import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NativeHarness, customCategory, explicitTarget, route, safeRouting } from './helpers.ts';
import type { RoutingConfig } from '../src/core/routing-policy.ts';
import { BUILTIN_IDS } from '../src/core/categories.ts';
import { LLM_FAILURE_CODES, LlmError } from '@deepseek-ai/dsh-llm';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import { ExecutionStore } from '../src/core/execution-store.ts';

// Real Cordis services, AgentLoop, Session events, Teams and native subagents;
// only LLM transport is offline. Never executes an external CLI or network call.
describe('V3 category routing through native DSH', { concurrency: false, timeout: 30_000 }, () => {
  const quickPolicy = (): RoutingConfig => ({ ...safeRouting(), builtins: {
    quick: { binding: explicitTarget('fast') },
    writing: { binding: explicitTarget('review', 'high') },
  } });

  it('starts safely with inherited model and records its real first request', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead();
    const result = await h.delegate(lead);
    const child = await h.child(lead, result.executionId);
    await h.idle(child, 1);
    assert.equal(h.requests(child)[0]!.model, 'strong');
    assert.equal(h.requests(child)[0]!.provider, 'offline');
    const status = await h.status(lead);
    assert.deepEqual(Object.keys(status).sort(), ['categories', 'executions', 'routing', 'teamId']);
    assert.deepEqual(status.routing, safeRouting());
    assert.deepEqual(status.categories.map(({ id }) => id), BUILTIN_IDS);
    assert.equal(status.executions[0]!.categoryId, 'unspecified');
    assert.equal(status.executions[0]!.source, 'default');
    assert.equal(status.executions[0]!.actualModel?.model, 'strong');
    assert.equal(h.teams.tryMembership(child)?.root, lead);
    assert.ok(h.teams.liveMembers(lead).some(member => member.id === child.id));
    assert.deepEqual(lead.model.current(), route('strong'));
  });

  it('uses the authorized category on the first adapter request, never task keywords or name', async (t) => {
    const h = await NativeHarness.create({ routing: quickPolicy() }); t.after(() => h.close());
    const lead = await h.lead(); h.authorize(lead);
    const quick = await h.delegate(lead, 'quick', 'reviewer', 'Review and audit complicated architecture.');
    const worker = await h.child(lead, quick.executionId); await h.idle(worker, 1);
    assert.equal(h.requests(worker)[0]!.model, 'fast');
    const writing = await h.delegate(lead, 'writing', 'writer', 'List the repository files.');
    const author = await h.child(lead, writing.executionId); await h.idle(author, 1);
    assert.equal(h.requests(author)[0]!.model, 'review');
    assert.equal(h.requests(author)[0]!.reasoningEffort, 'high');
    assert.equal((await h.status(lead)).executions.find(row => row.id === quick.executionId)!.source, 'category');
    assert.deepEqual(h.errors, []);
  });

  // The rc.3 provider used MALFORMED_RESPONSE; rc.4 introduced a dedicated refusal code.
  const refusalCode = Object.hasOwn(LLM_FAILURE_CODES, 'CONTENT_REFUSED') ? 'CONTENT_REFUSED' : 'MALFORMED_RESPONSE';
  it(`audits ${refusalCode} as a failed native delegation without trying another model`, async (t) => {
    const h = await NativeHarness.create({ routing: quickPolicy() }); t.after(() => h.close());
    const lead = await h.lead(); h.authorize(lead);
    const gate = h.adapter.holdNextRequest(); t.after(() => gate.release());
    const run = await h.delegate(lead, 'quick');
    const child = await h.child(lead, run.executionId);
    assert.equal((await gate.started).model, 'fast');
    const ended = Promise.withResolvers<string>();
    t.after(h.ctx.on('subagent/end', info => { if (info.id === child.id) ended.resolve(info.stopReason); }));
    h.allowCompletion(child);
    gate.fail(new LlmError('Offline provider refused content', refusalCode));
    assert.equal(await ended.promise, 'error');
    // subagent/end precedes delivery of the native activation.result used by the audit.
    await new Promise<void>(resolve => setImmediate(resolve));
    const status = await h.status(lead);
    assert.deepEqual(status.executions.map(({ id, state, stopReason }) => ({ id, state, stopReason })),
      [{ id: run.executionId, state: 'failed', stopReason: 'error' }]);
    assert.equal(h.requests(child).length, 1);
    assert.equal(h.created.length, 2, 'No fallback child was created');
  });

  it('rejects explicit selection without Session opt-in before creating any child', async (t) => {
    const h = await NativeHarness.create({ routing: quickPolicy() }); t.after(() => h.close());
    const lead = await h.lead(); const before = h.created.length;
    await assert.rejects(h.delegate(lead, 'quick'), /not authorized/i);
    assert.equal(h.created.length, before);
    assert.equal(h.adapter.requests.length, 0);
    assert.deepEqual((await h.status(lead)).executions, []);
  });

  it('does not reuse another Team Session authorization', async (t) => {
    const h = await NativeHarness.create({ routing: quickPolicy() }); t.after(() => h.close());
    const authorized = await h.lead('allowed'); h.authorize(authorized);
    const other = await h.lead('denied');
    await assert.rejects(h.delegate(other, 'quick'), /not authorized/i);
    const accepted = await h.delegate(authorized, 'quick');
    await h.idle(await h.child(authorized, accepted.executionId), 1);
    assert.deepEqual((await h.status(other)).executions, []);
  });

  for (const category of ['deep-low', 'deep-high', 'unspecified-low', 'unspecified-high', 'unknown', '__proto__', '']) {
    it(`rejects invalid/retired category ${JSON.stringify(category)} before admission`, async (t) => {
      const h = await NativeHarness.create(); t.after(() => h.close());
      const lead = await h.lead();
      await assert.rejects(h.delegate(lead, category));
      assert.equal(h.created.length, 1); assert.equal(h.adapter.requests.length, 0);
      assert.deepEqual((await h.status(lead)).executions, []);
    });
  }

  for (const provider of ['spawn', 'fork'] as const) {
    it(`does not rewrite ordinary ${provider}, Lead, names or keyword-looking prompts`, async (t) => {
      const h = await NativeHarness.create({ routing: quickPolicy() }); t.after(() => h.close());
      const lead = await h.lead(); h.authorize(lead);
      await h.drive(lead, 'Please list, review and audit everything.', 1);
      const child = await h.teammate(lead, 'reviewer', 'Please LIST, REVIEW and AUDIT.', provider);
      await h.idle(child, 1);
      assert.equal(h.requests(lead)[0]!.model, 'strong');
      assert.equal(h.requests(child)[0]!.model, 'strong');
      assert.deepEqual((await h.status(lead)).executions, []);
    });
  }

  it('snapshots new delegations while existing child continuation keeps its creation model', async (t) => {
    const policy = quickPolicy();
    const h = await NativeHarness.create({ routing: policy }); t.after(() => h.close());
    const lead = await h.lead(); h.authorize(lead);
    const first = await h.delegate(lead, 'quick', 'first');
    const child = await h.child(lead, first.executionId); await h.idle(child, 1);
    const original = (await h.status(lead)).executions[0]!;
    const next = quickPolicy(); next.builtins.quick = { binding: explicitTarget('review', 'high') };
    h.updatePolicy({ routing: next });
    await h.drive(child, 'Continue the same child after settings changed.', 2);
    assert.equal(h.requests(child)[1]!.model, 'fast');
    const second = await h.delegate(lead, 'quick', 'second');
    const newcomer = await h.child(lead, second.executionId); await h.idle(newcomer, 1);
    assert.equal(h.requests(newcomer)[0]!.model, 'review');
    const records = (await h.status(lead)).executions;
    assert.deepEqual(records.find(row => row.id === first.executionId)!.target, original.target);
    assert.notEqual(records.find(row => row.id === second.executionId)!.policyDigest, original.policyDigest);
  });

  it('clears inherited effort for an explicit same-model target that omits effort', async (t) => {
    const policy = safeRouting(); policy.defaultTarget = explicitTarget('strong');
    const h = await NativeHarness.create({ routing: policy }); t.after(() => h.close());
    const lead = await h.lead('high-effort-lead', 'high');
    await h.drive(lead, 'Confirm the parent high effort request.', 1);
    assert.equal(h.requests(lead)[0]!.reasoningEffort, 'high');
    const result = await h.delegate(lead);
    const child = await h.child(lead, result.executionId); await h.idle(child, 1);
    assert.equal(h.requests(child)[0]!.provider, 'offline');
    assert.equal(h.requests(child)[0]!.model, 'strong');
    assert.equal(h.requests(child)[0]!.reasoningEffort, undefined);
    assert.equal(lead.model.current()!.reasoningEffort, 'high');
  });

  it('merges old-run settlement and new-run audit across router unload/remount without losing native notices', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead();
    const oldGate = h.adapter.holdNextRequest(); t.after(() => oldGate.release());
    const oldRun = await h.delegate(lead, 'quick', 'old-generation'); await oldGate.started;
    const oldChild = await h.child(lead, oldRun.executionId);
    await h.unloadRouter();
    assert.equal(h.ctx.tools.get('team_route_delegate', lead), undefined);
    assert.equal(h.ctx.agents.get(oldChild.id), oldChild, 'Native manager, not router Fiber, owns the admitted run');
    await h.reloadRouter();
    assert.equal((await h.status(lead)).executions[0]!.state, 'unknown', 'Reload must not invent an active local handle');
    const newGate = h.adapter.holdNextRequest(); t.after(() => newGate.release());
    const newRun = await h.delegate(lead, 'writing', 'new-generation'); await newGate.started;
    const newChild = await h.child(lead, newRun.executionId);
    const oldEnded = Promise.withResolvers<void>(); const newEnded = Promise.withResolvers<void>();
    const outcomes: string[] = [];
    const dispose = h.ctx.on('subagent/end', info => {
      if (info.id !== oldChild.id && info.id !== newChild.id) return;
      assert.equal(info.stopReason, 'completed');
      assert.deepEqual(info.lastAssistantMessage, [{ type: 'text', text: 'Offline completion.' }]);
      outcomes.push(info.id);
      (info.id === oldChild.id ? oldEnded : newEnded).resolve();
    });
    t.after(dispose);
    h.allowCompletion(oldChild); oldGate.release(); await oldEnded.promise;
    // End publication precedes activation.result delivery; cross one event-loop turn
    // for native result consumers, without polling or imposing a timing threshold.
    await new Promise<void>(resolve => setImmediate(resolve));
    let records = (await h.status(lead)).executions;
    assert.equal(records.length, 2);
    assert.equal(records.find(row => row.id === oldRun.executionId)!.state, 'completed');
    assert.equal(records.find(row => row.id === newRun.executionId)!.state, 'running');
    h.allowCompletion(newChild); newGate.release(); await newEnded.promise;
    await new Promise<void>(resolve => setImmediate(resolve));
    await h.idle(lead);
    records = (await h.status(lead)).executions;
    assert.equal(records.length, 2);
    for (const record of records) { assert.equal(record.state, 'completed'); assert.equal(record.stopReason, 'completed'); }
    assert.deepEqual(outcomes, [oldChild.id, newChild.id]);
    assert.equal(h.ctx.agents.get(oldChild.id), undefined); assert.equal(h.ctx.agents.get(newChild.id), undefined);
    const delivered = JSON.stringify(h.requests(lead));
    assert.match(delivered, /old-generation/); assert.match(delivered, /new-generation/);
    assert.match(delivered, /Offline completion/);
    assert.deepEqual(h.errors, []);
  });

  it('does not expose routing while Team mode is disabled', async (t) => {
    const h = await NativeHarness.create({ routing: safeRouting() }, false); t.after(() => h.close());
    const lead = await h.lead();
    for (const name of ['team_route_delegate', 'team_route_status', 'team_route_cancel']) assert.equal(h.ctx.tools.get(name, lead), undefined);
    const child = await h.teammate(lead, 'worker', 'Review files.'); await child.whenIdle();
    assert.equal(h.requests(child)[0]!.model, 'strong');
  });

  it('does not expose delegation to teammates and rejects cross-Agent tool callers', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Ordinary work.'); await h.idle(worker, 1);
    assert.equal(h.ctx.tools.get('team_route_delegate', worker), undefined);
    assert.equal(h.ctx.tools.get('team_route_cancel', worker), undefined);
    await assert.rejects(h.tool(lead, 'team_route_delegate', { category: 'quick', prompt: 'Do work', description: 'Work' }, worker), /caller|Lead/i);
    assert.deepEqual((await h.status(lead)).executions, []);
  });

  it('uses dynamic custom IDs and preserves the execution snapshot after category removal', async (t) => {
    const routing = safeRouting(); routing.builtins.writing = { enabled: false };
    routing.custom.push(customCategory('custom-check', { binding: explicitTarget('review', 'high') }));
    const h = await NativeHarness.create({ routing }); t.after(() => h.close());
    const lead = await h.lead(); h.authorize(lead);
    const tool = h.ctx.tools.get('team_route_delegate', lead)!;
    assert.equal(tool.parameters.properties.category.enum, undefined);
    assert.doesNotMatch(tool.description, /custom-check|visual-engineering/);
    await assert.rejects(h.delegate(lead, 'writing'), /Active category IDs:.*custom-check/);
    const result = await h.delegate(lead, 'custom-check');
    const child = await h.child(lead, result.executionId); await h.idle(child, 1);
    assert.equal(h.requests(child)[0]!.model, 'review');
    assert.match(JSON.stringify(h.requests(child)[0]!), /Task category: custom-check/);
    h.updatePolicy({ routing: safeRouting() });
    const status = await h.status(lead);
    assert.ok(!status.categories.some(row => row.id === 'custom-check'));
    const record = status.executions.find(row => row.id === result.executionId)!;
    assert.deepEqual([record.categoryId, record.categoryNameAtStart, record.categoryOrigin], ['custom-check', 'Evidence', 'custom']);
    await assert.rejects(h.delegate(lead, 'custom-check'), /inactive or unknown/);
  });

  it('does not register removed legacy tools and explains an empty active registry', async (t) => {
    const routing = safeRouting();
    for (const id of BUILTIN_IDS) routing.builtins[id] = { enabled: false };
    const h = await NativeHarness.create({ routing }); t.after(() => h.close());
    const lead = await h.lead();
    for (const name of ['team_route_set', 'team_route_reset']) assert.equal(h.ctx.tools.get(name, lead), undefined);
    await assert.rejects(h.delegate(lead, 'writing'), /Enable at least one category/);
    assert.deepEqual((await h.status(lead)).categories, []);
    assert.equal(h.created.length, 1);
  });

  for (const target of [
    { mode: 'explicit' as const, provider: 'missing-provider', model: 'fast' },
    explicitTarget('missing-model'),
    explicitTarget('fast', 'unsupported-effort'),
  ]) {
    it(`rejects invalid advertised route ${JSON.stringify(target)} before child creation`, async (t) => {
      const policy = safeRouting(); policy.defaultTarget = target;
      const h = await NativeHarness.create({ routing: policy }); t.after(() => h.close());
      const lead = await h.lead();
      lead.session.append('subagent/model-selection-policy', { allowedModels: [{ provider: target.provider, model: target.model }] });
      await assert.rejects(h.delegate(lead));
      assert.equal(h.created.length, 1); assert.equal(h.adapter.requests.length, 0);
      assert.deepEqual((await h.status(lead)).executions, []);
    });
  }

  for (const change of ['config', 'disable', 'parent', 'authorization'] as const) {
    it(`rechecks ${change} after async model preflight with no stale admission`, async (t) => {
      const routing = quickPolicy();
      if (change === 'authorization') routing.builtins.quick = { binding: explicitTarget('strong') };
      const h = await NativeHarness.create({ routing }); t.after(() => h.close());
      const lead = await h.lead(); if (change !== 'authorization') h.authorize(lead);
      const started = Promise.withResolvers<void>(); const release = Promise.withResolvers<void>();
      t.after(() => release.resolve());
      const listModels = h.adapter.listModels.bind(h.adapter);
      let once = true;
      h.adapter.listModels = async provider => {
        if (once) { once = false; started.resolve(); await release.promise; }
        return listModels(provider);
      };
      h.ctx.emit('llm/models-updated', 'offline');
      const explanation = change === 'disable' ? /Active category IDs/
        : change === 'authorization' ? /not authorized/i : /changed before submission/i;
      const rejected = assert.rejects(h.delegate(lead, 'quick'), explanation);
      await started.promise;
      try {
        if (change === 'authorization') h.authorize(lead, ['fast']);
        else if (change === 'parent') lead.model.select(route('strong', 'low'));
        else {
          const next = safeRouting();
          if (change === 'disable') next.builtins.quick = { enabled: false };
          h.updatePolicy({ routing: next });
        }
      } finally { release.resolve(); }
      await rejected;
      assert.equal(h.created.length, 1); assert.equal(h.adapter.requests.length, 0);
      assert.deepEqual((await h.status(lead)).executions, []);
    });
  }

  it('still disposes a real native child when cancellation audit writes fail', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead(); const gate = h.adapter.holdNextRequest(); t.after(() => gate.release());
    const result = await h.delegate(lead); await gate.started;
    const child = await h.child(lead, result.executionId);
    const ended: string[] = [];
    const unsubscribe = h.ctx.on('subagent/end', info => {
      if (info.id === child.id) ended.push(info.stopReason);
    });
    t.after(unsubscribe);
    // Fault injection is confined to persistence; cancellation and managed teardown
    // still run through the real native activation, not a mocked dispose method.
    const update = t.mock.method(ExecutionStore.prototype, 'update', () => { throw new Error('Injected ENOSPC audit failure'); });
    try {
      const cancelled = await h.cancel(lead, result.executionId);
      assert.ok(update.mock.callCount() >= 1, 'Cancellation attempted to persist its audit transition');
      assert.equal(cancelled.stopped, true); assert.equal(cancelled.sideEffectsRolledBack, false);
      assert.equal(h.ctx.agents.get(child.id), undefined);
      assert.equal(h.teams.liveMembers(lead).some(row => row.id === child.id), false);
      assert.deepEqual(ended, ['aborted'], 'Native lifecycle confirms cleanup despite persistence failure');
    } finally { update.mock.restore(); }
    // A failed audit write must not be confused with durable cancelled evidence.
    assert.equal((await h.status(lead)).executions[0]!.state, 'running');
  });

  it('records uncertain startup as unknown when rejection follows real native admission', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead(); const gate = h.adapter.holdNextRequest(); t.after(() => gate.release());
    const start = h.ctx.subagents.startActivation.bind(h.ctx.subagents);
    let admitted: SubagentActivation | undefined;
    // Models the caller-visible ambiguity, not a claim that native admission is
    // side-effect-free: the real child is accepted before this boundary rejects.
    const startup = t.mock.method(h.ctx.subagents, 'startActivation', async (...args: Parameters<typeof start>) => {
      admitted = await start(...args);
      throw new Error('Injected rejection after native admission');
    });
    try {
      await assert.rejects(h.delegate(lead), /rejection after native admission/);
      await gate.started;
      assert.ok(admitted);
      const record = (await h.status(lead)).executions[0]!;
      assert.equal(record.state, 'unknown');
      assert.match(record.diagnostic ?? '', /uncertain|unconfirmed/i);
      assert.match(record.diagnostic ?? '', /no automatic replay/i);
      assert.equal(startup.mock.callCount(), 1, 'Startup rejection must not replay the task');
      assert.ok(h.ctx.agents.get(admitted.childId), 'Ambiguous startup can leave a real admitted child; do not assert zero side effects');
    } finally {
      startup.mock.restore();
      await admitted?.dispose();
    }
  });

  it('cancels a managed running execution and never claims to roll back side effects', async (t) => {
    const h = await NativeHarness.create(); t.after(() => h.close());
    const lead = await h.lead(); const gate = h.adapter.holdNextRequest();
    const result = await h.delegate(lead);
    await gate.started;
    const worker = await h.child(lead, result.executionId);
    assert.equal((await h.status(lead)).executions[0]!.state, 'running');
    const other = await h.lead('other');
    await assert.rejects(h.cancel(other, result.executionId), /No active/i);
    const cancelled = await h.cancel(lead, result.executionId);
    assert.equal(cancelled.stopped, true); assert.equal(cancelled.sideEffectsRolledBack, false);
    assert.equal(h.ctx.agents.get(worker.id), undefined);
    assert.equal(h.teams.liveMembers(lead).some(row => row.id === worker.id), false);
    const record = (await h.status(lead)).executions[0]!;
    assert.equal(record.state, 'cancelled'); assert.equal(record.stopReason, 'aborted');
    await assert.rejects(h.cancel(lead, result.executionId), /No active/i);
  });
});
