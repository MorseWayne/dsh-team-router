import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { Context } from '@deepseek-ai/cordis';
import { authorizationProjection, assertAuthorizedRoute } from '../src/adapter/dsh/authorization.ts';
import { ExecutionStore, policyDigest } from '../src/core/execution-store.ts';
import { previewMigration } from '../src/core/migration.ts';
import { Config, readRoutingState, requireRoutingPolicy, installConfigValidation } from '../src/adapter/dsh/config.ts';
import { createDefaultRoutingPolicy } from '../src/core/routing-policy.ts';
import type { SessionEvent } from '@deepseek-ai/dsh-session';

const legacy = () => ({ routes: { quick: { provider: 'offline', model: 'fast' } }, rules: [{ id: 'old', keywords: ['fix'], route: 'quick' }], roles: { worker: 'quick' }, defaultRoute: 'quick' });
const record = () => ({ category: 'quick' as const, source: 'default' as const, target: { executor: 'native' as const, model: { mode: 'inherit' as const } }, policyDigest: policyDigest(createDefaultRoutingPolicy()) });
function fixture(t: { after(fn: () => void): void }) {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-routing-v2-'));
  t.after(() => { assert.ok(directory.startsWith(join(tmpdir(), 'dsh-routing-v2-'))); rmSync(directory, { recursive: true, force: true }); });
  return { directory, store: new ExecutionStore(directory) };
}

describe('native authorization boundary', () => {
  it('restricts unrecorded policy to exact parent route and respects explicit allowlist', () => {
    assert.doesNotThrow(() => assertAuthorizedRoute(null, { provider: 'p', model: 'a' }, { provider: 'p', model: 'a' }));
    assert.throws(() => assertAuthorizedRoute(null, { provider: 'p', model: 'a' }, { provider: 'p', model: 'b' }), /not authorized/);
    assert.doesNotThrow(() => assertAuthorizedRoute([{ provider: 'p', model: 'b' }], { provider: 'p', model: 'a' }, { provider: 'p', model: 'b' }));
    assert.throws(() => assertAuthorizedRoute([], { provider: 'p', model: 'a' }, { provider: 'p', model: 'a' }), /not authorized/);
  });
  it('folds only the first native policy event, with validated detached data', () => {
    const event = { type: 'subagent/model-selection-policy', data: { allowedModels: [{ provider: 'p', model: 'a' }] } };
    const first = authorizationProjection.apply(null, event as unknown as SessionEvent);
    event.data.allowedModels[0]!.model = 'changed';
    assert.deepEqual(first, [{ provider: 'p', model: 'a' }]);
    assert.equal(authorizationProjection.apply(first, event as unknown as SessionEvent), first);
    assert.equal(authorizationProjection.apply(null, { type: 'irrelevant', data: {} } as unknown as SessionEvent), null);
    assert.throws(() => authorizationProjection.apply(null, { type: event.type, data: { allowedModels: [] } } as unknown as SessionEvent));
    assert.throws(() => authorizationProjection.apply(null, { type: event.type, data: { allowedModels: [{ provider: 'p', model: 'a' }, { provider: 'p', model: 'a' }] } } as unknown as SessionEvent), /duplicate/);
  });
});

describe('migration and configuration', () => {
  it('maps only the exact default and never guesses named categories', () => {
    const preview = previewMigration(legacy());
    assert.equal(preview.required, true);
    assert.deepEqual(preview.policy.defaultTarget, { executor: 'native', model: { mode: 'explicit', provider: 'offline', id: 'fast' } });
    assert.deepEqual(Object.keys(preview.policy.categories), []);
    assert.deepEqual(preview.retired, { routes: ['quick'], ruleCount: 1, roleCount: 1 });
    assert.equal(previewMigration({ routes: {} }).required, false);
  });
  it('requires migration for nonempty old configuration and ignores it entirely once V2 exists', () => {
    const old = Config(legacy());
    assert.equal(readRoutingState(old).migrationRequired, true);
    assert.throws(() => requireRoutingPolicy(old), /migration-required/);
    const next = Config({ ...legacy(), policyV2: createDefaultRoutingPolicy() });
    assert.deepEqual(requireRoutingPolicy(next), createDefaultRoutingPolicy());
    assert.equal(readRoutingState(Config({})).migrationRequired, false);
    assert.throws(() => readRoutingState(Config({ policyV2: null })));
  });
  it('validates complete V2 candidate and backs up before accepting a migration', async t => {
    const ctx = new Context(); t.after(() => ctx.fiber.dispose());
    let backups = 0;
    const probe = { name: 'routing-v2-probe', Config, apply(child: Context) { installConfigValidation(child, value => { assert.equal(value.defaultRoute, 'quick'); backups++; }); } };
    const fiber = await ctx.plugin(probe, legacy());
    t.after(() => fiber.dispose());
    assert.throws(() => fiber.resolveConfig({ ...legacy(), policyV2: { version: 2, categories: { 'deep-high': { mode: 'default' } } } }));
    assert.equal(backups, 0);
    const next = fiber.resolveConfig({ ...legacy(), policyV2: createDefaultRoutingPolicy() }) as Config;
    assert.equal(readRoutingState(next).migrationRequired, false);
    assert.equal(backups, 1);
    assert.equal(readRoutingState(fiber.effectiveConfig as Config).migrationRequired, true, 'candidate validation is not a commit');
  });
  it('a backup failure rejects the entire transition', async t => {
    const ctx = new Context(); t.after(() => ctx.fiber.dispose());
    const fiber = await ctx.plugin({ name: 'routing-v2-failed-backup', Config, apply(child: Context) { installConfigValidation(child, () => { throw new Error('backup failed'); }); } }, legacy());
    t.after(() => fiber.dispose());
    assert.throws(() => fiber.resolveConfig({ ...legacy(), policyV2: createDefaultRoutingPolicy() }), /backup failed/);
    assert.equal(readRoutingState(fiber.effectiveConfig as Config).migrationRequired, true);
  });
});

