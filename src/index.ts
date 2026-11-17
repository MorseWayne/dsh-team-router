import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Context } from '@deepseek-ai/cordis';
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent';
import { NativeTeams } from './native-team.ts';
import type { TeamMembership } from './native-team.ts';
import { Config, installConfigValidation, readPolicy } from './config.ts';
import type {} from '@deepseek-ai/dsh-settings';
export { Config } from './config.ts';
import type {} from '@deepseek-ai/dsh-llm';
import type {} from '@deepseek-ai/dsh-session';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { decide } from './policy.ts';
import type { NormalizedConfig, Route } from './policy.ts';
import { StateStore } from './store.ts';
import type { TeamState } from './store.ts';

export const name = 'team-router';
export const inject = ['agents', 'agentTeams', 'subagents', 'tools', 'llm'];

interface Runtime {
  agent: Agent;
  membership: TeamMembership;
  turn: number;
  text: string;
  error?: string;
  disposers: Array<() => void>;
}
const equal = (a: Route | undefined, b: Route | undefined): boolean => a?.provider === b?.provider
  && a?.model === b?.model && a?.reasoningEffort === b?.reasoningEffort;
const selection = (route: Route): ModelSelection => ({ ...route } as ModelSelection);
const errorText = (error: unknown): string => error instanceof Error ? error.message : String(error);

