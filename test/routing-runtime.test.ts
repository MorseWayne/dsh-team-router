import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { authorizationProjection, assertAuthorizedRoute } from '../src/adapter/dsh/authorization.ts';
import { resolveActiveRegistry, requiredGrantPairs } from '../src/core/active-registry.ts';
import { NativeHarness, customCategory, explicitTarget, safeRouting } from './helpers.ts';

const pair = (model: string) => ({ provider: 'p', model });

test('unrecorded authorization only allows the exact parent pair; explicit policy does not automatically grant parent', () => {
  assert.doesNotThrow(() => assertAuthorizedRoute(null, pair('a'), pair('a')));
  assert.throws(() => assertAuthorizedRoute(null, pair('a'), pair('b')), /not authorized/);
  assert.doesNotThrow(() => assertAuthorizedRoute([pair('b')], pair('a'), pair('b')));
  assert.throws(() => assertAuthorizedRoute([pair('b')], pair('a'), pair('a')), /not authorized/);
  assert.throws(() => assertAuthorizedRoute([], pair('a'), pair('a')), /not authorized/);
});

test('durable projection folds only the first policy and validates and detaches its contents', () => {
  const type = 'subagent/model-selection-policy';
  const event = (allowedModels: unknown) => ({ type, data: { allowedModels } }) as unknown as SessionEvent;
  const entries = [pair('a')];
  const first = authorizationProjection.apply(null, event(entries));
  entries[0]!.model = 'modified';
  assert.deepEqual(first, [pair('a')]);
  assert.equal(authorizationProjection.apply(first, event([pair('b')])), first);
  assert.equal(authorizationProjection.apply(null, { type: 'irrelevant', data: {} } as unknown as SessionEvent), null);
  for (const invalid of [null, [], [{ model: 'a' }], [pair('a'), pair('a')], [{ ...pair('x'), extra: true }]]) {
    assert.throws(() => authorizationProjection.apply(null, event(invalid)));
  }
});

test('live team status and the core registry agree; categorization is not model authorization', async t => {
  const initial = safeRouting();
  const harness = await NativeHarness.create({ routing: initial }); t.after(() => harness.close());
  const lead = await harness.lead();
  const after = safeRouting(); after.builtins.quick = { enabled: false, binding: explicitTarget('fast') };
  after.custom.push(customCategory('custom-runtime', { binding: explicitTarget('review', 'high') }));
  harness.updatePolicy({ routing: after });
  const registry = resolveActiveRegistry(after);
  const status = await harness.status(lead);
  assert.deepEqual(status.categories.map(category => [category.id, category.source, category.target]),
    registry.entries.map(category => [category.id, category.bindingSource, category.effectiveTarget]));
  assert.deepEqual(requiredGrantPairs(registry), [{ provider: 'offline', model: 'review' }]);
  await assert.rejects(harness.delegate(lead, 'quick'), /Active category IDs/);
  await assert.rejects(harness.delegate(lead, 'custom-runtime'), /not authorized/);
  assert.deepEqual((await harness.status(lead)).executions, []);
});
