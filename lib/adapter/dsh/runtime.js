/**
 * DSH host adapter: the ONLY place that wires routing onto DSH runtime services.
 * Every host touchpoint used here is inventoried in docs/ARCHITECTURE.md (T1–T13).
 * Host-agnostic rules (validation, prompts, outcome mapping) live in core/.
 */
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { parentAgentOptionsForDelegation } from '@deepseek-ai/dsh-subagent';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { NativeTeams } from "./native-team.js";
import { Config, installConfigValidation, readRoutingState, requireRoutingPolicy } from "./config.js";
import { CATEGORY_IDS, categorySelectionGuidance } from "../../core/categories.js";
import { DIAGNOSTICS, EXTERNAL_GATES, buildCategoryPrompt, outcomeState, validateDelegateArgs } from "../../core/delegation.js";
import { buildNativeSubagentGuidance, buildTeamFallbackGuidance, validateNativeSubagentCall } from "../../core/native-subagent.js";
import { resolveRoutingSnapshot } from "../../core/routing-policy.js";
import { authorizationProjection, assertAuthorizedRoute } from "./authorization.js";
import { ExecutionStore, policyDigest } from "../../core/execution-store.js";
export { Config } from "./config.js";
export { EXTERNAL_GATES } from "../../core/delegation.js";
export const name = 'team-router';
export const inject = ['agents', 'agentTeams', 'subagents', 'tools', 'llm', 'sessionProjections'];
const NATIVE_SUBAGENT_TOOL = 'subagent';
const FALLBACK_SECTION_ORDER = 601;
function toolSupportsModelSelection(definition) {
    const properties = definition?.parameters?.properties;
    if (typeof properties !== 'object' || properties === null)
        return false;
    return Object.hasOwn(properties, 'provider') && Object.hasOwn(properties, 'model');
}
export class TeamRouter {
    teams;
    store;
    registrations = new Map();
    active = new Map();
    authorization;
    stopped = false;
    ctx;
    configuration;
    constructor(ctx, configuration) {
        this.ctx = ctx;
        this.configuration = configuration;
        this.teams = new NativeTeams(ctx);
        this.store = new ExecutionStore(configuration.stateDir === undefined
            ? join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'storages', 'team-router')
            : resolve(configuration.stateDir));
    }
    caller(agent, leadOnly = false) {
        if (this.stopped || agent === undefined)
            throw new Error('A live native Agent Teams caller is required');
        const membership = this.teams.tryMembership(agent);
        if (membership === undefined)
            throw new Error('Caller is not a live native Agent Teams member');
        if (leadOnly && membership.role !== 'lead')
            throw new Error('Only the Team Lead may delegate or cancel routed tasks');
        return membership;
    }
    async preflight(options, signal) {
        if (!options.provider || !options.model)
            throw new Error('The selected native target has no complete provider/model route');
        const timeout = AbortSignal.timeout(5000);
        const checkSignal = AbortSignal.any([signal, timeout]);
        let abort;
        try {
            await Promise.race([
                (async () => {
                    const models = await this.ctx.llm.listModels(options.provider);
                    checkSignal.throwIfAborted();
                    if (!models.some(model => model.id === options.model))
                        throw new Error('The configured model is not advertised by its provider; review the category settings');
                    await this.ctx.llm.resolveCallConfig({ provider: options.provider, model: options.model,
                        ...(options.reasoningEffort === undefined ? {} : { reasoningEffort: options.reasoningEffort }) }, checkSignal);
                })(),
                new Promise((_resolve, reject) => {
                    abort = () => reject(new Error(signal.aborted ? 'Routing preparation cancelled' : 'Model catalog preflight timed out'));
                    if (checkSignal.aborted)
                        abort();
                    else
                        checkSignal.addEventListener('abort', abort, { once: true });
                }),
            ]);
        }
        finally {
            if (abort)
                checkSignal.removeEventListener('abort', abort);
        }
    }
    async delegate(agent, args, signal) {
        const membership = this.caller(agent, true);
        validateDelegateArgs(args);
        const policy = requireRoutingPolicy(this.configuration);
        const digest = policyDigest(policy);
        const snapshot = resolveRoutingSnapshot(policy, args.category);
        if (snapshot.target.executor !== 'native')
            throw new Error(EXTERNAL_GATES[snapshot.target.executor]);
        const provider = this.ctx.subagents.getProvider('spawn');
        if (!provider?.prepareContinuable || !provider.capabilities.agentOptions || !provider.capabilities.depthLimit) {
            throw new Error('The native spawn provider with model selection and depth enforcement is required');
        }
        const parentOptions = parentAgentOptionsForDelegation(agent);
        const parentDigest = policyDigest(parentOptions);
        const model = snapshot.target.model;
        const options = model.mode === 'inherit' ? { ...parentOptions } : {
            provider: model.provider, model: model.id,
            reasoningEffort: model.reasoningEffort === undefined ? undefined : ReasoningEffortId(model.reasoningEffort),
        };
        if (model.mode === 'explicit')
            assertAuthorizedRoute(this.authorization.stateOf(agent.session), parentOptions, { provider: model.provider, model: model.id });
        await this.preflight(options, signal);
        signal.throwIfAborted();
        if (this.caller(agent, true).root !== membership.root)
            throw new Error('Team identity changed during routing preparation');
        if (policyDigest(requireRoutingPolicy(this.configuration)) !== digest || policyDigest(parentAgentOptionsForDelegation(agent)) !== parentDigest) {
            throw new Error('Routing configuration or inherited model changed before submission; inspect settings and delegate again');
        }
        if (this.ctx.subagents.getProvider('spawn') !== provider)
            throw new Error('Native spawn provider changed during preparation');
        // Recheck authorization after metadata I/O, then submit without another await.
        if (model.mode === 'explicit')
            assertAuthorizedRoute(this.authorization.stateOf(agent.session), parentOptions, { provider: model.provider, model: model.id });
        const maxDepth = this.ctx.subagents.resolveMaxDepth(undefined);
        const teamId = String(membership.id);
        const record = this.store.begin(teamId, { category: snapshot.category, source: snapshot.source, target: snapshot.target, policyDigest: digest }, policy.historyLimit);
        let activation;
        try {
            activation = await this.ctx.subagents.startActivation({
                provider: 'spawn', parent: agent, label: args.description,
                ...(args.name === undefined ? {} : { name: args.name }),
                ...(args.cwd === undefined ? {} : { cwd: args.cwd }),
                ...(maxDepth === undefined ? {} : { maxDepth }),
                agentOptions: options,
                prompt: [{ type: 'text', text: buildCategoryPrompt(snapshot.category, args.prompt) }],
                signal, delivery: 'parent',
            });
        }
        catch (error) {
            // rc.3 can reject after inbox admission if activation publication fails;
            // even cleanup failure is only logged by the manager. Never claim no effects.
            try {
                this.store.update(teamId, record.id, { state: 'unknown', diagnostic: DIAGNOSTICS.uncertainStartup }, policy.historyLimit);
            }
            catch {
                this.ctx.logger.warn(`Could not persist uncertain startup for ${record.id}`);
            }
            throw error;
        }
        const running = { teamId, id: record.id, activation, historyLimit: policy.historyLimit };
        this.active.set(record.id, running);
        void activation.result.then(result => {
            this.store.update(teamId, record.id, {
                state: outcomeState(result.stopReason),
                stopReason: result.stopReason,
            }, policy.historyLimit);
        }, () => {
            this.store.update(teamId, record.id, { state: 'unknown', diagnostic: DIAGNOSTICS.unknownOutcome }, policy.historyLimit);
        }).catch(() => {
            this.ctx.logger.warn(`Could not persist routing outcome for ${record.id}; inspect the native child outcome`);
        }).finally(() => { this.active.delete(record.id); });
        // Observe completion before any fallible post-start persistence or teardown.
        try {
            this.store.update(teamId, record.id, { state: 'running', childId: String(activation.childId), name: activation.name }, policy.historyLimit);
        }
        catch (error) {
            try {
                await activation.dispose();
            }
            catch {
                throw new Error(`Audit write failed for ${record.id} (${activation.name}); child cleanup is unconfirmed. Inspect the native child and partial effects before retrying.`, { cause: error });
            }
            throw new Error(`Audit write failed for ${record.id} (${activation.name}); managed teardown finished. Inspect partial effects before retrying.`, { cause: error });
        }
        return { kind: 'activation', name: activation.name, executionId: record.id, category: snapshot.category, target: snapshot.target };
    }
    install(agent) {
        if (this.stopped || this.registrations.has(agent))
            return;
        const membership = this.teams.tryMembership(agent);
        if (!membership)
            return;
        const disposers = [];
        this.registrations.set(agent, disposers);
        const output = { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] };
        const caller = (candidate, leadOnly = false) => {
            if (candidate !== agent)
                throw new Error('Routing tool caller does not match its registered Agent');
            this.caller(candidate, leadOnly);
            return candidate;
        };
        disposers.push(agent.ctx.tools.register(defineTool({
            name: 'team_route_status', description: 'Read configured task categories, migration status, requested targets and managed execution history. Actual models are only reported from native request headers; this does not start tasks.',
            parameters: {}, output,
            execute: async (_args, exec) => {
                const current = caller(exec.agent);
                const membership = this.caller(current);
                const state = readRoutingState(this.configuration);
                // Normalize optional audit fields to the tool's JSON-only wire contract.
                return JSON.parse(JSON.stringify({
                    teamId: String(membership.id), policy: { ...state.policy }, migrationRequired: state.migrationRequired,
                    externalExecutors: EXTERNAL_GATES,
                    executions: this.store.list(String(membership.id)).map(record => {
                        const active = this.active.get(record.id);
                        const child = active ? this.ctx.agents.get(active.activation.childId) : undefined;
                        const actual = child?.session.requestHeader()?.config;
                        return { ...record, actualModel: actual === undefined ? null : {
                                provider: actual.provider, model: actual.model,
                                ...(actual.reasoningEffort === undefined ? {} : { reasoningEffort: actual.reasoningEffort }),
                            } };
                    }),
                }));
            },
        })));
        if (membership.role !== 'lead')
            return;
        disposers.push(agent.ctx.tools.register(defineTool({
            name: 'team_route_delegate',
            description: `Delegate a self-contained task using one configured category. Only new routed delegations use category settings; ordinary subagent calls do not. The native child starts with the chosen model on its first request and returns a managed completion notice. External executors that have not passed safety gates are refused.\n${categorySelectionGuidance('en')}`,
            parameters: {
                category: { type: 'string', enum: [...CATEGORY_IDS], required: true, description: 'Choose by main deliverable, then execution style; unspecified is the last fallback.' },
                prompt: { type: 'string', required: true, description: 'Self-contained goal, scope, constraints and acceptance criteria. The child does not inherit conversation history.' },
                description: { type: 'string', required: true, description: 'Short task label, at most 200 characters.' },
                name: { type: 'string', description: 'Optional native child name; lowercase words joined by hyphens, not lead.' },
                cwd: { type: 'string', description: 'Optional initial directory within the delegated permission scope.' },
            }, output,
            isConcurrencySafe: () => true,
            execute: (args, exec) => this.delegate(caller(exec.agent, true), args, exec.signal),
        })));
        disposers.push(agent.ctx.tools.register(defineTool({
            name: 'team_route_cancel', description: 'Lead only: request cancellation of one active routed execution. Cancellation does not undo edits or commands. A returned cancelled status requires managed teardown to finish.',
            parameters: { executionId: { type: 'string', required: true, description: 'Execution ID from team_route_delegate or team_route_status.' } }, output,
            execute: async (args, exec) => {
                const lead = caller(exec.agent, true);
                const teamId = String(this.caller(lead).id);
                const running = this.active.get(args.executionId);
                if (!running || running.teamId !== teamId)
                    throw new Error('No active routed execution with that ID in this team');
                try {
                    this.store.update(teamId, running.id, { state: 'cancelling' }, running.historyLimit);
                }
                catch {
                    this.ctx.logger.warn(`Could not persist cancellation request for ${running.id}; cancellation will still be attempted`);
                }
                try {
                    await running.activation.dispose();
                }
                catch {
                    throw new Error('Cancellation has not been confirmed; inspect the native execution before retrying');
                }
                return { executionId: running.id, stopped: true, sideEffectsRolledBack: false };
            },
        })));
        for (const toolName of ['team_route_set', 'team_route_reset'])
            disposers.push(agent.ctx.tools.register(defineTool({
                name: toolName, description: 'Retired legacy member-model override. Use category settings and team_route_delegate for new work; this tool always refuses and never changes an existing teammate.',
                parameters: { member: { type: 'string' }, route: { type: 'string' } }, output,
                execute: (_args, exec) => { caller(exec.agent, true); throw new Error('Legacy member overrides have been retired. Configure task categories and start a new routed delegation.'); },
            })));
    }
    release(agent) {
        for (const dispose of this.registrations.get(agent) ?? [])
            dispose();
        this.registrations.delete(agent);
    }
    renderPromptGuidance(agent) {
        if (this.stopped || agent === undefined || this.ctx.agents.get(agent.id) !== agent)
            return '';
        if (!this.configuration.nativeSubagentGuidance.get())
            return '';
        let state;
        try {
            state = readRoutingState(this.configuration);
        }
        catch {
            return '';
        }
        if (state.migrationRequired)
            return '';
        let authorizedRoutes;
        try {
            authorizedRoutes = this.authorization.stateOf(agent.session);
        }
        catch {
            return '';
        }
        const parentRoute = parentAgentOptionsForDelegation(agent);
        const delegationMode = this.configuration.delegationMode.get();
        let isRoot = agent.session.header.origin !== 'subagent';
        try {
            isRoot = isRoot && this.ctx.subagents.rootOf(agent) === agent;
        }
        catch { /* keep session header check */ }
        if (toolSupportsModelSelection(this.ctx.tools.get(NATIVE_SUBAGENT_TOOL, agent))) {
            return buildNativeSubagentGuidance(state.policy, { authorizedRoutes, parentRoute, delegationMode, isRoot });
        }
        if (this.teams.tryMembership(agent)?.role === 'lead') {
            return buildTeamFallbackGuidance(state.policy, { authorizedRoutes, parentRoute, delegationMode, isRoot: true });
        }
        return '';
    }
    async start() {
        this.authorization = await this.ctx.sessionProjections.register(authorizationProjection);
        this.ctx.inject(['systemPrompt'], child => {
            let order = FALLBACK_SECTION_ORDER;
            try {
                order = child.systemPrompt.getSectionOrder('TEAM_POLICY') + 1;
            }
            catch {
                order = FALLBACK_SECTION_ORDER;
            }
            child.effect(() => child.systemPrompt.section({
                name: 'team-router:policy',
                order,
                interpolate: false,
                text: ({ agent }) => this.renderPromptGuidance(agent),
            }), 'teamRouter.systemPrompt');
        });
        this.ctx.on('tools/pre-execute', (exec, next) => {
            if (this.stopped || exec.name !== NATIVE_SUBAGENT_TOOL || !this.configuration.enforceNativeSubagentRouting.get())
                return next();
            const agent = exec.agent;
            if (agent === undefined || this.ctx.agents.get(agent.id) !== agent)
                return next();
            if (!toolSupportsModelSelection(this.ctx.tools.get(NATIVE_SUBAGENT_TOOL, agent, exec.toolSet)))
                return next();
            let state;
            try {
                state = readRoutingState(this.configuration);
            }
            catch {
                return next();
            }
            if (state.migrationRequired)
                return next();
            let authorizedRoutes;
            try {
                authorizedRoutes = this.authorization.stateOf(agent.session);
            }
            catch {
                return next();
            }
            const parentRoute = parentAgentOptionsForDelegation(agent);
            const verdict = validateNativeSubagentCall(state.policy, exec.arguments, { authorizedRoutes, parentRoute });
            if (!verdict.ok)
                return Promise.resolve({ kind: 'deny', reason: verdict.reason });
            return next();
        });
        this.ctx.on('agent/created', ({ agent }) => { this.install(agent); return undefined; });
        this.ctx.on('subagent/start', info => { const agent = this.ctx.agents.get(info.id); if (agent)
            this.install(agent); });
        this.ctx.on('agent/disposed', ({ agent }) => this.release(agent));
        this.ctx.on('session/event', (session, event) => {
            if (event.type !== 'team/mode')
                return;
            for (const agent of [...this.registrations.keys()]) {
                if (this.ctx.subagents.rootOf(agent).session === session && !event.data.enabled)
                    this.release(agent);
            }
            if (event.data.enabled)
                for (const agent of this.ctx.agents.list())
                    this.install(agent);
        });
        this.ctx.effect(() => () => this.stop(), 'teamRouter.cleanup');
        for (const agent of this.ctx.agents.list())
            this.install(agent);
    }
    stop() {
        this.stopped = true;
        for (const agent of [...this.registrations.keys()])
            this.release(agent);
        // Already admitted activations belong to the native manager, not the settings
        // plugin. They keep their chosen model and finish/notify normally after unload.
    }
}
export async function apply(ctx, config) {
    readRoutingState(config);
    const router = new TeamRouter(ctx, config);
    installConfigValidation(ctx, legacy => { router.store.backupLegacy(legacy); });
    ctx.inject(['settings'], child => {
        child.effect(() => child.settings.configure({ auto: false }, ctx.fiber), 'teamRouter.settingsPresentation');
    });
    await router.start();
}
//# sourceMappingURL=runtime.js.map