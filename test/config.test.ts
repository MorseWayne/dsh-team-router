import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import { Config, installConfigValidation, readPolicy, resolvePolicy } from '../src/adapter/dsh/config.ts';
import { parseConfig } from '../src/core/policy.ts';

const route = { provider: 'offline', model: 'fast' };
const fixture = () => ({
  routes: { fast: { ...route } },
  rules: [{ id: 'inventory', keywords: ['list'], route: 'fast' }],
  roles: { worker: 'fast' },
  defaultRoute: 'fast',
  stateDir: '/static/router-state',
});

const probe = {
  name: 'router-config-probe',
  Config,
  apply(ctx: Context, config: Config) {
    readPolicy(config);
    installConfigValidation(ctx);
  },
};

describe('native configuration contract', () => {
  it('preserves the flat input and exposes immutable collection snapshots, not element refs', () => {
    const input = fixture();
    const config = Config(input);
    assert.equal(Config.type, 'object');
    assert.equal(config.stateDir, input.stateDir);
    assert.deepEqual(readPolicy(config), parseConfig({
      routes: input.routes, rules: input.rules, roles: input.roles, defaultRoute: input.defaultRoute,
    }));
    assert.equal(resolvePolicy, readPolicy);
    assert.ok(Object.isFrozen(config.routes.get()));
    assert.ok(Object.isFrozen(config.routes.get().fast));
    assert.ok(Object.isFrozen(config.rules.get()));
    assert.ok(Object.isFrozen(config.rules.get()[0]!.keywords));
    assert.equal(typeof config.routes.get().fast!.get, 'undefined');
    input.routes.fast.model = 'modified-after-parse';
    assert.equal(config.routes.get().fast!.model, 'fast');
    const detached = readPolicy(config);
    detached.routes.fast!.model = 'modified-after-read';
    assert.equal(config.routes.get().fast!.model, 'fast');
  });

  it('supplies defaults and omits static fields from the policy validator', () => {
    const config = Config({ unknownStaticField: { keep: true }, stateDir: '/static' });
    assert.deepEqual(readPolicy(config), parseConfig({ routes: {} }));
    assert.deepEqual(config.unknownStaticField, { keep: true });
    assert.equal(config.defaultRoute.get(), undefined);
    assert.equal(Config.dict!.stateDir!.meta.volatile, undefined);
    for (const name of ['routes', 'rules', 'roles', 'defaultRoute', 'historyLimit']) {
      assert.equal(Config.dict![name]!.meta.volatile, true);
    }
    const roundTrip = new Schema(Config.toJSON());
    assert.equal(roundTrip.type, 'object');
    assert.equal(roundTrip.dict!.routes!.type, 'dict');
    assert.equal(roundTrip.dict!.rules!.type, 'array');
  });

  it('enforces shape bounds and unsafe dictionary keys', () => {
    const invalid: unknown[] = [
      { routes: { fast: { model: 'x' } } },
      { routes: { fast: { ...route, provider: '  ' } } },
      { routes: {}, historyLimit: 0 },
      { routes: {}, historyLimit: 1001 },
      { routes: {}, historyLimit: 1.5 },
      { ...fixture(), rules: [{ id: 'x', route: 'fast', keywords: ['x'.repeat(101)] }] },
      { ...fixture(), rules: [{ id: 'x', route: 'fast', keywords: Array(33).fill('x') }] },
      { ...fixture(), rules: Array.from({ length: 65 }, (_, index) => ({ id: String(index), route: 'fast', keywords: [] })) },
      { ...fixture(), rules: [{ id: 'x', route: 'fast', keywords: [], priority: 0.5 }] },
      { routes: JSON.parse('{"__proto__":{"provider":"offline","model":"x"}}') },
      { routes: {}, stateDir: '  ' },
    ];
    for (const input of invalid) assert.throws(() => Config(input as Parameters<typeof Config>[0]));
    assert.throws(() => readPolicy(Config({ routes: Object.fromEntries(
      Array.from({ length: 65 }, (_, index) => [String(index), { ...route }]),
    ) })), /at most 64 routes/);
  });

  it('rejects cross-field candidates through native fiber.resolveConfig before publishing refs', async (t) => {
    const ctx = new Context();
    t.after(() => ctx.fiber.dispose());
    const fiber = await ctx.plugin(probe, fixture());
    t.after(() => fiber.dispose());
    const live = fiber.effectiveConfig as Config;
    const routesRef = live.routes;
    const before = readPolicy(live);
    const invalid = [
      { ...fixture(), routes: {} },
      { ...fixture(), roles: { worker: 'missing' } },
      { ...fixture(), defaultRoute: 'missing' },
      { ...fixture(), rules: [{ id: 'x', route: 'missing', keywords: [] }] },
      { ...fixture(), rules: [{ id: 'x', route: 'fast', keywords: [] }, { id: 'x', route: 'fast', keywords: [] }] },
      { ...fixture(), routes: { fast: { ...route, unexpected: true } } },
    ];
    for (const input of invalid) {
      assert.throws(() => fiber.resolveConfig(input));
      assert.equal((fiber.effectiveConfig as Config).routes, routesRef);
      assert.deepEqual(readPolicy(live), before);
    }
    const candidate = fiber.resolveConfig({
      routes: { next: { provider: 'offline', model: 'next' } },
      rules: [{ id: 'next', keywords: ['review'], route: 'next' }],
      roles: { worker: 'next' }, defaultRoute: 'next', stateDir: '/static/router-state',
    }) as Config;
    assert.equal(readPolicy(candidate).defaultRoute, 'next');
    assert.deepEqual(readPolicy(live), before, 'Candidate resolution is not a live commit');
  });

  it('scopes semantic validation to its own fiber', async (t) => {
    const ctx = new Context();
    t.after(() => ctx.fiber.dispose());
    const owned = await ctx.plugin(probe, fixture());
    t.after(() => owned.dispose());
    const other = await ctx.plugin({ name: 'unrelated-config-probe', apply() {} }, {});
    t.after(() => other.dispose());
    assert.deepEqual(other.resolveConfig({ arbitrary: 'unrelated' }), { arbitrary: 'unrelated' });
  });
});
