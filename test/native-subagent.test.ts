import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ToolCallId } from '@deepseek-ai/dsh-llm';
import { defineTool } from '@deepseek-ai/dsh-tools';
import type { Agent } from '@deepseek-ai/dsh-agent';
import {
  buildNativeRoutingPlan,
  buildNativeSubagentGuidance,
  buildTeamFallbackGuidance,
  validateNativeSubagentCall,
} from '../src/core/native-subagent.ts';
import type { RoutingPolicyV2 } from '../src/core/routing-policy.ts';
import { NativeHarness, config as legacyConfig, explicitTarget, safePolicy } from './helpers.ts';

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

function registerSubagentTool(h: NativeHarness, withModelSelection: boolean, calls: unknown[]) {
  return h.ctx.tools.register(defineTool({
    name: 'subagent',
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

async function assembledSection(h: NativeHarness, agent: Agent): Promise<string | undefined> {
  const assembly = await h.ctx.systemPrompt.assemble({ scope: agent, agent });
  return assembly.sections.find(section => section.name === 'team-router:policy')?.text;
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
    const h = await NativeHarness.create({ ...legacyConfig(), enforceNativeSubagentRouting: true }, false);
    t.after(() => h.close());
    const calls: unknown[] = [];
    t.after(registerSubagentTool(h, true, calls));

    const agent = await h.lead('legacy');
    h.authorize(agent);
    assert.equal(await assembledSection(h, agent), '');
    const result = await runSubagentCall(h, agent, { prompt: 'task', description: 'task' });
    assert.equal(result.isError, false);
    assert.equal(calls.length, 1);
  });
});
