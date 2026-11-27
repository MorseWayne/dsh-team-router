import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
import { Config, installConfigValidation, readRoutingConfig } from '../src/adapter/dsh/config.ts';
import { createDefaultRoutingConfig } from '../src/core/routing-policy.ts';
import { customCategory, explicitTarget } from './helpers.ts';

const namespace = 'team-router-routing-test';
/** Real native Loader entry, with production Config and the same pre-save validation. */
const probe = {
  name: namespace, Config,
  apply(ctx: Context, config: Config) {
    readRoutingConfig(config);
    installConfigValidation(ctx);
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
  const stop = async () => { await current?.fiber.dispose(); current = undefined; };
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
  const inherited = createDefaultRoutingConfig();
  inherited.defaultTarget = explicitTarget('fast');
  const initial = [{ insert: [{
    id: namespace, name: 'cordis:router-routing-test',
    config: { stateDir, unknownStatic: staticValue, ...(inheritFromBase ? { routing: inherited } : {}) },
  }] }];
  if (inheritFromBase) {
    // A lower-layer default must come from an actual bundle layer.
    const bundleDir = join(dir, 'node_modules', 'settings-test-base');
    await mkdir(bundleDir, { recursive: true });
    await writeFile(join(bundleDir, 'package.json'), JSON.stringify({
      name: 'settings-test-base', version: '1.0.0', private: true, dsh: { bundle: { patch: './cordis.patch.yml' } },
    }));
    await writeFile(join(bundleDir, 'cordis.patch.yml'), JSON.stringify(initial, null, 2) + '\n');
  }
  await writeFile(basePath, '[]\n');
  await writeFile(patchPath, '# Preserve this profile comment.\n' + JSON.stringify(inheritFromBase ? [] : initial, null, 2) + '\n');

  const start = async () => {
    assert.equal(current, undefined);
    current = await boot('team-router-settings-test', basePath, readProfilePatches('test', profile), async (ctx) => {
      ctx.provide('profileContext', profile);
      ctx.loader.builtins['router-routing-test'] = probe;
      await ctx.plugin(ConfigEditor);
      await ctx.plugin(SettingsForms);
    });
    assert.ok(current.settings.describe().find(row => row.ns === namespace), 'Settings discovers the native Loader entry');
  };
  const ctx = () => { assert.ok(current); return current; };
  const entry = () => {
    const result = ctx().configEditor.entries().find(row => row.options.id === namespace);
    assert.ok(result?.fiber);
    return result;
  };
  const descriptor = () => {
    const result = ctx().settings.describe().find(row => row.ns === namespace);
    assert.ok(result);
    return result;
  };
  const live = () => entry().fiber!.effectiveConfig as Config;
  const save = (value: unknown, revision = descriptor().revision) => ctx().settings.mutate(namespace, [{ op: 'set', path: ['routing'], value }], revision);
  await start();
  return { ctx, entry, descriptor, live, save, start, stop, patchPath, stateDir, staticValue, inherited };
}

describe('native V3 Settings persistence and CAS', { concurrency: false, timeout: 30_000 }, () => {
  it('commits routes and behavior together on the same Fiber/ref and persists on reboot', async t => {
    const h = await settingsFixture(t);
    const entry = h.entry(), fiber = entry.fiber!, ref = h.live().routing;
    const descriptor = h.descriptor();
    assert.equal(Object.hasOwn(descriptor.value as object, 'stateDir'), false);
    assert.equal(Object.hasOwn(descriptor.value as object, 'unknownStatic'), false);
    assert.deepEqual(readRoutingConfig(h.live()), createDefaultRoutingConfig());
    const routing = createDefaultRoutingConfig();
    routing.behavior = { guidance: false, delegationMode: 'orchestrator', strict: true };
    routing.builtins = { writing: { enabled: false }, quick: { binding: explicitTarget('fast') } };
    routing.custom = [customCategory('custom-settings')];
    routing.historyLimit = 8;
    await h.save(routing, descriptor.revision);
    assert.equal(h.entry(), entry);
    assert.equal(h.entry().fiber, fiber);
    assert.equal(h.live().routing, ref);
    assert.deepEqual(readRoutingConfig(h.live()), routing);
    assert.ok(h.descriptor().revision > descriptor.revision);
    assert.equal(h.live().stateDir, h.stateDir);
    assert.deepEqual(h.live().unknownStatic, h.staticValue);
    assert.match(await readFile(h.patchPath, 'utf8'), /Preserve this profile comment/);
    await h.stop(); await h.start();
    assert.deepEqual(readRoutingConfig(h.live()), routing);
    assert.deepEqual(h.live().unknownStatic, h.staticValue);
  });

  it('rejects stale revisions and invalid V3 before changing disk or live routing', async t => {
    const h = await settingsFixture(t);
    const oldRevision = h.descriptor().revision;
    const routing = createDefaultRoutingConfig(); routing.historyLimit = 8;
    await h.save(routing, oldRevision);
    const { revision } = h.descriptor();
    const ref = h.live().routing;
    const bytes = await readFile(h.patchPath);
    await assert.rejects(h.save(createDefaultRoutingConfig(), oldRevision), (error: unknown) => error instanceof SettingsConflictError
      && error.code === 'SETTINGS_CONFLICT' && error.expected === oldRevision && error.actual === revision);
    for (const invalid of [null, { ...routing, version: 2 }, { ...routing, builtins: { 'deep-high': {} } },
      { ...routing, custom: [customCategory('custom-dupe'), customCategory('custom-dupe')] },
      { ...routing, custom: [customCategory('custom-invalid', { purpose: '\u202edanger' })] }]) {
      await assert.rejects(h.save(invalid, revision));
    }
    assert.deepEqual(await readFile(h.patchPath), bytes);
    assert.equal(h.descriptor().revision, revision);
    assert.equal(h.live().routing, ref);
    assert.deepEqual(readRoutingConfig(h.live()), routing);
  });

  it('can override and then restore layered routing without a null or migration sentinel', async t => {
    const h = await settingsFixture(t, true);
    assert.deepEqual(readRoutingConfig(h.live()), h.inherited);
    const routing = createDefaultRoutingConfig();
    routing.behavior.guidance = false;
    await h.save(routing);
    assert.deepEqual(readRoutingConfig(h.live()), routing);
    await h.stop(); await h.start();
    assert.deepEqual(readRoutingConfig(h.live()), routing);
    await h.ctx().settings.mutate(namespace, [{ op: 'unset', path: ['routing'] }], h.descriptor().revision);
    assert.deepEqual(readRoutingConfig(h.live()), h.inherited);
  });

  it('preserves static fields during form replacement and refuses writes to stateDir', async t => {
    const h = await settingsFixture(t);
    const fiber = h.entry().fiber!;
    const routing = createDefaultRoutingConfig(); routing.defaultTarget = explicitTarget('review');
    await h.ctx().settings.replace(namespace, { routing }, h.descriptor().revision);
    assert.equal(h.entry().fiber, fiber);
    assert.deepEqual(readRoutingConfig(h.live()), routing);
    assert.equal(h.live().stateDir, h.stateDir);
    assert.deepEqual(h.live().unknownStatic, h.staticValue);
    assert.equal(h.entry().options.config.stateDir, h.stateDir);
    assert.deepEqual(h.entry().options.config.unknownStatic, h.staticValue);
    const bytes = await readFile(h.patchPath);
    await assert.rejects(h.ctx().settings.mutate(namespace, [{ op: 'set', path: ['stateDir'], value: '/not-allowed' }], h.descriptor().revision), /not volatile/);
    assert.deepEqual(await readFile(h.patchPath), bytes);
  });
});
