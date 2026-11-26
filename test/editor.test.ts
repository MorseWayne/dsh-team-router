import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseConfig } from '../src/core/policy.ts';
import { PolicyEditor, draftToPolicy, draftValidationIssue, policyRequiresCatalog, policyToDraft, policyMutations, resetMutations, moveRule, rowKey } from '../src/ui/editor.ts';
import type { EditorDraft, EditorForm, EditorMutation, FormSnapshot, ValidationField, ValidationReason } from '../src/ui/editor.ts';

const policy = () => parseConfig({ routes: { quick: { provider: 'test', model: 'fast' } }, rules: [{ id: 'review', keywords: ['review'], route: 'quick', priority: 1 }], roles: { reviewer: 'quick' }, defaultRoute: 'quick' });
class Form implements EditorForm {
  snapshot: FormSnapshot = { status: 'ready', writable: true, revision: 7, value: policy() };
  listeners = new Set<() => void>();
  calls: Array<{ ops: readonly EditorMutation[]; revision: number | undefined }> = [];
  handler: (ops: readonly EditorMutation[]) => Promise<boolean> = async () => true;
  getSnapshot() { return this.snapshot; }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  emit(snapshot: FormSnapshot) { this.snapshot = snapshot; for (const listener of this.listeners) listener(); }
  async mutate(ops: readonly EditorMutation[], revision?: number) { this.calls.push({ ops, revision }); return this.handler(ops); }
}