describe('V2 execution audit', () => {
  it('uses distinct versioned files, rejects corruption and preserves legacy data', t => {
    const { directory, store } = fixture(t);
    const oldPath = join(directory, 'legacy.json'); writeFileSync(oldPath, 'untouched');
    const run = store.begin('team', record(), 100);
    store.update('team', run.id, { state: 'running', childId: 'child', name: 'worker' }, 100);
    assert.equal(store.list('team')[0]!.state, 'running');
    assert.equal(new ExecutionStore(directory).list('team')[0]!.state, 'unknown');
    assert.equal(readFileSync(oldPath, 'utf8'), 'untouched');
    const path = join(directory, 'v2', readdirSync(join(directory, 'v2'))[0]!);
    assert.equal(statSync(path).mode & 0o777, 0o600);
    writeFileSync(path, '{broken');
    assert.throws(() => new ExecutionStore(directory).list('team'));
    assert.equal(readFileSync(path, 'utf8'), '{broken');
  });
  it('late old-instance completion cannot overwrite new-instance runs', t => {
    const { directory, store: first } = fixture(t);
    const old = first.begin('team', record(), 100);
    first.update('team', old.id, { state: 'running' }, 100);
    const second = new ExecutionStore(directory);
    const next = second.begin('team', record(), 100);
    first.update('team', old.id, { state: 'completed' }, 100);
    second.update('team', next.id, { state: 'running' }, 100);
    const rows = second.list('team');
    assert.equal(rows.length, 2);
    assert.equal(rows.find(row => row.id === old.id)!.state, 'completed');
    assert.equal(rows.find(row => row.id === next.id)!.state, 'running');
  });
  it('bounds finished history without trimming active executions', t => {
    const { store } = fixture(t);
    const active = store.begin('team', record(), 1);
    const first = store.begin('team', record(), 1); store.update('team', first.id, { state: 'completed' }, 1);
    const last = store.begin('team', record(), 1); store.update('team', last.id, { state: 'failed' }, 1);
    assert.deepEqual(store.list('team').map(row => row.id), [active.id, last.id]);
    assert.deepEqual(store.list('another-team'), []);
  });
  it('bounds cold-restart orphan history and releases completed ownership', t => {
    const { directory, store } = fixture(t);
    const orphan = store.begin('team', record(), 1);
    const path = join(directory, 'v2', readdirSync(join(directory, 'v2'))[0]!);
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    saved.records[0].ownerProcess = 'previous-host-process';
    writeFileSync(path, JSON.stringify(saved));
    const restarted = new ExecutionStore(directory);
    assert.equal(restarted.list('team')[0]!.state, 'unknown');
    for (let i = 0; i < 3; i++) {
      const next = restarted.begin('team', record(), 1);
      restarted.update('team', next.id, { state: 'completed' }, 1);
    }
    assert.equal(restarted.list('team').length, 1);
    assert.notEqual(restarted.list('team')[0]!.id, orphan.id);
    assert.equal((Reflect.get(restarted, 'owned') as Set<string>).size, 0);
  });
  it('backs up legacy configuration once and rejects a mismatching preexisting backup', t => {
    const { store } = fixture(t);
    const parsed = previewMigration(legacy()).legacy;
    const path = store.backupLegacy(parsed);
    assert.equal(store.backupLegacy(parsed), path);
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), JSON.parse(JSON.stringify({ version: 1, legacy: parsed })));
    writeFileSync(path, '{}');
    assert.throws(() => store.backupLegacy(parsed), /does not match/);
  });
});
