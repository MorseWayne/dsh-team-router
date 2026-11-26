import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import type { Fiber } from '@deepseek-ai/cordis';
import { updateVolatile } from '@deepseek-ai/cosmokit';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { TeamService } from '@deepseek-ai/dsh-agent-team';
import * as localFs from '@deepseek-ai/dsh-fs-local';
import { LlmAdapter, LlmRuntime, ReasoningEffortId, createUserMessage } from '@deepseek-ai/dsh-llm';
import type { ContentBlock, GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm';
import { SessionId, SessionStore } from '@deepseek-ai/dsh-session';
import * as jsonl from '@deepseek-ai/dsh-session-persistence-jsonl';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SqliteSessionQueryEngine } from '@deepseek-ai/dsh-session-query-sqlite';
import { SubagentRuntime } from '@deepseek-ai/dsh-subagent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import * as fork from '@deepseek-ai/dsh-subagent-fork-in-process';
import * as spawn from '@deepseek-ai/dsh-subagent-spawn-in-process';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import * as nativeExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { ToolsService } from '@deepseek-ai/dsh-tools';
import type { ToolRunContext } from '@deepseek-ai/dsh-tools';
import { WorkingDirectoryService } from '@deepseek-ai/dsh-working-directory';
import * as router from '../src/index.ts';
import { NativeTeams } from '../src/adapter/dsh/native-team.ts';
import type { Config as EffectiveRouterConfig } from '../src/adapter/dsh/config.ts';
import type { RouterConfig } from '../src/core/policy.ts';
import type { RoutingPolicyV2, Target } from '../src/core/routing-policy.ts';
import type { ExecutionRecord } from '../src/core/execution-store.ts';

// Same released log-only event used by dsh-tool-subagent's user-controlled opt-in.
// The harness appends through Session (never mutates the router's projection).
declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    'subagent/model-selection-policy': { allowedModels: Array<{ provider: string; model: string }> };
  }
}

export const safePolicy = (): RoutingPolicyV2 => ({
  version: 2, defaultTarget: { executor: 'native', model: { mode: 'inherit' } }, categories: {}, historyLimit: 100,
});
export const explicitTarget = (model: string, reasoningEffort?: string): Target => ({
  executor: 'native', model: { mode: 'explicit', provider: 'offline', id: model,
    ...(reasoningEffort === undefined ? {} : { reasoningEffort }) },
});
type HarnessConfig = RouterConfig | { policyV2: RoutingPolicyV2 };

export const text = (value: string): ContentBlock[] => [{ type: 'text', text: value }];
export const route = (model: string, reasoningEffort?: string) => ({
  provider: 'offline', model, ...(reasoningEffort === undefined ? {} : { reasoningEffort: ReasoningEffortId(reasoningEffort) }),
});
export const config = (): RouterConfig => ({
  routes: { fast: route('fast'), review: route('review', 'high'), strong: route('strong') },
  rules: [
    { id: 'cheap-list', keywords: ['list', 'inventory'], route: 'fast' },
    { id: 'review-code', keywords: ['review', 'audit'], route: 'review', priority: 10 },
  ],
  roles: { reviewer: 'review' },
});

/** Only the LLM transport is synthetic: all sessions, Agents, Teams and hooks are native. */
export class OfflineAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = [];
  private readonly gates: Array<ReturnType<typeof this.makeGate>> = [];

  override async listModels(provider: string) {
    return ['strong', 'fast', 'review'].map((id) => ({ provider, id, name: `Offline ${id}`, inputModalities: ['text' as const] }));
  }

  override async resolveModel(provider: string, model: string, signal?: AbortSignal): Promise<LlmResolvedModelInfo> {
    signal?.throwIfAborted();
    const found = (await this.listModels(provider)).find((entry) => entry.id === model);
    assert.ok(found, `Unexpected offline model lookup: ${model}`);
    return { ...found, context: { contextWindow: 65536 }, reasoning: {
      efforts: [{ id: ReasoningEffortId('low'), name: 'Low' }, { id: ReasoningEffortId('high'), name: 'High' }],
    } };
  }

  private makeGate() {
    return { started: Promise.withResolvers<GenerateOptions>(), released: Promise.withResolvers<void>() };
  }

  /** Explicit rendezvous for a running-request test; never sleeps or polls. */
  holdNextRequest() {
    const gate = this.makeGate();
    this.gates.push(gate);
    return { started: gate.started.promise, release: () => gate.released.resolve(), fail: (error: Error) => gate.released.reject(error) };
  }

  releaseAll() {
    for (const gate of this.gates) gate.released.resolve();
    this.gates.length = 0;
  }

  override async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    options.signal?.throwIfAborted();
    this.requests.push(options);
    const gate = this.gates.shift();
    if (gate !== undefined) {
      gate.started.resolve(options);
      const aborted = Promise.withResolvers<never>();
      const onAbort = () => aborted.reject(options.signal?.reason ?? new Error('Offline request aborted'));
      options.signal?.addEventListener('abort', onAbort, { once: true });
      try { await Promise.race([gate.released.promise, aborted.promise]); }
      finally { options.signal?.removeEventListener('abort', onAbort); }
    }
    options.signal?.throwIfAborted();
    yield { type: 'block-start', index: 0, blockType: 'text' };
    yield { type: 'text-delta', index: 0, text: 'Offline completion.' };
    yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Offline completion.' } };
    yield { type: 'finish', reason: { kind: 'stop' } };
  }
}

