import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions } from '@deepseek-ai/dsh-llm';
import { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
import * as nativeTool from '@deepseek-ai/dsh-tool-subagent';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { defineTool } from '@deepseek-ai/dsh-tools';
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent';
import { BUILTIN_IDS } from '../src/core/categories.ts';
import { resolveActiveRegistry } from '../src/core/active-registry.ts';
import {
  buildNativeRoutingPlan, buildNativeSubagentGuidance, buildNativeSubagentReminder, buildTeamFallbackGuidance,
  projectSessionPlan, validateNativeSubagentCall,
} from '../src/core/native-subagent.ts';
import type { RoutingBehavior, RoutingConfig } from '../src/core/routing-policy.ts';
import { NativeHarness, customCategory, explicitTarget, route, safeRouting, text } from './helpers.ts';

function mixed(behavior: Partial<RoutingBehavior> = {}): RoutingConfig {
  const config = safeRouting();
  config.behavior = { ...config.behavior, ...behavior };
  config.builtins = { writing: { binding: explicitTarget('fast') }, ultrabrain: { binding: explicitTarget('review', 'high') } };
  return config;
}
const call = (model: string, effort?: string) => ({ provider: 'offline', model, ...(effort === undefined ? {} : { reasoning_effort: effort }) });
function authorized(model: string) { return { provider: 'offline', model }; }

describe('core session routing plans', () => {
  it('projects enabled categories once and groups by the complete authorized tuple', () => {
    const config = mixed();
    config.builtins.debugging = { binding: explicitTarget('review', 'low') };
    config.builtins.deep = { binding: explicitTarget('review', 'high') };
    config.builtins.quick = { enabled: false };
    config.custom = [customCategory('custom-check', { binding: explicitTarget('review', 'high') })];
    const registry = resolveActiveRegistry(config);
    const session = { authorizedRoutes: [authorized('review')] };
    const plan = projectSessionPlan(registry, session);
    assert.deepEqual(plan, buildNativeRoutingPlan(config, session));
    assert.equal(plan.entries.find(entry => entry.category === 'writing')!.mode, 'unauthorized');
    assert.ok(!plan.entries.some(entry => entry.category === 'quick'));
    assert.deepEqual(plan.explicitGroups.map(group => [group.route.reasoningEffort, group.entries.map(e => e.category)]), [
      ['high', ['deep', 'ultrabrain', 'custom-check']], ['low', ['debugging']],
    ]);
    assert.equal(plan.inheritAllowed, true);
    assert.equal(buildNativeRoutingPlan(config, { authorizedRoutes: null, parentRoute: route('review') }).explicitRoutes.length, 2);
    assert.equal(buildNativeRoutingPlan(config, { authorizedRoutes: [] }).explicitRoutes.length, 0);
  });

  it('implements all four strict rows including active categories but no authorized explicit route', () => {
    const config = mixed();
    assert.deepEqual(validateNativeSubagentCall(config, call('unknown')), { ok: true });
    config.behavior.strict = true;
    for (const malformed of [{ ...call('fast'), provider: '' }, call(''), call('fast', ''), null, [], 'not-object', { provider: 'offline' }, { model: 'fast' }, { reasoning_effort: 'high' },
      { provider: false, model: 'fast' }, { ...call('fast'), reasoning_effort: 0 }]) {
      assert.deepEqual(validateNativeSubagentCall(config, malformed), { ok: true });
      assert.deepEqual(validateNativeSubagentCall(config, malformed, { authorizationUnavailable: true }), { ok: true });
    }
    assert.equal(validateNativeSubagentCall(config, {}).ok, true);
    assert.equal(validateNativeSubagentCall(config, call('review', 'high')).ok, true);
    assert.equal(validateNativeSubagentCall(config, call('review')).ok, false);
    assert.equal(validateNativeSubagentCall(config, call('review', 'low')).ok, false);
    const denied = { authorizedRoutes: [] };
    assert.equal(validateNativeSubagentCall(config, {}, denied).ok, true);
    assert.equal(validateNativeSubagentCall(config, call('fast'), denied).ok, false);
    const allInherit = safeRouting(); allInherit.behavior.strict = true;
    assert.equal(validateNativeSubagentCall(allInherit, call('fast')).ok, false);
    allInherit.defaultTarget = explicitTarget('fast');
    assert.equal(validateNativeSubagentCall(allInherit, {}).ok, false);
    assert.equal(validateNativeSubagentCall(allInherit, call('fast')).ok, true);
    for (const id of BUILTIN_IDS) allInherit.builtins[id] = { enabled: false };
    assert.equal(validateNativeSubagentCall(allInherit, {}).ok, true);
    assert.equal(validateNativeSubagentCall(allInherit, call('unconfigured')).ok, true);
  });

  it('distinguishes denied explicit routes, pure inheritance, disabled routing and unreadable grants', () => {
    const denied = { isRoot: true, authorizedRoutes: [] };
    const outage = { isRoot: true, authorizationUnavailable: true };
    const config = mixed({ strict: true, delegationMode: 'orchestrator' });
    for (const render of [buildNativeSubagentGuidance, buildTeamFallbackGuidance]) {
      assert.match(render(config, denied), /No explicit specialist route is authorized.*settings and start a new Session/);
      assert.match(render(config, outage), /authorization-unavailable/);
      for (const session of [denied, outage]) {
        assert.doesNotMatch(render(config, session), /offline|review|fast|high/);
        assert.equal(render({ ...config, behavior: { ...config.behavior, guidance: false } }, session), '');
      }
      assert.equal(render(safeRouting(), denied), '');
    }
    assert.match(buildNativeSubagentGuidance(config, denied), /Omit provider\/model\/reasoning_effort on host `subagent`/);
    const teamAdvice = buildTeamFallbackGuidance(config, denied);
    assert.match(teamAdvice, /`team_route_status`.*inherit category.*`team_route_delegate`/);
    assert.doesNotMatch(teamAdvice, /subagent|provider\/model/);
    const allExplicit = { ...config, defaultTarget: explicitTarget('private') };
    const noFallback = buildTeamFallbackGuidance(allExplicit, denied);
    assert.match(noFallback, /No explicit specialist route is authorized.*start a new Session/);
    assert.doesNotMatch(noFallback, /private|team_route_delegate|team_route_status|subagent|offline|review|fast|high/);
    for (const session of [denied, outage]) assert.equal(buildNativeSubagentReminder(config, session), '');
    for (const args of [{}, call('review', 'high'), call('other')]) {
      const result = validateNativeSubagentCall(config, args, outage);
      assert.equal(result.ok, false);
      if (!result.ok) assert.match(result.reason, /authorization-unavailable/);
    }
    assert.deepEqual(validateNativeSubagentCall(config, { model: 'partial' }, outage), { ok: true });
    assert.deepEqual(validateNativeSubagentCall(mixed(), call('other'), outage), { ok: true });
    for (const id of BUILTIN_IDS) config.builtins[id] = { enabled: false };
    for (const render of [buildNativeSubagentGuidance, buildTeamFallbackGuidance]) {
      assert.equal(render(config, denied), ''); assert.equal(render(config, outage), '');
    }
    assert.deepEqual(validateNativeSubagentCall(config, {}, outage), { ok: true });
  });

  it('only suggests an optional scout evidence pack when scout itself is a specialist', () => {
    const config = mixed({ delegationMode: 'specialist-first' });
    config.builtins.scout = { enabled: true, binding: explicitTarget('fast', 'low') };
    const session = { isRoot: true, parentRoute: route('fast', 'high'), authorizedRoutes: [authorized('fast'), authorized('review')] };
    const renderers = [buildNativeSubagentGuidance, buildNativeSubagentReminder, buildTeamFallbackGuidance];
    for (const render of renderers) {
      const hint = /Read known items directly\..*broad unknowns, scout may gather a read-only evidence pack.*clear scope or same model: owner handles it/;
      assert.match(render(config, session), hint);
      for (const context of [{ ...session, isRoot: false }, { ...session, parentRoute: route('fast', 'low') },
        { ...session, authorizedRoutes: [authorized('review')] }]) assert.doesNotMatch(render(config, context), /scout may gather/);
      for (const behavior of [{ ...config.behavior, guidance: false }, { ...config.behavior, delegationMode: 'passive' as const }]) {
        assert.doesNotMatch(render({ ...config, behavior }, session), /scout may gather/);
      }
      for (const scout of [{ enabled: false, binding: explicitTarget('fast', 'low') }, { enabled: true }]) {
        assert.doesNotMatch(render({ ...config, builtins: { ...config.builtins, scout } }, session), /scout may gather/);
      }
    }
  });

  it('does not advertise denied tuples and toggles proactive advice with config, root and tuple', () => {
    const config = mixed({ delegationMode: 'specialist-first' });
    const session = { isRoot: true, parentRoute: route('review', 'high'), authorizedRoutes: [authorized('review')] };
    const guidance = buildNativeSubagentGuidance(config, session);
    assert.match(guidance, /\("offline", "review", "high"\): ultrabrain/);
    assert.match(guidance, /Omit provider\/model\/reasoning_effort for host defaults or a compatible parent model: .*writing .*unauthorized/);
    assert.doesNotMatch(guidance, /"fast"|Specialist-first/);
    assert.equal(buildNativeSubagentReminder(config, session), '');
    const distinct = { ...session, parentRoute: route('review', 'low') };
    assert.match(buildNativeSubagentGuidance(config, distinct), /Specialist-first/);
    assert.match(buildNativeSubagentReminder(config, distinct), /\("offline", "review", "high"\): ultrabrain \(Conclusions/);
    assert.doesNotMatch(buildNativeSubagentReminder(config, distinct), /writing|"fast"|quick|unspecified/);
    assert.match(buildTeamFallbackGuidance(config, distinct), /team_route_status.*\n[\s\S]*categories: ultrabrain\./);
    assert.equal(buildNativeSubagentReminder(config, { ...distinct, isRoot: false }), '');
    assert.doesNotMatch(buildNativeSubagentGuidance(config, { ...distinct, isRoot: false }), /Specialist-first/);
    assert.match(buildNativeSubagentGuidance(config, { authorizedRoutes: [] }), /No explicit specialist route is authorized/);
    config.behavior.guidance = false;
    assert.equal(buildNativeSubagentGuidance(config, distinct), '');
    assert.equal(buildNativeSubagentReminder(config, distinct), '');
    assert.equal(buildTeamFallbackGuidance(config, distinct), '');
  });
});

const output = {
  schema: { type: 'json' } as const,
  render: (_args: unknown, value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }],
};
function registerSubagentTool(h: NativeHarness, selectable: boolean, calls: unknown[], name = 'subagent') {
  return h.ctx.tools.register(defineTool({
    name, description: 'Test native subagent tool', output,
    parameters: {
      prompt: { type: 'string', required: true }, description: { type: 'string', required: true },
      ...(selectable ? { provider: { type: 'string' }, model: { type: 'string' }, reasoning_effort: { type: 'string' } } : {}),
    },
    execute: async args => { calls.push(args); return { ok: true }; },
  }));
}
async function section(h: NativeHarness, agent: Agent, modelSelection?: ModelSelection): Promise<string | undefined> {
  const assembly = await h.ctx.systemPrompt.assemble({ scope: agent, agent, ...(modelSelection === undefined ? {} : { modelSelection }) });
  return assembly.sections.find(section => section.name === 'team-router:policy')?.text;
}
const reminders = (request: GenerateOptions) => request.messages.filter(m => m.source.kind === 'team-router:reminder');
async function tool(h: NativeHarness, agent: Agent, args: Record<string, unknown>, id: string) {
  const batch = await h.ctx.tools.execute({ agent, signal: h.signals.signal, calls: [{
    type: 'tool-call', id: ToolCallId(id), name: 'subagent', arguments: JSON.stringify({ prompt: 'work', description: 'work', ...args }),
  }] });
  assert.equal(batch.results.length, 1);
  return batch.results[0]!.result;
}

describe('released dsh-tool-subagent with offline live capabilities', { concurrency: false, timeout: 15_000 }, () => {
  async function mount(h: NativeHarness, defaults?: ReturnType<typeof route>) {
    const fiber = await h.ctx.plugin(nativeTool, { provider: 'spawn', modelSelection: true,
      ...(defaults === undefined ? {} : { agentOptions: defaults }),
    });
    h.fibers.push(fiber);
    return fiber;
  }
  it('enforces session authorization and effort preflight even when router strict is off', async t => {
    const h = await NativeHarness.create({ routing: mixed() }); t.after(() => h.close());
    await mount(h);
    const root = await h.lead(); h.authorize(root, ['review']);
    const probes = t.mock.method(h.adapter, 'resolveModel');
    const denied = await tool(h, root, call('fast'), 'host-denied');
    assert.equal(denied.isError, true);
    assert.match(denied.content[0]!.text, /not allowed for this Session/);
    assert.equal(probes.mock.callCount(), 0, 'Authorization precedes exact model lookup');
    h.adapter.efforts.set('review', ['low']);
    const unsupported = await tool(h, root, call('review', 'high'), 'host-effort');
    assert.equal(unsupported.isError, true);
    assert.match(unsupported.content[0]!.text, /does not support reasoning effort "high"/);
    assert.equal(probes.mock.callCount(), 1);
    assert.equal(h.created.length, 1);
    assert.equal(h.adapter.requests.length, 0);
  });

  it('can accept the real activation after preflight but fail the child request when effort support drifts', async t => {
    const h = await NativeHarness.create({ routing: mixed() }, false); t.after(() => h.close());
    await mount(h);
    const root = await h.lead(); h.authorize(root);
    h.adapter.efforts.set('review', ['high']);
    const probes = t.mock.method(h.adapter, 'resolveModel');
    let lookupsBeforeChange = 0;
    t.after(h.ctx.on('agent/created', ({ agent }) => {
      if (agent.session.header.origin !== 'subagent') return;
      lookupsBeforeChange = probes.mock.calls.filter(c => c.arguments[1] === 'review').length;
      h.adapter.efforts.set('review', ['low']);
    }));
    const ended = Promise.withResolvers<string>();
    t.after(h.ctx.on('subagent/end', info => { ended.resolve(info.stopReason); }));
    const result = await tool(h, root, { ...call('review', 'high'), name: 'drift' }, 'host-drift');
    assert.equal(result.isError, false);
    assert.match(result.content[0]!.text, /started subagent drift/);
    assert.equal(await ended.promise, 'error');
    assert.equal(lookupsBeforeChange, 1, 'Only the real tool preflight resolved the model before creation');
    assert.ok(probes.mock.calls.filter(c => c.arguments[1] === 'review').length > lookupsBeforeChange);
    const child = h.created[1]!;
    assert.ok(h.errors.some(e => e.agent === child && /does not support reasoning effort "high"/.test(String(e.error))));
    assert.equal(h.requests(child).length, 0, 'The real child request failed capability validation before streaming');
    assert.equal(h.created.length, 2, 'No automatic redispatch');
  });

  for (const configured of [false, true]) {
    it(`omitted fields use ${configured ? 'configured child defaults' : 'compatible parent model and effort'}`, async t => {
      const h = await NativeHarness.create({ routing: mixed() }); t.after(() => h.close());
      await mount(h, configured ? route('fast', 'low') : undefined);
      const root = await h.lead('defaults', 'high');
      const result = await tool(h, root, {}, 'host-default');
      assert.equal(result.isError, false);
      const child = h.created[1]!; await h.idle(child, 1);
      const { provider, model, reasoningEffort } = h.requests(child)[0]!;
      assert.deepEqual({ provider, model, reasoningEffort }, configured ? route('fast', 'low') : route('strong', 'high'));
    });
  }

  it('strict matches the configured grant and rejects unconfigured or mismatched native calls before preflight', async t => {
    const h = await NativeHarness.create({ routing: mixed({ strict: true }) }); t.after(() => h.close());
    await mount(h); const root = await h.lead(); h.authorize(root);
    const probes = t.mock.method(h.adapter, 'resolveModel');
    for (const [id, args] of [['wrong', call('strong')], ['wrong-effort', call('review', 'low')]] as const) {
      const denied = await tool(h, root, args, id);
      assert.equal(denied.isError, true); assert.match(denied.content[0]!.text, /Strict task-category routing/);
    }
    assert.equal(probes.mock.callCount(), 0); assert.equal(h.created.length, 1);
    assert.equal((await tool(h, root, call('review', 'high'), 'host-match')).isError, false);
    const child = h.created[1]!; await h.idle(child, 1);
    assert.equal(h.requests(child)[0]!.model, 'review'); assert.equal(h.requests(child)[0]!.reasoningEffort, 'high');
  });

  it('fails closed only in strict mode on an unreadable router projection, without leaking routes in either prompt', async t => {
    const config = mixed({ strict: true, delegationMode: 'orchestrator' });
    const h = await NativeHarness.create({ routing: config }); t.after(() => h.close());
    const mounted = await mount(h); const root = await h.lead(); h.authorize(root);
    // Fault-inject only the router reader; the real tool still reads its own Session policy.
    await h.unloadRouter();
    const register = SessionProjectionRegistry.prototype.register;
    const mock = t.mock.method(SessionProjectionRegistry.prototype, 'register', async function (definition, ...args) {
      const handle = await register.call(this, definition, ...args);
      if (definition.key === 'teamRouter.modelAuthorization') handle.stateOf = () => { throw new Error('private projection details'); };
      return handle;
    });
    try { await h.reloadRouter(); } finally { mock.mock.restore(); }
    const guide = await section(h, root) ?? '';
    assert.match(guide, /authorization-unavailable/); assert.doesNotMatch(guide, /offline|review|fast|private projection details/);
    await h.drive(root, 'go', 1);
    assert.deepEqual(reminders(h.requests(root)[0]!), []);
    for (const [id, args] of [['omitted', {}], ['explicit', call('review', 'high')]] as const) {
      const denied = await tool(h, root, args, id);
      assert.equal(denied.isError, true); assert.match(denied.content[0]!.text, /authorization-unavailable/);
      assert.doesNotMatch(denied.content[0]!.text, /offline|review|fast|private projection details/);
    }
    for (const field of ['provider', 'model', 'reasoning_effort']) {
      const malformed = await tool(h, root, { ...call('review', 'high'), [field]: '' }, `empty-${field}`);
      assert.equal(malformed.isError, true);
      assert.ok(malformed.content[0]!.text.includes(`child LLM \`${field}\` must be non-empty`));
    }
    assert.equal(h.created.length, 1);
    config.behavior.strict = false; h.updatePolicy({ routing: config });
    assert.equal((await tool(h, root, call('review', 'high'), 'advisory')).isError, false);
    const child = h.created[1]!; await h.idle(child, 1);
    assert.equal(h.requests(child)[0]!.model, 'review'); assert.equal(h.requests(child)[0]!.reasoningEffort, 'high');
    await mounted.dispose();
    assert.equal(h.ctx.agents.get(child.id), child, 'The non-Lead child is still live');
    assert.equal(h.ctx.tools.get('subagent', child), undefined);
    assert.equal(await section(h, child), '', 'No selectable tool or Lead fallback for this child');
    assert.match(await section(h, root) ?? '', /authorization-unavailable/, 'Eligible Team Lead fallback');
    config.behavior.guidance = false; h.updatePolicy({ routing: config });
    assert.equal(await section(h, root), '');
    config.behavior.guidance = true;
    for (const id of BUILTIN_IDS) config.builtins[id] = { enabled: false };
    h.updatePolicy({ routing: config });
    assert.equal(await section(h, root), '', 'No active categories even though authorization is unreadable');
  });
});

describe('native subagent routing integration', { concurrency: false, timeout: 30_000 }, () => {
  it('preserves classic7 and both strict extremes for literal pre-scout V3 settings', async t => {
    // Deliberately not derived from the current registry: this is the 1.0.0 on-disk ID set.
    const oldIds = ['visual-engineering', 'frontend-engineering', 'backend-data', 'deep', 'debugging', 'code-review',
      'verification-automation', 'ultrabrain', 'artistry', 'writing', 'quick', 'unspecified'];
    const classic = ['visual-engineering', 'deep', 'ultrabrain', 'artistry', 'writing', 'quick', 'unspecified'];
    const config: RoutingConfig = { version: 3, defaultTarget: { mode: 'inherit' },
      behavior: { guidance: true, delegationMode: 'passive', strict: true }, custom: [], historyLimit: 100,
      builtins: Object.fromEntries(oldIds.filter(id => !classic.includes(id)).map(id => [id, { enabled: false }])) };
    const h = await NativeHarness.create({ routing: config }); t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('old-v3'); h.authorize(root);
    assert.deepEqual((await h.status(root)).categories.map(c => c.id), classic);
    config.builtins = Object.fromEntries(oldIds.map(id => [id, { enabled: false }])); h.updatePolicy({ routing: config });
    assert.deepEqual((await h.status(root)).categories, []);
    assert.equal((await tool(h, root, call('unconfigured'), 'legacy-off')).isError, false);
    config.builtins = Object.fromEntries(oldIds.map(id => [id, { binding: explicitTarget('fast') }])); h.updatePolicy({ routing: config });
    assert.deepEqual((await h.status(root)).categories.map(c => c.id), oldIds);
    assert.equal((await tool(h, root, {}, 'legacy-omit')).isError, true);
    assert.equal((await tool(h, root, call('fast'), 'legacy-match')).isError, false);
  });

  it('injects authorized guidance in a regular session and updates it live', async t => {
    const h = await NativeHarness.create({ routing: mixed() }, false); t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('solo');
    assert.equal(h.ctx.agentTeams.isEnabled(root), false);
    assert.equal(h.ctx.tools.get('team_route_delegate', root), undefined);
    assert.match(await section(h, root) ?? '', /No explicit specialist route is authorized/);
    h.authorize(root);
    assert.match(await section(h, root) ?? '', /\("offline", "fast"\): writing/);
    h.updatePolicy({ routing: mixed({ delegationMode: 'specialist-first' }) });
    assert.match(await section(h, root) ?? '', /Specialist-first/);
    const child = await h.teammate(root, 'child-worker', 'work');
    h.authorize(child);
    const childSection = await section(h, child) ?? '';
    assert.match(childSection, /Routes \(provider, model/);
    assert.doesNotMatch(childSection, /Specialist-first/);
    h.updatePolicy({ routing: mixed({ guidance: false }) });
    assert.equal(await section(h, root), '');
    await h.unloadRouter();
    assert.equal(await section(h, root), undefined);
  });

  it('uses the Lead-only fallback for subagent without model selection and never blocks that tool', async t => {
    const h = await NativeHarness.create({ routing: mixed({ strict: true }) }); t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, false, calls));
    const root = await h.lead('fallback'); h.authorize(root);
    assert.match(await section(h, root) ?? '', /team_route_delegate[\s\S]*Active authorized explicit categories: ultrabrain, writing/);
    assert.equal((await tool(h, root, {}, 'fallback')).isError, false);
    assert.equal(calls.length, 1);
    const child = await h.teammate(root, 'child-worker', 'work'); h.authorize(child);
    assert.equal(await section(h, child), '');
  });

  it('enforces selectable native calls through the real tools/pre-execute hook only when strict', async t => {
    const config = mixed(); config.defaultTarget = explicitTarget('fast');
    const h = await NativeHarness.create({ routing: config }, false); t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));
    const root = await h.lead('strict'); h.authorize(root);
    assert.equal((await tool(h, root, {}, 'passive')).isError, false);
    config.behavior.strict = true;
    h.updatePolicy({ routing: config });
    for (const [id, args] of [['omit', {}], ['wrong', call('strong')], ['wrong-effort', call('review')]] as const) {
      const denied = await tool(h, root, args, id);
      assert.equal(denied.isError, true);
      assert.match(JSON.stringify(denied.content), /Strict task-category routing/);
    }
    assert.equal(calls.length, 1);
    assert.equal((await tool(h, root, call('review', 'high'), 'match')).isError, false);
    assert.equal((await tool(h, root, call('fast'), 'default')).isError, false);
    assert.equal(calls.length, 3);
    const inherit = safeRouting(); inherit.behavior.strict = true;
    h.updatePolicy({ routing: inherit });
    assert.equal((await tool(h, root, call('fast'), 'no-explicit')).isError, true);
    assert.equal((await tool(h, root, {}, 'inherit')).isError, false);
    assert.equal(calls.length, 4);
  });

  it('appends one self-contained trailing user-role reminder per turn across a real bridged tool loop', async t => {
    const h = await NativeHarness.create({ routing: mixed({ delegationMode: 'specialist-first' }) }, false);
    t.after(() => h.close());
    const name = 'bridge__host__subagent'; const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls, name));
    const root = await h.lead('bridge'); h.authorize(root);
    assert.equal(h.ctx.tools.get('subagent', root), undefined);
    const args = { prompt: 'Write a note.', description: 'Note', ...call('fast') };
    h.adapter.callToolOnNextRequest(name, args);
    await h.drive(root, 'Draft the release note.', 2);
    assert.deepEqual(calls, [args]);
    const [first, continuation] = h.requests(root);
    const [notice] = reminders(first!);
    assert.equal(reminders(first!).length, 1);
    assert.equal(first!.messages.at(-1), notice);
    assert.equal(notice!.role, 'user');
    assert.equal(notice!.source.form, 'instructions');
    const content = notice!.content[0];
    assert.ok(content?.type === 'text');
    assert.match(content.text, /\("offline", "fast"\): writing/);
    assert.deepEqual(reminders(continuation!).map(m => m.id), [notice!.id]);
    assert.ok(continuation!.messages.some(m => m.role === 'tool'));
    h.updatePolicy({ routing: mixed({ delegationMode: 'orchestrator' }) });
    await h.drive(root, 'Now implement the plan.', 3);
    const after = h.requests(root)[2]!;
    const nextNotice = reminders(after).at(-1)!;
    assert.equal(reminders(after).length, 2);
    assert.equal(after.messages.at(-1), nextNotice);
    assert.match(JSON.stringify(nextNotice.content), /orchestrator.*must delegate.*post-approval implementation/);
    for (const behavior of [{ delegationMode: 'passive' }, { guidance: false, delegationMode: 'orchestrator' }] as const) {
      h.updatePolicy({ routing: mixed(behavior) });
      await h.drive(root, 'This turn needs no additional notice.');
      assert.deepEqual(reminders(h.requests(root).at(-1)!).map(m => m.id), [notice!.id, nextNotice.id]);
    }
    await h.unloadRouter();
    await h.drive(root, 'No reminder after unload.');
    assert.deepEqual(reminders(h.requests(root).at(-1)!).map(m => m.id), [notice!.id, nextNotice.id]);
  });

  it('uses captured selection; withholds reminders for synthetic messages, children and uncertain roots', async t => {
    const config = safeRouting(); config.behavior.delegationMode = 'orchestrator';
    config.builtins.writing = { binding: explicitTarget('strong') };
    const h = await NativeHarness.create({ routing: config }, false); t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('captured');
    const captured = route('strong', 'high');
    assert.doesNotMatch(await section(h, root) ?? '', /Orchestrator:/);
    assert.match(await section(h, root, captured) ?? '', /writing \(Documentation and prose\)\*[\s\S]*Orchestrator:/);
    root.model.select(captured);
    root.followup(createUserMessage({ content: text('Synthetic context.'), source: { kind: 'team-router:reminder', form: 'instructions' } }));
    await h.idle(root, 1);
    assert.equal(reminders(h.requests(root)[0]!).length, 1);
    await h.drive(root, 'First human input.', 2);
    assert.equal(reminders(h.requests(root)[1]!).length, 2);
    const child = await h.teammate(root, 'child', 'Child startup.');
    await h.drive(child, 'Human input in child.', 2);
    assert.ok(h.requests(child).every(request => reminders(request).length === 0));
    const rootOf = h.ctx.subagents.rootOf.bind(h.ctx.subagents);
    const mock = t.mock.method(h.ctx.subagents, 'rootOf', (agent: Agent) => {
      if (agent === root) throw new Error('Ownership unavailable');
      return rootOf(agent);
    });
    try {
      const guide = await section(h, root) ?? '';
      assert.match(guide, /Routes \(provider, model/);
      assert.doesNotMatch(guide, /Orchestrator:/);
      await h.drive(root, 'Uncertain root ownership.', 3);
      assert.equal(reminders(h.requests(root)[2]!).length, 2);
    } finally { mock.mock.restore(); }
  });

  it('preserves the section placement and falls back to a finite late order', async t => {
    const h = await NativeHarness.create({ routing: mixed() }, false); t.after(() => h.close());
    const root = await h.lead('order');
    for (const [name, order] of [['before-fallback', 10198], ['suffix', 10200], ['shifted-before', 14998], ['shifted-suffix', 15000]] as const) {
      t.after(h.ctx.systemPrompt.section({ name, order, text: name }));
    }
    const between = async (before: string, after: string) => {
      const { sections } = await h.ctx.systemPrompt.assemble({ scope: root, agent: root });
      const names = sections.map(s => s.name);
      const index = names.indexOf('team-router:policy');
      assert.ok(names.indexOf(before) < index && index < names.indexOf(after), names.join(', '));
    };
    await between('before-fallback', 'suffix');
    await h.unloadRouter();
    const lookup = SystemPrompt.prototype.getSectionOrder;
    for (const order of [15000, undefined, NaN, Infinity, new Error('Missing order')] as const) {
      const mock = t.mock.method(SystemPrompt.prototype, 'getSectionOrder', function (name) {
        if (name !== 'DEPLOYMENT_PERSONA_SUFFIX') return lookup.call(this, name);
        if (order instanceof Error) throw order;
        return order;
      });
      try {
        await h.reloadRouter();
        if (order === 15000) await between('shifted-before', 'shifted-suffix');
        else await between('before-fallback', 'suffix');
      } finally { mock.mock.restore(); await h.unloadRouter(); }
    }
  });
});
