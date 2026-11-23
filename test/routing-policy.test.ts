import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CATEGORIES, CATEGORY_IDS, CATEGORY_LIST, categorySelectionGuidance, getCategory, isCategoryId,
} from '../src/categories.ts';
import {
  createDefaultRoutingPolicy, parseRoutingPolicy, parseTarget, resolveRoutingSnapshot,
} from '../src/routing-policy.ts';
import type { Target } from '../src/routing-policy.ts';

const native = (id = 'native-model'): Target => ({
  executor: 'native', model: { mode: 'explicit', provider: 'provider', id },
});
const external = (executor: 'codex' | 'agy' | 'cursor', id = 'external-model'): Target => ({
  executor, model: { mode: 'explicit', id },
});
const retired = ['deep-low', 'deep-high', 'unspecified-low', 'unspecified-high'];

function rejects(input: unknown, pattern?: RegExp): void {
  assert.throws(() => parseRoutingPolicy(input), pattern ?? TypeError);
}

function nullRecord(value: object): object {
  return Object.assign(Object.create(null), value);
}

function poison(key: string): object {
  return Object.defineProperty({}, key, { value: 'poison', enumerable: true });
}

/** Each insertion point lies on a parsed object boundary. */
const containers: Array<(value: object) => unknown> = [
  (value) => ({ version: 2, ...value }),
  (value) => ({ version: 2, defaultTarget: value }),
  (value) => ({ version: 2, defaultTarget: { executor: 'native', model: value } }),
  (value) => ({ version: 2, categories: value }),
  (value) => ({ version: 2, categories: { quick: value } }),
  (value) => ({ version: 2, categories: { quick: { mode: 'target', target: value } } }),
  (value) => ({ version: 2, categories: { quick: { mode: 'target', target: { executor: 'codex', model: value } } } }),
];

// Root must be passed directly in descriptor tests; spreading would invoke test getters.
const boundaries = [(value: object) => value, ...containers.slice(1)];

describe('seven category registry', () => {
  it('defines exactly seven stable identifiers in the documented order', () => {
    assert.deepEqual(CATEGORY_IDS, [
      'visual-engineering', 'ultrabrain', 'deep', 'artistry', 'quick', 'unspecified', 'writing',
    ]);
    assert.deepEqual(CATEGORY_LIST.map((entry) => entry.id), CATEGORY_IDS);
    assert.deepEqual(Object.keys(CATEGORIES), CATEGORY_IDS);
    for (const id of CATEGORY_IDS) {
      assert.equal(getCategory(id), CATEGORIES[id]);
      assert.equal(isCategoryId(id), true);
      for (const locale of ['en', 'zh'] as const) {
        for (const field of ['name', 'purpose', 'avoid', 'example'] as const) {
          assert.ok(getCategory(id)[locale][field].length > 0);
        }
      }
    }
  });

  it('has no silent alias, case folding, whitespace trimming, or object coercion', () => {
    for (const id of [...retired, 'explore', 'librarian', '', ' ', ' deep', 'Deep', 'deep ',
      '__proto__', 'constructor', undefined, null, 42, Symbol('deep'), { toString() { throw new Error('coerced'); } }]) {
      assert.equal(isCategoryId(id), false);
      assert.throws(() => getCategory(id), TypeError);
    }
    assert.throws(() => getCategory('deep-high'), /use "deep" explicitly/);
    assert.throws(() => getCategory('unspecified-low'), /use "unspecified" explicitly/);
  });

  it('freezes identifiers, the registry, entries and localized metadata', () => {
    assert.ok(Object.isFrozen(CATEGORY_IDS));
    assert.ok(Object.isFrozen(CATEGORIES));
    assert.ok(Object.isFrozen(CATEGORY_LIST));
    for (const entry of CATEGORY_LIST) {
      assert.ok(Object.isFrozen(entry));
      assert.ok(Object.isFrozen(entry.en));
      assert.ok(Object.isFrozen(entry.zh));
    }
    assert.equal(Reflect.set(CATEGORIES.deep.en, 'name', 'changed'), false);
  });

  it('supplies deliverable-first Lead guidance in both languages without extra tiers', () => {
    for (const locale of ['en', 'zh'] as const) {
      const guidance = categorySelectionGuidance(locale);
      for (const id of CATEGORY_IDS) assert.ok(guidance.includes(`${id} —`));
      for (const id of retired) assert.ok(!guidance.includes(id));
    }
    const english = categorySelectionGuidance();
    assert.match(english, /primary deliverable/);
    assert.match(english, /use unspecified only/i);
    assert.match(english, /grant no permissions/);
    assert.match(english, /never.*automatically escalate\/replay/);
    assert.match(categorySelectionGuidance('zh'), /不按任务中的关键词/);
    assert.throws(() => categorySelectionGuidance('fr' as 'en'), TypeError);
  });
});

