import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BUILTIN_IDS, CLASSIC7_IDS, CUSTOM_CATEGORY_TEMPLATES, MAX_CUSTOM_CATEGORIES } from '../src/core/categories.ts';
import { previewRecommendations } from '../src/core/recommendations.ts';
import type { ModelCatalog } from '../src/core/recommendations.ts';
import { createDefaultRoutingConfig } from '../src/core/routing-policy.ts';
import { isAllowedModelArray, planModelGrant, requiredModelRoutes, type ModelAuthorizationForm } from '../src/ui/model-grants.ts';
import {
  RoutingEditor, routingConfigMutations, routingConfigToDraft, routingDraftIssue, routingDraftToConfig, routingFormConfig,
} from '../src/ui/routing-editor.ts';
import type { RoutingForm, RoutingFormSnapshot, RoutingFormValue, RoutingMutation } from '../src/ui/routing-editor.ts';

const available: ModelCatalog = {
  groups: [{ id: 'openai', name: 'OpenAI', models: [
    { id: 'gpt-5-mini', name: 'Mini', reasoning: { efforts: [{ id: 'low', name: 'Low' }] } },
    { id: 'gpt-5-codex', name: 'Codex' },
  ] }], failures: [],
};
function v3(): RoutingFormValue { return { routing: createDefaultRoutingConfig() }; }

class FakeGrants implements ModelAuthorizationForm {
  state: ReturnType<ModelAuthorizationForm['getSnapshot']> = {
    status: 'ready', writable: true, revision: 7,
    value: { enabled: false, allowedModels: [{ provider: 'other', model: 'keep' }] },
  };
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
  constructor(value: RoutingFormValue = v3()) {
    this.state = { status: 'ready', value, revision: 1, writable: true };
  }
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
    const next: RoutingFormValue = { ...this.state.value };
    for (const op of ops) {
      assert.equal(op.op, 'set');
      assert.deepEqual(op.path, ['routing']);
      next.routing = op.value;
    }
    this.push(next);
    return true;
  }
}

function editHistory(editor: RoutingEditor, value = '42'): void {
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: value });
}

describe('V3 routing form and draft helpers', () => {
  it('renders all 12 built-ins enabled by default and produces normalized V3 config', () => {
    const draft = routingConfigToDraft(createDefaultRoutingConfig());
    assert.deepEqual(Object.keys(draft.builtins), BUILTIN_IDS);
    assert.ok(BUILTIN_IDS.every(id => draft.builtins[id].enabled && draft.builtins[id].binding.mode === 'default'));
    assert.deepEqual(draft.custom, []);
    assert.equal(draft.historyLimit, '100');
    assert.equal(routingDraftIssue(draft), undefined);
    const config = routingDraftToConfig(draft);
    assert.equal(config.version, 3);
    assert.deepEqual(config.builtins, {});
  });

  it('uses factory default when routing is omitted, and rejects null or non-V3 configs', () => {
    const def = routingFormConfig({});
    assert.equal(def.version, 3);
    assert.equal(def.defaultTarget.mode, 'inherit');
    assert.throws(() => routingFormConfig({ routing: null }), TypeError);
    assert.throws(() => routingFormConfig({ routing: { version: 2 } as never }), TypeError);
  });

  it('emits only one routing set mutation', () => {
    const source = createDefaultRoutingConfig();
    const writes = routingConfigMutations(source);
    assert.deepEqual(writes.map(write => ({ op: write.op, path: write.path })), [{ op: 'set', path: ['routing'] }]);
    assert.notEqual(writes[0]!.value, source);
  });

  it('validates history limits and active explicit catalog entries only', () => {
    const draft = routingConfigToDraft(createDefaultRoutingConfig());
    for (const value of ['', ' ', '0', '1001', '1.5', 'nan']) {
      draft.historyLimit = value;
      assert.equal(routingDraftIssue(draft)?.reason, 'history');
    }
    draft.historyLimit = '100';
    draft.builtins.quick.binding = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini', reasoningEffort: 'low' };
    assert.equal(routingDraftIssue(draft, undefined, false)?.reason, 'catalogRequired');
    assert.equal(routingDraftIssue(draft, available), undefined);

    // Stale effort on enabled category fails; disabling the category allows saving with dormant binding.
    draft.builtins.quick.binding = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini', reasoningEffort: 'high' };
    assert.equal(routingDraftIssue(draft, available)?.field, 'effort');
    draft.builtins.quick.enabled = false;
    assert.equal(routingDraftIssue(draft, available), undefined);
    assert.equal(routingDraftIssue(draft, undefined, false), undefined);
  });

  it('allows disabling all categories even if defaultTarget points to an unavailable catalog model', () => {
    const draft = routingConfigToDraft(createDefaultRoutingConfig());
    draft.defaultTarget = { mode: 'explicit', provider: 'openai', model: 'removed-model' };
    assert.equal(routingDraftIssue(draft, available)?.field, 'model');
    for (const id of BUILTIN_IDS) draft.builtins[id].enabled = false;
    assert.equal(routingDraftIssue(draft, available), undefined);
    assert.equal(routingDraftIssue(draft, undefined, false), undefined);
  });

  it('rejects failed provider groups for active bindings', () => {
    const draft = routingConfigToDraft(createDefaultRoutingConfig());
    draft.defaultTarget = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' };
    const failed = { ...available, failures: [{ id: 'openai', name: 'OpenAI', message: 'timeout' }] };
    assert.equal(routingDraftIssue(draft, failed)?.field, 'provider');
  });
});

