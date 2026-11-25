import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ModelAuthorizationForm } from '../src/model-grants.ts';
import { CATEGORY_IDS } from '../src/categories.ts';
import { createDefaultRoutingPolicy } from '../src/routing-policy.ts';
import { previewRecommendations } from '../src/recommendations.ts';
import type { ModelCatalog } from '../src/recommendations.ts';
import {
  RoutingEditor, routingDraftIssue, routingDraftToPolicy, routingFormPreview, routingPolicyMutations, routingPolicyToDraft,
} from '../src/routing-editor.ts';
import type { RoutingForm, RoutingFormSnapshot, RoutingFormValue, RoutingMutation } from '../src/routing-editor.ts';

const available: ModelCatalog = {
  groups: [{ id: 'openai', name: 'OpenAI', models: [
    { id: 'gpt-5-mini', name: 'Mini', reasoning: { efforts: [{ id: 'low', name: 'Low' }] } },
    { id: 'gpt-5-codex', name: 'Codex' },
  ] }], failures: [],
};
function legacy(): RoutingFormValue {
  return {
    routes: { default: { provider: 'openai', model: 'gpt-5-mini' } },
    rules: [{ id: 'rule', route: 'default', keywords: ['work'] }], roles: { worker: 'default' }, defaultRoute: 'default', historyLimit: 10,
  };
}
function v2(): RoutingFormValue { return { policyV2: createDefaultRoutingPolicy() }; }

class FakeGrants implements ModelAuthorizationForm {
  state: ReturnType<ModelAuthorizationForm['getSnapshot']> = { status: 'ready', writable: true, revision: 7,
    value: { enabled: false, allowedModels: [{ provider: 'other', model: 'keep' }] } };
  writes = 0;
  getSnapshot() { return this.state; }
  subscribe() { return () => {}; }
  async mutate(ops: Parameters<ModelAuthorizationForm['mutate']>[0], revision: number) {
    this.writes++;
    if (revision !== this.state.revision || !this.state.writable) return false;
    for (const op of ops) Object.assign(this.state.value!, { [op.path[0]]: op.value });
    this.state.revision++;
    return true;
  }
}

class FakeForm implements RoutingForm {
  grants = new FakeGrants();
  state: RoutingFormSnapshot;
  listeners = new Set<() => void>();
  writes: Array<{ ops: readonly RoutingMutation[]; revision: number | undefined }> = [];
  reject = false;
  transportError = false;
  pending: (() => void) | undefined;
  delay = false;
  constructor(value = v2()) { this.state = { status: 'ready', value, revision: 1, writable: true }; }
  getSnapshot(): RoutingFormSnapshot { return this.state; }
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  push(value: RoutingFormValue, revision = (this.state.revision ?? 0) + 1): void {
    this.state = { ...this.state, value, revision };
    for (const listener of this.listeners) listener();
  }
  async mutate(ops: readonly RoutingMutation[], revision?: number): Promise<boolean> {
    this.writes.push({ ops: structuredClone(ops), revision });
    if (this.delay) await new Promise<void>(resolve => { this.pending = resolve; });
    if (this.transportError) throw new Error('network failed');
    if (this.reject || revision !== this.state.revision) return false;
    assert.equal(ops.length, 1);
    assert.equal(ops[0]!.op, 'set');
    assert.deepEqual(ops[0]!.path, ['policyV2']);
    this.push({ ...this.state.value, policyV2: ops[0]!.value });
    return true;
  }
}

function editHistory(editor: RoutingEditor, value = '42'): void {
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: value });
}