test('edit rows round-trip without sharing accepted objects; empty default explicitly masks composition defaults rather than re-inheriting them', () => {
  const original = policy();
  const draft = policyToDraft(original);
  draft.routes[0]!.model = 'other';
  draft.defaultRoute = '   ';
  const next = draftToPolicy(draft);
  assert.equal(original.routes.quick!.model, 'fast');
  assert.equal(next.routes.quick!.model, 'other');
  assert.equal(next.defaultRoute, undefined);
  assert.deepEqual(policyMutations(next).find(op => op.path[0] === 'defaultRoute'), { op: 'set', path: ['defaultRoute'], value: null });
});
test('duplicate normalized route names and exact teammate names are rejected before map construction', () => {
  const draft = policyToDraft(policy());
  draft.routes.push({ ...draft.routes[0]!, key: rowKey(), name: ' quick ' });
  assert.throws(() => draftToPolicy(draft), /duplicate route name/);
  draft.routes.pop();
  draft.roles.push({ ...draft.roles[0]!, key: rowKey() });
  assert.throws(() => draftToPolicy(draft), /duplicate member name/);
});
test('unknown targets, duplicate rule ids, unsafe keys, and invalid numbers cannot save', () => {
  const draft = policyToDraft(policy());
  draft.rules[0]!.route = 'missing';
  assert.throws(() => draftToPolicy(draft), /unknown route/);
  draft.rules[0]!.route = 'quick';
  draft.rules.push({ ...draft.rules[0]!, key: rowKey() });
  assert.throws(() => draftToPolicy(draft), /duplicate rule id/);
  draft.rules.pop();
  draft.routes[0]!.name = '__proto__';
  assert.throws(() => draftToPolicy(draft), /unsafe key/);
  draft.routes[0]!.name = 'quick';
  draft.historyLimit = '1.5';
  assert.throws(() => draftToPolicy(draft), /finite integer/);
});
test('rule reordering changes tie-breaking order without mutating prior draft', () => {
  const draft = policyToDraft(policy());
  draft.rules.push({ ...draft.rules[0]!, key: rowKey(), id: 'second' });
  const moved = moveRule(draft.rules, 1, -1);
  assert.equal(moved[0]!.id, 'second');
  assert.equal(draft.rules[0]!.id, 'review');
});
test('CAS uses the captured draft revision; pushed values do not replace a dirty draft', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  const draft = editor.getSnapshot().draft!;
  editor.edit({ ...draft, historyLimit: '42' });
  form.emit({ ...form.snapshot, revision: 8, value: parseConfig({ routes: {} }) });
  assert.equal(editor.getSnapshot().draft!.historyLimit, '42');
  assert.equal(editor.getSnapshot().revision, 7);
  assert.equal(editor.getSnapshot().stale, true);
  form.handler = async () => false;
  assert.equal(await editor.save(), false);
  assert.equal(form.calls[0]!.revision, 7);
  assert.equal(editor.getSnapshot().draft!.historyLimit, '42');
  assert.equal(editor.getSnapshot().error!.kind, 'refused');
  editor.discard();
  assert.equal(editor.getSnapshot().revision, 8);
  assert.equal(editor.getSnapshot().dirty, false);
  assert.equal(editor.getSnapshot().draft!.routes.length, 0);
  editor.dispose();
  assert.equal(form.listeners.size, 0);
});
test('accepted writes fold Host values; reset changes only the five policy fields', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: '25' });
  form.handler = async () => {
    form.emit({ ...form.snapshot, revision: 8, value: parseConfig({ ...policy(), historyLimit: 25 }) });
    return true;
  };
  assert.equal(await editor.save(), true);
  assert.equal(editor.getSnapshot().draft!.historyLimit, '25');
  assert.equal(editor.getSnapshot().dirty, false);
  assert.equal(editor.getSnapshot().notice, 'saved');
  assert.equal(editor.getSnapshot().revision, 8);
  await editor.reset();
  assert.deepEqual(form.calls[1]!.ops, resetMutations());
  assert.deepEqual(form.calls[1]!.ops.map(op => op.path[0]), ['routes', 'rules', 'roles', 'defaultRoute', 'historyLimit']);
  assert.ok(form.calls.every(call => call.ops.every(op => op.path[0] !== 'stateDir')));
  editor.dispose();
});
test('an event from an old render keeps that render’s revision instead of fencing with unseen Host values', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  const rendered = editor.getSnapshot();
  form.emit({ ...form.snapshot, revision: 8, value: parseConfig({ routes: {} }) });
  editor.edit({ ...rendered.draft!, historyLimit: '55' }, rendered.revision);
  assert.equal(editor.getSnapshot().revision, 7);
  assert.equal(editor.getSnapshot().stale, true);
  form.handler = async () => false;
  await editor.save();
  assert.equal(form.calls[0]!.revision, 7);
  editor.dispose();
});
test('a validation refusal at the same revision preserves the draft and permits a correction', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: '22' });
  form.handler = async () => false;
  await editor.save();
  assert.equal(editor.getSnapshot().stale, false);
  assert.equal(editor.getSnapshot().draft!.historyLimit, '22');
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: '23' });
  form.handler = async () => true;
  assert.equal(await editor.save(), true);
  assert.equal(form.calls[1]!.revision, 7);
  editor.dispose();
});
test('visual validation locates the first invalid control by stable row key and localized reason', () => {
  const check = (change: (draft: EditorDraft) => void, row: 'route' | 'rule' | 'role' | 'defaults', field: ValidationField, reasonKey: ValidationReason) => {
    const draft = policyToDraft(policy());
    const key = row === 'route' ? draft.routes[0]!.key : row === 'rule' ? draft.rules[0]!.key : row === 'role' ? draft.roles[0]!.key : 'defaults';
    change(draft);
    assert.deepEqual(draftValidationIssue(draft), { rowKey: key, field, reasonKey });
  };
  check(draft => { draft.routes[0]!.name = ''; }, 'route', 'routeName', 'validationRequired');
  check(draft => { draft.routes[0]!.provider = ' '; }, 'route', 'provider', 'validationRequired');
  check(draft => { draft.routes[0]!.model = ''; }, 'route', 'model', 'validationRequired');
  check(draft => { draft.routes[0]!.name = '__proto__'; }, 'route', 'routeName', 'validationUnsafeName');
  check(draft => { draft.rules[0]!.id = ''; }, 'rule', 'ruleId', 'validationRequired');
  check(draft => { draft.rules[0]!.priority = '1.5'; }, 'rule', 'priority', 'validationPriority');
  check(draft => { draft.rules[0]!.keywords = 'a'.repeat(101); }, 'rule', 'keywords', 'validationKeywordLength');
  check(draft => { draft.rules[0]!.keywords = Array.from({ length: 33 }, (_, i) => String(i)).join('\n'); }, 'rule', 'keywords', 'validationKeywordLimit');
  check(draft => { draft.rules[0]!.route = 'missing'; }, 'rule', 'target', 'validationUnknownRoute');
  check(draft => { draft.roles[0]!.name = ''; }, 'role', 'memberName', 'validationRequired');
  check(draft => { draft.roles[0]!.route = 'missing'; }, 'role', 'target', 'validationUnknownRoute');
  check(draft => { draft.defaultRoute = 'missing'; }, 'defaults', 'defaultRoute', 'validationUnknownRoute');
  check(draft => { draft.historyLimit = ''; }, 'defaults', 'historyLimit', 'validationHistory');
  const draft = policyToDraft(policy());
  draft.routes.push({ ...draft.routes[0]!, key: rowKey(), name: ' quick ' });
  assert.deepEqual(draftValidationIssue(draft), { rowKey: draft.routes[1]!.key, field: 'routeName', reasonKey: 'validationDuplicateRoute' });
  draft.routes.pop();
  draft.roles.push({ ...draft.roles[0]!, key: rowKey() });
  assert.deepEqual(draftValidationIssue(draft), { rowKey: draft.roles[1]!.key, field: 'memberName', reasonKey: 'validationDuplicateRole' });
  draft.roles.pop();
  draft.rules.push({ ...draft.rules[0]!, key: rowKey(), id: ' review ' });
  assert.deepEqual(draftValidationIssue(draft), { rowKey: draft.rules[1]!.key, field: 'ruleId', reasonKey: 'validationDuplicateRule' });
});
test('wire null remains UI inheritance while empty named-route policies require no catalog', () => {
  const draft = policyToDraft({ ...policy(), defaultRoute: null });
  assert.equal(draft.defaultRoute, '');
  assert.equal(draftValidationIssue(draft), undefined);
  const empty = parseConfig({ routes: {} });
  assert.equal(policyRequiresCatalog(empty), false);
  assert.equal(policyRequiresCatalog(policy()), true);
  assert.equal(draftValidationIssue(policyToDraft(empty)), undefined);
  assert.deepEqual(policyMutations(empty).find(op => op.path[0] === 'defaultRoute'), { op: 'set', path: ['defaultRoute'], value: null });
});
test('reset confirmation cannot clear a later Host revision or a dirty draft', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  const openedAt = editor.getSnapshot().revision;
  form.emit({ ...form.snapshot, revision: 8, value: parseConfig({ routes: {} }) });
  assert.equal(await editor.reset(openedAt), false);
  assert.equal(form.calls.length, 0);
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: '11' });
  assert.equal(await editor.reset(8), false);
  assert.equal(form.calls.length, 0);
  assert.equal(editor.getSnapshot().draft!.historyLimit, '11');
  editor.discard();
  assert.equal(await editor.reset(8), true);
  assert.equal(form.calls[0]!.revision, 8);
  editor.dispose();
});
test('read-only/loading forms and invalid drafts never mutate; transport failure keeps the draft', async () => {
  const form = new Form();
  const editor = new PolicyEditor(form);
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: 'invalid' });
  assert.equal(await editor.save(), false);
  assert.equal(editor.getSnapshot().error!.kind, 'validation');
  assert.equal(form.calls.length, 0);
  editor.edit({ ...editor.getSnapshot().draft!, historyLimit: '22' });
  form.handler = async () => { throw new Error('connection lost'); };
  assert.equal(await editor.save(), false);
  assert.equal(editor.getSnapshot().draft!.historyLimit, '22');
  assert.equal(editor.getSnapshot().error!.kind, 'transport');
  form.emit({ ...form.snapshot, writable: false });
  assert.equal(await editor.save(), false);
  assert.equal(form.calls.length, 1);
  editor.dispose();
});