describe('Active-only model grants synchronization', () => {
  const mini = { provider: 'openai', model: 'gpt-5-mini' };
  const codex = { provider: 'openai', model: 'gpt-5-codex' };

  it('computes required routes strictly from active effective targets', () => {
    const config = createDefaultRoutingConfig();
    config.defaultTarget = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' };
    assert.deepEqual(requiredModelRoutes(config), [mini]);

    // Override all 12 built-ins to codex => defaultTarget (mini) is no longer needed!
    for (const id of BUILTIN_IDS) {
      config.builtins[id] = { binding: { mode: 'explicit', provider: 'openai', model: 'gpt-5-codex' } };
    }
    assert.deepEqual(requiredModelRoutes(config), [codex]);

    // Disable all 12 built-ins => zero grants required!
    for (const id of BUILTIN_IDS) config.builtins[id] = { enabled: false, binding: { mode: 'explicit', provider: 'openai', model: 'gpt-5-codex' } };
    assert.deepEqual(requiredModelRoutes(config), []);
  });

  it('rejects malformed allowedModels rows in planModelGrant', () => {
    assert.equal(isAllowedModelArray([]), true);
    assert.equal(isAllowedModelArray([mini]), true);
    for (const allowedModels of [null, {}, [null], [{ provider: 'openai' }], [{ provider: '', model: 'gpt-5-mini' }], [{ provider: 'openai', model: 0 }], new Array(1)]) {
      assert.equal(isAllowedModelArray(allowedModels), false);
      assert.deepEqual(planModelGrant([mini], {
        status: 'ready', writable: true, revision: 1,
        value: { enabled: true, allowedModels: allowedModels as never },
      }), { kind: 'unavailable', reason: 'invalid' });
    }
  });

  it('repairs missing grants without rewriting unchanged config and preserves existing grants', async () => {
    const config = createDefaultRoutingConfig();
    config.defaultTarget = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' };
    const form = new FakeForm({ routing: config });
    const editor = new RoutingEditor(form, form.grants);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.deepEqual(form.grants.state.value, { enabled: true, allowedModels: [{ provider: 'other', model: 'keep' }, mini] });
    assert.equal(form.writes.length, 0);
    editHistory(editor);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.equal(form.grants.writes, 1);
    editor.dispose();
  });

  it('blocks save when grant service is unavailable or read-only, unless all active routes inherit or are disabled', async () => {
    for (const unavailable of [true, false]) {
      const config = createDefaultRoutingConfig();
      config.builtins.deep = { binding: { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' } };
      const form = new FakeForm({ routing: config });
      if (unavailable) form.grants.state.status = 'unavailable'; else form.grants.state.writable = false;
      const editor = new RoutingEditor(form, form.grants);
      editHistory(editor);
      assert.equal(await editor.save({ catalog: available }), false);
      assert.equal(editor.getSnapshot().error?.kind, unavailable ? 'grantUnavailable' : 'grantReadOnly');
      assert.equal(form.writes.length, 0);

      // Disabling deep removes the grant requirement and allows saving!
      editor.setBuiltinEnabled('deep', false);
      assert.equal(await editor.save({ catalog: available }), true);
      assert.equal(form.grants.writes, 0);
      editor.dispose();
    }
  });

  it('does not grant on refused writes and retries only authorization after grant conflict', async () => {
    const config = createDefaultRoutingConfig();
    config.defaultTarget = { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' };
    const form = new FakeForm({ routing: config });
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
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(await editor.save({ catalog: available }), true);
    assert.equal(form.writes.length, 2);
    assert.deepEqual(form.grants.state.value!.allowedModels, [{ provider: 'other', model: 'keep' }, concurrent, mini]);
    editor.dispose();
  });
});

describe('RoutingEditor V3 behaviors, presets, custom categories & recommendations', () => {
  it('switches classic7 / all12 presets without clearing bindings or custom categories', async () => {
    const config = createDefaultRoutingConfig();
    config.builtins['backend-data'] = { binding: { mode: 'explicit', provider: 'openai', model: 'gpt-5-codex' } };
    config.custom.push({
      id: 'custom-evidence-check', name: '证据核验', purpose: 'Verify API facts with citations',
      enabled: true, proactive: false, binding: { mode: 'default' },
    });
    const form = new FakeForm({ routing: config });
    const editor = new RoutingEditor(form, form.grants);

    editor.applyBuiltinPreset('classic7');
    const draft = editor.getSnapshot().draft!;
    for (const id of BUILTIN_IDS) {
      assert.equal(draft.builtins[id].enabled, CLASSIC7_IDS.includes(id));
    }
    assert.deepEqual(draft.builtins['backend-data'].binding, { mode: 'explicit', provider: 'openai', model: 'gpt-5-codex' });
    assert.equal(draft.custom.length, 1);
    assert.equal(draft.custom[0]!.enabled, true);
    assert.equal(form.writes.length, 0); // Not auto-saved

    editor.applyBuiltinPreset('all12');
    assert.equal(editor.getSnapshot().dirty, false); // Back to saved state
    editor.dispose();
  });

  it('supports custom category CRUD, template seeding, Chinese slug fallback, ID lock after save, and max 8 limit', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);

    // Seed from template
    const tpl = CUSTOM_CATEGORY_TEMPLATES[0]!;
    const tplId = editor.addCustomCategory({ id: tpl.suggestedId, name: tpl.zh.name, purpose: tpl.zh.purpose, avoid: tpl.zh.avoid });
    assert.equal(tplId, 'custom-evidence-check');
    let entry = editor.getSnapshot().draft!.custom[0]!;
    assert.equal(entry.persisted, false);
    assert.equal(entry.enabled, true);
    assert.equal(entry.proactive, false);

    // Unpersisted ID can be edited
    editor.updateCustomCategory(tplId!, { id: 'custom-api-check', proactive: true });
    assert.equal(editor.getSnapshot().draft!.custom[0]!.id, 'custom-api-check');

    // Pure Chinese blank name generates valid ASCII slug
    const zhId = editor.addCustomCategory({ name: '安全审计', purpose: '检查权限边界并给出证据' });
    assert.ok(zhId && /^custom-[a-z][a-z0-9-]*$/.test(zhId));

    // Save persists and locks IDs
    assert.equal(await editor.save(), true);
    entry = editor.getSnapshot().draft!.custom[0]!;
    assert.equal(entry.persisted, true);
    editor.updateCustomCategory('custom-api-check', { id: 'custom-renamed', name: '接口核验' });
    assert.equal(editor.getSnapshot().draft!.custom[0]!.id, 'custom-api-check'); // ID locked!
    assert.equal(editor.getSnapshot().draft!.custom[0]!.name, '接口核验'); // Display name updated!

    // Fill up to MAX_CUSTOM_CATEGORIES (8), then verify 9th is refused
    for (let i = editor.getSnapshot().draft!.custom.length; i < MAX_CUSTOM_CATEGORIES; i++) {
      const added = editor.addCustomCategory({ name: `Extra ${i}`, purpose: `Purpose ${i}` });
      assert.ok(added);
    }
    assert.equal(editor.getSnapshot().draft!.custom.length, MAX_CUSTOM_CATEGORIES);
    assert.equal(editor.addCustomCategory({ name: 'Overflow', purpose: 'Too many' }), undefined);

    // Remove works cleanly
    editor.removeCustomCategory('custom-api-check');
    assert.equal(editor.getSnapshot().draft!.custom.length, MAX_CUSTOM_CATEGORIES - 1);
    editor.dispose();
  });

  it('validates custom category IDs, duplicates, and control characters cleanly', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    const id1 = editor.addCustomCategory({ name: 'One', purpose: 'Do one' })!;
    editor.updateCustomCategory(id1, { id: 'bad-prefix' });
    assert.equal(await editor.save(), false);
    assert.deepEqual(editor.getSnapshot().issue, { section: 'bad-prefix', field: 'id', reason: 'customId' });

    editor.updateCustomCategory('bad-prefix', { id: 'custom-dup' });
    const id2 = editor.addCustomCategory({ name: 'Two', purpose: 'Do two' })!;
    editor.updateCustomCategory(id2, { id: 'custom-dup' });
    assert.equal(await editor.save(), false);
    assert.equal(editor.getSnapshot().issue?.reason, 'customDuplicate');

    editor.removeCustomCategory(id2);
    editor.updateCustomCategory('custom-dup', { purpose: 'line1\nline2' });
    assert.equal(await editor.save(), false);
    assert.deepEqual(editor.getSnapshot().issue, { section: 'custom-dup', field: 'purpose', reason: 'text' });
    editor.dispose();
  });

  it('applies scoped recommendations, skips disabled built-ins, preserves custom categories, and rejects stale previews', async () => {
    const config = createDefaultRoutingConfig();
    config.builtins['backend-data'] = { enabled: false };
    config.custom.push({
      id: 'custom-evidence-check', name: 'Evidence', purpose: 'Verify APIs',
      enabled: true, proactive: false, binding: { mode: 'default' },
    });
    const form = new FakeForm({ routing: config });
    const editor = new RoutingEditor(form, form.grants);

    const preview = previewRecommendations(routingDraftToConfig(editor.getSnapshot().draft!), available, { group: 'implementation' });
    assert.ok(preview.skippedDisabled.includes('backend-data'));
    assert.ok(preview.changes.every(change => change.category !== 'backend-data'));
    assert.equal(editor.applyRecommendations(preview, 1), true);
    assert.equal(editor.getSnapshot().draft!.custom[0]!.persisted, true);
    assert.equal(editor.getSnapshot().draft!.custom[0]!.binding.mode, 'default');

    // Stale preview after local edit is refused
    const preview2 = previewRecommendations(routingDraftToConfig(editor.getSnapshot().draft!), available);
    editHistory(editor, '55');
    assert.equal(editor.applyRecommendations(preview2, 1), false);
    assert.equal(editor.getSnapshot().error?.kind, 'previewChanged');
    editor.dispose();
  });

  it('edits behavior atomically in routing and allows behavior-only save without catalog loaded', async () => {
    const config = createDefaultRoutingConfig();
    config.builtins.writing = { binding: { mode: 'explicit', provider: 'openai', model: 'gpt-5-mini' } };
    const form = new FakeForm({ routing: config });
    form.grants.state.value = { enabled: true, allowedModels: [{ provider: 'openai', model: 'gpt-5-mini' }] };
    const editor = new RoutingEditor(form, form.grants);

    editor.editBehavior({ delegationMode: 'orchestrator', strict: true, guidance: false });
    assert.equal(editor.getSnapshot().dirty, true);
    assert.equal(await editor.save({ catalogReady: false }), true);
    assert.equal(form.writes.length, 1);
    assert.deepEqual(form.state.value?.routing?.behavior, { guidance: false, delegationMode: 'orchestrator', strict: true });
    assert.equal(editor.getSnapshot().dirty, false);
    assert.equal(editor.getSnapshot().notice, 'saved');
    editor.dispose();
  });

  it('preserves dirty drafts on Host push, rejected saves, and cleans up on dispose', async () => {
    const form = new FakeForm();
    const editor = new RoutingEditor(form, form.grants);
    editHistory(editor, '77');
    form.push(v3());
    assert.equal(editor.getSnapshot().stale, true);
    assert.equal(await editor.save(), false);
    editor.discard();
    assert.equal(editor.getSnapshot().revision, 2);
    assert.equal(editor.getSnapshot().draft?.historyLimit, '100');

    editHistory(editor, '33');
    form.reject = true;
    assert.equal(await editor.save(), false);
    assert.equal(editor.getSnapshot().error?.kind, 'refused');
    assert.equal(editor.getSnapshot().draft?.historyLimit, '33');

    editor.dispose();
    assert.equal(form.listeners.size, 0);
    assert.equal(await editor.save(), false);
  });
});