describe('V2 policy parsing and target mapping', () => {
  it('provides detached safe defaults, but never infers a version from legacy/invalid input', () => {
    const first = createDefaultRoutingPolicy();
    const second = createDefaultRoutingPolicy();
    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.defaultTarget, second.defaultTarget);
    assert.notEqual(first.defaultTarget.model, second.defaultTarget.model);
    assert.notEqual(first.categories, second.categories);
    assert.equal(first.version, 2);
    assert.equal(first.historyLimit, 100);
    assert.equal(Object.getPrototypeOf(first.categories), null);
    assert.deepEqual(first.defaultTarget, { executor: 'native', model: { mode: 'inherit' } });
    assert.deepEqual(parseRoutingPolicy({ version: 2 }), first);
    for (const input of [undefined, null, {}, { version: 1 }, { version: '2' }, { routes: {} }]) rejects(input);
  });

  it('resolves all seven categories from the default when overrides are absent', () => {
    const policy = parseRoutingPolicy({ version: 2, defaultTarget: native('base') });
    for (const category of CATEGORY_IDS) {
      assert.deepEqual(resolveRoutingSnapshot(policy, category), {
        category, source: 'default', target: native('base'), historyLimit: 100,
      });
    }
  });

  it('distinguishes category-default, native inheritance, and executor-default models', () => {
    const policy = parseRoutingPolicy({
      version: 2, defaultTarget: native('base'),
      categories: {
        quick: { mode: 'default' },
        deep: { mode: 'target', target: { executor: 'native', model: { mode: 'inherit' } } },
        writing: { mode: 'target', target: { executor: 'codex', model: { mode: 'executor-default' } } },
      },
    });
    const fallback = resolveRoutingSnapshot(policy, 'quick');
    assert.equal(fallback.source, 'default');
    assert.deepEqual(fallback.target, native('base'));
    const inherited = resolveRoutingSnapshot(policy, 'deep');
    assert.equal(inherited.source, 'category');
    assert.deepEqual(inherited.target, { executor: 'native', model: { mode: 'inherit' } });
    const executorDefault = resolveRoutingSnapshot(policy, 'writing');
    assert.equal(executorDefault.source, 'category');
    assert.deepEqual(executorDefault.target, { executor: 'codex', model: { mode: 'executor-default' } });
    assert.equal(Object.hasOwn(executorDefault.target.model, 'id'), false);
  });

  it('supports each external executor as both default and explicit category target', () => {
    for (const executor of ['codex', 'agy', 'cursor'] as const) {
      const chosen = external(executor);
      const policy = parseRoutingPolicy({ version: 2, defaultTarget: chosen, categories: {
        quick: { mode: 'target', target: { executor, model: { mode: 'executor-default' } } },
      } });
      assert.deepEqual(resolveRoutingSnapshot(policy, 'writing').target, chosen);
      assert.equal(resolveRoutingSnapshot(policy, 'quick').target.model.mode, 'executor-default');
    }
  });

  it('normalizes nonempty model fields while preserving adapter-owned effort values', () => {
    assert.deepEqual(parseTarget({ executor: 'native', model: {
      mode: 'explicit', provider: ' provider ', id: '\tmodel\n', reasoningEffort: ' vendor-specific ',
    } }), { executor: 'native', model: {
      mode: 'explicit', provider: 'provider', id: 'model', reasoningEffort: 'vendor-specific',
    } });
    const plain = parseTarget({ executor: 'agy', model: {
      mode: 'explicit', id: 'custom/model', reasoningEffort: undefined,
    } });
    assert.equal(Object.hasOwn(plain.model, 'reasoningEffort'), false);
  });

  it('allows frozen and null-prototype data without invoking a mutation', () => {
    const input = nullRecord({
      version: 2,
      defaultTarget: nullRecord({ executor: 'native', model: nullRecord({ mode: 'inherit' }) }),
      categories: nullRecord({ deep: nullRecord({ mode: 'default' }) }),
    });
    Object.freeze(input);
    assert.equal(resolveRoutingSnapshot(input, 'deep').target.model.mode, 'inherit');
  });

  it('is structural only and makes no claim of model access, availability, or actual usage', () => {
    const policy = parseRoutingPolicy({ version: 2, defaultTarget: native('not-in-any-catalog') });
    const snapshot = resolveRoutingSnapshot(policy, 'deep');
    assert.deepEqual(snapshot.target, native('not-in-any-catalog'));
    assert.equal(Object.hasOwn(snapshot, 'authorized'), false);
    assert.equal(Object.hasOwn(snapshot, 'actualModel'), false);
  });
});

