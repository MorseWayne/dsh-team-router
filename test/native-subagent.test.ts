import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions } from '@deepseek-ai/dsh-llm';
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
    for (const malformed of [null, [], 'not-object', { provider: 'offline' }, { model: 'fast' }, { reasoning_effort: 'high' },
      { provider: false, model: 'fast' }, { ...call('fast'), reasoning_effort: 0 }]) {
      assert.deepEqual(validateNativeSubagentCall(config, malformed), { ok: true });
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

  it('does not advertise denied tuples and toggles proactive advice with config, root and tuple', () => {
    const config = mixed({ delegationMode: 'specialist-first' });
    const session = { isRoot: true, parentRoute: route('review', 'high'), authorizedRoutes: [authorized('review')] };
    const guidance = buildNativeSubagentGuidance(config, session);
    assert.match(guidance, /\("offline", "review", "high"\): ultrabrain/);
    assert.match(guidance, /writing .*unauthorized; inherit parent model/);
    assert.doesNotMatch(guidance, /"fast"|Specialist-first/);
    assert.equal(buildNativeSubagentReminder(config, session), '');
    const distinct = { ...session, parentRoute: route('review', 'low') };
    assert.match(buildNativeSubagentGuidance(config, distinct), /Specialist-first/);
    assert.match(buildNativeSubagentReminder(config, distinct), /\("offline", "review", "high"\): ultrabrain \(Show conclusions/);
    assert.doesNotMatch(buildNativeSubagentReminder(config, distinct), /writing|"fast"|quick|unspecified/);
    assert.match(buildTeamFallbackGuidance(config, distinct), /team_route_status.*\n[\s\S]*categories: ultrabrain\./);
    assert.equal(buildNativeSubagentReminder(config, { ...distinct, isRoot: false }), '');
    assert.doesNotMatch(buildNativeSubagentGuidance(config, { ...distinct, isRoot: false }), /Specialist-first/);
    assert.equal(buildNativeSubagentGuidance(config, { authorizedRoutes: [] }), '');
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

describe('native subagent routing integration', { concurrency: false, timeout: 30_000 }, () => {
  it('injects authorized guidance in a regular session and updates it live', async t => {
    const h = await NativeHarness.create({ routing: mixed() }, false); t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('solo');
    assert.equal(h.ctx.agentTeams.isEnabled(root), false);
    assert.equal(h.ctx.tools.get('team_route_delegate', root), undefined);
    assert.equal(await section(h, root), '');
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
