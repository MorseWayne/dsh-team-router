import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import { Config, installConfigValidation, readRoutingConfig } from '../src/adapter/dsh/config.ts';
import { DELEGATION_MODES, isDelegationMode } from '../src/index.ts';
import { createDefaultRoutingConfig } from '../src/core/routing-policy.ts';

const probe = {
  name: 'router-config-probe', Config,
  apply(ctx: Context, config: Config) {
    readRoutingConfig(config);
    installConfigValidation(ctx);
  },
};

test('native schema exposes only one volatile value and keeps stateDir static', () => {
  const config = Config({ stateDir: '/static/router-state', unknownStaticField: { keep: true } });
  assert.deepEqual(Object.keys(Config.dict!).sort(), ['routing', 'stateDir']);
  assert.equal(Config.dict!.routing!.meta.volatile, true);
  assert.equal(Config.dict!.stateDir!.meta.volatile, undefined);
  assert.equal(config.routing.get(), undefined);
  assert.deepEqual(readRoutingConfig(config), createDefaultRoutingConfig());
  assert.deepEqual(config.unknownStaticField, { keep: true });
  assert.throws(() => Config({ stateDir: '  ' }));
});

test('settings schema round-trips all delegation modes and rejects present bad config', () => {
  assert.deepEqual(DELEGATION_MODES, ['passive', 'specialist-first', 'orchestrator']);
  const schema = new Schema(Config.toJSON());
  for (const delegationMode of DELEGATION_MODES) {
    assert.equal(isDelegationMode(delegationMode), true);
    const routing = createDefaultRoutingConfig(); routing.behavior.delegationMode = delegationMode;
    const effective = schema({ routing }) as Config;
    const detached = readRoutingConfig(effective);
    assert.deepEqual(detached, routing);
    detached.behavior.guidance = false;
    assert.equal(readRoutingConfig(effective).behavior.guidance, true);
  }
  assert.equal(isDelegationMode('aggressive'), false);
  for (const routing of [null, false, { version: 2 }, { version: 3, behavior: null }]) {
    assert.throws(() => readRoutingConfig(Config({ routing })));
  }
});

test('native T8 validates candidate resolution on its own fiber before updating references', async t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose());
  const initial = { stateDir: '/static/router-state', routing: createDefaultRoutingConfig() };
  const fiber = await ctx.plugin(probe, initial);
  const live = fiber.effectiveConfig as Config;
  const ref = live.routing;
  for (const routing of [{ version: 1 }, { version: 3, builtins: { 'deep-high': {} } }, { ...initial.routing, historyLimit: 0 }]) {
    assert.throws(() => fiber.resolveConfig({ ...initial, routing }));
    assert.equal((fiber.effectiveConfig as Config).routing, ref);
    assert.deepEqual(readRoutingConfig(live), initial.routing);
  }
  const routing = createDefaultRoutingConfig(); routing.behavior.strict = true; routing.historyLimit = 8;
  assert.deepEqual(readRoutingConfig(fiber.resolveConfig({ ...initial, routing }) as Config), routing);
  assert.deepEqual(readRoutingConfig(live), initial.routing);
  const other = await ctx.plugin({ name: 'unrelated-config-probe', apply() {} }, {});
  assert.deepEqual(other.resolveConfig({ routing: 'arbitrary unrelated value' }), { routing: 'arbitrary unrelated value' });
});
