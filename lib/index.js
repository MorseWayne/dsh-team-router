import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { decide, parseConfig } from "./policy.js";
import { StateStore } from "./store.js";
export const name = 'team-router';
export const inject = ['agents', 'agentTeams', 'tools', 'llm'];
const equal = (a, b) => a?.provider === b?.provider
    && a?.model === b?.model && a?.reasoningEffort === b?.reasoningEffort;
const selection = (route) => ({ ...route });
const errorText = (error) => error instanceof Error ? error.message : String(error);
/** Exposed for offline verification; mount through apply() in a real Host. */
export class TeamRouter {
    policy;
    store;
    states = new Map();
    runtimes = new Map();
    validated = new Map();
    stopped = false;
    ctx;
    constructor(ctx, config) {
        this.ctx = ctx;
        if (config === null || typeof config !== 'object' || Array.isArray(config))
            throw new Error('Router config must be an object');
        const { stateDir, ...policy } = config;
        if (stateDir !== undefined && (typeof stateDir !== 'string' || stateDir.trim() === ''))
            throw new Error('stateDir must be a non-empty path');
        this.policy = parseConfig(policy);
        this.store = new StateStore(typeof stateDir === 'string' ? resolve(stateDir) : join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'storages', 'team-router'), this.policy.historyLimit);
    }
    state(id) {
        let state = this.states.get(id);
        if (state === undefined) {
            state = this.store.load(id);
            this.states.set(id, state);
        }
        return state;
    }
    commit(state) {
        this.store.save(state);
        this.states.set(state.teamId, state);
    }
    caller(agent) {
        if (this.stopped)
            throw new Error('Team router has been disposed');
        if (agent === undefined)
            throw new Error('A native Agent Teams caller is required');
        const membership = this.ctx.agentTeams.tryMembership(agent);
        if (membership === undefined)
            throw new Error('Caller is not a live native Agent Teams member');
        return membership;
    }
    /** A bounded metadata check, not a provider health, quota, or billing probe. */
    async validate(route, signal) {
        const key = JSON.stringify(route);
        let pending = this.validated.get(key);
        if (pending === undefined) {
            pending = (async () => {
                if (!this.ctx.llm.listProviders().some((provider) => provider.id === route.provider))
                    throw new Error(`Unregistered model provider: ${route.provider}`);
                const abort = AbortSignal.timeout(5000);
                let listener;
                try {
                    const models = await Promise.race([
                        this.ctx.llm.listModels(route.provider),
                        new Promise((_resolve, reject) => {
                            listener = () => reject(new Error(`Model catalog timed out: ${route.provider}`));
                            abort.addEventListener('abort', listener, { once: true });
                        }),
                    ]);
                    if (!models.some((model) => model.id === route.model))
                        throw new Error(`Model is not advertised by ${route.provider}: ${route.model}. Add it to that provider's model catalog before routing.`);
                    await this.ctx.llm.resolveCallConfig(selection(route), abort);
                }
                finally {
                    if (listener !== undefined)
                        abort.removeEventListener('abort', listener);
                }
            })();
            this.validated.set(key, pending);
            void pending.catch(() => { if (this.validated.get(key) === pending)
                this.validated.delete(key); });
        }
        await pending;
        signal?.throwIfAborted();
    }
    /** Select future steps at creation, first turn claim, task edges, or idle overrides; never rewrite an admitted step. */
    refresh(runtime, force = false) {
        const { agent, membership } = runtime;
        if (this.ctx.agents.get(agent.id) !== agent || this.ctx.agentTeams.tryMembership(agent)?.role !== 'teammate')
            return;
        const state = this.state(String(membership.id));
        const tasks = this.ctx.agentTeams.listTasks(agent).filter((task) => task.ownerName === membership.name && task.status === 'in_progress');
        const owned = tasks.length > 0 ? tasks : this.ctx.agentTeams.listTasks(agent).filter((task) => task.ownerName === membership.name && task.status === 'pending' && task.ready);
        const ids = owned.map((task) => String(task.id)).sort();
        const key = ids.length > 0 ? `tasks:${JSON.stringify(ids)}` : `turn:${runtime.turn}`;
        const previous = state.members[String(agent.id)];
        const manualRoute = state.overrides[String(agent.id)];
        const sameOverride = previous?.decision.source === 'manual'
            ? previous.decision.routeName === manualRoute : manualRoute === undefined;
        const namedRoute = previous?.decision.routeName;
        const stillAllowed = previous?.decision.source === 'inherit' || (namedRoute !== undefined
            && Object.hasOwn(this.policy.routes, namedRoute) && equal(previous?.selected, this.policy.routes[namedRoute]));
        if (!force && previous?.key === key && sameOverride && stillAllowed) {
            // Restore a latched task, unless a cold override or deployment route changed.
            if (!equal(agent.model.current(), previous.selected))
                agent.model.select(selection(previous.selected));
            return;
        }
        const baseline = previous?.baseline ?? agent.model.current();
        if (baseline === undefined)
            throw new Error(`Teammate ${membership.name} has no complete inherited model route`);
        const member = this.ctx.agentTeams.listMembers(agent).find((row) => row.id === agent.id);
        const taskText = owned.length > 0 ? owned.map((task) => `${task.subject}\n${task.description}`).join('\n') : runtime.text || member?.description || '';
        const decision = decide(this.policy, { memberName: membership.name, taskText, ...(manualRoute === undefined ? {} : { manualRoute }) });
        const selected = decision.route ?? { ...baseline };
        const changed = previous === undefined || previous.key !== key || JSON.stringify(previous.decision) !== JSON.stringify(decision) || !equal(previous.selected, selected);
        if (changed) {
            const next = structuredClone(state);
            next.members[String(agent.id)] = { baseline: { ...baseline }, key, selected: { ...selected }, decision };
            next.history.push({
                at: new Date().toISOString(), memberId: String(agent.id), memberName: membership.name, boundary: key,
                source: decision.source, route: { ...selected },
                ...(decision.routeName === undefined ? {} : { routeName: decision.routeName }),
                ...(decision.ruleId === undefined ? {} : { ruleId: decision.ruleId }),
            });
            next.history = next.history.slice(-this.policy.historyLimit);
            this.commit(next);
        }
        if (!equal(agent.model.current(), selected))
            agent.model.select(selection(selected));
        delete runtime.error;
    }
    safeRefresh(runtime, force = false) {
        try {
            this.refresh(runtime, force);
        }
        catch (error) {
            runtime.error = errorText(error);
            this.ctx.logger.warn(`Team router blocked ${runtime.membership.name}: ${runtime.error}`);
        }
    }
    status(agent) {
        const membership = this.caller(agent);
        const state = this.state(String(membership.id));
        return {
            teamId: String(membership.id),
            routes: this.policy.routes,
            members: this.ctx.agentTeams.listMembers(agent).map((member) => {
                const live = this.ctx.agents.get(member.id);
                const saved = state.members[String(member.id)];
                return {
                    id: String(member.id), name: member.name, role: member.role, status: member.status,
                    lastUsed: live?.session.requestHeader()?.config ?? null,
                    nextSelection: live?.model.current() ?? null,
                    decision: saved?.decision ?? null,
                    selected: saved?.selected ?? null,
                    manualRoute: state.overrides[String(member.id)] ?? null,
                    error: live === undefined ? null : this.runtimes.get(live)?.error ?? null,
                };
            }),
            history: state.history,
        };
    }
    tools(runtime) {
        const output = { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] };
        const caller = (agent) => {
            if (agent !== runtime.agent)
                throw new Error('Router tool caller does not match its registered Agent');
            this.caller(agent);
            return agent;
        };
        runtime.disposers.push(runtime.agent.ctx.tools.register(defineTool({
            name: 'team_route_status',
            description: 'Inspect this native Agent Team model routing: actual/selected models, named route whitelist, manual overrides, rule sources, and bounded decision history. Read-only; does not start any agent.',
            parameters: {}, output,
            execute: async (_args, exec) => JSON.parse(JSON.stringify(this.status(caller(exec.agent)))),
        })));
        if (runtime.membership.role !== 'lead')
            return;
        const target = (agent, member) => {
            const membership = this.caller(agent);
            if (membership.role !== 'lead')
                throw new Error('Only the Team Lead may change model routes');
            const row = this.ctx.agentTeams.listMembers(agent).find((item) => item.name === member && item.role === 'teammate' && item.status !== 'failed');
            if (row === undefined)
                throw new Error(`No routable teammate named ${member}`);
            return { membership, row };
        };
        runtime.disposers.push(runtime.agent.ctx.tools.register(defineTool({
            name: 'team_route_set',
            description: 'Lead only: select one configured named model route for an existing native teammate. Override wins over rules; applies immediately if idle, otherwise at the next new turn or task boundary. Does not interrupt or wake the teammate.',
            parameters: {
                member: { type: 'string', required: true, description: 'Exact teammate name from list_agents or team_route_status.' },
                route: { type: 'string', required: true, description: 'Exact configured route name from team_route_status; arbitrary provider/model strings are not accepted.' },
            }, output,
            execute: async (args, exec) => {
                const agent = caller(exec.agent);
                const { membership, row } = target(agent, args.member);
                const route = Object.hasOwn(this.policy.routes, args.route) ? this.policy.routes[args.route] : undefined;
                if (route === undefined)
                    throw new Error(`Unknown named route: ${args.route}`);
                await this.validate(route, exec.signal);
                // Recheck authority and identity after metadata I/O, before committing the side effect.
                const current = target(agent, args.member);
                if (current.membership.id !== membership.id || current.row.id !== row.id)
                    throw new Error('Team identity changed while validating route');
                const next = structuredClone(this.state(String(membership.id)));
                next.overrides[String(row.id)] = args.route;
                this.commit(next);
                const live = this.ctx.agents.get(row.id);
                const tracked = live === undefined ? undefined : this.runtimes.get(live);
                if (tracked !== undefined && live?.status === 'idle')
                    this.refresh(tracked, true);
                return { member: args.member, route: args.route, applies: live?.status === 'idle' ? 'next-step' : 'next-turn-or-task-boundary' };
            },
        })));
        runtime.disposers.push(runtime.agent.ctx.tools.register(defineTool({
            name: 'team_route_reset',
            description: 'Lead only: remove one teammate manual route override. Falls back to task rules, then role/default, then the original inherited route at the next safe boundary; never interrupts or wakes work.',
            parameters: { member: { type: 'string', required: true, description: 'Exact teammate name.' } }, output,
            execute: async (args, exec) => {
                const agent = caller(exec.agent);
                const { membership, row } = target(agent, args.member);
                const next = structuredClone(this.state(String(membership.id)));
                delete next.overrides[String(row.id)];
                this.commit(next);
                const live = this.ctx.agents.get(row.id);
                const tracked = live === undefined ? undefined : this.runtimes.get(live);
                if (tracked !== undefined && live?.status === 'idle')
                    this.refresh(tracked, true);
                return { member: args.member, reset: true, applies: live?.status === 'idle' ? 'next-step' : 'next-turn-or-task-boundary' };
            },
        })));
    }
    async install(agent, signal) {
        if (this.stopped || this.runtimes.has(agent))
            return;
        const membership = this.ctx.agentTeams.tryMembership(agent);
        if (membership === undefined)
            return; // Ordinary/workflow children must remain untouched.
        if (agent.model?.select === undefined || agent.model.current === undefined)
            throw new Error('dsh-team-router requires the Agent.model API in DSH 0.2.2-rc.1');
        const runtime = { agent, membership, turn: 0, text: '', disposers: [] };
        this.runtimes.set(agent, runtime);
        try {
            this.tools(runtime);
            if (membership.role === 'teammate') {
                // Serial agent/created is awaited by DSH before releasing queued input.
                this.refresh(runtime);
                const saved = this.state(String(membership.id)).members[String(agent.id)];
                if (saved !== undefined && saved.decision.source !== 'inherit')
                    await this.validate(saved.selected, signal);
            }
        }
        catch (error) {
            runtime.error = errorText(error);
            throw error;
        }
    }
    async start() {
        this.ctx.on('agent/created', async ({ agent, signal }) => { await this.install(agent, signal); return undefined; });
        this.ctx.on('agent/inbox/claimed', ({ agent, message, turn }) => {
            const runtime = this.runtimes.get(agent);
            if (runtime?.membership.role !== 'teammate' || runtime.turn === turn)
                return;
            runtime.turn = turn;
            runtime.text = message.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n');
            this.safeRefresh(runtime, true); // This synchronous event precedes model.current() capture.
        });
        this.ctx.on('session/event', (session, event) => {
            if (event.type !== 'team/task')
                return;
            for (const runtime of this.runtimes.values()) {
                if (runtime.membership.role === 'teammate' && runtime.membership.root.session === session && runtime.membership.id === event.data.teamId)
                    this.safeRefresh(runtime);
            }
        });
        this.ctx.on('agent/pre-step', async (payload, next) => {
            const runtime = this.runtimes.get(payload.agent);
            if (runtime?.membership.role !== 'teammate')
                return next();
            const assertPrepared = () => {
                if (this.stopped)
                    return undefined;
                if (runtime.error !== undefined)
                    throw new Error(runtime.error);
                const saved = this.state(String(runtime.membership.id)).members[String(payload.agent.id)];
                if (saved !== undefined && !equal(payload.modelSelection, saved.selected)) {
                    throw new Error('Team route changed during step preparation. Request blocked; inspect team_route_status and explicitly resend the input if still needed. No automatic replay.');
                }
                return saved;
            };
            const saved = assertPrepared();
            if (saved !== undefined && saved.decision.source !== 'inherit') {
                try {
                    const routeName = saved.decision.routeName;
                    if (routeName === undefined || !Object.hasOwn(this.policy.routes, routeName))
                        throw new Error(`Latched route no longer exists: ${routeName}`);
                    if (!equal(saved.selected, this.policy.routes[routeName]))
                        throw new Error(`Latched route differs from the configured whitelist: ${routeName}`);
                    await this.validate(saved.selected, payload.signal);
                }
                catch (error) {
                    runtime.error = errorText(error);
                    throw error;
                }
            }
            // Task commits can run while adapter metadata or downstream guards are awaited.
            assertPrepared();
            const decision = await next();
            if (decision.kind !== 'reject')
                assertPrepared();
            return decision; // Never replace this step's already-captured selection.
        });
        this.ctx.on('llm/adapters-updated', () => { this.validated.clear(); });
        this.ctx.on('llm/models-updated', () => { this.validated.clear(); });
        this.ctx.on('agent/disposed', ({ agent }) => {
            const runtime = this.runtimes.get(agent);
            if (runtime !== undefined)
                for (const dispose of runtime.disposers)
                    dispose();
            this.runtimes.delete(agent);
            if (runtime?.membership.role === 'lead')
                this.states.delete(String(runtime.membership.id));
        });
        this.ctx.effect(() => () => this.stop(), 'teamRouter.cleanup');
        for (const agent of this.ctx.agents.list()) {
            // Do not splice routing into a running turn when enabling the plugin live.
            if (agent.status !== 'idle')
                throw new Error('Enable dsh-team-router only when existing Agents are idle, or restart the Host');
            await this.install(agent);
        }
    }
    stop() {
        this.stopped = true;
        for (const runtime of this.runtimes.values()) {
            for (const dispose of runtime.disposers)
                dispose();
            if (runtime.membership.role !== 'teammate' || this.ctx.agents.get(runtime.agent.id) !== runtime.agent)
                continue;
            const saved = this.states.get(String(runtime.membership.id))?.members[String(runtime.agent.id)];
            // Do not overwrite a later selection made by another owner.
            if (saved !== undefined && equal(runtime.agent.model.current(), saved.selected) && !equal(saved.selected, saved.baseline)) {
                try {
                    runtime.agent.model.select(selection(saved.baseline));
                }
                catch (error) {
                    this.ctx.logger.warn(`Could not restore ${runtime.membership.name}: ${errorText(error)}`);
                }
            }
        }
        this.runtimes.clear();
        this.states.clear();
        this.validated.clear();
    }
}
export async function apply(ctx, config = { routes: {} }) {
    await new TeamRouter(ctx, config).start();
}
//# sourceMappingURL=index.js.map