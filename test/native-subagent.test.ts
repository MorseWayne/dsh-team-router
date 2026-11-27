import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions } from '@deepseek-ai/dsh-llm';
import { SystemPrompt } from '@deepseek-ai/dsh-system-prompt';
import { defineTool } from '@deepseek-ai/dsh-tools';
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent';
import {
  buildNativeRoutingPlan,
  buildNativeSubagentGuidance,
  buildNativeSubagentReminder,
  buildTeamFallbackGuidance,
  validateNativeSubagentCall,
} from '../src/core/native-subagent.ts';
import type { RoutingPolicyV2 } from '../src/core/routing-policy.ts';
import { NativeHarness, config as legacyConfig, explicitTarget, route, safePolicy, text } from './helpers.ts';

const mixedPolicy = (): RoutingPolicyV2 => ({
  ...safePolicy(),
  categories: {
    writing: { mode: 'target', target: explicitTarget('fast') },
    ultrabrain: { mode: 'target', target: explicitTarget('review', 'high') },
  },
});

const allExplicitPolicy = (): RoutingPolicyV2 => ({
  ...safePolicy(),
  defaultTarget: explicitTarget('fast'),
  categories: {
    ultrabrain: { mode: 'target', target: explicitTarget('review', 'high') },
  },
});

const output = {
  schema: { type: 'json' } as const,
  render: (_args: unknown, value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }],
};

function registerSubagentTool(h: NativeHarness, withModelSelection: boolean, calls: unknown[], name = 'subagent') {
  return h.ctx.tools.register(defineTool({
    name,
    description: 'Test native subagent tool',
    parameters: {
      prompt: { type: 'string', required: true },
      description: { type: 'string', required: true },
      ...(withModelSelection ? {
        provider: { type: 'string' },
        model: { type: 'string' },
        reasoning_effort: { type: 'string' },
      } : {}),
    },
    output,
    execute: async (args) => {
      calls.push(args);
      return { ok: true, received: args };
    },
  }));
}

async function assembledSection(h: NativeHarness, agent: Agent, modelSelection?: ModelSelection): Promise<string | undefined> {
  const assembly = await h.ctx.systemPrompt.assemble({ scope: agent, agent, ...(modelSelection === undefined ? {} : { modelSelection }) });
  return assembly.sections.find(section => section.name === 'team-router:policy')?.text;
}

function reminders(request: GenerateOptions) {
  return request.messages.filter(message => message.source.kind === 'team-router:reminder');
}

async function runSubagentCall(h: NativeHarness, agent: Agent, args: Record<string, unknown>, id = 'call-1') {
  const batch = await h.ctx.tools.execute({
    agent,
    signal: h.signals.signal,
    calls: [{
      type: 'tool-call',
      id: ToolCallId(id),
      name: 'subagent',
      arguments: JSON.stringify(args),
    }],
  });
  assert.equal(batch.results.length, 1);
  return batch.results[0]!.result;
}

