import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import type { Context } from '@deepseek-ai/cordis';
import { boot, readProfilePatches } from '@deepseek-ai/dsh-app-boot';
import type { ProfileContext } from '@deepseek-ai/dsh-app-boot';
import { ConfigEditor } from '@deepseek-ai/dsh-config-editor';
import { SettingsConflictError, SettingsForms } from '@deepseek-ai/dsh-settings';
import { Config, installConfigValidation, readPolicy, readRoutingState } from '../src/adapter/dsh/config.ts';
import { createDefaultRoutingPolicy } from '../src/core/routing-policy.ts';
import { ExecutionStore } from '../src/core/execution-store.ts';

const namespace = 'team-router-policy-test';
const model = (id: string) => ({ provider: 'offline', model: id });

/** A real Loader entry sharing the router's production schema and validation hook. */
const probe = {
  name: 'team-router-policy-test',
  Config,
  apply(ctx: Context, config: Config) {
    readRoutingState(config);
    const store = new ExecutionStore(config.stateDir!);
    installConfigValidation(ctx, legacy => { store.backupLegacy(legacy); });
  },
};

/** All persistence goes through native ConfigEditor into a disposable profile. */
async function settingsFixture(t: TestContext, inheritFromBase = false) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-team-router-settings-'));
  const dir = join(root, 'profile');
  const home = join(root, 'home');
  const basePath = join(root, 'cordis.yml');
  const patchPath = join(dir, 'cordis.patch.yml');
  const stateDir = join(root, 'router-state');
  const staticValue = { untouched: 'preserve unknown static configuration' };
  const profile: ProfileContext = {
    name: 'team-router-settings-test', dir, home, patchPath,
    installAnchor: fileURLToPath(new URL('../package.json', import.meta.url)),
    cwd: root, startedBundles: [], overlays: [], telemetryDisabledEnv: '1',
  };
  let current: Context | undefined;
  const stop = async () => {
    await current?.fiber.dispose();
    current = undefined;
  };
  t.after(async () => {
    await stop();
    assert.ok(root.startsWith(join(tmpdir(), 'dsh-team-router-settings-')));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(dir);
  await mkdir(home);
  await writeFile(join(dir, 'package.json'), JSON.stringify({
    name: 'team-router-settings-test-profile', private: true, type: 'module',
    dsh: { profile: { bundles: inheritFromBase ? ['settings-test-base'] : [] } },
  }));
  const initial = [{
    insert: [{
      id: namespace, name: 'cordis:router-policy-test',
      config: {
        routes: { fast: model('fast') },
        rules: [{ id: 'inventory', keywords: ['list'], route: 'fast' }],
        roles: { worker: 'fast' }, defaultRoute: 'fast', historyLimit: 100,
        stateDir, unknownStatic: staticValue,
      },
    }],
  }];
  // Native ConfigEditor composes profile bundle layers, not the boot YAML's
  // plain entries. A lower-layer default must therefore come from a real bundle.
  if (inheritFromBase) {
    const bundleDir = join(dir, 'node_modules', 'settings-test-base');
    await mkdir(bundleDir, { recursive: true });
    await writeFile(join(bundleDir, 'package.json'), JSON.stringify({
      name: 'settings-test-base', version: '1.0.0', private: true,
      dsh: { bundle: { patch: './cordis.patch.yml' } },
    }));
    await writeFile(join(bundleDir, 'cordis.patch.yml'), JSON.stringify(initial, null, 2) + '\n');
  }
  await writeFile(basePath, '[]\n');
  await writeFile(patchPath, '# Preserve this profile comment.\n' + JSON.stringify(inheritFromBase ? [] : initial, null, 2) + '\n');

  const start = async () => {
    assert.equal(current, undefined);
    current = await boot('team-router-settings-test', basePath, readProfilePatches('test', profile), async (ctx) => {
      ctx.provide('profileContext', profile);
      ctx.loader.builtins['router-policy-test'] = probe;
      await ctx.plugin(ConfigEditor);
      await ctx.plugin(SettingsForms);
    });
    const descriptor = current.settings.describe().find((row) => row.ns === namespace);
    assert.ok(descriptor, 'Native Settings must discover the active Loader entry');
    return current;
  };
  const ctx = () => { assert.ok(current); return current; };
  const entry = () => {
    const result = ctx().configEditor.entries().find((row) => row.options.id === namespace);
    assert.ok(result?.fiber);
    return result;
  };
  const descriptor = () => {
    const result = ctx().settings.describe().find((row) => row.ns === namespace);
    assert.ok(result);
    return result;
  };
  await start();
  return { ctx, entry, descriptor, start, stop, patchPath, stateDir, staticValue };
}

describe('native settings profile persistence and CAS', { concurrency: false, timeout: 30_000 }, () => {
  it('atomically saves V2 over inherited legacy config with backup, live references, CAS and restart persistence', async t => {
    const h = await settingsFixture(t, true);
    const fiber = h.entry().fiber!;
    const config = fiber.effectiveConfig as Config;
    const ref = config.policyV2;
    const revision = h.descriptor().revision;
    const legacy = readPolicy(config);
    assert.equal(readRoutingState(config).migrationRequired, true);
    const policy = createDefaultRoutingPolicy();
    policy.categories.quick = { mode: 'target', target: { executor: 'native', model: { mode: 'explicit', provider: 'offline', id: 'review' } } };
    await h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['policyV2'], value: policy }], revision);
    assert.equal(h.entry().fiber, fiber);
    assert.equal(config.policyV2, ref);
    assert.equal(readRoutingState(config).migrationRequired, false);
    assert.deepEqual(readRoutingState(config).policy, policy);
    assert.deepEqual(readPolicy(config), legacy, 'Legacy composition data is retained only for rollback, not run by V2');
    const backups = await readdir(join(h.stateDir, 'migrations'));
    assert.equal(backups.length, 1);
    assert.deepEqual(JSON.parse(await readFile(join(h.stateDir, 'migrations', backups[0]!), 'utf8')).legacy, JSON.parse(JSON.stringify(legacy)));
    const bytes = await readFile(h.patchPath);
    await assert.rejects(h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['policyV2'], value: createDefaultRoutingPolicy() }], revision), SettingsConflictError);
    await assert.rejects(h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['policyV2'], value: { version: 2, categories: { 'deep-high': { mode: 'default' } } } }], h.descriptor().revision));
    assert.deepEqual(await readFile(h.patchPath), bytes);
    assert.equal(config.stateDir, h.stateDir);
    assert.deepEqual(config.unknownStatic, h.staticValue);
    await h.stop(); await h.start();
    assert.deepEqual(readRoutingState(h.entry().fiber!.effectiveConfig as Config).policy, policy);
    assert.equal((await readdir(join(h.stateDir, 'migrations'))).length, 1);
  });
  it('distinguishes explicit no-default from restoring the composition default', async (t) => {
    const h = await settingsFixture(t, true);
    const config = () => h.entry().fiber!.effectiveConfig as Config;
    assert.equal(readPolicy(config()).defaultRoute, 'fast');
    await h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['defaultRoute'], value: null }], h.descriptor().revision);
    assert.equal(readPolicy(config()).defaultRoute, undefined, 'Empty default must really inherit the teammate model');
    assert.match(await readFile(h.patchPath, 'utf8'), /defaultRoute: null|"defaultRoute": null/);
    await h.stop();
    await h.start();
    assert.equal(readPolicy(config()).defaultRoute, undefined);
    await h.ctx().settings.mutate(namespace, [{ op: 'unset', path: ['defaultRoute'] }], h.descriptor().revision);
    assert.equal(readPolicy(config()).defaultRoute, 'fast', 'Only the explicit restore action re-inherits the composition');
  });
  it('atomically commits related fields into the same live fiber and restores the persisted policy on reboot', async (t) => {
    const h = await settingsFixture(t);
    const entry = h.entry();
    const fiber = entry.fiber!;
    const uid = fiber.uid;
    const live = fiber.effectiveConfig as Config;
    const routesRef = live.routes;
    const rulesRef = live.rules;
    const before = h.descriptor();
    assert.equal(Object.hasOwn(before.value as object, 'stateDir'), false);
    assert.equal(Object.hasOwn(before.value as object, 'unknownStatic'), false);

    await h.ctx().settings.mutate(namespace, [
      { op: 'set', path: ['routes'], value: { review: model('review') } },
      { op: 'set', path: ['rules'], value: [{ id: 'review', keywords: ['audit'], route: 'review' }] },
      { op: 'set', path: ['roles'], value: { reviewer: 'review' } },
      { op: 'set', path: ['defaultRoute'], value: 'review' },
      { op: 'set', path: ['historyLimit'], value: 7 },
    ], before.revision);

    assert.equal(h.entry(), entry);
    assert.equal(h.entry().fiber!.uid, uid, 'Volatile-only persistence must not remount the plugin');
    assert.equal((h.entry().fiber!.effectiveConfig as Config).routes, routesRef);
    assert.equal((h.entry().fiber!.effectiveConfig as Config).rules, rulesRef);
    const expected = readPolicy(live);
    assert.deepEqual(Object.keys(expected.routes), ['review']);
    assert.equal(expected.defaultRoute, 'review');
    assert.equal(expected.historyLimit, 7);
    assert.equal(expected.rules[0]!.route, 'review');
    assert.equal(expected.roles.reviewer, 'review');
    assert.ok(h.descriptor().revision > before.revision);
    assert.equal(live.stateDir, h.stateDir);
    assert.deepEqual(live.unknownStatic, h.staticValue);
    assert.equal(h.entry().options.config.stateDir, h.stateDir);
    assert.deepEqual(h.entry().options.config.unknownStatic, h.staticValue);
    assert.match(await readFile(h.patchPath, 'utf8'), /Preserve this profile comment/);

    await h.stop();
    await h.start();
    assert.deepEqual(readPolicy(h.entry().fiber!.effectiveConfig as Config), expected);
    assert.equal((h.entry().fiber!.effectiveConfig as Config).stateDir, h.stateDir);
    assert.deepEqual((h.entry().fiber!.effectiveConfig as Config).unknownStatic, h.staticValue);
  });

  it('refuses stale and cross-reference-invalid writes without changing disk bytes or running references', async (t) => {
    const h = await settingsFixture(t);
    const oldRevision = h.descriptor().revision;
    await h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['historyLimit'], value: 8 }], oldRevision);
    const descriptor = h.descriptor();
    const fiber = h.entry().fiber!;
    const live = fiber.effectiveConfig as Config;
    const routesRef = live.routes;
    const beforePolicy = readPolicy(live);
    const beforeBytes = await readFile(h.patchPath);

    await assert.rejects(
      h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['historyLimit'], value: 9 }], oldRevision),
      (error: unknown) => error instanceof SettingsConflictError
        && error.code === 'SETTINGS_CONFLICT' && error.expected === oldRevision && error.actual === descriptor.revision,
    );
    assert.deepEqual(await readFile(h.patchPath), beforeBytes);
    assert.equal(h.descriptor().revision, descriptor.revision);

    await assert.rejects(
      h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['routes'], value: {} }], descriptor.revision),
      /unknown route/,
    );
    assert.deepEqual(await readFile(h.patchPath), beforeBytes, 'Invalid cross-field references must fail before persistence');
    assert.equal(h.entry().fiber, fiber);
    assert.equal((fiber.effectiveConfig as Config).routes, routesRef);
    assert.deepEqual(readPolicy(live), beforePolicy);
    assert.equal(h.descriptor().revision, descriptor.revision);
  });

  it('preserves ordinary and unknown static fields on complete form replacement and rejects attempts to mutate stateDir', async (t) => {
    const h = await settingsFixture(t);
    const fiber = h.entry().fiber!;
    const before = h.descriptor();
    await h.ctx().settings.replace(namespace, {
      routes: { final: model('final') }, rules: [], roles: {}, defaultRoute: 'final', historyLimit: 9,
    }, before.revision);
    const live = h.entry().fiber!.effectiveConfig as Config;
    assert.equal(h.entry().fiber, fiber);
    assert.equal(readPolicy(live).defaultRoute, 'final');
    assert.equal(live.stateDir, h.stateDir);
    assert.deepEqual(live.unknownStatic, h.staticValue);
    assert.equal(h.entry().options.config.stateDir, h.stateDir);
    assert.deepEqual(h.entry().options.config.unknownStatic, h.staticValue);
    const beforeBytes = await readFile(h.patchPath);
    await assert.rejects(
      h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['stateDir'], value: '/not-allowed' }], h.descriptor().revision),
      /not volatile/,
    );
    assert.deepEqual(await readFile(h.patchPath), beforeBytes);
    assert.equal((h.entry().fiber!.effectiveConfig as Config).stateDir, h.stateDir);
  });
});