describe('independent policy graphs and immutable snapshots', () => {
  it('detaches parsed defaults, bindings and nested models from input and each other', () => {
    const shared = { executor: 'native', model: { mode: 'explicit', provider: 'p', id: 'original' } };
    const input = { version: 2, defaultTarget: shared, categories: { deep: { mode: 'target', target: shared } } };
    const policy = parseRoutingPolicy(input);
    shared.model.id = 'input-mutation';
    const snapshot = resolveRoutingSnapshot(policy, 'deep', 17);
    assert.equal(snapshot.target.model.mode, 'explicit');
    if (snapshot.target.model.mode === 'explicit') assert.equal(snapshot.target.model.id, 'original');
    assert.equal(snapshot.revision, 17);
    assert.notEqual(policy.defaultTarget, policy.categories.deep?.mode === 'target' ? policy.categories.deep.target : undefined);
    if (policy.defaultTarget.model.mode === 'explicit') policy.defaultTarget.model.id = 'default-mutation';
    assert.deepEqual(resolveRoutingSnapshot(policy, 'deep').target, {
      executor: 'native', model: { mode: 'explicit', provider: 'p', id: 'original' },
    });
    policy.categories.deep = { mode: 'default' };
    policy.historyLimit = 1;
    assert.equal(snapshot.source, 'category');
    assert.equal(snapshot.historyLimit, 100);
    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.target), true);
    assert.equal(Object.isFrozen(snapshot.target.model), true);
    assert.equal(Reflect.set(snapshot.target.model, 'id', 'tampered'), false);
  });

  it('does not inherit a previous explicit model effort and does not share snapshots', () => {
    const input = { version: 2, defaultTarget: {
      executor: 'native', model: { mode: 'explicit', provider: 'p', id: 'm', reasoningEffort: 'high' },
    } };
    const first = resolveRoutingSnapshot(input, 'deep');
    const second = resolveRoutingSnapshot({ version: 2, defaultTarget: native('next') }, 'deep');
    assert.equal(Object.hasOwn(second.target.model, 'reasoningEffort'), false);
    const third = resolveRoutingSnapshot(input, 'deep');
    assert.notEqual(first, third);
    assert.notEqual(first.target, third.target);
    assert.notEqual(first.target.model, third.target.model);
    assert.equal(Object.hasOwn(second, 'revision'), false);
  });

  it('revalidates potentially mutated typed policies before taking a snapshot', () => {
    const policy = createDefaultRoutingPolicy();
    Reflect.set(policy.categories, 'unknown', { mode: 'default' });
    assert.throws(() => resolveRoutingSnapshot(policy, 'quick'), /invalid category|expected one of/);
  });

  it('validates optional configuration revisions without treating them as authorization', () => {
    for (const revision of [0, 1, Number.MAX_SAFE_INTEGER]) {
      assert.equal(resolveRoutingSnapshot({ version: 2 }, 'quick', revision).revision, revision);
    }
    for (const revision of [-1, 1.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null]) {
      assert.throws(() => resolveRoutingSnapshot({ version: 2 }, 'quick', revision as number), /revision/);
    }
  });
});