describe('core native subagent routing guidance and validation', () => {
  it('emits no guidance and allows all calls when every category inherits', () => {
    const policy = safePolicy();
    assert.equal(buildNativeSubagentGuidance(policy), '');
    assert.equal(buildTeamFallbackGuidance(policy), '');
    assert.deepEqual(validateNativeSubagentCall(policy, { prompt: 'hi', description: 'hi' }), { ok: true });
    assert.deepEqual(validateNativeSubagentCall(policy, { provider: 'offline', model: 'fast' }), { ok: true });
  });

  it('renders exact category routes and respects session authorization filtering', () => {
    const policy = mixedPolicy();
    const full = buildNativeSubagentGuidance(policy, {
      authorizedRoutes: [{ provider: 'offline', model: 'fast' }, { provider: 'offline', model: 'review' }],
      parentRoute: { provider: 'offline', model: 'strong' },
    });
    assert.match(full, /writing .*: provider="offline", model="fast" \(omit reasoning_effort\)/);
    assert.match(full, /ultrabrain .*: provider="offline", model="review", reasoning_effort="high"/);
    assert.match(full, /quick .*: inherit parent model/);

    // No Session authorization event and parent differs: never suggest unauthorized models.
    assert.equal(buildNativeSubagentGuidance(policy, {
      authorizedRoutes: null,
      parentRoute: { provider: 'offline', model: 'strong' },
    }), '');

    // Partial authorization: authorized route stays explicit; unauthorized route falls back to inherit.
    const partial = buildNativeSubagentGuidance(policy, {
      authorizedRoutes: [{ provider: 'offline', model: 'fast' }],
      parentRoute: { provider: 'offline', model: 'strong' },
    });
    assert.match(partial, /writing .*: provider="offline", model="fast"/);
    assert.match(partial, /ultrabrain .*: inherit parent model \(configured route is not authorized in this Session/);

    // Same-model explicit effort is authorized even without a session policy event.
    const sameModelPolicy: RoutingPolicyV2 = {
      ...safePolicy(),
      categories: { ultrabrain: { mode: 'target', target: explicitTarget('strong', 'high') } },
    };
    const sameModel = buildNativeSubagentGuidance(sameModelPolicy, {
      authorizedRoutes: null,
      parentRoute: { provider: 'offline', model: 'strong' },
    });
    assert.match(sameModel, /ultrabrain .*: provider="offline", model="strong", reasoning_effort="high"/);
  });

  it('validates explicit routes strictly without blocking legitimate inheritance or partial tool errors', () => {
    const auth = {
      authorizedRoutes: [{ provider: 'offline', model: 'fast' }, { provider: 'offline', model: 'review' }],
      parentRoute: { provider: 'offline', model: 'strong' },
    };

    // Mixed policy: omission is allowed because inherit categories exist.
    const mixed = mixedPolicy();
    assert.deepEqual(validateNativeSubagentCall(mixed, { prompt: 'p', description: 'd' }, auth), { ok: true });
    assert.deepEqual(validateNativeSubagentCall(mixed, { provider: 'offline', model: 'fast' }, auth), { ok: true });
    assert.deepEqual(validateNativeSubagentCall(mixed, { provider: 'offline', model: 'review', reasoning_effort: 'high' }, auth), { ok: true });

    // Missing required reasoning_effort on configured route is denied.
    const wrongEffort = validateNativeSubagentCall(mixed, { provider: 'offline', model: 'review' }, auth);
    assert.equal(wrongEffort.ok, false);
    assert.match(wrongEffort.reason, /offline\/review/);
    assert.match(wrongEffort.reason, /reasoning_effort="high"/);

    // Unconfigured model is denied even if it exists in catalog.
    const wrongModel = validateNativeSubagentCall(mixed, { provider: 'offline', model: 'strong' }, auth);
    assert.equal(wrongModel.ok, false);
    assert.match(wrongModel.reason, /offline\/strong/);

    // Partial arguments defer to native subagent's own schema/argument validation.
    assert.deepEqual(validateNativeSubagentCall(mixed, { provider: 'offline' }, auth), { ok: true });

    // All-explicit policy: omitting provider/model is denied.
    const strict = allExplicitPolicy();
    const omitted = validateNativeSubagentCall(strict, { prompt: 'p', description: 'd' }, auth);
    assert.equal(omitted.ok, false);
    assert.match(omitted.reason, /every category maps to an explicit configured model/);

    // External targets never trap native validation.
    const withExternal: RoutingPolicyV2 = {
      ...allExplicitPolicy(),
      categories: { quick: { mode: 'target', target: { executor: 'codex', model: { mode: 'executor-default' } } } },
    };
    const plan = buildNativeRoutingPlan(withExternal, auth);
    assert.equal(plan.inheritAllowed, true);
    assert.deepEqual(validateNativeSubagentCall(withExternal, { prompt: 'p', description: 'd' }, auth), { ok: true });
  });

  it('adds specialist-first guidance only for distinct specialist categories on root agents', () => {
    const policy: RoutingPolicyV2 = {
      ...safePolicy(),
      categories: {
        ultrabrain: { mode: 'target', target: explicitTarget('review', 'high') },
        writing: { mode: 'target', target: explicitTarget('strong') }, // same provider/model as parent (no distinct effort)
        quick: { mode: 'target', target: explicitTarget('fast') }, // non-specialist category
        unspecified: { mode: 'target', target: explicitTarget('fast') }, // fallback category
      },
    };
    const auth = [{ provider: 'offline', model: 'strong' }, { provider: 'offline', model: 'fast' }, { provider: 'offline', model: 'review' }];
    const parent = { provider: 'offline', model: 'strong' };

    // Passive mode (default): no proactive delegation paragraph.
    const passive = buildNativeSubagentGuidance(policy, { authorizedRoutes: auth, parentRoute: parent, delegationMode: 'passive', isRoot: true });
    assert.doesNotMatch(passive, /Specialist-first delegation/);

    // Specialist-first on root: includes ONLY ultrabrain (excludes writing=same model, quick, unspecified).
    const proactive = buildNativeSubagentGuidance(policy, { authorizedRoutes: auth, parentRoute: parent, delegationMode: 'specialist-first', isRoot: true });
    assert.match(proactive, /Specialist-first delegation is enabled for this session/);
    assert.match(proactive, /\(ultrabrain\)/);
    assert.doesNotMatch(proactive, /\([^)]*writing[^)]*\)/);
    assert.doesNotMatch(proactive, /\([^)]*quick[^)]*\)/);
    assert.doesNotMatch(proactive, /\([^)]*unspecified[^)]*\)/);

    // Distinct reasoningEffort on same model counts as a specialist upgrade.
    const effortUpgradePolicy: RoutingPolicyV2 = {
      ...safePolicy(),
      categories: { ultrabrain: { mode: 'target', target: explicitTarget('strong', 'high') } },
    };
    const effortProactive = buildNativeSubagentGuidance(effortUpgradePolicy, {
      authorizedRoutes: auth, parentRoute: { provider: 'offline', model: 'strong', reasoningEffort: 'low' },
      delegationMode: 'specialist-first', isRoot: true,
    });
    assert.match(effortProactive, /Specialist-first delegation.*\(ultrabrain\)/);

    // Child subagent (isRoot: false): NEVER receives proactive delegation guidance (prevents recursion).
    const child = buildNativeSubagentGuidance(policy, { authorizedRoutes: auth, parentRoute: parent, delegationMode: 'specialist-first', isRoot: false });
    assert.match(child, /Category routes:/);
    assert.doesNotMatch(child, /Specialist-first delegation/);

    // Team fallback also respects distinct specialist categories and isRoot.
    const fallbackRoot = buildTeamFallbackGuidance(policy, { authorizedRoutes: auth, parentRoute: parent, delegationMode: 'specialist-first', isRoot: true });
    assert.match(fallbackRoot, /Specialist-first delegation is enabled.*\(ultrabrain\)/);
    const fallbackChild = buildTeamFallbackGuidance(policy, { authorizedRoutes: auth, parentRoute: parent, delegationMode: 'specialist-first', isRoot: false });
    assert.doesNotMatch(fallbackChild, /Specialist-first delegation/);
  });
  it('renders only explicit, authorized and distinct specialist tuples for both proactive modes', () => {
    const policy: RoutingPolicyV2 = {
      ...safePolicy(),
      categories: {
        'visual-engineering': { mode: 'target', target: explicitTarget('strong', 'low') }, // identical
        writing: { mode: 'target', target: explicitTarget('strong') }, // omitted effort clears 'low'
        ultrabrain: { mode: 'target', target: explicitTarget('strong', 'high') },
        deep: { mode: 'target', target: explicitTarget('review', 'high') }, // unauthorized
        artistry: { mode: 'target', target: { executor: 'codex', model: { mode: 'executor-default' } } },
        quick: { mode: 'target', target: explicitTarget('fast') },
        unspecified: { mode: 'target', target: explicitTarget('fast') },
      },
    };
    const session = { isRoot: true, parentRoute: route('strong', 'low'), authorizedRoutes: [route('strong'), route('fast')] };
    const specialist = buildNativeSubagentReminder(policy, { ...session, delegationMode: 'specialist-first' });
    const orchestrator = buildNativeSubagentReminder(policy, { ...session, delegationMode: 'orchestrator' });
    assert.match(specialist, /specialist-first.*Proactively delegate/);
    assert.match(orchestrator, /orchestrator.*must delegate/);
    for (const reminder of [specialist, orchestrator]) {
      assert.match(reminder, /follow-ups and post-approval implementation/);
      assert.match(reminder, /explicit requests to answer or execute directly/);
      assert.match(reminder, /host `subagent` accepting `provider`\/`model`.*bridged or namespaced.*not a local subagent/);
      assert.match(reminder, /^writing: "offline", "strong"$/m);
      assert.match(reminder, /^ultrabrain: "offline", "strong", "high"$/m);
      assert.doesNotMatch(reminder, /^(?:visual-engineering|deep|artistry|quick|unspecified):/m);
    }
    const system = buildNativeSubagentGuidance(policy, { ...session, delegationMode: 'orchestrator' });
    assert.match(system, /Orchestrator delegation.*\(ultrabrain, writing\).*must delegate execution/);
    assert.match(system, /multi-turn follow-ups and implementation after plan approval/);
    assert.match(system, /If namespaced or bridged.*not an adapter-local subagent/);
    assert.equal(buildNativeSubagentReminder(policy, { ...session, delegationMode: 'passive' }), '');
    assert.equal(buildNativeSubagentReminder(policy, { ...session, isRoot: false, delegationMode: 'orchestrator' }), '');
    assert.equal(buildNativeSubagentReminder(policy, { isRoot: true, delegationMode: 'orchestrator' }), '');
    assert.equal(buildNativeSubagentReminder(policy, { ...session, authorizedRoutes: [], delegationMode: 'orchestrator' }), '');
  });
});

