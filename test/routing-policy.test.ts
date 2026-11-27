import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BUILTINS, BUILTIN_GROUPS, BUILTIN_IDS, BUILTIN_LIST, CLASSIC7_IDS, CUSTOM_CATEGORY_TEMPLATES,
  CUSTOM_ID_PATTERN, MAX_CUSTOM_CATEGORIES, generateCustomCategoryId, getBuiltinCategory, isBuiltinId,
} from '../src/core/categories.ts';
import { createDefaultRoutingConfig, parseBinding, parseRoutingConfig, parseTarget, routingConfigFingerprint } from '../src/core/routing-policy.ts';
import type { CustomCategory } from '../src/core/routing-policy.ts';

const target = { mode: 'explicit', provider: 'p', model: 'm' } as const;
const custom = (id = 'custom-evidence'): CustomCategory => ({ id, name: 'Evidence', purpose: 'Verify sources.', enabled: true, proactive: false, binding: { mode: 'default' } });
const rejectConfig = (value: unknown, expected: typeof TypeError | RegExp = TypeError) => assert.throws(() => parseRoutingConfig(value), expected);

it('defines 13 ordered bilingual categories, classic subset and four template cards', () => {
  assert.deepEqual(BUILTIN_IDS, ['visual-engineering', 'frontend-engineering', 'backend-data', 'deep', 'debugging', 'code-review',
    'verification-automation', 'ultrabrain', 'artistry', 'writing', 'scout', 'quick', 'unspecified']);
  assert.equal(BUILTINS.scout.group, 'analysis');
  assert.deepEqual(BUILTIN_LIST.filter(c => !c.defaultEnabled).map(c => c.id), ['scout']);
  assert.deepEqual(Object.keys(BUILTIN_GROUPS), ['implementation', 'quality', 'analysis', 'general']);
  assert.deepEqual(Object.values(BUILTIN_GROUPS).map(({ zh, en }) => [zh, en]), [
    ['产品与工程实现', 'Product & engineering'], ['质量与交付', 'Quality & delivery'],
    ['分析与表达', 'Analysis & expression'], ['通用与兜底', 'General & fallback'],
  ]);
  assert.deepEqual(BUILTIN_LIST.map(entry => entry.id), BUILTIN_IDS);
  assert.deepEqual(CLASSIC7_IDS, ['visual-engineering', 'deep', 'ultrabrain', 'artistry', 'writing', 'quick', 'unspecified']);
  assert.deepEqual(BUILTIN_LIST.filter(entry => !entry.proactive).map(entry => entry.id), ['quick', 'unspecified']);
  for (const id of BUILTIN_IDS) {
    const category = getBuiltinCategory(id);
    assert.equal(category, BUILTINS[id]); assert.ok(isBuiltinId(id));
    for (const locale of [category.en, category.zh]) {
      assert.ok(Object.isFrozen(locale));
      assert.deepEqual(Object.keys(locale), ['name', 'purpose', 'shortPurpose', 'avoid', 'example', 'deliverableCheck']);
      for (const value of Object.values(locale)) assert.match(value, /^[^\r\n]+$/);
    }
  }
  for (const id of ['Deep', ' deep', '__proto__', 'constructor', 'deep-high', undefined, Symbol(), { toString() { throw Error('coercion'); } }]) {
    assert.equal(isBuiltinId(id), false); assert.throws(() => getBuiltinCategory(id), TypeError);
  }
  assert.deepEqual(CUSTOM_CATEGORY_TEMPLATES.map(x => x.templateId), ['evidence-check', 'security-audit', 'data-eval', 'safe-migration']);
  for (const card of CUSTOM_CATEGORY_TEMPLATES) {
    assert.equal(card.suggestedId, `custom-${card.templateId}`);
    assert.deepEqual(Object.keys(card.en), ['name', 'purpose', 'avoid', 'example', 'nearBuiltin']);
    assert.deepEqual(Object.keys(card.zh), Object.keys(card.en));
    assert.ok(Object.isFrozen(card.en));
  }
});

it('generates ASCII slugs with deterministic fallback, collisions and length bounds', () => {
  assert.equal(generateCustomCategoryId('证据核验'), 'custom-cat-1');
  assert.equal(generateCustomCategoryId('证据核验', ['custom-cat-1', 'custom-cat-2']), 'custom-cat-3');
  assert.equal(generateCustomCategoryId('Audit & Verify 中文'), 'custom-audit-verify');
  assert.equal(generateCustomCategoryId('Audit & Verify 中文', ['custom-audit-verify']), 'custom-audit-verify-1');
  for (const name of ['X', '000', '🧪', 'a---b', 'r'.repeat(200), `${'r'.repeat(30)}-suffix`]) {
    const ids = new Set<string>();
    for (let n = 0; n < 17; n++) {
      const id = generateCustomCategoryId(name, ids);
      assert.ok(CUSTOM_ID_PATTERN.test(id) && id.length >= 8 && id.length <= 40);
      assert.ok(!ids.has(id)); ids.add(id);
    }
  }
});

