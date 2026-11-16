import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { NativeHarness, config, route, text } from './helpers.ts';

// No provider SDK, credentials, sockets, billing, or replay fixtures are involved.
// All routing assertions below inspect real LlmAdapter dispatches, not options.
describe('offline native DSH Agent Teams integration', { concurrency: false, timeout: 30_000 }, () => {
  for (const provider of ['spawn', 'fork'] as const) {
    it(`${provider}: routes the very first prompt and exact role before request capture`, async (t) => {
      const h = await NativeHarness.create();
      t.after(() => h.close());
      const lead = await h.lead();
      await h.drive(lead, 'Please list the architecture and review it.', 1);
      assert.equal(h.requests(lead)[0]!.model, 'strong', 'The Lead never takes a teammate route');

      const worker = await h.teammate(lead, 'worker', 'Please LIST the repository files.', provider);
      await h.idle(worker, 1);
      assert.equal(h.requests(worker)[0]!.model, 'fast', 'Initial prompt routing must beat inherited strong');
      assert.equal(h.requests(worker)[0]!.provider, 'offline');
      assert.equal(h.requests(worker)[0]!.reasoningEffort, undefined);
      let status = await h.status(lead);
      assert.equal(status.members.find((member) => member.id === worker.id)!.decision!.source, 'task');
      assert.equal(status.members.find((member) => member.id === worker.id)!.decision!.ruleId, 'cheap-list');

      const reviewer = await h.teammate(lead, 'reviewer', 'Handle the ordinary work.', provider);
      await h.idle(reviewer, 1);
      assert.equal(h.requests(reviewer)[0]!.model, 'review');
      assert.equal(h.requests(reviewer)[0]!.reasoningEffort, 'high');
      status = await h.status(lead);
      assert.equal(status.members.find((member) => member.id === reviewer.id)!.decision!.source, 'role');
      assert.deepEqual(lead.model.current(), route('strong'));
      assert.deepEqual(h.errors, []);
    });
  }

  it('routes real task ownership edges, latches edits, and rejects stale revisions', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Handle ordinary work.');
    await h.idle(worker, 1);
    const task = await h.ctx.agentTeams.createTask(lead, { subject: 'List files', description: 'Inventory the workspace' });
    const assigned = await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'worker' });
    assert.equal(worker.model.current()!.model, 'fast');
    assert.equal(assigned.status, 'in_progress', 'Native Lead reassign already starts the task');
    const released = await h.ctx.agentTeams.updateTask(worker, { taskId: task.id, expectedRevision: assigned.revision, action: 'release' });
    assert.equal(worker.model.current()!.model, 'strong');
    const claimed = await h.ctx.agentTeams.updateTask(worker, { taskId: task.id, expectedRevision: released.revision, action: 'claim' });
    assert.equal(claimed.status, 'in_progress');
    const edited = await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: claimed.revision, action: 'edit', subject: 'Review security', description: 'Audit the change' });
    assert.equal(worker.model.current()!.model, 'fast', 'Editing one task is not a new task boundary');
    const before = (await h.status(lead)).history.length;
    await assert.rejects(h.ctx.agentTeams.updateTask(worker, { taskId: task.id, expectedRevision: claimed.revision, action: 'complete' }));
    assert.equal((await h.status(lead)).history.length, before);
    await h.drive(worker, 'Continue the assigned work.', 2);
    assert.equal(h.requests(worker).at(-1)!.model, 'review', 'A new turn re-evaluates authoritative task text');
    await h.ctx.agentTeams.updateTask(worker, { taskId: task.id, expectedRevision: edited.revision, action: 'complete' });
    assert.equal(worker.model.current()!.model, 'strong', 'Completed task owner must not retain its task route');
    assert.deepEqual(h.errors, []);
  });

  it('manual override/reset is Lead-only, whitelisted, and isolated between same-name teams', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const leadA = await h.lead('team-a');
    const leadB = await h.lead('team-b');
    const workerA = await h.teammate(leadA, 'worker', 'Ordinary work.');
    const workerB = await h.teammate(leadB, 'worker', 'Ordinary work.');
    await h.idle(workerA, 1);
    await h.idle(workerB, 1);
    assert.equal(h.ctx.tools.get('team_route_set', workerA), undefined);
    await assert.rejects(h.tool(leadA, 'team_route_set', { member: 'worker', route: 'fast' }, workerA), /caller/i);
    await assert.rejects(h.tool(leadA, 'team_route_set', { member: 'worker', route: '__proto__' }), /Unknown named route/);
    await h.tool(leadA, 'team_route_set', { member: 'worker', route: 'fast' });
    assert.equal(workerA.model.current()!.model, 'fast');
    assert.equal(workerB.model.current()!.model, 'strong');
    const stateA = await h.status(leadA);
    const stateB = await h.status(leadB);
    assert.notEqual(stateA.teamId, stateB.teamId);
    assert.ok(stateA.history.every((event) => event.memberId === workerA.id));
    assert.ok(stateB.history.every((event) => event.memberId === workerB.id));
    await h.tool(leadA, 'team_route_reset', { member: 'worker' });
    assert.deepEqual(workerA.model.current(), route('strong'));
    assert.deepEqual(h.errors, []);
  });

  it('queues a running member override without rewriting its in-flight request', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(worker, 1);
    const gate = h.adapter.holdNextRequest();
    const run = h.drive(worker, 'Continue ordinary work.', 2);
    const inFlight = await gate.started;
    try {
      assert.equal(inFlight.model, 'strong');
      await h.tool(lead, 'team_route_set', { member: 'worker', route: 'review' });
      assert.equal(worker.model.current()!.model, 'strong');
      assert.equal((await h.status(lead)).members.find((row) => row.id === worker.id)!.manualRoute, 'review');
    } finally { gate.release(); }
    await run;
    assert.equal(h.requests(worker).at(-1)!.model, 'strong');
    await h.drive(worker, 'Next ordinary work.', 3);
    assert.equal(h.requests(worker).at(-1)!.model, 'review');
    assert.equal(h.requests(worker).at(-1)!.reasoningEffort, 'high');
  });

  it('does not route ordinary native child activations outside the Teams roster', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const child = await h.ctx.subagents.startActivation({
      provider: 'spawn', delivery: 'caller', label: 'ordinary child',
      request: { parent: lead, prompt: text('Please LIST the files.') }, signal: h.signals.signal,
    });
    await child.result;
    const requests = h.adapter.requests.filter((request) => request.sessionId === child.childId);
    assert.equal(requests.length, 1);
    assert.equal(requests[0]!.model, 'strong');
    assert.equal((await h.status(lead)).history.length, 0);
    assert.deepEqual(h.errors, []);
  });

  it('restores live baselines and scoped tools on unload without clobbering another selection', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const first = await h.teammate(lead, 'first', 'Please list files.');
    const second = await h.teammate(lead, 'second', 'Please list files.');
    await h.idle(first, 1);
    await h.idle(second, 1);
    second.model.select(route('review') as never);
    await h.unloadRouter();
    assert.deepEqual(first.model.current(), route('strong'));
    assert.deepEqual(second.model.current(), route('review'));
    assert.equal(h.ctx.tools.get('team_route_status', lead), undefined);
    assert.equal(h.ctx.tools.get('team_route_status', first), undefined);
    await h.reloadRouter();
    assert.equal(h.ctx.tools.definitions(lead).filter((tool) => tool.name === 'team_route_set').length, 1);
    assert.equal(h.ctx.tools.definitions(first).filter((tool) => tool.name === 'team_route_status').length, 1);
  });

  it('persists member-ID overrides and original baseline across cold resume plus plugin reload', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const original = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(original, 1);
    await h.tool(lead, 'team_route_set', { member: 'worker', route: 'fast' });
    await h.ctx.subagents.drainChildren(lead, [original.id]);
    assert.equal(h.ctx.agents.get(original.id), undefined);
    await h.idle(lead); // Native settlement may wake the parent before reload.
    await h.unloadRouter();
    await h.reloadRouter();
    await h.ctx.agentTeams.sendMessage(lead, { target: 'worker', content: text('Continue ordinary work.'), signal: h.signals.signal });
    const resumed = h.ctx.agents.get(original.id);
    assert.ok(resumed);
    assert.notEqual(resumed, original);
    await h.idle(resumed, 2);
    assert.equal(h.requests(resumed).at(-1)!.model, 'fast');
    await h.tool(lead, 'team_route_reset', { member: 'worker' });
    assert.deepEqual(resumed.model.current(), route('strong'), 'Must not mistake persisted routed model for original baseline');
    assert.deepEqual(h.errors, []);
  });

  it('applies a cold manual override before validating an obsolete latched task route', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(worker, 1);
    const task = await h.ctx.agentTeams.createTask(lead, { subject: 'List files', description: 'Inventory the workspace' });
    await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'worker' });
    assert.equal(worker.model.current()!.model, 'fast');
    await h.ctx.subagents.drainChildren(lead, [worker.id]);
    await h.idle(lead);
    const models = h.adapter.listModels.bind(h.adapter);
    h.adapter.listModels = async (provider) => (await models(provider)).filter((model) => model.id !== 'fast');
    h.ctx.emit('llm/models-updated', 'offline');
    await h.tool(lead, 'team_route_set', { member: 'worker', route: 'review' });
    await h.unloadRouter();
    await h.reloadRouter();
    await h.ctx.agentTeams.sendMessage(lead, { target: 'worker', content: text('Continue assigned work.'), signal: h.signals.signal });
    const resumed = h.ctx.agents.get(worker.id);
    assert.ok(resumed);
    await h.idle(resumed, 2);
    assert.equal(h.requests(resumed).at(-1)!.model, 'review');
    assert.deepEqual(h.errors, []);
  });

  for (const phase of ['metadata-validation', 'downstream-guard'] as const) {
    it(`vetoes stale captured routes when tasks change during ${phase}`, async (t) => {
      const h = await NativeHarness.create();
      t.after(() => h.close());
      const lead = await h.lead();
      const worker = await h.teammate(lead, 'worker', 'Please list files.');
      await h.idle(worker, 1);
      const started = Promise.withResolvers<void>();
      const released = Promise.withResolvers<void>();
      t.after(() => released.resolve());
      if (phase === 'metadata-validation') {
        const listModels = h.adapter.listModels.bind(h.adapter);
        let once = true;
        h.adapter.listModels = async (provider) => {
          if (once) {
            once = false;
            started.resolve();
            await released.promise;
          }
          return listModels(provider);
        };
        h.ctx.emit('llm/models-updated', 'offline');
      } else {
        let once = true;
        h.ctx.on('agent/pre-step', async ({ agent }, next) => {
          if (agent === worker && once) {
            once = false;
            started.resolve();
            await released.promise;
          }
          return next();
        });
      }
      worker.inbox.clear();
      worker.followup(createUserMessage({ content: text('Please list files again.'), source: { kind: 'user' } }));
      await started.promise;
      try {
        const task = await h.ctx.agentTeams.createTask(lead, { subject: 'Review security', description: 'Audit the change' });
        await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'worker' });
        assert.equal(worker.model.current()!.model, 'review');
      } finally { released.resolve(); }
      await worker.whenIdle();
      assert.equal(h.requests(worker).length, 1, 'Stale fast request must never reach adapter dispatch');
      assert.ok(h.errors.some((entry) => entry.agent === worker && /route changed during step preparation/i.test(String(entry.error))));
      h.errors.length = 0;
      await h.drive(worker, 'Explicitly continue the assigned task.', 2);
      assert.equal(h.requests(worker).at(-1)!.model, 'review');
    });
  }

  it('preserves an admitted step route when a task changes during native prepareCall', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Please list files.');
    await h.idle(worker, 1);
    const started = Promise.withResolvers<void>();
    const released = Promise.withResolvers<void>();
    t.after(() => released.resolve());
    const resolveModel = h.adapter.resolveModel.bind(h.adapter);
    let once = true;
    h.adapter.resolveModel = async (provider, model, signal) => {
      if (once) {
        once = false;
        started.resolve();
        await released.promise;
      }
      return resolveModel(provider, model, signal);
    };
    const run = h.drive(worker, 'Please list files again.', 2);
    await started.promise;
    try {
      const task = await h.ctx.agentTeams.createTask(lead, { subject: 'Review security', description: 'Audit the change' });
      await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'worker' });
      assert.equal(worker.model.current()!.model, 'review');
    } finally { released.resolve(); }
    await run;
    assert.equal(h.requests(worker).at(-1)!.model, 'fast', 'Admitted native step is immutable, even before transport starts');
    await h.drive(worker, 'Continue the assigned task.', 3);
    assert.equal(h.requests(worker).at(-1)!.model, 'review');
    assert.deepEqual(h.errors, []);
  });

  for (const bad of [
    { provider: 'not-registered', model: 'fast' },
    { provider: 'offline', model: 'not-advertised' },
    { provider: 'offline', model: 'fast', reasoningEffort: 'not-supported' },
  ]) {
    it(`refuses invalid route before any adapter dispatch: ${JSON.stringify(bad)}`, async (t) => {
      const policy = config();
      policy.routes.bad = bad;
      policy.roles = { worker: 'bad' };
      const h = await NativeHarness.create(policy);
      t.after(() => h.close());
      const lead = await h.lead();
      await assert.rejects(h.teammate(lead, 'worker', 'Ordinary work.'));
      assert.equal(h.adapter.requests.length, 0);
      assert.deepEqual(lead.model.current(), route('strong'));
    });
  }
});