describe('V2 exact schema and security boundaries', () => {
  it('rejects unknown and retired category IDs as bindings or requested categories', () => {
    for (const id of [...retired, 'other', ' deep', 'Deep', '', '__proto__', 'constructor', 'prototype']) {
      rejects({ version: 2, categories: { [id]: { mode: 'default' } } });
      assert.throws(() => resolveRoutingSnapshot({ version: 2 }, id), TypeError);
    }
    assert.throws(() => resolveRoutingSnapshot({ version: 2 }, undefined), TypeError);
    rejects({ version: 2, categories: { 'deep-high': { mode: 'default' } } }, /use "deep" explicitly/);
  });

  it('rejects unknown root, binding, target and model fields even if undefined', () => {
    for (const key of ['routes', 'rules', 'roles', 'defaultRoute', 'stateDir', 'extra']) {
      rejects({ version: 2, [key]: undefined }, /unknown field/);
    }
    for (const model of [
      { mode: 'inherit', id: undefined },
      { mode: 'explicit', provider: 'p', id: 'm', extra: undefined },
    ]) rejects({ version: 2, defaultTarget: { executor: 'native', model } }, /unknown field/);
    rejects({ version: 2, defaultTarget: { ...native(), extra: true } }, /unknown field/);
    rejects({ version: 2, categories: { quick: { mode: 'default', target: native() } } }, /unknown field/);
    rejects({ version: 2, categories: { quick: { mode: 'target', target: native(), priority: 1 } } }, /unknown field/);
  });

  it('rejects incompatible discriminant branches and does not coerce enums', () => {
    const invalid: unknown[] = [
      { executor: 'native', model: { mode: 'executor-default' } },
      { executor: 'codex', model: { mode: 'inherit' } },
      { executor: 'native', model: { mode: 'explicit', id: 'm' } },
      { executor: 'cursor', model: { mode: 'explicit', provider: 'p', id: 'm' } },
      { executor: 'agy', model: { mode: 'executor-default', reasoningEffort: 'high' } },
      { executor: 'native', model: { mode: 'inherit', reasoningEffort: 'high' } },
      { executor: 'other', model: { mode: 'executor-default' } },
      { executor: ' codex ', model: { mode: 'executor-default' } },
      { executor: 'native', model: { mode: ' explicit ', provider: 'p', id: 'm' } },
      { executor: 'native', model: { mode: 'default' } },
      { executor: 'native' }, {},
    ];
    for (const value of invalid) assert.throws(() => parseTarget(value), TypeError);
    for (const value of [{ mode: 'target' }, { mode: 'other' }, { mode: ' default ' }, {}]) {
      rejects({ version: 2, categories: { quick: value } });
    }
  });

  it('rejects empty or non-string IDs and efforts without coercion', () => {
    for (const value of ['', ' \t\n', null, 0, false, {}, [], Symbol('id')]) {
      for (const field of ['id', 'provider', 'reasoningEffort']) {
        assert.throws(() => parseTarget({ executor: 'native', model: {
          mode: 'explicit', provider: 'p', id: 'm', [field]: value,
        } }), TypeError);
      }
    }
  });

  it('accepts history endpoints but rejects fractional, unsafe and nonnumeric limits', () => {
    for (const historyLimit of [1, 100, 1000]) {
      assert.equal(parseRoutingPolicy({ version: 2, historyLimit }).historyLimit, historyLimit);
    }
    for (const historyLimit of [0, -1, 1001, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '100', null, undefined]) {
      rejects({ version: 2, historyLimit }, /historyLimit/);
    }
  });

  it('never resets present malformed data to defaults', () => {
    for (const value of [null, undefined, false, [], 'value']) {
      rejects({ version: 2, defaultTarget: value });
      rejects({ version: 2, categories: value });
      rejects({ version: 2, categories: { quick: value } });
    }
  });

  it('rejects non-plain objects at every parsed boundary', () => {
    for (const value of [[], new Date(), new Map(), /pattern/, Object.create({ inherited: true }), new (class Example {})()]) {
      for (const wrap of boundaries) rejects(wrap(value), /plain object/);
    }
  });

  it('rejects getters and setters at every boundary without invoking them', () => {
    let invoked = 0;
    for (const wrap of boundaries) {
      for (const enumerable of [true, false]) {
        const value = Object.defineProperty({}, 'field', {
          enumerable,
          get() { invoked += 1; throw new Error('getter must never execute'); },
        });
        rejects(wrap(value), /data property/);
        const setter = Object.defineProperty({}, 'field', { set() { invoked += 1; } });
        rejects(wrap(setter), /data property/);
      }
    }
    assert.equal(invoked, 0);
  });

  it('rejects prototype pollution keys and symbols at all object boundaries', () => {
    for (const wrap of boundaries) {
      for (const key of ['__proto__', 'prototype', 'constructor']) rejects(wrap(poison(key)), /unsafe key/);
      rejects(wrap({ [Symbol('field')]: true }), /symbol fields/);
    }
    assert.equal(Object.hasOwn(Object.prototype, 'polluted'), false);
  });

  it('does not discard non-enumerable fields, including unknown ones', () => {
    rejects(Object.defineProperty({ version: 2 }, 'hidden', { value: undefined }), /unknown field/);
    const source = Object.defineProperty({}, 'version', { value: 2 });
    assert.equal(parseRoutingPolicy(source).version, 2);
    const model = Object.defineProperty({ mode: 'inherit' }, 'hidden', { value: true });
    rejects({ version: 2, defaultTarget: { executor: 'native', model } }, /unknown field/);
  });

  it('rejects inherited malicious getters without reading them', () => {
    let invoked = false;
    const prototype = Object.defineProperty({}, 'version', {
      get() { invoked = true; throw new Error('must not read inherited value'); },
    });
    rejects(Object.create(prototype), /plain object/);
    assert.equal(invoked, false);
  });
});
