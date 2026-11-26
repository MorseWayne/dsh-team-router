import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, statSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { StateStore } from '../src/core/store.ts';
import type { TeamState } from '../src/core/store.ts';

const base = { provider: 'offline', model: 'strong', reasoningEffort: 'high' };
function fixture(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), 'team-router-store-'));
  t.after(() => {
    assert.equal(dirname(directory), tmpdir());
    assert.ok(directory.startsWith(join(tmpdir(), 'team-router-store-')));
    rmSync(directory, { recursive: true, force: true });
  });
  return { directory, store: new StateStore(directory, 2) };
}
function filled(store: StateStore, id = 'team-a'): TeamState {
  const state = store.load(id);
  state.overrides['member-uuid'] = 'fast';
  state.members['member-uuid'] = {
    baseline: { ...base }, key: 'tasks:["1"]', selected: { provider: 'offline', model: 'fast' },
    decision: { source: 'manual', routeName: 'fast', route: { provider: 'offline', model: 'fast' } },
  };
  state.history = Array.from({ length: 3 }, (_, i) => ({
    at: new Date(i).toISOString(), memberId: 'member-uuid', memberName: 'researcher',
    boundary: `turn:${i}`, source: 'manual' as const, routeName: 'fast', route: { provider: 'offline', model: 'fast' },
  }));
  return state;
}

test('state round-trips baselines, overrides and bounded history without temp artifacts', (t) => {
  const { directory, store } = fixture(t);
  store.save(filled(store));
  const restored = new StateStore(directory, 2).load('team-a');
  assert.equal(restored.overrides['member-uuid'], 'fast');
  assert.deepEqual(restored.members['member-uuid']?.baseline, base);
  assert.equal(restored.history.length, 2);
  assert.equal(readdirSync(directory).filter((name) => name.endsWith('.tmp')).length, 0);
  assert.equal(statSync(store.path('team-a')).mode & 0o777, 0o600);
});

test('history limit updates apply to later cold state reads', (t) => {
  const { store } = fixture(t);
  store.save(filled(store));
  store.setHistoryLimit(1);
  assert.equal(store.load('team-a').history.length, 1);
  assert.throws(() => store.setHistoryLimit(0));
});

test('canonical team ids prevent same-name cross-team overrides and path traversal', (t) => {
  const { directory, store } = fixture(t);
  store.save(filled(store, '../../team-a'));
  assert.equal(dirname(store.path('../../team-a')), directory);
  assert.notEqual(store.path('team-a'), store.path('team-b'));
  assert.deepEqual(Object.keys(store.load('team-b').overrides), []);
});

test('corrupt or mismatched state fails closed and preserves the original evidence', (t) => {
  const { store } = fixture(t);
  store.save(filled(store));
  const file = store.path('team-a');
  writeFileSync(file, '{broken');
  assert.throws(() => store.load('team-a'));
  assert.equal(readFileSync(file, 'utf8'), '{broken');
  writeFileSync(file, JSON.stringify({ ...filled(store, 'team-b'), teamId: 'wrong' }));
  assert.throws(() => store.load('team-a'), /identity\/version/);
});

test('invalid saved routes and decision sources are rejected before use', (t) => {
  const { store } = fixture(t);
  const state = filled(store);
  state.members['member-uuid']!.baseline.model = '';
  store.save(state);
  assert.throws(() => store.load('team-a'), /must not be empty/);
  const corrupt = filled(store, 'team-b');
  (corrupt.members['member-uuid']!.decision as { source: string }).source = 'unknown';
  store.save(corrupt);
  assert.throws(() => store.load('team-b'), /Invalid decision source/);
});

test('contradictory latched state is refused instead of selecting a different model', (t) => {
  const { store } = fixture(t);
  const state = filled(store);
  state.members['member-uuid']!.selected = { provider: 'offline', model: 'strong' };
  store.save(state);
  assert.throws(() => store.load('team-a'), /Inconsistent named route state/);
});