describe('V3 strict parsing and fingerprint', () => {
  it('defaults omitted top-level fields only, validates version, and detaches views', () => {
    const a = createDefaultRoutingConfig(); const b = createDefaultRoutingConfig();
    assert.deepEqual(a, b); assert.deepEqual(parseRoutingConfig({ version: 3 }), { ...a, builtins: {} });
    assert.deepEqual(parseRoutingConfig(a), a);
    assert.deepEqual(a, { version: 3, defaultTarget: { mode: 'inherit' }, behavior: { guidance: true, delegationMode: 'passive', strict: false }, builtins: { scout: { enabled: true } }, custom: [], historyLimit: 100 });
    a.behavior.strict = true; a.builtins.deep = { enabled: false }; a.custom.push(custom());
    assert.equal(b.behavior.strict, false); assert.deepEqual(b.builtins, { scout: { enabled: true } }); assert.deepEqual(b.custom, []);
    for (const input of [undefined, null, {}, { version: 1 }, { version: 2 }, { version: '3' }]) rejectConfig(input);
    for (const key of ['defaultTarget', 'behavior', 'builtins', 'custom', 'historyLimit']) {
      rejectConfig({ version: 3, [key]: null }); rejectConfig({ version: 3, [key]: undefined });
    }
    for (const key of ['policyV2', 'routes', 'rules', 'roles', 'categories', 'stateDir']) rejectConfig({ version: 3, [key]: undefined }, /unknown field/);
  });
  it('normalizes only redundant overrides and validates exact bindings/targets', () => {
    const config = parseRoutingConfig({ version: 3, builtins: {
      writing: {}, quick: { enabled: true, binding: { mode: 'default' } },
      deep: { enabled: false, binding: { mode: 'default' } }, artistry: { enabled: true, binding: target },
    } });
    assert.deepEqual(config.builtins, { deep: { enabled: false }, artistry: { binding: target } });
    assert.notEqual(config.builtins.artistry?.binding, target);
    const old = parseRoutingConfig({ version: 3, builtins: { scout: { enabled: false, binding: target } } });
    assert.deepEqual(old.builtins, { scout: { binding: target } });
    assert.deepEqual(parseRoutingConfig(old), old);
    assert.equal(routingConfigFingerprint(old), routingConfigFingerprint({ ...old, builtins: { scout: { enabled: false, binding: target } } }));
    assert.notEqual(routingConfigFingerprint(old), routingConfigFingerprint({ ...old, builtins: { scout: { enabled: true, binding: target } } }));
    assert.deepEqual(parseTarget({ ...target, provider: ' p ', model: ' m ', reasoningEffort: ' high ' }), { ...target, reasoningEffort: 'high' });
    assert.deepEqual(parseBinding({ mode: 'default' }), { mode: 'default' });
    assert.deepEqual(parseBinding({ mode: 'inherit' }), { mode: 'inherit' });
    for (const invalid of [null, {}, { mode: ' default ' }, { mode: 'target', target }, { ...target, id: 'x' }, { mode: 'inherit', reasoningEffort: 'high' }]) {
      assert.throws(() => parseTarget(invalid), TypeError); assert.throws(() => parseBinding(invalid), TypeError);
    }
    assert.throws(() => parseTarget({ mode: 'default' }), TypeError);
    for (const key of ['Deep', 'deep ', 'deep-high', 'custom-test']) rejectConfig({ version: 3, builtins: { [key]: {} } }, /unknown builtin/);
    for (const value of [true, { enabled: undefined }, { enabled: 'false' }, { binding: null }, { binding: undefined }]) {
      rejectConfig({ version: 3, builtins: { writing: value } });
    }
  });
  it('validates Unicode code point lengths and rejects controls before trim', () => {
    for (const [field, limit] of [['provider', 128], ['model', 128], ['reasoningEffort', 48]] as const) {
      assert.equal((parseTarget({ ...target, [field]: '🧪'.repeat(limit) }) as typeof target)[field], '🧪'.repeat(limit));
      assert.throws(() => parseTarget({ ...target, [field]: '🧪'.repeat(limit + 1) }));
      for (const value of ['', '   ', null, false, 'line\n', '\tleading', 'a\u0085b', 'a\u2028b', 'a\u2029b', '\u200fA', 'X\u202e', 'X\u2069']) {
        assert.throws(() => parseTarget({ ...target, [field]: value }), TypeError);
      }
    }
    for (const [field, limit] of [['name', 40], ['purpose', 120], ['avoid', 80]] as const) {
      assert.equal(parseRoutingConfig({ version: 3, custom: [{ ...custom(), [field]: '🧪'.repeat(limit) }] }).custom[0]![field], '🧪'.repeat(limit));
      for (const value of ['🧪'.repeat(limit + 1), '', ' ', undefined, null, 'line\r', '\u2066rtl']) {
        rejectConfig({ version: 3, custom: [{ ...custom(), [field]: value }] });
      }
    }
  });
  it('bounds custom IDs, uniqueness, array contents and history', () => {
    assert.equal(MAX_CUSTOM_CATEGORIES, 8);
    for (const id of ['custom-a', `custom-${'z'.repeat(33)}`]) assert.equal(parseRoutingConfig({ version: 3, custom: [custom(id)] }).custom[0]!.id, id);
    for (const id of ['custom-a\n', 'custom-a-', 'custom-9abc', 'custom-A', 'custom-中文', `custom-${'x'.repeat(34)}`, 'quick']) {
      rejectConfig({ version: 3, custom: [custom(id)] }, /custom category ID/);
    }
    rejectConfig({ version: 3, custom: [custom(), custom()] }, /duplicate/);
    const entries = Array.from({ length: 9 }, (_, index) => custom(`custom-cat-${index}`));
    assert.equal(parseRoutingConfig({ version: 3, custom: entries.slice(0, 8) }).custom.length, 8);
    rejectConfig({ version: 3, custom: entries }, /at most 8/);
    for (const candidate of [new Array(1), Object.assign([custom()], { extra: true }), Object.assign([custom()], { [Symbol()]: 1 }), new (class extends Array {})()]) {
      rejectConfig({ version: 3, custom: candidate });
    }
    for (const historyLimit of [1, 1000]) assert.equal(parseRoutingConfig({ version: 3, historyLimit }).historyLimit, historyLimit);
    for (const historyLimit of [0, 1001, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '100']) rejectConfig({ version: 3, historyLimit }, /historyLimit/);
  });
  it('rejects unsafe keys, symbols, extra hidden fields, getters and prototypes at every boundary', () => {
    let called = false;
    const getter = { get() { called = true; throw new Error('never invoke the getter'); } };
    const contexts: Array<[string, (value: unknown) => unknown]> = [
      ['version', x => x], ['mode', x => ({ version: 3, defaultTarget: x })],
      ['guidance', x => ({ version: 3, behavior: x })], ['quick', x => ({ version: 3, builtins: x })],
      ['enabled', x => ({ version: 3, builtins: { quick: x } })], ['mode', x => ({ version: 3, builtins: { quick: { binding: x } } })],
      ['name', x => ({ version: 3, custom: [x] })], ['mode', x => ({ version: 3, custom: [{ ...custom(), binding: x }] })],
    ];
    for (const [firstField, wrap] of contexts) {
      for (const key of ['__proto__', 'prototype', 'constructor']) rejectConfig(wrap(Object.defineProperty({}, key, { value: 1 })), /unsafe key/);
      rejectConfig(wrap({ [Symbol()]: true }), /symbol fields/);
      rejectConfig(wrap(Object.defineProperty({}, firstField, getter)), /own data property/);
      rejectConfig(wrap(Object.create(Object.defineProperty({}, firstField, getter))), /plain object/);
      rejectConfig(wrap(new Date()), /plain object/);
    }
    rejectConfig({ version: 3, custom: Object.defineProperty([custom()], 0, getter) }, /own data property/);
    rejectConfig(Object.defineProperty({ version: 3 }, 'hidden', { value: true }), /unknown field/);
    assert.deepEqual(parseRoutingConfig(Object.freeze(Object.assign(Object.create(null), { version: 3 }))), parseRoutingConfig({ version: 3 }));
    assert.equal(called, false);
  });
  it('fingerprints all effective settings canonically, independent of input ordering', () => {
    const base = { version: 3, builtins: { deep: { binding: target }, quick: {} }, custom: [custom('custom-z'), custom('custom-a')] };
    const reordered = { custom: [...base.custom].reverse(), builtins: { quick: { enabled: true, binding: { mode: 'default' } }, deep: { binding: target } }, version: 3 };
    const fingerprint = routingConfigFingerprint(base);
    assert.equal(fingerprint, routingConfigFingerprint(reordered));
    assert.equal(JSON.parse(fingerprint).builtins.length, 12); // Original V3 canonical shape (no scout override).
    assert.equal(JSON.parse(routingConfigFingerprint(createDefaultRoutingConfig())).builtins.length, 13);
    for (const update of [
      { defaultTarget: target }, { historyLimit: 1 }, { behavior: { guidance: false, strict: false, delegationMode: 'passive' } },
      { builtins: { deep: { binding: target }, quick: { enabled: false } } },
      { custom: [custom('custom-z'), { ...custom('custom-a'), proactive: true }] },
    ]) assert.notEqual(fingerprint, routingConfigFingerprint({ ...base, ...update }));
  });
});
