/**
 * DSH host adapter: the ONLY place that wires routing onto DSH runtime services.
 * Every host touchpoint used here is inventoried in docs/ARCHITECTURE.md (T1–T14).
 * Host-agnostic rules (validation, prompts, outcome mapping) live in core/.
 */
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createUserMessage, ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { parentAgentOptionsForDelegation } from '@deepseek-ai/dsh-subagent';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { NativeTeams } from "./native-team.js";
import { Config, installConfigValidation, readRoutingConfig } from "./config.js";
import { resolveActiveCategory, resolveActiveRegistry } from "../../core/active-registry.js";
import { DIAGNOSTICS, buildCategoryPrompt, outcomeState, validateDelegateArgs } from "../../core/delegation.js";
import { buildNativeSubagentGuidance, buildNativeSubagentReminder, buildTeamFallbackGuidance, validateNativeSubagentCall } from "../../core/native-subagent.js";
import { authorizationProjection, assertAuthorizedRoute } from "./authorization.js";
import { ExecutionStore, policyDigest } from "../../core/execution-store.js";
export { Config } from "./config.js";
export const name = 'team-router';
export const inject = ['agents', 'agentTeams', 'subagents', 'tools', 'llm', 'sessionProjections'];
const NATIVE_SUBAGENT_TOOL = 'subagent';
const REMINDER_SOURCE = 'team-router:reminder';
// Just before the deployment persona suffix on the supported host; use the
// same late placement if the host cannot look up its suffix order.
const FALLBACK_SECTION_ORDER = 10_199;
function toolSupportsModelSelection(definition) {
    const properties = definition?.parameters?.properties;
    if (typeof properties !== 'object' || properties === null)
        return false;
    return Object.hasOwn(properties, 'provider') && Object.hasOwn(properties, 'model');
}
function requireActiveCategory(registry, id) {
    const category = resolveActiveCategory(registry, id);
    if (category)
        return category;
    const activeIds = registry.entries.map(entry => entry.id);
    throw new Error(activeIds.length === 0
        ? 'No active routing categories. Enable at least one category in Team Router settings first.'
        : `Requested category is inactive or unknown. Active category IDs: ${activeIds.join(', ')}. Check team_route_status for current routing.`);
}
const modelTuple = ({ provider, model, reasoningEffort }) => [provider, model, reasoningEffort];
function parentModelDigest(agent, options) {
    const current = agent.model?.current();
    // Native delegation uses the last request tuple, but a live selection can also
    // change during preflight before the parent has dispatched another request.
    return policyDigest([modelTuple(options), current === undefined ? null : modelTuple(current)]);
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
        const registry = resolveActiveRegistry(readRoutingConfig(this.configuration));
        const category = requireActiveCategory(registry, args?.category);
        validateDelegateArgs(args);
        const { config, configDigest } = registry;
        const target = category.effectiveTarget;
        const provider = this.ctx.subagents.getProvider('spawn');
        if (!provider?.prepareContinuable || !provider.capabilities.agentOptions || !provider.capabilities.depthLimit) {
            throw new Error('The native spawn provider with model selection and depth enforcement is required');
        }
        const parentOptions = parentAgentOptionsForDelegation(agent);
        const parentDigest = parentModelDigest(agent, parentOptions);
        const options = target.mode === 'inherit' ? { ...parentOptions } : {
            provider: target.provider, model: target.model,
            reasoningEffort: target.reasoningEffort === undefined ? undefined : ReasoningEffortId(target.reasoningEffort),
        };
        if (target.mode === 'explicit')
            assertAuthorizedRoute(this.authorization.stateOf(agent.session), parentOptions, target);
        await this.preflight(options, signal);
        signal.throwIfAborted();
        if (this.caller(agent, true).root !== membership.root)
            throw new Error('Team identity changed during routing preparation');
        const currentRegistry = resolveActiveRegistry(readRoutingConfig(this.configuration));
        requireActiveCategory(currentRegistry, category.id);
        const currentParent = parentAgentOptionsForDelegation(agent);
        if (currentRegistry.configDigest !== configDigest || parentModelDigest(agent, currentParent) !== parentDigest) {
            throw new Error('Routing configuration or inherited model changed before submission; inspect settings and delegate again');
        }
        if (this.ctx.subagents.getProvider('spawn') !== provider)
            throw new Error('Native spawn provider changed during preparation');
        // Recheck authorization after metadata I/O, then submit without another await.
        if (target.mode === 'explicit')
            assertAuthorizedRoute(this.authorization.stateOf(agent.session), currentParent, target);
        const maxDepth = this.ctx.subagents.resolveMaxDepth(undefined);
        const teamId = String(membership.id);
        const record = this.store.begin(teamId, {
            categoryId: category.id, categoryNameAtStart: category.nameEn, categoryOrigin: category.origin,
            source: category.bindingSource, target, policyDigest: configDigest,
        }, config.historyLimit);
        let activation;
        try {
            activation = await this.ctx.subagents.startActivation({
                provider: 'spawn', parent: agent, label: args.description,
                ...(args.name === undefined ? {} : { name: args.name }),
                ...(args.cwd === undefined ? {} : { cwd: args.cwd }),
                ...(maxDepth === undefined ? {} : { maxDepth }),
                agentOptions: options,
                prompt: [{ type: 'text', text: buildCategoryPrompt(category, args.prompt) }],
                signal, delivery: 'parent',
            });
        }
        catch (error) {
            // rc.3 can reject after inbox admission if activation publication fails;
            // even cleanup failure is only logged by the manager. Never claim no effects.
            try {
                this.store.update(teamId, record.id, { state: 'unknown', diagnostic: DIAGNOSTICS.uncertainStartup }, config.historyLimit);
            }
            catch {
                this.ctx.logger.warn(`Could not persist uncertain startup for ${record.id}`);
            }
            throw error;
        }
        const running = { teamId, id: record.id, activation, historyLimit: config.historyLimit };
        this.active.set(record.id, running);
        void activation.result.then(result => {
            this.store.update(teamId, record.id, {
                state: outcomeState(result.stopReason),
                stopReason: result.stopReason,
            }, config.historyLimit);
        }, () => {
            this.store.update(teamId, record.id, { state: 'unknown', diagnostic: DIAGNOSTICS.unknownOutcome }, config.historyLimit);
        }).catch(() => {
            this.ctx.logger.warn(`Could not persist routing outcome for ${record.id}; inspect the native child outcome`);
        }).finally(() => { this.active.delete(record.id); });
        // Observe completion before any fallible post-start persistence or teardown.
        try {
            this.store.update(teamId, record.id, { state: 'running', childId: String(activation.childId), name: activation.name }, config.historyLimit);
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
        return { kind: 'activation', name: activation.name, executionId: record.id, category: category.id, target };
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
            name: 'team_route_status', description: 'Read current routing settings, active task categories and managed execution history. Actual models are reported only from native request headers; this tool does not start tasks.',
            parameters: {}, output,
            execute: async (_args, exec) => {
                const current = caller(exec.agent);
                const membership = this.caller(current);
                const registry = resolveActiveRegistry(readRoutingConfig(this.configuration));
                // Normalize optional audit fields to the tool's JSON-only wire contract.
                return JSON.parse(JSON.stringify({
                    teamId: String(membership.id), routing: registry.config,
                    categories: registry.entries.map(entry => ({
                        id: entry.id, origin: entry.origin, group: entry.group, name: entry.nameEn, purpose: entry.purposeEn,
                        proactive: entry.proactive, source: entry.bindingSource, target: entry.effectiveTarget,
                    })),
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
            description: 'Delegate a self-contained task using one currently active category. Choose by the main deliverable. For mixed work, use one owner unless the deliverables are independently verifiable. Check team_route_status for live settings; ordinary subagent calls or existing teammates are not changed by this tool.',
            parameters: {
                category: { type: 'string', required: true, description: 'Active category ID. Read team_route_status for the current active category list.' },
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
    }
    release(agent) {
        for (const dispose of this.registrations.get(agent) ?? [])
            dispose();
        this.registrations.delete(agent);
    }
    isLiveRoot(agent) {
        if (this.ctx.agents.get(agent.id) !== agent || agent.session.header.origin === 'subagent')
            return false;
        try {
            return this.ctx.subagents.rootOf(agent) === agent;
        }
        catch {
            return false;
        }
    }
    sessionAuthorization(agent) {
        try {
            return { authorizedRoutes: this.authorization.stateOf(agent.session) };
        }
        catch {
            return { authorizationUnavailable: true };
        }
    }
    guidanceState(agent) {
        let config;
        try {
            config = readRoutingConfig(this.configuration);
        }
        catch {
            return undefined;
        }
        if (config.behavior.guidance)
            return { config, authorization: this.sessionAuthorization(agent) };
        return undefined;
    }
    renderPromptGuidance(agent, modelSelection) {
        if (this.stopped || agent === undefined || this.ctx.agents.get(agent.id) !== agent)
            return '';
        const state = this.guidanceState(agent);
        if (state === undefined)
            return '';
        const session = {
            ...state.authorization,
            parentRoute: modelSelection ?? agent.model?.current() ?? parentAgentOptionsForDelegation(agent),
            isRoot: this.isLiveRoot(agent),
        };
        if (toolSupportsModelSelection(this.ctx.tools.get(NATIVE_SUBAGENT_TOOL, agent))) {
            return buildNativeSubagentGuidance(state.config, session);
        }
        if (session.isRoot && this.teams.tryMembership(agent)?.role === 'lead') {
            return buildTeamFallbackGuidance(state.config, session);
        }
        return '';
    }
    async start() {
        this.authorization = await this.ctx.sessionProjections.register(authorizationProjection);
        this.ctx.inject(['systemPrompt'], child => {
            let order = FALLBACK_SECTION_ORDER;
            try {
                const suffixOrder = child.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX');
                if (Number.isFinite(suffixOrder))
                    order = suffixOrder - 1;
            }
            catch { /* Older hosts may not expose getSectionOrder. */ }
            child.effect(() => child.systemPrompt.section({
                name: 'team-router:policy',
                order,
                interpolate: false,
                text: ({ agent, modelSelection }) => this.renderPromptGuidance(agent, modelSelection),
            }), 'teamRouter.systemPrompt');
        });
        this.ctx.on('agent/pre-step', async ({ agent, step, messages, signal, modelSelection }, next) => {
            // The host starts each turn at step 1. Only a new human input (not a
            // retry, subagent result, or synthetic context) should gain a reminder.
            if (step !== 1 || !messages.some(message => message.source.kind === 'user'))
                return next();
            const decision = await next();
            if (decision.kind !== 'enter' || signal.aborted || this.stopped
                || !this.isLiveRoot(agent) || !decision.messages.some(message => message.source.kind === 'user'))
                return decision;
            const state = this.guidanceState(agent);
            if (state === undefined || state.authorization.authorizationUnavailable || state.config.behavior.delegationMode === 'passive')
                return decision;
            // Do not gate on the unnamespaced tool's presence: a provider bridge
            // can expose the model-selecting host tool under its own namespace.
            const text = buildNativeSubagentReminder(state.config, {
                ...state.authorization,
                parentRoute: modelSelection ?? agent.model?.current() ?? parentAgentOptionsForDelegation(agent), isRoot: true,
            });
            if (text === '')
                return decision;
            const reminder = createUserMessage({
                content: [{ type: 'text', text }], source: { kind: REMINDER_SOURCE, form: 'instructions' },
            });
            return { ...decision, messages: [...decision.messages, reminder] };
        });
        this.ctx.on('tools/pre-execute', (exec, next) => {
            if (this.stopped || exec.name !== NATIVE_SUBAGENT_TOOL)
                return next();
            const agent = exec.agent;
            if (agent === undefined || this.ctx.agents.get(agent.id) !== agent)
                return next();
            if (!toolSupportsModelSelection(this.ctx.tools.get(NATIVE_SUBAGENT_TOOL, agent, exec.toolSet)))
                return next();
            let config;
            try {
                config = readRoutingConfig(this.configuration);
            }
            catch {
                return next();
            }
            if (!config.behavior.strict)
                return next();
            const verdict = validateNativeSubagentCall(config, exec.arguments, {
                ...this.sessionAuthorization(agent), parentRoute: parentAgentOptionsForDelegation(agent),
            });
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
    readRoutingConfig(config);
    const router = new TeamRouter(ctx, config);
    installConfigValidation(ctx);
    ctx.inject(['settings'], child => {
        child.effect(() => child.settings.configure({ auto: false }, ctx.fiber), 'teamRouter.settingsPresentation');
    });
    await router.start();
}
//# sourceMappingURL=runtime.js.map