export interface RouterStatus {
  teamId: string;
  policy: RoutingPolicyV2;
  migrationRequired: boolean;
  externalExecutors: Record<'codex' | 'agy' | 'cursor', string>;
  executions: Array<ExecutionRecord & { actualModel: ReturnType<typeof route> | null }>;
}
export interface Delegated {
  kind: 'activation'; name: string; executionId: string; category: string; target: Target;
}

export class NativeHarness {
  readonly ctx = new Context();
  readonly adapter = new OfflineAdapter();
  readonly teams = new NativeTeams(this.ctx);
  readonly activations = new Map<string, SubagentActivation>();
  readonly errors: Array<{ agent: Agent; error: unknown }> = [];
  readonly handles: AgentHandle[] = [];
  readonly created: Agent[] = [];
  readonly signals = new AbortController();
  readonly fibers: Fiber[] = [];
  routerFiber: Fiber | undefined;
  private serial = 0;
  private closed = false;
  private readonly completing = new WeakSet<Agent>();

  /** Let a selected real child settle naturally instead of parking test context. */
  allowCompletion(agent: Agent) {
    this.completing.add(agent);
    agent.inbox.clear();
  }

  readonly directory: string;
  readonly policy: HarnessConfig;
  private readonly defaultEnabled: boolean;
  private constructor(directory: string, policy: HarnessConfig, defaultEnabled: boolean) {
    this.directory = directory;
    this.policy = policy;
    this.defaultEnabled = defaultEnabled;
  }

  static async create(policy: HarnessConfig = { policyV2: safePolicy() }, defaultEnabled = true) {
    const harness = new NativeHarness(await mkdtemp(join(tmpdir(), 'dsh-team-router-native-')), policy, defaultEnabled);
    try { await harness.mount(); return harness; }
    catch (error) { await harness.close(); throw error; }
  }

  private async mount() {
    const { ctx } = this;
    // Mount service providers in dependency order; namespace plugins retain inject/Config metadata.
    this.fibers.push(await ctx.plugin(SessionStore));
    this.fibers.push(await ctx.plugin(SessionProjectionRegistry));
    this.fibers.push(await ctx.plugin(SystemPrompt));
    this.fibers.push(await ctx.plugin(ToolsService));
    this.fibers.push(await ctx.plugin(nativeExecutor));
    this.fibers.push(await ctx.plugin(LlmRuntime));
    ctx.llm.registerAdapter(['offline'], this.adapter);
    this.fibers.push(await ctx.plugin(AgentRegistry));
    this.fibers.push(await ctx.plugin(localFs.default, { cwd: this.directory }));
    this.fibers.push(await ctx.plugin(WorkingDirectoryService, { defaultDirectory: this.directory }));
    this.fibers.push(await ctx.plugin(jsonl, { root: join(this.directory, 'sessions'), compression: 'none' }));
    this.fibers.push(await ctx.plugin(SqliteSessionQueryEngine, { path: ':memory:', openAt: 'never' }));
    this.fibers.push(await ctx.plugin(AgentLoop, { agents: [] }));
    this.fibers.push(await ctx.plugin(SubagentRuntime, { maxActiveSubagents: 32, maxDepth: 2 }));
    this.fibers.push(await ctx.plugin(spawn, { providerName: 'spawn' }));
    this.fibers.push(await ctx.plugin(fork, { providerName: 'fork' }));
    // Tests opt in explicitly; production/native Team mode defaults to false.
    this.fibers.push(await ctx.plugin(TeamService, { defaultEnabled: this.defaultEnabled }));
    ctx.on('agent/error', ({ agent, error }) => { this.errors.push({ agent, error }); });
    ctx.on('agent/created', ({ agent }) => { this.created.push(agent); return undefined; });
    // Native continuable activations normally unload on empty-inbox settlement. Park a
    // non-waking native context at true idle so task/override assertions can use the same
    // live Agent. It is cleared synchronously before the next explicitly driven turn.
    ctx.on('agent/status', ({ agent, status }) => {
      if (!this.closed && !this.completing.has(agent) && status === 'idle' && this.teams.tryMembership(agent)?.role === 'teammate') {
        agent.inject(createUserMessage({ content: text('Parked offline test context.'), source: { kind: 'user' } }));
      }
    });
    await this.reloadRouter();
  }

  async unloadRouter() {
    await this.routerFiber?.dispose();
    this.routerFiber = undefined;
  }

  async reloadRouter() {
    assert.equal(this.routerFiber, undefined, 'Unload the old plugin before remounting');
    this.routerFiber = await this.ctx.plugin(router, { ...this.policy, stateDir: join(this.directory, 'routes') });
  }