describe('routing form and draft helpers', () => {
  it('renders all seven categories even with no saved overrides', () => {
    const draft = routingPolicyToDraft(createDefaultRoutingPolicy());
    assert.deepEqual(Object.keys(draft.categories), CATEGORY_IDS);
    assert.ok(CATEGORY_IDS.every(id => draft.categories[id].mode === 'default'));
    assert.equal(draft.historyLimit, '100');
    assert.equal(routingDraftIssue(draft), undefined);
    assert.equal(routingDraftToPolicy(draft).version, 2);
  });

  it('reads V2 preferentially and never revives legacy rules', () => {
    const value = { ...legacy(), policyV2: createDefaultRoutingPolicy() };
    const preview = routingFormPreview(value);
    assert.equal(preview.required, false);
    assert.deepEqual(preview.policy.defaultTarget, { executor: 'native', model: { mode: 'inherit' } });
    assert.equal(preview.retired, undefined);
  });

  it('previews exact legacy default mapping and retirement without automatic category guesses', () => {
    const preview = routingFormPreview(legacy());
    assert.equal(preview.required, true);
    assert.deepEqual(preview.retired, { routes: ['default'], ruleCount: 1, roleCount: 1 });
    assert.deepEqual(preview.policy.defaultTarget, { executor: 'native', model: { mode: 'explicit', provider: 'openai', id: 'gpt-5-mini' } });
    assert.equal(preview.policy.historyLimit, 10);
    assert.deepEqual(Object.keys(preview.policy.categories), []);
  });

  it('supports empty legacy values and null legacy default without touching unrelated fields', () => {
    const input = { routes: {}, defaultRoute: null, stateDir: '/leave/alone' };
    const result = routingFormPreview(input);
    assert.equal(result.required, false);
    assert.equal(result.policy.defaultTarget.model.mode, 'inherit');
    assert.equal(input.stateDir, '/leave/alone');
  });

  it('rejects explicit null or malformed V2 instead of migrating legacy values silently', () => {
    assert.throws(() => routingFormPreview({ ...legacy(), policyV2: null }), TypeError);
    assert.throws(() => routingFormPreview({ policyV2: { version: 1 } as never }), TypeError);
  });

  it('emits only one policyV2 set mutation, never unset or legacy field writes', () => {
    const source = createDefaultRoutingPolicy();
    const writes = routingPolicyMutations(source);
    assert.deepEqual(writes.map(write => ({ op: write.op, path: write.path })), [{ op: 'set', path: ['policyV2'] }]);
    assert.notEqual(writes[0]!.value, source);
  });

  it('preserves incomplete form strings until explicit validation', () => {
    const draft = routingPolicyToDraft(createDefaultRoutingPolicy());
    for (const value of ['', ' ', '0', '1001', '1.5', 'not-a-number']) {
      draft.historyLimit = value;
      assert.equal(routingDraftIssue(draft)?.reason, 'history');
    }
    draft.historyLimit = '100';
    draft.defaultTarget = { executor: 'native', model: { mode: 'explicit', provider: '', id: '' } };
    assert.equal(routingDraftIssue(draft)?.field, 'provider');
  });

  it('requires a valid catalog only for explicit native selections and verifies effort per model', () => {
    const draft = routingPolicyToDraft(createDefaultRoutingPolicy());
    assert.equal(routingDraftIssue(draft, undefined, false), undefined);
    draft.categories.quick = { mode: 'target', target: { executor: 'native', model: { mode: 'explicit', provider: 'openai', id: 'gpt-5-mini', reasoningEffort: 'low' } } };
    assert.equal(routingDraftIssue(draft)?.reason, 'catalogRequired');
    assert.equal(routingDraftIssue(draft, available), undefined);
    const selection = draft.categories.quick.target.model;
    if (selection.mode === 'explicit') selection.reasoningEffort = 'high';
    assert.equal(routingDraftIssue(draft, available)?.field, 'effort');
    if (selection.mode === 'explicit') { delete selection.reasoningEffort; selection.id = 'missing'; }
    assert.equal(routingDraftIssue(draft, available)?.field, 'model');
  });

  it('does not accept stale models from a failed provider group', () => {
    const draft = routingPolicyToDraft(routingFormPreview(legacy()).policy);
    const failed = { ...available, failures: [{ id: 'openai', name: 'OpenAI', message: 'timeout' }] };
    assert.equal(routingDraftIssue(draft, failed)?.field, 'provider');
  });

  it('keeps existing external targets but rejects save preflight while P0 is unverified', () => {
    const policy = createDefaultRoutingPolicy();
    policy.categories.deep = { mode: 'target', target: { executor: 'codex', model: { mode: 'explicit', id: 'saved-model' } } };
    const draft = routingPolicyToDraft(policy);
    assert.deepEqual(draft.categories.deep, policy.categories.deep);
    assert.deepEqual(routingDraftIssue(draft), { section: 'deep', field: 'executor', reason: 'externalUnavailable' });
  });
});