describe('native subagent routing integration (no Team mode required)', { concurrency: false, timeout: 30_000 }, () => {
  it('injects category routing guidance in a regular session without Team mode when subagent exposes modelSelection', async (t) => {
    const h = await NativeHarness.create({ policyV2: mixedPolicy() }, false);
    t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));

    const agent = await h.lead('solo');
    assert.equal(h.ctx.agentTeams.isEnabled(agent), false, 'Team mode must remain disabled');
    assert.equal(h.ctx.tools.get('team_route_delegate', agent), undefined);

    // Before session authorization: no unauthorized routes are advertised.
    assert.equal(await assembledSection(h, agent), '');

    // Once authorized (as DSH Web does on fresh sessions): guidance appears in regular sessions.
    h.authorize(agent);
    const text = await assembledSection(h, agent);
    assert.ok(text);
    assert.match(text, /Task-category model routing is configured for the `subagent` tool/);
    assert.match(text, /writing .*: provider="offline", model="fast"/);
    assert.match(text, /ultrabrain .*: provider="offline", model="review", reasoning_effort="high"/);

    // Disabling nativeSubagentGuidance suppresses the section live.
    h.updatePolicy({ policyV2: mixedPolicy(), nativeSubagentGuidance: false });
    assert.equal(await assembledSection(h, agent), '');

    // Re-enabling brings it back; unloading the plugin removes the section completely.
    h.updatePolicy({ policyV2: mixedPolicy(), nativeSubagentGuidance: true });
    assert.match((await assembledSection(h, agent)) ?? '', /Category routes:/);
    await h.unloadRouter();
    assert.equal(await assembledSection(h, agent), undefined);
  });

  it('falls back cleanly when native subagent does not expose modelSelection', async (t) => {
    const soloHarness = await NativeHarness.create({ policyV2: mixedPolicy(), enforceNativeSubagentRouting: true }, false);
    t.after(() => soloHarness.close());
    const soloCalls: unknown[] = [];
    t.after(registerSubagentTool(soloHarness, false, soloCalls));

    const solo = await soloHarness.lead('no-select-solo');
    soloHarness.authorize(solo);
    assert.equal(await assembledSection(soloHarness, solo), '');
    // Strict mode never blocks a non-modelSelection subagent tool.
    const allowed = await runSubagentCall(soloHarness, solo, { prompt: 'do work', description: 'work' });
    assert.equal(allowed.isError, false);
    assert.equal(soloCalls.length, 1);

    // In Team mode without native modelSelection, Lead gets team_route_delegate fallback guidance, teammate does not.
    const teamHarness = await NativeHarness.create({ policyV2: mixedPolicy() }, true);
    t.after(() => teamHarness.close());
    const teamCalls: unknown[] = [];
    t.after(registerSubagentTool(teamHarness, false, teamCalls));

    const lead = await teamHarness.lead('fallback-lead');
    teamHarness.authorize(lead);
    const leadSection = await assembledSection(teamHarness, lead);
    assert.ok(leadSection);
    assert.match(leadSection, /prefer `team_route_delegate` over `subagent`/);
    assert.match(leadSection, /Configured categories: ultrabrain, writing/);

    const worker = await teamHarness.teammate(lead, 'worker', 'idle');
    assert.equal(await assembledSection(teamHarness, worker), '');
  });

  it('enforces native subagent routes via tools/pre-execute only when enabled', async (t) => {
    const h = await NativeHarness.create({ policyV2: allExplicitPolicy() }, false);
    t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));

    const agent = await h.lead('enforced');
    h.authorize(agent);

    // Default enforceNativeSubagentRouting is false: omitted model call passes through.
    const defaultResult = await runSubagentCall(h, agent, { prompt: 'task', description: 'task' }, 'call-default');
    assert.equal(defaultResult.isError, false);
    assert.equal(calls.length, 1);

    // Enable strict enforcement live.
    h.updatePolicy({ policyV2: allExplicitPolicy(), enforceNativeSubagentRouting: true });

    // Omitting provider/model on an all-explicit policy is denied before reaching tool body.
    const deniedOmit = await runSubagentCall(h, agent, { prompt: 'task', description: 'task' }, 'call-omit');
    assert.equal(deniedOmit.isError, true);
    assert.equal(calls.length, 1);
    assert.match(JSON.stringify(deniedOmit.content), /Strict task-category routing is enabled/);

    // Calling with an unconfigured model is denied.
    const deniedWrong = await runSubagentCall(h, agent, {
      prompt: 'task', description: 'task', provider: 'offline', model: 'strong',
    }, 'call-wrong');
    assert.equal(deniedWrong.isError, true);
    assert.equal(calls.length, 1);
    assert.match(JSON.stringify(deniedWrong.content), /does not match any configured category route/);

    // Calling with a matching configured route succeeds.
    const allowedMatch = await runSubagentCall(h, agent, {
      prompt: 'task', description: 'task', provider: 'offline', model: 'review', reasoning_effort: 'high',
    }, 'call-match');
    assert.equal(allowedMatch.isError, false);
    assert.equal(calls.length, 2);

    // Calling with defaultTarget route (omitting effort) succeeds.
    const allowedDefault = await runSubagentCall(h, agent, {
      prompt: 'task', description: 'task', provider: 'offline', model: 'fast',
    }, 'call-fast');
    assert.equal(allowedDefault.isError, false);
    assert.equal(calls.length, 3);
  });

  it('does not inject guidance or block native subagent while legacy migration is pending', async (t) => {
    const h = await NativeHarness.create({ ...legacyConfig(), delegationMode: 'orchestrator', enforceNativeSubagentRouting: true }, false);
    t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));

    const agent = await h.lead('legacy');
    h.authorize(agent);
    assert.equal(await assembledSection(h, agent), '');
    await h.drive(agent, 'Legacy policy cannot add near-field reminders.', 1);
    assert.equal(reminders(h.requests(agent)[0]!).length, 0);
    const result = await runSubagentCall(h, agent, { prompt: 'task', description: 'task' });
    assert.equal(result.isError, false);
    assert.equal(calls.length, 1);
  });

  it('toggles specialist-first delegation live on root agents without enabling recursive delegation in children', async (t) => {
    const h = await NativeHarness.create({ policyV2: mixedPolicy() }, false);
    t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));

    const root = await h.lead('root-proactive');
    h.authorize(root);

    // Default passive mode: routing table present, no proactive trigger.
    const before = await assembledSection(h, root);
    assert.ok(before);
    assert.doesNotMatch(before, /Specialist-first delegation/);

    // Flip delegationMode live to specialist-first: takes effect on the very next prompt assembly.
    h.updatePolicy({ policyV2: mixedPolicy(), delegationMode: 'specialist-first' });
    const after = await assembledSection(h, root);
    assert.ok(after);
    assert.match(after, /Specialist-first delegation is enabled/);
    assert.match(after, /\(ultrabrain, writing\)/);

    // Spawn a real native child subagent: it keeps passive routing table if authorized, NEVER specialist-first.
    const child = await h.teammate(root, 'child-worker', 'work');
    h.authorize(child);
    const childPrompt = await assembledSection(h, child);
    assert.ok(childPrompt);
    assert.match(childPrompt, /Category routes:/);
    assert.doesNotMatch(childPrompt, /Specialist-first delegation/);
  });

  it('appends one trailing user-role reminder per turn across a real tool loop, not once per request', async (t) => {
    const h = await NativeHarness.create({ policyV2: mixedPolicy(), delegationMode: 'specialist-first' }, false);
    t.after(() => h.close());
    // Simulate a bridge whose selectable host tool is visible only under a namespace.
    // No adapter-specific name is expected by the router.
    const bridgedTool = 'bridge__host__subagent';
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls, bridgedTool));
    const root = await h.lead('bridge');
    const openedSteps: number[] = [];
    t.after(h.ctx.on('session/event', (session, event) => {
      if (session === root.session && event.type === 'step/start') openedSteps.push(event.data.step);
    }));
    h.authorize(root);
    assert.equal(h.ctx.tools.get('subagent', root), undefined);

    const args = { prompt: 'Write a short release note.', description: 'Release note', provider: 'offline', model: 'fast' };
    h.adapter.callToolOnNextRequest(bridgedTool, args);
    await h.drive(root, 'Draft the release note.', 2);
    assert.deepEqual(calls, [args], 'A real host tool execution must create step 2');
    const first = h.requests(root)[0]!;
    const continuation = h.requests(root)[1]!;
    const [notice] = reminders(first);
    assert.equal(reminders(first).length, 1);
    assert.equal(first.messages.at(-1), notice);
    assert.equal(notice!.role, 'user');
    assert.equal(notice!.source.form, 'instructions');
    assert.match(JSON.stringify(notice!.content), /specialist-first.*writing: \\"offline\\", \\"fast\\"/);
    assert.deepEqual(reminders(continuation).map(message => message.id), [notice!.id]);
    assert.ok(continuation.messages.some(message => message.role === 'tool'), 'Step 2 uses the persisted tool result');
    assert.deepEqual(openedSteps, [1, 2]);

    h.updatePolicy({ policyV2: mixedPolicy(), delegationMode: 'orchestrator' });
    await h.drive(root, 'I approved it. Now implement the plan.', 3);
    const after = h.requests(root)[2]!;
    assert.deepEqual(openedSteps, [1, 2, 1]);
    const nextNotice = reminders(after).at(-1)!;
    assert.equal(reminders(after).length, 2);
    assert.notEqual(nextNotice.id, notice!.id);
    assert.match(JSON.stringify(nextNotice.content), /orchestrator.*must delegate.*post-approval implementation/);
    // Persistent bridges consume trailing user-role content after the last assistant/tool message.
    const boundary = after.messages.findLastIndex(message => message.role === 'assistant' || message.role === 'tool');
    assert.ok(boundary >= 0);
    const trailingUsers = after.messages.slice(boundary + 1).filter(message => message.role === 'user');
    assert.ok(trailingUsers.some(message => message.source.kind === 'user' && JSON.stringify(message.content).includes('Now implement the plan.')));
    assert.equal(trailingUsers.at(-1), nextNotice);
    assert.equal(trailingUsers.filter(message => message.source.kind === 'team-router:reminder').length, 1);
  });

  it('stops appending after passive mode, guidance opt-out, and plugin disposal without erasing history', async (t) => {
    const policyV2 = mixedPolicy();
    const h = await NativeHarness.create({ policyV2, delegationMode: 'specialist-first' }, false);
    t.after(() => h.close());
    const root = await h.lead('guidance-lifecycle');
    h.authorize(root);
    await h.drive(root, 'First user turn.', 1);
    const firstId = reminders(h.requests(root)[0]!)[0]!.id;

    h.updatePolicy({ policyV2, delegationMode: 'passive' });
    await h.drive(root, 'Passive turn.', 2);
    assert.deepEqual(reminders(h.requests(root)[1]!).map(message => message.id), [firstId]);

    h.updatePolicy({ policyV2, delegationMode: 'orchestrator', nativeSubagentGuidance: false });
    await h.drive(root, 'Opted out turn.', 3);
    assert.deepEqual(reminders(h.requests(root)[2]!).map(message => message.id), [firstId]);

    h.updatePolicy({ policyV2, delegationMode: 'orchestrator' });
    await h.drive(root, 'Active again.', 4);
    const activeIds = reminders(h.requests(root)[3]!).map(message => message.id);
    assert.equal(activeIds.length, 2);
    await h.unloadRouter();
    await h.drive(root, 'Turn after plugin disposal.', 5);
    assert.deepEqual(reminders(h.requests(root)[4]!).map(message => message.id), activeIds);
  });

  it('rejects non-user turns, child sessions, and uncertain roots without suppressing passive routing tables', async (t) => {
    const h = await NativeHarness.create({ policyV2: mixedPolicy(), delegationMode: 'orchestrator' }, false);
    t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('confirmed-root-only');
    h.authorize(root);
    root.followup(createUserMessage({ content: text('Synthetic context.'), source: { kind: 'team-router:reminder', form: 'instructions' } }));
    await h.idle(root, 1);
    assert.equal(reminders(h.requests(root)[0]!).length, 1, 'Only the fixture message should be present');
    assert.deepEqual(reminders(h.requests(root)[0]!)[0]!.content, text('Synthetic context.'));

    const child = await h.teammate(root, 'header-child', 'Child startup.');
    h.authorize(child);
    await h.drive(child, 'Real user-role message in a child.', 2);
    for (const request of h.requests(child)) assert.equal(reminders(request).length, 0);

    const rootOf = h.ctx.subagents.rootOf.bind(h.ctx.subagents);
    const mock = t.mock.method(h.ctx.subagents, 'rootOf', (agent: Agent) => {
      if (agent === root) throw new Error('Root ownership is unavailable');
      return rootOf(agent);
    });
    try {
      const guidance = await assembledSection(h, root);
      assert.match(guidance ?? '', /Category routes:/);
      assert.doesNotMatch(guidance ?? '', /Orchestrator delegation/);
      await h.drive(root, 'User turn with uncertain root ownership.', 2);
      assert.equal(reminders(h.requests(root)[1]!).length, 1, 'Root lookup failure must not append a reminder');
    } finally { mock.mock.restore(); }

    const get = h.ctx.agents.get.bind(h.ctx.agents);
    const unregistered = t.mock.method(h.ctx.agents, 'get', (id: Agent['id']) => id === root.id ? undefined : get(id));
    try {
      assert.equal(await assembledSection(h, root), '');
      await h.drive(root, 'Input from an unregistered agent instance.', 3);
      assert.deepEqual(reminders(h.requests(root)[2]!).map(message => message.id), reminders(h.requests(root)[0]!).map(message => message.id));
    } finally { unregistered.mock.restore(); }
  });

  it('uses the captured selection for the system section and first-step tuple comparison', async (t) => {
    const policyV2 = {
      ...safePolicy(), categories: { writing: { mode: 'target' as const, target: explicitTarget('strong') } },
    };
    const h = await NativeHarness.create({ policyV2, delegationMode: 'orchestrator' }, false);
    t.after(() => h.close());
    t.after(registerSubagentTool(h, true, []));
    const root = await h.lead('model-selection');
    // Without a Session authorization event the current provider/model pair alone is authorized.
    await h.drive(root, 'Same complete tuple: no reminder.', 1);
    assert.equal(reminders(h.requests(root)[0]!).length, 0);
    const captured = route('strong', 'high');
    assert.doesNotMatch((await assembledSection(h, root)) ?? '', /Orchestrator delegation/);
    assert.match((await assembledSection(h, root, captured)) ?? '', /Orchestrator delegation.*\(writing\)/);
    root.model.select(captured);
    await h.drive(root, 'Explicit effort differs from the route with omitted effort.', 2);
    const second = h.requests(root)[1]!;
    assert.equal(second.reasoningEffort, 'high');
    assert.equal(reminders(second).length, 1);
    assert.match(JSON.stringify(reminders(second)[0]!.content), /writing: \\"offline\\", \\"strong\\"/);
    root.model.select(route('strong'));
    await h.drive(root, 'Switch back to the identical tuple.', 3);
    assert.deepEqual(reminders(h.requests(root)[2]!).map(message => message.id), reminders(second).map(message => message.id));
  });

  it('places the policy before the suffix and uses a finite late fallback for absent or invalid order APIs', async (t) => {
    const h = await NativeHarness.create({ policyV2: mixedPolicy() }, false);
    t.after(() => h.close());
    const root = await h.lead('section-order');
    for (const [name, order] of [['before-fallback', 10198], ['suffix', 10200], ['shifted-before', 14998], ['shifted-suffix', 15000]] as const) {
      t.after(h.ctx.systemPrompt.section({ name, order, text: name }));
    }
    const assertBetween = async (before: string, after: string) => {
      const { sections } = await h.ctx.systemPrompt.assemble({ scope: root, agent: root });
      const names = sections.map(section => section.name);
      const index = names.indexOf('team-router:policy');
      assert.ok(names.indexOf(before) < index && index < names.indexOf(after), names.join(', '));
    };
    await assertBetween('before-fallback', 'suffix');
    await h.unloadRouter();

    const lookup = SystemPrompt.prototype.getSectionOrder;
    for (const value of [15000, undefined, NaN, Infinity, new Error('Missing order')] as const) {
      const mock = t.mock.method(SystemPrompt.prototype, 'getSectionOrder', function (name) {
        if (name !== 'DEPLOYMENT_PERSONA_SUFFIX') return lookup.call(this, name);
        if (value instanceof Error) throw value;
        return value;
      });
      try {
        await h.reloadRouter();
        if (value === 15000) await assertBetween('shifted-before', 'shifted-suffix');
        else await assertBetween('before-fallback', 'suffix');
      } finally {
        mock.mock.restore();
        await h.unloadRouter();
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(SystemPrompt.prototype, 'getSectionOrder')!;
    Object.defineProperty(SystemPrompt.prototype, 'getSectionOrder', { ...descriptor, value: undefined });
    try {
      await h.reloadRouter();
      await assertBetween('before-fallback', 'suffix');
    } finally {
      Object.defineProperty(SystemPrompt.prototype, 'getSectionOrder', descriptor);
    }
  });
});