  /** Test-only live commit: native candidate validation then Loader-style refs.
   * This is not ConfigEditor persistence; those paths have separate real-Loader tests.
   */
  updatePolicy(policy: HarnessConfig) {
    const fiber = this.routerFiber;
    assert.ok(fiber, 'A mounted native router Fiber is required');
    const active = fiber.effectiveConfig as EffectiveRouterConfig;
    const candidate = fiber.resolveConfig({ ...policy, stateDir: active.stateDir }) as EffectiveRouterConfig;
    assert.equal(candidate.stateDir, active.stateDir, 'This helper only commits live policy fields');
    for (const key of ['policyV2', 'routes', 'rules', 'roles', 'defaultRoute', 'historyLimit'] as const) {
      updateVolatile(active[key], candidate[key]);
    }
    assert.equal(fiber.effectiveConfig, active, 'Live updates retain the native effective config references');
  }

  async lead(prefix = 'lead', reasoningEffort?: string) {
    const handle = await this.ctx.agents.create({
      sessionId: SessionId(`${prefix}-${++this.serial}`),
      meta: { cwd: this.directory },
      agentOptions: route('strong', reasoningEffort),
    });
    this.handles.push(handle);
    return handle.agent;
  }

  async teammate(lead: Agent, name: string, prompt: string, provider: 'spawn' | 'fork' = 'spawn', description = 'Offline teammate') {
    const activation = await this.ctx.subagents.startActivation({
      name, label: description, prompt: text(prompt), provider, parent: lead,
      delivery: 'caller', signal: this.signals.signal,
    });
    this.activations.set(activation.childId, activation);
    const agent = this.ctx.agents.get(activation.childId);
    assert.ok(agent, `Native teammate ${name} should be resident`);
    return agent;
  }

  /** Dispose the exact native activation; future resumes have a different owner. */
  async evict(agent: Agent) {
    const activation = this.activations.get(agent.id);
    assert.ok(activation, 'Cold-resume fixture requires its returned native activation');
    await activation.dispose();
    this.activations.delete(agent.id);
    assert.equal(this.ctx.agents.get(agent.id), undefined);
  }

  requests(agent: Agent) {
    return this.adapter.requests.filter((request) => request.sessionId === agent.id);
  }

  async idle(agent: Agent, expectedRequests?: number) {
    await agent.whenIdle();
    assert.equal(agent.status, 'idle');
    assert.deepEqual(this.errors.filter((entry) => entry.agent === agent), [], 'whenIdle() is not proof of a successful turn');
    if (expectedRequests !== undefined) assert.equal(this.requests(agent).length, expectedRequests, 'Actual adapter dispatch count');
  }

  async drive(agent: Agent, prompt: string, expectedRequests?: number) {
    agent.inbox.clear();
    agent.followup(createUserMessage({ content: text(prompt), source: { kind: 'user' } }));
    await this.idle(agent, expectedRequests);
  }

  async tool<T = unknown>(agent: Agent, name: string, args: unknown = {}, caller: Agent = agent): Promise<T> {
    const definition = this.ctx.tools.get(name, agent);
    assert.ok(definition, `${name} must be visible in ${agent.id}'s native scope`);
    // Exercise the actual registered tool definition and its authority checks. The
    // plugin needs only these execution fields; no runtime or Team methods are mocked.
    return await definition.execute(args, { agent: caller, signal: this.signals.signal } as ToolRunContext) as T;
  }

  status(agent: Agent) { return this.tool<RouterStatus>(agent, 'team_route_status'); }

  authorize(agent: Agent, models = ['strong', 'fast', 'review']) {
    agent.session.append('subagent/model-selection-policy', {
      allowedModels: models.map(model => ({ provider: 'offline', model })),
    });
  }

  delegate(lead: Agent, category = 'unspecified', name = 'routed-worker', prompt = 'Produce evidence for this task.') {
    return this.tool<Delegated>(lead, 'team_route_delegate', { category, name, prompt, description: 'Offline routed task' });
  }

  async child(lead: Agent, executionId: string) {
    const record = (await this.status(lead)).executions.find(row => row.id === executionId);
    assert.ok(record?.childId, 'Accepted routing must publish a native child identity');
    const agent = this.ctx.agents.get(SessionId(record.childId));
    assert.ok(agent, 'Native routed child must be resident');
    return agent;
  }

  cancel(lead: Agent, executionId: string) {
    return this.tool<{ executionId: string; stopped: boolean; sideEffectsRolledBack: boolean }>(lead, 'team_route_cancel', { executionId });
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    this.signals.abort(new Error('Native test teardown'));
    this.adapter.releaseAll();
    try {
      // Draining native activations before the persistence provider unloads avoids
      // racing independently owned Cordis sibling disposers.
      for (const handle of [...this.handles].reverse()) {
        if (this.ctx.subagents) await this.ctx.subagents.drainDescendants([handle.agent]);
        await handle.dispose();
      }
      await this.unloadRouter();
      for (const fiber of [...this.fibers].reverse()) await fiber.dispose();
      await this.ctx.fiber.dispose();
    } finally {
      assert.ok(this.directory.startsWith(join(tmpdir(), 'dsh-team-router-native-')));
      await rm(this.directory, { recursive: true, force: true });
    }
  }
}