/** Exposed for offline verification; mount through apply() in a real Host. */
export class TeamRouter {
  readonly store: StateStore;
  readonly teams: NativeTeams;
  private readonly configuration: Config;
  get policy(): NormalizedConfig { return readPolicy(this.configuration); }
  private readonly states = new Map<string, TeamState>();
  private readonly runtimes = new Map<Agent, Runtime>();
  private readonly validated = new Map<string, Promise<void>>();
  private stopped = false;
  private readonly ctx: Context;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.configuration = config;
    this.teams = new NativeTeams(ctx);
    const policy = readPolicy(config);
    this.store = new StateStore(config.stateDir === undefined ? join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'storages', 'team-router') : resolve(config.stateDir), policy.historyLimit);
  }

  private state(id: string): TeamState {
    let state = this.states.get(id);
    if (state === undefined) {
      this.store.setHistoryLimit(this.policy.historyLimit);
      state = this.store.load(id);
      this.states.set(id, state);
    }
    return state;
  }
  private commit(state: TeamState): void {
    this.store.save(state);
    this.states.set(state.teamId, state);
  }
  private caller(agent: Agent | undefined): TeamMembership {
    if (this.stopped) throw new Error('Team router has been disposed');
    if (agent === undefined) throw new Error('A native Agent Teams caller is required');
    const membership = this.teams.tryMembership(agent);
    if (membership === undefined) throw new Error('Caller is not a live native Agent Teams member');
    return membership;
  }

  /** A bounded metadata check, not a provider health, quota, or billing probe. */
  private async validate(route: Route, signal?: AbortSignal): Promise<void> {
    const key = JSON.stringify(route);
    let pending = this.validated.get(key);
    if (pending === undefined) {
      pending = (async () => {
        if (!this.ctx.llm.listProviders().some((provider) => provider.id === route.provider)) throw new Error(`Unregistered model provider: ${route.provider}`);
        const abort = AbortSignal.timeout(5000);
        let listener: (() => void) | undefined;
        try {
          const models = await Promise.race([
            this.ctx.llm.listModels(route.provider),
            new Promise<never>((_resolve, reject) => {
              listener = () => reject(new Error(`Model catalog timed out: ${route.provider}`));
              abort.addEventListener('abort', listener, { once: true });
            }),
          ]);
          if (!models.some((model) => model.id === route.model)) throw new Error(`Model is not advertised by ${route.provider}: ${route.model}. Add it to that provider's model catalog before routing.`);
          await this.ctx.llm.resolveCallConfig(selection(route), abort);
        } finally {
          if (listener !== undefined) abort.removeEventListener('abort', listener);
        }
      })();
      this.validated.set(key, pending);
      void pending.catch(() => { if (this.validated.get(key) === pending) this.validated.delete(key); });
    }
    await pending;
    signal?.throwIfAborted();
  }

  /** Select future steps at creation, first turn claim, task edges, or idle overrides; never rewrite an admitted step. */
  private refresh(runtime: Runtime, force = false): void {
    const { agent, membership } = runtime;
    if (this.ctx.agents.get(agent.id) !== agent || this.teams.tryMembership(agent)?.role !== 'teammate') return;
    const state = this.state(String(membership.id));
    const tasks = this.ctx.agentTeams.listTasks(agent).filter((task) => task.ownerId === agent.id && task.status === 'in_progress');
    const owned = tasks.length > 0 ? tasks : this.ctx.agentTeams.listTasks(agent).filter((task) => task.ownerId === agent.id && task.status === 'pending' && task.ready);
    const ids = owned.map((task) => String(task.id)).sort();
    const key = ids.length > 0 ? `tasks:${JSON.stringify(ids)}` : `turn:${runtime.turn}`;
    const previous = state.members[String(agent.id)];
    const manualRoute = state.overrides[String(agent.id)];
    const sameOverride = previous?.decision.source === 'manual'
      ? previous.decision.routeName === manualRoute : manualRoute === undefined;
    if (!force && previous?.key === key && sameOverride) {
      // A settings edit alone does not interrupt this task's latched choice.
      if (!equal(agent.model.current(), previous.selected)) agent.model.select(selection(previous.selected));
      return;
    }
    const baseline = previous?.baseline ?? agent.model.current();
    if (baseline === undefined) throw new Error(`Teammate ${membership.name} has no complete inherited model route`);
    const member = this.teams.liveMembers(agent).find((row) => row.id === agent.id);
    const taskText = owned.length > 0 ? owned.map((task) => `${task.subject}\n${task.description}`).join('\n') : runtime.text || member?.description || '';
    const policy = this.policy;
    const decision = decide(policy, { memberName: membership.name, taskText, ...(manualRoute === undefined ? {} : { manualRoute }) });
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
      next.history = next.history.slice(-policy.historyLimit);
      this.commit(next);
    }
    if (!equal(agent.model.current(), selected)) agent.model.select(selection(selected));
    delete runtime.error;
  }
  private safeRefresh(runtime: Runtime, force = false): void {
    try { this.refresh(runtime, force); } catch (error) {
      runtime.error = errorText(error);
      this.ctx.logger.warn(`Team router blocked ${runtime.membership.name}: ${runtime.error}`);
    }
  }

  private async status(agent: Agent) {
    const membership = this.caller(agent);
    const members = await this.teams.listMembers(agent);
    if (this.caller(agent).root !== membership.root) throw new Error('Team identity changed while reading status');
    const state = this.state(String(membership.id));
    return {
      teamId: String(membership.id),
      routes: this.policy.routes,
      members: members.map((member) => {
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

  private tools(runtime: Runtime): void {
    const output = { schema: { type: 'json' } as const, render: (_args: unknown, value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }] };
    const caller = (agent: Agent | undefined): Agent => {
      if (agent !== runtime.agent) throw new Error('Router tool caller does not match its registered Agent');
      this.caller(agent);
      return agent;
    };
    runtime.disposers.push(runtime.agent.ctx.tools.register(defineTool({
      name: 'team_route_status',
      description: 'Inspect this native Agent Team model routing: actual/selected models, named route whitelist, manual overrides, rule sources, and bounded decision history. Read-only; does not start any agent.',
      parameters: {}, output,
      execute: async (_args, exec) => JSON.parse(JSON.stringify(await this.status(caller(exec.agent)))),
    })));
    if (runtime.membership.role !== 'lead') return;
    const target = async (agent: Agent, member: string) => {
      const membership = this.caller(agent);
      if (membership.role !== 'lead') throw new Error('Only the Team Lead may change model routes');
      const row = (await this.teams.listMembers(agent)).find((item) => item.name === member && item.role === 'teammate' && item.status !== 'failed');
      if (this.caller(agent).root !== membership.root) throw new Error('Team identity changed while resolving member');
      if (row === undefined) throw new Error(`No routable teammate named ${member}`);
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
        const { membership, row } = await target(agent, args.member);
        const policy = this.policy;
        const route = Object.hasOwn(policy.routes, args.route) ? policy.routes[args.route] : undefined;
        if (route === undefined) throw new Error(`Unknown named route: ${args.route}`);
        await this.validate(route, exec.signal);
        // Recheck authority and identity after metadata I/O, before committing the side effect.
        const current = await target(agent, args.member);
        if (current.membership.id !== membership.id || current.row.id !== row.id) throw new Error('Team identity changed while validating route');
        if (!equal(this.policy.routes[args.route], route)) throw new Error('Named route changed while validating it; inspect current policy and retry');
        const next = structuredClone(this.state(String(membership.id)));
        next.overrides[String(row.id)] = args.route;
        this.commit(next);
        const live = this.ctx.agents.get(row.id);
        const tracked = live === undefined ? undefined : this.runtimes.get(live);
        if (tracked !== undefined && live?.status === 'idle') this.refresh(tracked, true);
        return { member: args.member, route: args.route, applies: live?.status === 'idle' ? 'next-step' : 'next-turn-or-task-boundary' };
      },
    })));
    runtime.disposers.push(runtime.agent.ctx.tools.register(defineTool({
      name: 'team_route_reset',
      description: 'Lead only: remove one teammate manual route override. Falls back to task rules, then role/default, then the original inherited route at the next safe boundary; never interrupts or wakes work.',
      parameters: { member: { type: 'string', required: true, description: 'Exact teammate name.' } }, output,
      execute: async (args, exec) => {
        const agent = caller(exec.agent);
        const { membership, row } = await target(agent, args.member);
        const next = structuredClone(this.state(String(membership.id)));
        delete next.overrides[String(row.id)];
        this.commit(next);
        const live = this.ctx.agents.get(row.id);
        const tracked = live === undefined ? undefined : this.runtimes.get(live);
        if (tracked !== undefined && live?.status === 'idle') this.refresh(tracked, true);
        return { member: args.member, reset: true, applies: live?.status === 'idle' ? 'next-step' : 'next-turn-or-task-boundary' };
      },
    })));
  }

  private async install(agent: Agent, signal?: AbortSignal, deferRoute = false): Promise<void> {
    if (this.stopped || this.runtimes.has(agent)) return;
    const membership = this.teams.tryMembership(agent);
    if (membership === undefined) return; // Ordinary/workflow children must remain untouched.
    if (agent.model?.select === undefined || agent.model.current === undefined) throw new Error('dsh-team-router requires the Agent.model API in DSH 0.2.2-rc.3');
    const runtime: Runtime = { agent, membership, turn: 0, text: '', disposers: [] };
    this.runtimes.set(agent, runtime);
    try {
      this.tools(runtime);
      if (membership.role === 'teammate' && !deferRoute) {
        // rc.3 establishes runtime ancestry at subagent/start, before queuing input.
        this.refresh(runtime, true);
        const saved = this.state(String(membership.id)).members[String(agent.id)];
        if (saved !== undefined && saved.decision.source !== 'inherit') await this.validate(saved.selected, signal);
      }
    } catch (error) {
      runtime.error = errorText(error);
      throw error;
    }
  }

  async start(): Promise<void> {
    this.ctx.on('agent/created', async ({ agent, signal }) => { await this.install(agent, signal); return undefined; });
    this.ctx.on('subagent/start', (info) => {
      const agent = this.ctx.agents.get(info.id);
      if (agent !== undefined) void this.install(agent).catch((error) => {
        this.ctx.logger.warn(`Team router initialization blocked ${info.id}: ${errorText(error)}`);
      });
    });
    this.ctx.on('agent/inbox/claimed', ({ agent, message, turn }) => {
      const runtime = this.runtimes.get(agent);
      if (runtime?.membership.role !== 'teammate' || runtime.turn === turn) return;
      runtime.turn = turn;
      runtime.text = message.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n');
      this.safeRefresh(runtime, true); // This synchronous event precedes model.current() capture.
    });
    this.ctx.on('session/event', (session, event) => {
      if (event.type === 'team/mode') {
        for (const runtime of [...this.runtimes.values()]) {
          if (runtime.membership.root.session === session && !event.data.enabled) this.release(runtime);
        }
        if (event.data.enabled) for (const agent of this.ctx.agents.list()) {
          if (this.teams.tryMembership(agent)?.root.session === session) void this.install(agent, undefined, agent.status === 'running').catch((error) => {
            this.ctx.logger.warn(`Team router mode initialization failed: ${errorText(error)}`);
          });
        }
        return;
      }
      if (event.type !== 'team/task') return;
      for (const runtime of this.runtimes.values()) {
        if (runtime.membership.role === 'teammate' && runtime.membership.root.session === session && String(runtime.membership.id) === String(event.data.teamId)) this.safeRefresh(runtime);
      }
    });
    this.ctx.on('agent/pre-step', async (payload, next) => {
      const runtime = this.runtimes.get(payload.agent);
      if (runtime?.membership.role !== 'teammate') return next();
      const assertPrepared = () => {
        if (this.stopped) return undefined;
        if (runtime.error !== undefined) throw new Error(runtime.error);
        const saved = this.state(String(runtime.membership.id)).members[String(payload.agent.id)];
        if (saved !== undefined && !equal(payload.modelSelection, saved.selected)) {
          throw new Error('Team route changed during step preparation. Request blocked; inspect team_route_status and explicitly resend the input if still needed. No automatic replay.');
        }
        return saved;
      };
      const saved = assertPrepared();
      if (saved !== undefined && saved.decision.source !== 'inherit') {
        try {
          // A settings edit is not a task boundary. Keep validating the existing
          // latch even if its named route changed, until refresh chooses anew.
          await this.validate(saved.selected, payload.signal);
        } catch (error) { runtime.error = errorText(error); throw error; }
      }
      // Task commits can run while adapter metadata or downstream guards are awaited.
      assertPrepared();
      const decision = await next();
      if (decision.kind !== 'reject') assertPrepared();
      return decision; // Never replace this step's already-captured selection.
    });
    this.ctx.on('llm/adapters-updated', () => { this.validated.clear(); });
    this.ctx.on('llm/models-updated', () => { this.validated.clear(); });
    this.ctx.on('agent/disposed', ({ agent }) => {
      const runtime = this.runtimes.get(agent);
      if (runtime !== undefined) for (const dispose of runtime.disposers) dispose();
      this.runtimes.delete(agent);
      if (runtime?.membership.role === 'lead') this.states.delete(String(runtime.membership.id));
    });
    this.ctx.effect(() => () => this.stop(), 'teamRouter.cleanup');
    for (const agent of this.ctx.agents.list()) {
      // Installing the editor must not splice policy into an existing running turn.
      await this.install(agent, undefined, agent.status === 'running');
    }
  }

  private release(runtime: Runtime): void {
    for (const dispose of runtime.disposers) dispose();
    if (runtime.membership.role === 'teammate' && this.ctx.agents.get(runtime.agent.id) === runtime.agent) {
      const saved = this.states.get(String(runtime.membership.id))?.members[String(runtime.agent.id)];
      // Do not overwrite a later selection made by another owner.
      if (saved !== undefined && equal(runtime.agent.model.current(), saved.selected) && !equal(saved.selected, saved.baseline)) {
        try { runtime.agent.model.select(selection(saved.baseline)); }
        catch (error) { this.ctx.logger.warn(`Could not restore ${runtime.membership.name}: ${errorText(error)}`); }
      }
    }
    this.runtimes.delete(runtime.agent);
  }

  stop(): void {
    this.stopped = true;
    for (const runtime of [...this.runtimes.values()]) this.release(runtime);
    this.runtimes.clear();
    this.states.clear();
    this.validated.clear();
  }
}

export async function apply(ctx: Context, config: Config): Promise<void> {
  readPolicy(config);
  installConfigValidation(ctx);
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber), 'teamRouter.settingsPresentation');
  });
  await new TeamRouter(ctx, config).start();
}
