import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Context } from '@deepseek-ai/cordis';
import type { Fiber } from '@deepseek-ai/cordis';
import { AgentRegistry } from '@deepseek-ai/dsh-agent';
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import { AgentLoop } from '@deepseek-ai/dsh-agent-loop';
import { TeamService } from '@deepseek-ai/dsh-experimental-agent-team';
import * as localFs from '@deepseek-ai/dsh-fs-local';
import { LlmAdapter, LlmRuntime, createUserMessage } from '@deepseek-ai/dsh-llm';
import type { ContentBlock, GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm';
import { SessionId, SessionStore } from '@deepseek-ai/dsh-session';
import * as jsonl from '@deepseek-ai/dsh-session-persistence-jsonl';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import { SqliteSessionQueryEngine } from '@deepseek-ai/dsh-session-query-sqlite';
import { SubagentRuntime } from '@deepseek-ai/dsh-subagent';
import * as fork from '@deepseek-ai/dsh-subagent-fork-in-process';
import * as spawn from '@deepseek-ai/dsh-subagent-spawn-in-process';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import * as nativeExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { ToolsService } from '@deepseek-ai/dsh-tools';
import type { ToolRunContext } from '@deepseek-ai/dsh-tools';
import { WorkingDirectoryService } from '@deepseek-ai/dsh-working-directory';
import * as router from '../src/index.ts';
import type { RouterConfig } from '../src/policy.ts';

export const text = (value: string): ContentBlock[] => [{ type: 'text', text: value }];
export const route = (model: string, reasoningEffort?: string) => ({
  provider: 'offline', model, ...(reasoningEffort === undefined ? {} : { reasoningEffort }),
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
      efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }],
    } } as LlmResolvedModelInfo;
  }

  private makeGate() {
    return { started: Promise.withResolvers<GenerateOptions>(), released: Promise.withResolvers<void>() };
  }

  /** Explicit rendezvous for a running-request test; never sleeps or polls. */
  holdNextRequest() {
    const gate = this.makeGate();
    this.gates.push(gate);
    return { started: gate.started.promise, release: () => gate.released.resolve() };
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
  members: Array<{
    id: string; name: string; role: string;
    lastUsed: ReturnType<typeof route> | null; nextSelection: ReturnType<typeof route> | null;
    selected: ReturnType<typeof route> | null;
    decision: { source: string; routeName?: string; ruleId?: string } | null;
    manualRoute: string | null; error: string | null;
  }>;
  history: Array<{ memberId: string; boundary: string; source: string; route: ReturnType<typeof route>; ruleId?: string }>;
}

export class NativeHarness {
  readonly ctx = new Context();
  readonly adapter = new OfflineAdapter();
  readonly errors: Array<{ agent: Agent; error: unknown }> = [];
  readonly handles: AgentHandle[] = [];
  readonly created: Agent[] = [];
  readonly signals = new AbortController();
  readonly fibers: Fiber[] = [];
  routerFiber?: Fiber;
  private serial = 0;
  private closed = false;

  readonly directory: string;
  readonly policy: RouterConfig;
  private constructor(directory: string, policy: RouterConfig) {
    this.directory = directory;
    this.policy = policy;
  }

  static async create(policy: RouterConfig = config()) {
    const harness = new NativeHarness(await mkdtemp(join(tmpdir(), 'dsh-team-router-native-')), policy);
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
    this.fibers.push(await ctx.plugin(TeamService));
    ctx.on('agent/error', ({ agent, error }) => { this.errors.push({ agent, error }); });
    ctx.on('agent/created', ({ agent }) => { this.created.push(agent); return undefined; });
    // Native continuable activations normally unload on empty-inbox settlement. Park a
    // non-waking native context at true idle so task/override assertions can use the same
    // live Agent. It is cleared synchronously before the next explicitly driven turn.
    ctx.on('agent/status', ({ agent, status }) => {
      if (!this.closed && status === 'idle' && ctx.agentTeams.tryMembership(agent)?.role === 'teammate') {
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

  async lead(prefix = 'lead') {
    const handle = await this.ctx.agents.create({
      sessionId: SessionId(`${prefix}-${++this.serial}`),
      meta: { cwd: this.directory },
      agentOptions: route('strong'),
    });
    this.handles.push(handle);
    return handle.agent;
  }

  async teammate(lead: Agent, name: string, prompt: string, provider: 'spawn' | 'fork' = 'spawn', description = 'Offline teammate') {
    const result = await this.ctx.agentTeams.spawnTeammate(lead, {
      name, description, prompt: text(prompt), provider,
      context: provider === 'fork' ? 'fork' : 'fresh', signal: this.signals.signal,
    });
    const agent = this.ctx.agents.get(result.member.id);
    assert.ok(agent, `Native teammate ${name} should be resident`);
    return agent;
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
