import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { resolveActiveCategory, resolveActiveRegistry, requiredGrantPairs } from '../src/core/active-registry.ts';
import { BUILTIN_IDS } from '../src/core/categories.ts';
import { createDefaultRoutingConfig, routingConfigFingerprint } from '../src/core/routing-policy.ts';
import type { CustomCategory } from '../src/core/routing-policy.ts';
import { sha256 } from '../src/core/sha256.ts';

const target = { mode: 'explicit', provider: 'p', model: 'm' } as const;
const custom = (id: string, values: Partial<CustomCategory> = {}): CustomCategory => ({
  id, name: '证据', purpose: '核验文档', enabled: true, proactive: true, binding: { mode: 'default' }, ...values,
});

test('resolves built-in order, sorted enabled custom IDs, metadata and effective binding sources', () => {
  const config = createDefaultRoutingConfig(); config.defaultTarget = target;
  config.builtins = { writing: { enabled: false }, deep: { binding: { mode: 'inherit' } } };
  config.custom = [custom('custom-z'), custom('custom-a', { binding: { ...target, reasoningEffort: 'high' }, avoid: 'Only if sourced' }), custom('custom-off', { enabled: false })];
  const registry = resolveActiveRegistry(config);
  assert.deepEqual(registry.entries.map(e => e.id), [...BUILTIN_IDS.filter(id => id !== 'writing'), 'custom-a', 'custom-z']);
  for (const id of ['writing', 'custom-off', 'Custom-a', null, 0, Symbol()]) assert.equal(resolveActiveCategory(registry, id), undefined);
  const a = resolveActiveCategory(registry, 'custom-a')!;
  assert.deepEqual([a.nameEn, a.nameZh, a.origin, a.group, a.purposeEn, a.avoidEn, a.proactive], ['证据', '证据', 'custom', 'custom', '核验文档', 'Only if sourced', true]);
  assert.equal(a.bindingSource, 'category');
  assert.equal(resolveActiveCategory(registry, 'custom-z')!.bindingSource, 'default');
  assert.deepEqual(resolveActiveCategory(registry, 'deep')!.effectiveTarget, { mode: 'inherit' });
  assert.deepEqual(a.effectiveTarget, { ...target, reasoningEffort: 'high' });
  assert.equal(registry.byId.get('custom-a'), a);
});

test('freezes the detached configuration, entries and an actually immutable index', () => {
  const config = createDefaultRoutingConfig(); config.custom.push(custom('custom-a'));
  const registry = resolveActiveRegistry(config);
  config.custom[0]!.name = 'changed'; config.builtins.deep = { enabled: false };
  assert.equal(resolveActiveCategory(registry, 'custom-a')!.nameEn, '证据');
  assert.ok(resolveActiveCategory(registry, 'deep'));
  for (const object of [registry, registry.config, registry.config.behavior, registry.config.defaultTarget, registry.config.builtins,
    registry.config.custom, registry.config.custom[0], registry.config.custom[0]!.binding, registry.entries, registry.entries[0], registry.byId]) {
    assert.ok(Object.isFrozen(object));
  }
  assert.equal(Reflect.get(registry.byId, 'set'), undefined);
  assert.throws(() => Map.prototype.set.call(registry.byId, 'forged', registry.entries[0]), TypeError);
  assert.deepEqual([...registry.byId.keys()], registry.entries.map(e => e.id));
  assert.deepEqual([...registry.byId.values()], registry.entries);
  registry.byId.forEach((entry, id, map) => { assert.equal(map, registry.byId); assert.equal(entry.id, id); });
});

test('hashes the canonical fingerprint as SHA-256, including multibyte input', () => {
  assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const config = createDefaultRoutingConfig();
  config.custom = [custom('custom-z'), custom('custom-a', { purpose: '🧪'.repeat(120) })];
  const digest = resolveActiveRegistry(config).configDigest;
  assert.equal(digest, createHash('sha256').update(routingConfigFingerprint(config)).digest('hex'));
  config.custom.reverse();
  assert.equal(resolveActiveRegistry(config).configDigest, digest);
  config.builtins.quick = { enabled: false };
  assert.notEqual(resolveActiveRegistry(config).configDigest, digest);
});

test('grant pairs use only active effective targets and deduplicate by provider/model, not effort', () => {
  const config = createDefaultRoutingConfig(); config.defaultTarget = { ...target, model: 'unused' };
  for (const id of BUILTIN_IDS) config.builtins[id] = { enabled: false };
  const empty = resolveActiveRegistry(config);
  assert.deepEqual(requiredGrantPairs(empty), []);
  assert.equal(empty.byId.size, 0);
  config.builtins.quick = { binding: target }; config.builtins.deep = { binding: { ...target, reasoningEffort: 'high' } };
  config.builtins.writing = { enabled: false, binding: { ...target, model: 'denied' } };
  config.custom = [custom('custom-z', { binding: { ...target, provider: 'other' } }), custom('custom-off', { enabled: false })];
  assert.deepEqual(requiredGrantPairs(resolveActiveRegistry(config)), [{ provider: 'p', model: 'm' }, { provider: 'other', model: 'm' }]);
  config.custom.push(custom('custom-default'));
  assert.ok(requiredGrantPairs(resolveActiveRegistry(config)).some(pair => pair.model === 'unused'));
});
