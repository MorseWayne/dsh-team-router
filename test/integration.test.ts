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

      let createdBeforeOwnership = false;
      let publishedBeforeInput = false;
      h.ctx.on('agent/created', ({ agent }) => {
        if (agent === lead) return undefined;
        createdBeforeOwnership = h.teams.tryMembership(agent) === undefined;
        return undefined;
      });
      h.ctx.on('subagent/start', (info) => {
        const child = h.ctx.agents.get(info.id);
        if (child === undefined || h.ctx.subagents.namesOf(child).self !== 'worker') return;
        const membership = h.teams.tryMembership(child);
        assert.equal(membership?.root, lead);
        assert.equal(membership?.name, 'worker');
        assert.ok(h.teams.liveMembers(lead).some((row) => row.id === child.id));
        assert.equal(h.requests(child).length, 0);
        assert.equal(h.ctx.sessionProjections.snapshot(lead.session, ['subagentCatalog']).values.subagentCatalog?.some((row) => row.id === child.id), false);
        publishedBeforeInput = true;
      });
      const worker = await h.teammate(lead, 'worker', 'Please LIST the repository files.', provider);
      await h.idle(worker, 1);
      assert.equal(createdBeforeOwnership, true, 'agent/created precedes activation ownership in rc.3');
      assert.equal(publishedBeforeInput, true, 'Native root/name are available at subagent/start before catalog/input publication');
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
    const assigned = await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: worker.id });
    assert.equal(worker.model.current()!.model, 'fast');
    assert.equal(assigned.status, 'in_progress', 'Native Lead reassign already starts the task');
    assert.equal(assigned.ownerId, worker.id, 'Native task ownership is canonical SessionId, not its display name');
    assert.equal(assigned.ownerName, 'worker');
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

  it('leaves a mode-off root and its ordinary native children untouched', async (t) => {
    const h = await NativeHarness.create(config(), false);
    t.after(() => h.close());
    const lead = await h.lead();
    assert.equal(h.ctx.agentTeams.isEnabled(lead), false);
    assert.equal(h.teams.tryMembership(lead), undefined);
    assert.equal(h.ctx.tools.get('team_route_status', lead), undefined);
    const child = await h.ctx.subagents.startActivation({
      provider: 'spawn', delivery: 'caller', label: 'ordinary child', name: 'reviewer',
      parent: lead, prompt: text('Please LIST the files.'), signal: h.signals.signal,
    });
    assert.equal((await child.result).stopReason, 'completed');
    const requests = h.adapter.requests.filter((request) => request.sessionId === child.childId);
    assert.equal(requests.length, 1);
    assert.equal(requests[0]!.model, 'strong', 'Neither role nor task rules apply when Team mode is off');
    assert.deepEqual(h.teams.liveMembers(lead), []);
    assert.deepEqual(await h.teams.listMembers(lead), []);
    assert.equal(h.ctx.tools.get('team_route_set', lead), undefined);
    assert.deepEqual(h.errors, []);
  });

  it('includes all continuable descendants of an enabled tree, not only direct children', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const parent = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(parent, 1);
    const nested = await h.teammate(parent, 'reviewer', 'Please list files.');
    await h.idle(nested, 1);
    const membership = h.teams.tryMembership(nested);
    assert.equal(membership?.root, lead);
    assert.equal(membership?.id, lead.id);
    assert.equal(membership?.name, 'worker/reviewer');
    assert.equal(membership?.role, 'teammate');
    assert.equal(h.requests(nested)[0]!.model, 'fast');
    const rows = (await h.status(lead)).members;
    assert.ok(rows.some((row) => row.id === nested.id && row.name === 'worker/reviewer'));
    await h.tool(lead, 'team_route_set', { member: 'worker/reviewer', route: 'review' });
    assert.equal(nested.model.current()!.model, 'review');
    await h.evict(nested);
    assert.equal(h.teams.tryMembership(nested), undefined, 'A stale Agent object never regains authority');
    assert.ok((await h.teams.listMembers(lead)).some((row) => row.id === nested.id && row.name === 'worker/reviewer'));
  });

  it('releases routing on mode-off and restores scoped routing on mode-on without waking members', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(worker, 1);
    await h.tool(lead, 'team_route_set', { member: 'worker', route: 'fast' });
    assert.equal(worker.model.current()!.model, 'fast');
    await h.ctx.agentTeams.setEnabled(lead, false, h.signals.signal);
    assert.equal(h.teams.tryMembership(worker), undefined);
    assert.equal(h.ctx.tools.get('team_route_status', lead), undefined);
    assert.equal(h.ctx.tools.get('team_route_status', worker), undefined);
    assert.deepEqual(worker.model.current(), route('strong'));
    await h.ctx.agentTeams.setEnabled(lead, true, h.signals.signal);
    assert.equal(h.teams.tryMembership(worker)?.name, 'worker');
    assert.equal(worker.model.current()!.model, 'fast');
    assert.equal(h.ctx.tools.definitions(lead).filter((tool) => tool.name === 'team_route_set').length, 1);
    assert.equal(h.ctx.tools.definitions(worker).filter((tool) => tool.name === 'team_route_status').length, 1);
    assert.equal(h.requests(worker).length, 1, 'Mode changes and override restoration never dispatch a request');
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
    await h.evict(original);
    await h.idle(lead); // Native settlement may wake the parent before reload.
    await h.unloadRouter();
    await h.reloadRouter();
    const targetId = await h.ctx.subagents.resolveName(lead, 'worker', h.signals.signal);
    assert.equal(targetId, original.id);
    assert.ok((await h.status(lead)).members.some((row) => row.id === original.id));
    assert.equal(h.ctx.agents.get(original.id), undefined, 'Cold catalog/status reads must not resume an Agent');
    await h.ctx.subagents.sendMessage(lead, targetId, text('Continue ordinary work.'), { signal: h.signals.signal });
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
    await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: worker.id });
    assert.equal(worker.model.current()!.model, 'fast');
    await h.evict(worker);
    await h.idle(lead);
    const models = h.adapter.listModels.bind(h.adapter);
    h.adapter.listModels = async (provider) => (await models(provider)).filter((model) => model.id !== 'fast');
    h.ctx.emit('llm/models-updated', 'offline');
    await h.tool(lead, 'team_route_set', { member: 'worker', route: 'review' });
    await h.unloadRouter();
    await h.reloadRouter();
    await h.ctx.subagents.sendMessage(lead, worker.id, text('Continue assigned work.'), { signal: h.signals.signal });
    const resumed = h.ctx.agents.get(worker.id);
    assert.ok(resumed);
    await h.idle(resumed, 2);
    assert.equal(h.requests(resumed).at(-1)!.model, 'review');
    assert.deepEqual(h.errors, []);
  });

  it('keeps an existing task choice through live policy and task edits, then reads policy next turn', async (t) => {
    const h = await NativeHarness.create();
    t.after(() => h.close());
    const lead = await h.lead();
    const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
    await h.idle(worker, 1);
    const task = await h.ctx.agentTeams.createTask(lead, { subject: 'List files', description: 'Inventory the workspace' });
    const assigned = await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: worker.id });
    assert.deepEqual(worker.model.current(), route('fast'));
    const before = await h.status(lead);
    const next = config();
    next.routes.fast = route('review', 'high');
    const fiber = h.routerFiber;
    h.updatePolicy(next);
    assert.equal(h.routerFiber, fiber, 'Policy updates retain the mounted router instance');
    assert.deepEqual(worker.model.current(), route('fast'), 'A live policy edit is not a task boundary');
    await h.ctx.agentTeams.updateTask(lead, {
      taskId: task.id, expectedRevision: assigned.revision, action: 'edit',
      subject: 'List amended files', description: 'Inventory the revised workspace',
    });
    assert.deepEqual(worker.model.current(), route('fast'), 'Editing the same owned task retains its choice');
    const unrelated = await h.ctx.agentTeams.createTask(lead, { subject: 'Ordinary unrelated work', description: 'No ownership change' });
    await h.ctx.agentTeams.updateTask(lead, {
      taskId: unrelated.id, expectedRevision: unrelated.revision, action: 'edit', subject: 'Review unrelated work',
    });
    const latched = await h.status(lead);
    assert.deepEqual(worker.model.current(), route('fast'), 'Unrelated task events cannot adopt a new policy mid-task');
    assert.deepEqual(latched.history, before.history, 'Neither policy nor non-boundary task edits create routing decisions');
    assert.equal(h.requests(worker).length, 1, 'Live policy and task edits do not wake the member');
    await h.drive(worker, 'Continue the assigned task.', 2);
    assert.equal(h.requests(worker).at(-1)!.model, 'review');
    assert.equal(h.requests(worker).at(-1)!.reasoningEffort, 'high');
    assert.deepEqual(worker.model.current(), route('review', 'high'));
    assert.deepEqual(h.errors, []);
  });

  it('preserves an already admitted request across a live route edit and adopts it next turn', async (t) => {
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
        assert.equal(model, 'fast');
        started.resolve();
        await released.promise;
      }
      return resolveModel(provider, model, signal);
    };
    const run = h.drive(worker, 'Please list files again.', 2);
    await started.promise;
    try {
      const next = config();
      next.routes.fast = route('review', 'high');
      h.updatePolicy(next);
      assert.deepEqual(worker.model.current(), route('fast'));
      assert.equal(h.requests(worker).length, 1, 'The native step is admitted but transport has not started');
    } finally { released.resolve(); }
    await run;
    assert.equal(h.requests(worker).at(-1)!.model, 'fast', 'An admitted request keeps its captured native model selection');
    await h.drive(worker, 'Please list files on the next turn.', 3);
    assert.equal(h.requests(worker).at(-1)!.model, 'review');
    assert.equal(h.requests(worker).at(-1)!.reasoningEffort, 'high');
    assert.deepEqual(h.errors, []);
  });

  for (const change of ['changed', 'deleted'] as const) {
    it(`rejects manual override when its live named route is ${change} during catalog validation`, async (t) => {
      const h = await NativeHarness.create();
      t.after(() => h.close());
      const lead = await h.lead();
      const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
      await h.idle(worker, 1);
      const before = await h.status(lead);
      const started = Promise.withResolvers<void>();
      const released = Promise.withResolvers<void>();
      t.after(() => released.resolve());
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
      const rejected = assert.rejects(
        h.tool(lead, 'team_route_set', { member: 'worker', route: 'fast' }),
        /named route changed while validating/i,
      );
      await started.promise;
      try {
        const next = config();
        if (change === 'changed') next.routes.fast = route('review', 'high');
        else {
          delete next.routes.fast;
          next.rules = (next.rules ?? []).filter((rule) => rule.route !== 'fast');
        }
        h.updatePolicy(next);
      } finally { released.resolve(); }
      await rejected;
      const after = await h.status(lead);
      assert.equal(after.members.find((row) => row.id === worker.id)!.manualRoute, null, 'Rejected validation never commits an override');
      assert.deepEqual(after.history, before.history);
      assert.deepEqual(worker.model.current(), route('strong'));
      assert.equal(h.requests(worker).length, 1);
      assert.deepEqual(h.errors, []);
    });
  }

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
        await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: worker.id });
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
      await h.ctx.agentTeams.updateTask(lead, { taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: worker.id });
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
      const worker = await h.teammate(lead, 'worker', 'Ordinary work.');
      await worker.whenIdle();
      assert.equal(h.adapter.requests.length, 0);
      assert.ok(h.errors.some((entry) => entry.agent === worker), 'Awaited pre-step must reject the invalid route');
      assert.deepEqual(lead.model.current(), route('strong'));
    });
  }
});
