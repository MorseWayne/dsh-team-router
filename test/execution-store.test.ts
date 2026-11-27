import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { ExecutionStore, policyDigest } from '../src/core/execution-store.ts';
import { resolveActiveRegistry } from '../src/core/active-registry.ts';
import { createDefaultRoutingConfig } from '../src/core/routing-policy.ts';

const record = () => ({
  categoryId: 'custom-historical', categoryNameAtStart: 'Original label', categoryOrigin: 'custom' as const,
  source: 'category' as const, target: { mode: 'inherit' as const }, policyDigest: resolveActiveRegistry(createDefaultRoutingConfig()).configDigest,
});
function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), 'dsh-routing-execution-'));
  t.after(() => {
    assert.ok(root.startsWith(join(tmpdir(), 'dsh-routing-execution-')));
    rmSync(root, { recursive: true, force: true });
  });
  const directory = join(root, 'executions');
  return { root, directory, store: new ExecutionStore(root), path: (teamId: string) => join(directory, `${policyDigest(teamId)}.json`) };
}

test('uses independent audited files with atomic writes, private permissions and historical category names', t => {
  const { root, directory, store, path } = fixture(t);
  const old = join(root, 'older.json'); writeFileSync(old, 'untouched');
  const team = 'team/a'; const run = store.begin(team, record(), 100);
  store.update(team, run.id, { state: 'running', childId: 'child', name: 'worker' }, 100);
  assert.equal(store.list(team)[0]!.state, 'running');
  assert.equal(new ExecutionStore(root).list(team)[0]!.state, 'unknown');
  assert.equal(readFileSync(old, 'utf8'), 'untouched');
  assert.equal(statSync(path(team)).mode & 0o777, 0o600);
  assert.equal(statSync(directory).mode & 0o777, 0o700);
  assert.deepEqual(readdirSync(directory), [`${policyDigest(team)}.json`]);
  const saved = JSON.parse(readFileSync(path(team), 'utf8'));
  assert.deepEqual(Object.keys(saved), ['format', 'teamId', 'records']);
  assert.deepEqual([saved.format, saved.teamId], [1, team]);
  assert.equal(resolveActiveRegistry(createDefaultRoutingConfig()).byId.has(run.categoryId), false);
  assert.equal(new ExecutionStore(root).list(team)[0]!.categoryNameAtStart, 'Original label');
  assert.deepEqual(store.list('another-team'), []);
});

test('rejects wrong team, invalid targets, corruption and oversized files instead of resetting', t => {
  const { store, path } = fixture(t);
  assert.throws(() => store.list(' '), /team ID/);
  store.begin('team', record(), 100);
  const file = path('team');
  const saved = JSON.parse(readFileSync(file, 'utf8'));
  writeFileSync(file, JSON.stringify({ ...saved, teamId: 'other' }));
  assert.throws(() => store.list('team'), /team identity mismatch/);
  writeFileSync(file, JSON.stringify({ ...saved, records: [{ ...saved.records[0], target: { mode: 'default' } }] }));
  assert.throws(() => store.list('team'), /target.mode/);
  writeFileSync(file, '{broken'); assert.throws(() => store.list('team')); assert.equal(readFileSync(file, 'utf8'), '{broken');
  writeFileSync(file, Buffer.alloc(4 * 1024 * 1024 + 1));
  assert.throws(() => store.list('team'), /exceeds 4 MiB/);
});

test('merges late completion across store instances without overwriting active runs', t => {
  const { root, store: first } = fixture(t);
  const old = first.begin('team', record(), 100);
  first.update('team', old.id, { state: 'running' }, 100);
  const second = new ExecutionStore(root);
  const next = second.begin('team', record(), 100);
  assert.equal(second.list('team').find(row => row.id === old.id)!.state, 'unknown');
  first.update('team', old.id, { state: 'completed' }, 100);
  second.update('team', next.id, { state: 'running' }, 100);
  assert.deepEqual(second.list('team').map(row => [row.id, row.state]), [[old.id, 'completed'], [next.id, 'running']]);
});

test('trims oldest terminal and previous-process orphan history, not current active executions', t => {
  const { root, store, path } = fixture(t);
  const orphan = store.begin('team', record(), 1);
  const saved = JSON.parse(readFileSync(path('team'), 'utf8'));
  saved.records[0].ownerProcess = 'previous-process';
  writeFileSync(path('team'), JSON.stringify(saved));
  const restarted = new ExecutionStore(root);
  assert.equal(restarted.list('team')[0]!.state, 'unknown');
  const active = restarted.begin('team', record(), 1);
  const first = restarted.begin('team', record(), 1); restarted.update('team', first.id, { state: 'completed' }, 1);
  const last = restarted.begin('team', record(), 1); restarted.update('team', last.id, { state: 'failed' }, 1);
  assert.deepEqual(restarted.list('team').map(row => row.id), [active.id, last.id]);
  assert.notEqual(active.id, orphan.id);
  assert.throws(() => restarted.begin('team', record(), 0), /history limit/);
});