describe('Save synchronizes DSH authorization', () => {
  const route = { provider: 'openai', model: 'gpt-5-mini' };
  function configured() {
    const policy = routingFormPreview(legacy()).policy;
    policy.categories.deep = { mode: 'target', target: policy.defaultTarget };
    return new FakeForm({ policyV2: policy });
  }
  it('repairs existing selections without rewriting policy; preserves unrelated grants and deduplicates targets', async () => {
    const form = configured();
    const editor = new RoutingEditor(form, form.grants);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.deepEqual(form.grants.state.value, { enabled: true, allowedModels: [{ provider: 'other', model: 'keep' }, route] });
    assert.equal(form.writes.length, 0);
    editHistory(editor);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.equal(form.grants.writes, 1);
    editor.dispose();
  });
  it('blocks a missing or read-only grant service before saving, but inheritance needs no grant', async () => {
    for (const unavailable of [true, false]) {
      const form = configured();
      if (unavailable) form.grants.state.status = 'unavailable'; else form.grants.state.writable = false;
      const editor = new RoutingEditor(form, form.grants);
      editHistory(editor);
      assert.equal(await editor.save({ catalog: available }), false);
      assert.equal(editor.getSnapshot().error?.kind, unavailable ? 'grantUnavailable' : 'grantReadOnly');
      assert.equal(form.writes.length, 0);
      editor.setCategoryMode('deep', 'default'); editor.setNativeModelMode('default', 'inherit');
      assert.equal(await editor.save(), true);
      assert.equal(form.grants.writes, 0);
      editor.dispose();
    }
  });
  it('does not grant on refused policy writes or overwrite concurrent grants; retries only authorization', async () => {
    const form = configured();
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor);
    form.reject = true;
    assert.equal(await editor.save({ catalog: available }), false);
    assert.equal(form.grants.writes, 0);
    form.reject = false; form.delay = true;
    const saving = editor.save({ catalog: available });
    form.grants.state.revision = 8;
    const concurrent = { provider: 'another', model: 'gpt-5-mini' };
    form.grants.state.value!.allowedModels.push(concurrent);
    form.pending!();
    assert.equal(await saving, false);
    assert.equal(editor.getSnapshot().error?.kind, 'grantFailed');
    assert.equal(editor.getSnapshot().notice, undefined);
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.equal(form.writes.length, 2);
    assert.deepEqual(form.grants.state.value!.allowedModels, [{ provider: 'other', model: 'keep' }, concurrent, route]);
    editor.dispose();
  });
});

