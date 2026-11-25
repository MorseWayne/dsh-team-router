// Test the shipped bytes, not a rebuild or a workspace link. Usage:
// node scripts/test-host-compat.mjs 0.2.2-rc.3 /path/to/dsh-team-router.tgz
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// No checkout dependencies are needed to start the probe. Accept a canonical
// version (including prerelease/build identifiers), never an npm range or tag.
const num = '(?:0|[1-9][0-9]*)';
const pre = `(?:${num}|[0-9]*[a-zA-Z-][a-zA-Z0-9-]*)`;
const exactVersion = new RegExp(`^${num}\\.${num}\\.${num}(?:-${pre}(?:\\.${pre})*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$`);
const [host, input, ...extra] = process.argv.slice(2);
if (!exactVersion.test(host ?? '') || !input || extra.length) {
  throw new Error('Usage: node scripts/test-host-compat.mjs <exact-host-version> <built.tgz>');
}
const repo = fileURLToPath(new URL('../', import.meta.url));
const artifact = realpathSync(input);
const pkg = 'dsh-team-router';
const isDsh = name => name.startsWith('@deepseek-ai/dsh-');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const tempParent = realpathSync(tmpdir());
const dir = mkdtempSync(join(tempParent, 'team-router-compat-'));
try {
  const packed = join(dir, 'bundle.tgz');
  copyFileSync(artifact, packed);
  const manifest = JSON.parse(execFileSync('tar', ['-xOzf', packed, 'package/package.json'], { encoding: 'utf8' }));
  assert.equal(manifest.name, pkg);
  const supported = manifest.engines.dsh.split('||').map(s => s.trim());
  assert.ok(supported.every(v => exactVersion.test(v)), 'Packed engines.dsh must explicitly enumerate exact versions');
  assert.ok(supported.includes(host), `Host ${host} is not declared in ${manifest.engines.dsh}`);
  const deps = { ...manifest.devDependencies, ...manifest.peerDependencies };
  const pinned = Object.keys(deps).filter(isDsh);
  assert.ok(pinned.includes('@deepseek-ai/dsh-app-boot') && pinned.includes('@deepseek-ai/dsh-subagent'));
  for (const name of pinned) deps[name] = host;
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'team-router-compat-test', private: true, type: 'module',
    dependencies: { ...deps, [pkg]: 'file:./bundle.tgz' } }));

  const registry = 'https://registry.npmjs.org/';
  const userConfig = join(dir, 'user.npmrc');
  writeFileSync(userConfig, `registry=${registry}\n@deepseek-ai:registry=${registry}\nstrict-peer-deps=true\nlegacy-peer-deps=false\nforce=false\n`);
  execFileSync('npm', ['install', '--ignore-scripts', '--strict-peer-deps', '--no-audit', '--no-fund', `--userconfig=${userConfig}`, `--registry=${registry}`],
    { cwd: dir, stdio: 'inherit', env: { ...process.env, npm_config_cache: process.env.npm_config_cache ?? join(dir, 'npm-cache') } });
  const lock = json(join(dir, 'package-lock.json')).packages;
  const integrity = 'sha512-' + createHash('sha512').update(readFileSync(packed)).digest('base64');
  assert.equal(lock[`node_modules/${pkg}`].integrity, integrity, 'Must install the supplied tarball unchanged');
  const installed = join(dir, 'node_modules', pkg);
  assert.deepEqual(json(join(installed, 'package.json')), manifest);
  const localRequire = createRequire(join(dir, 'package.json'));
  const pluginRequire = createRequire(join(installed, 'package.json'));
  for (const [entry, metadata] of Object.entries(lock)) {
    if (!/(?:^|\/)node_modules\/@deepseek-ai\/dsh-[^/]+$/.test(entry)) continue;
    assert.equal(metadata.version, host, `Wrong locked host: ${entry}`);
    assert.equal(json(join(dir, entry, 'package.json')).version, host, `Wrong installed host: ${entry}`);
  }
  for (const name of pinned) {
    assert.equal(lock[`node_modules/${name}`]?.version, host, `Missing root Host dependency: ${name}`);
    assert.equal(pluginRequire.resolve(name), localRequire.resolve(name), `Split Host service resolution: ${name}`);
  }
  const { getDshRuntimeVersion, evaluatePluginCompatibility } = await import(pathToFileURL(localRequire.resolve('@deepseek-ai/dsh-app-boot')).href);
  assert.equal(getDshRuntimeVersion(), host);
  assert.equal(evaluatePluginCompatibility(manifest), undefined, 'The actual Host gate must accept without an exemption');
  const semver = createRequire(localRequire.resolve('@deepseek-ai/dsh-app-boot'))('semver');
  const highest = semver.rsort([...supported])[0];
  const next = semver.inc(highest, semver.prerelease(highest) ? 'prerelease' : 'patch');
  const future = evaluatePluginCompatibility(manifest, {}, next);
  assert.ok(future && !future.exempted && Object.hasOwn(future.requirements, 'engines.dsh'), `Unexpected support for untested ${next}`);

  // The client is a DSH loader module, not a standalone page. Smoke-test both
  // registration keys and cleanup; this does not claim to render the browser UI.
  let client;
  globalThis.window = { __ModuleLoader__: { load({ id, factory }) {
    assert.equal(id, pkg); client = factory(localRequire);
  } } };
  try { await import(pathToFileURL(localRequire.resolve(`${pkg}/client`)).href); }
  finally { delete globalThis.window; }
  const slots = new Map(), stops = [], requestedForms = [], optionalRemotes = [];
  client.apply({
    effect: fn => stops.push(fn()), locale: { register: () => () => {}, bind: () => key => key },
    // A Host without the optional diagnostic remotes must still mount both editor slots.
    inject: names => { optionalRemotes.push(...names); },
    configForms: { get: ns => { requestedForms.push(ns); return {}; }, whileServed: (ns, fn) => { assert.deepEqual(ns, ['team-router']); return fn(); } },
    slots: { inject: (_, fn) => fn(), register: (options, component) => { slots.set(options.name, { options, component }); return () => slots.delete(options.name); } },
  });
  assert.deepEqual(requestedForms.sort(), ['subagent-model-selection-settings', 'team-router']);
  assert.deepEqual(optionalRemotes.sort(), ['remote.pluginManager', 'remote.settings']);
  const detail = slots.get('plugins.bundle.config'), settings = slots.get('settings.section');
  assert.equal(detail.options.key, pkg); assert.equal(settings.options.id, 'team-router');
  assert.equal(typeof detail.component, 'function'); assert.equal(detail.component, settings.component);
  for (const stop of stops.reverse()) stop();
  assert.equal(slots.size, 0);

  // Reuse the full suite without copying src/. Tests normally import ../src/*.ts.
  // Private-module tests forward to the packed JS; the main and published subpaths
  // load via real package exports. Both see exactly the same module instances.
  cpSync(join(repo, 'test'), join(dir, 'test'), { recursive: true });
  mkdirSync(join(dir, 'src'));
  const publicModules = { index: pkg, categories: `${pkg}/categories`, policy: `${pkg}/policy`, 'routing-policy': `${pkg}/routing-policy` };
  for (const file of readdirSync(join(installed, 'lib'))) {
    if (!file.endsWith('.js') || file === 'client.js') continue;
    const id = basename(file, '.js');
    const specifier = publicModules[id] ?? `../node_modules/${pkg}/lib/${file}`;
    writeFileSync(join(dir, 'src', `${id}.ts`), `export * from ${JSON.stringify(specifier)};\n`);
  }
  const tests = readdirSync(join(dir, 'test')).filter(file => file.endsWith('.test.ts')).sort();
  assert.ok(tests.includes('integration.test.ts') && tests.includes('settings.test.ts'));
  console.log(`Testing ${pkg}@${manifest.version} (${integrity}) against real DSH ${host}: ${tests.length} suites`);
  execFileSync(process.execPath, ['--experimental-strip-types', '--test', ...tests.map(file => `test/${file}`)], {
    cwd: dir, env: { ...process.env, DSH_HOME: join(dir, 'test-home') }, stdio: 'inherit',
  });
} finally {
  assert.equal(dirname(realpathSync(dir)), tempParent);
  assert.ok(basename(dir).startsWith('team-router-compat-'));
  rmSync(dir, { recursive: true, force: true });
}