describe('revision-bound V2 editor', () => {
  it('selects a provider/model pair in one edit and does not carry effort between providers with the same model ID', async () => {
    const policy = createDefaultRoutingPolicy();
    policy.defaultTarget = { executor: 'native', model: { mode: 'explicit', provider: 'openai', id: 'gpt-5-mini', reasoningEffort: 'low' } };
    const form = new FakeForm({ policyV2: policy });
    const editor = new RoutingEditor(form, form.grants);
    editor.setNativeModelMode('default', 'inherit');
    editor.setNativeModelMode('default', 'explicit', 1, { provider: 'openai', id: 'gpt-5-mini' });
    assert.deepEqual(editor.getSnapshot().draft?.defaultTarget, policy.defaultTarget);
    const choice = { provider: 'alternate', id: 'gpt-5-mini' };
    editor.setNativeModelMode('default', 'explicit', 1, choice);
    const expected = { executor: 'native', model: { mode: 'explicit', ...choice } };
    assert.deepEqual(editor.getSnapshot().draft?.defaultTarget, expected);
    assert.equal(form.writes.length, 0);
    assert.equal(await editor.save({ catalog: { groups: [...available.groups, { id: 'alternate', name: 'Alternate', models: [{ id: choice.id, name: 'Mini' }] }], failures: [] } }), true);
    assert.deepEqual(form.state.value?.policyV2?.defaultTarget, expected);
    editor.dispose();
  });
  it('keeps bundle-detail and Settings drafts local while sharing only saved Host policy', async () => {
    const form = new FakeForm();
    const detail = new RoutingEditor(form, form.grants);
    const settings = new RoutingEditor(form, form.grants);
    editHistory(detail, '42');
    assert.equal(settings.getSnapshot().draft!.historyLimit, '100');
    assert.equal(await detail.save(), true);
    assert.equal(settings.getSnapshot().draft!.historyLimit, '42');
    editHistory(settings, '24');
    settings.dispose();
    const reopened = new RoutingEditor(form, form.grants);
    assert.equal(reopened.getSnapshot().draft!.historyLimit, '42');
    assert.equal(form.writes.length, 1);
    reopened.dispose(); detail.dispose();
    assert.equal(form.listeners.size, 0);
  });
  it('stages independent draft edits and persists only through an explicit save', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    const draft = { ...editor.getSnapshot().draft!, historyLimit: '23' };
    editor.edit(draft);
    draft.historyLimit = '99';
    assert.equal(form.writes.length, 0);
    assert.equal(editor.getSnapshot().draft?.historyLimit, '23');
    assert.equal(await editor.save(), true);
    assert.equal(form.writes.length, 1);
    assert.equal(form.writes[0]!.revision, 1);
    assert.equal(form.state.value?.policyV2?.historyLimit, 23);
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(editor.getSnapshot().notice, 'saved');
    editor.dispose();
  });

  it('requires explicit revision-bound migration confirmation even if a draft was edited', async () => {
    const form = new FakeForm(legacy());
    const editor = new RoutingEditor(form, form.grants);
    assert.equal(editor.getSnapshot().migrationRequired, true);
    editHistory(editor);
    assert.equal(await editor.save({ catalog: available }), false);
    assert.equal(editor.getSnapshot().error?.kind, 'migration');
    assert.equal(form.writes.length, 0);
    assert.equal(editor.confirmMigration(1), true);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.equal(editor.getSnapshot().migrationRequired, false);
    assert.equal(form.state.value?.rules?.length, 1); // Legacy data retained for Host backup, not edited here.
    assert.equal(form.writes[0]!.ops.length, 1);
    editor.dispose();
  });

  it('allows confirmed migration to be saved even without changing the mapped values', async () => {
    const form = new FakeForm(legacy());
    const editor = new RoutingEditor(form, form.grants);
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(editor.confirmMigration(), true);
    assert.equal(editor.getSnapshot().dirty, true);
    assert.equal(await editor.save({ catalog: available }), true);
    editor.dispose();
  });

  it('preserves dirty drafts on Host pushes and never refreshes their base revision', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor, '77');
    form.push(v2());
    assert.equal(editor.getSnapshot().stale, true);
    assert.equal(editor.getSnapshot().revision, 1);
    assert.equal(editor.getSnapshot().draft?.historyLimit, '77');
    assert.equal(await editor.save(), false);
    assert.equal(form.writes.length, 0);
    editor.discard();
    assert.equal(editor.getSnapshot().revision, 2);
    assert.equal(editor.getSnapshot().draft?.historyLimit, '100');
    editor.dispose();
  });

  it('invalidates migration confirmation after a Host revision change', () => {
    const form = new FakeForm(legacy());
    const editor = new RoutingEditor(form, form.grants);
    editor.confirmMigration();
    form.push(legacy());
    assert.equal(editor.getSnapshot().migrationConfirmed, false);
    assert.equal(editor.confirmMigration(1), false);
    assert.equal(editor.confirmMigration(2), false);
    editor.dispose();
  });

  it('preserves drafts on rejected or thrown saves', async () => {
    for (const failure of ['reject', 'transportError'] as const) {
      const form = new FakeForm();
      const editor = new RoutingEditor(form, form.grants);
      editHistory(editor, '31');
      form[failure] = true;
      assert.equal(await editor.save(), false);
      assert.equal(editor.getSnapshot().dirty, true);
      assert.equal(editor.getSnapshot().draft?.historyLimit, '31');
      assert.equal(editor.getSnapshot().error?.kind, failure === 'reject' ? 'refused' : 'transport');
      editor.dispose();
    }
  });

  it('prevents double saves, edits and discard during an admitted save', async () => {
    const form = new FakeForm();
    form.delay = true;
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor, '12');
    const result = editor.save();
    assert.equal(editor.getSnapshot().saving, true);
    editHistory(editor, '88');
    editor.discard();
    assert.equal(await editor.save(), false);
    assert.equal(form.writes.length, 1);
    form.pending!();
    assert.equal(await result, true);
    assert.equal(form.state.value?.policyV2?.historyLimit, 12);
    editor.dispose();
  });

  it('does not write read-only, loading, unavailable or unversioned snapshots', async () => {
    for (const state of [
      { writable: false }, { status: 'loading' as const }, { status: 'unavailable' as const }, { revision: undefined },
    ]) {
      const form = new FakeForm();
      const editor = new RoutingEditor(form, form.grants);
      editHistory(editor);
      form.state = { ...form.state, ...state };
      assert.equal(await editor.save(), false);
      assert.equal(form.writes.length, 0);
      editor.dispose();
    }
  });

  it('only applies recommendation previews to the unchanged draft and revision', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    const preview = previewRecommendations(routingDraftToPolicy(editor.getSnapshot().draft!), available);
    assert.equal(form.writes.length, 0);
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(editor.applyRecommendations(preview, 1), true);
    assert.equal(editor.getSnapshot().dirty, true);
    assert.equal(form.writes.length, 0);
    assert.equal(await editor.save({ catalog: available }), true);
    editor.dispose();
  });

  it('refuses stale recommendation previews after local edits or Host updates', () => {
    for (const cause of ['draft', 'host']) {
      const form = new FakeForm();
      const editor = new RoutingEditor(form, form.grants);
      const preview = previewRecommendations(routingDraftToPolicy(editor.getSnapshot().draft!), available);
      if (cause === 'draft') editHistory(editor, '17'); else form.push(v2());
      assert.equal(editor.applyRecommendations(preview, 1), false);
      assert.equal(editor.getSnapshot().error?.kind, 'previewChanged');
      assert.equal(form.writes.length, 0);
      editor.dispose();
    }
  });

  it('keeps explicit model choices when catalog validation fails', async () => {
    const form = new FakeForm({ policyV2: routingFormPreview(legacy()).policy });
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor);
    assert.equal(await editor.save({ catalogReady: false }), false);
    assert.equal(editor.getSnapshot().issue?.reason, 'catalogRequired');
    assert.equal(editor.getSnapshot().draft?.defaultTarget.model.mode, 'explicit');
    assert.equal(form.writes.length, 0);
    assert.equal(await editor.save({ catalog: available }), true);
    editor.dispose();
  });

  it('restores category custom selections when switching default/custom within an edit session', async () => {
    const policy = createDefaultRoutingPolicy();
    const selected = { mode: 'target' as const, target: { executor: 'native' as const, model: { mode: 'explicit' as const, provider: 'openai', id: 'gpt-5-mini', reasoningEffort: 'low' } } };
    policy.categories.quick = selected;
    const form = new FakeForm({ policyV2: policy });
    const editor = new RoutingEditor(form, form.grants);
    editor.setCategoryMode('quick', 'default');
    assert.deepEqual(editor.getSnapshot().draft?.categories.quick, { mode: 'default' });
    editor.setCategoryMode('quick', 'target');
    assert.deepEqual(editor.getSnapshot().draft?.categories.quick, selected);
    editor.setCategoryMode('quick', 'default');
    assert.equal(await editor.save(), true);
    assert.deepEqual(form.state.value?.policyV2?.categories.quick, { mode: 'default' });
    editor.setCategoryMode('quick', 'target');
    assert.equal(editor.getSnapshot().draft?.categories.quick.mode, 'target');
    assert.notDeepEqual(editor.getSnapshot().draft?.categories.quick, selected);
    editor.dispose();
  });

  it('restores explicit native models and effort after temporary inheritance without persisting hidden values', async () => {
    const policy = createDefaultRoutingPolicy();
    policy.defaultTarget = { executor: 'native', model: { mode: 'explicit', provider: 'openai', id: 'gpt-5-mini', reasoningEffort: 'low' } };
    const form = new FakeForm({ policyV2: policy });
    const editor = new RoutingEditor(form, form.grants);
    editor.setNativeModelMode('default', 'inherit');
    assert.deepEqual(editor.getSnapshot().draft?.defaultTarget, { executor: 'native', model: { mode: 'inherit' } });
    editor.setNativeModelMode('default', 'explicit');
    assert.deepEqual(editor.getSnapshot().draft?.defaultTarget, policy.defaultTarget);
    editor.setNativeModelMode('default', 'inherit');
    assert.equal(await editor.save(), true);
    assert.deepEqual(form.state.value?.policyV2?.defaultTarget, { executor: 'native', model: { mode: 'inherit' } });
    editor.dispose();
  });

  it('unsubscribes on disposal and performs no later writes', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor);
    editor.dispose();
    assert.equal(form.listeners.size, 0);
    assert.equal(await editor.save(), false);
  });
});
