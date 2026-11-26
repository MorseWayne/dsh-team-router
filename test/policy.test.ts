import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decide, parseConfig } from '../src/core/policy.ts';
import type { NormalizedConfig, Route, RouterConfig } from '../src/core/policy.ts';

const route = (model: string): Route => ({ provider: 'test-provider', model });

function fixture(): RouterConfig {
  return {
    routes: {
      manual: route('manual-model'),
      task: route('task-model'),
      role: route('role-model'),
      fallback: route('fallback-model'),
    },
    rules: [{ id: 'task-rule', keywords: ['review', '审查'], route: 'task' }],
    roles: { Reviewer: 'role' },
    defaultRoute: 'fallback',
  };
}

function matchingConfig(keyword: string): NormalizedConfig {
  return parseConfig({
    routes: { match: route('match-model') },
    rules: [{ id: 'match-rule', keywords: [keyword], route: 'match' }],
  });
}

function assertRejected(input: unknown, pattern?: RegExp): void {
  if (pattern === undefined) assert.throws(() => parseConfig(input), TypeError);
  else assert.throws(() => parseConfig(input), pattern);
}

describe('configuration normalization', () => {
  it('normalizes absent collections and history limit', () => {
    const result = parseConfig({ routes: {} });
    assert.deepEqual(result.rules, []);
    assert.deepEqual(Object.keys(result.routes), []);
    assert.deepEqual(Object.keys(result.roles), []);
    assert.equal(Object.getPrototypeOf(result.routes), null);
    assert.equal(Object.getPrototypeOf(result.roles), null);
    assert.equal(result.historyLimit, 100);
    assert.equal(Object.hasOwn(result, 'defaultRoute'), false);
    assert.deepEqual(decide(result, { memberName: 'anyone' }), { source: 'inherit' });
  });

  it('treats explicitly undefined optional fields as absent', () => {
    const result = parseConfig({
      routes: { base: { ...route('base'), reasoningEffort: undefined } },
      rules: undefined,
      roles: undefined,
      defaultRoute: undefined,
      historyLimit: undefined,
    });
    assert.equal(result.historyLimit, 100);
    assert.deepEqual(result.rules, []);
    assert.equal(Object.hasOwn(result.routes.base, 'reasoningEffort'), false);
  });

  it('trims route fields, names, references, rule ids, and keywords', () => {
    const result = parseConfig({
      routes: { ' base ': { provider: ' provider ', model: '\tmodel\n', reasoningEffort: ' high ' } },
      rules: [{ id: ' keyword-rule ', keywords: [' Review ', '\t审查 '], route: ' base ' }],
      roles: { ' Reviewer ': ' base ' },
      defaultRoute: ' base ',
    });
    assert.deepEqual(result.routes.base, { provider: 'provider', model: 'model', reasoningEffort: 'high' });
    assert.deepEqual(result.rules, [
      { id: 'keyword-rule', keywords: ['Review', '审查'], route: 'base', priority: 0 },
    ]);
    assert.equal(result.roles[' Reviewer '], 'base');
    assert.equal(result.defaultRoute, 'base');
    assert.equal(decide(result, { memberName: ' Reviewer ', manualRoute: ' base ' }).source, 'manual');
  });

  it('accepts plain null-prototype input records', () => {
    const routes = Object.assign(Object.create(null), { base: Object.assign(Object.create(null), route('base')) });
    const roles = Object.assign(Object.create(null), { Reviewer: 'base' });
    const source = Object.assign(Object.create(null), { routes, roles });
    assert.equal(decide(parseConfig(source), { memberName: 'Reviewer' }).routeName, 'base');
  });

  it('permits an empty keyword collection without matching it', () => {
    const result = parseConfig({
      routes: { base: route('base') },
      rules: [{ id: 'disabled', keywords: [], route: 'base' }],
    });
    assert.deepEqual(decide(result, { memberName: 'anyone', taskText: 'anything' }), { source: 'inherit' });
  });
});

describe('routing precedence and stable priorities', () => {
  it('gives a valid manual route precedence over every other source', () => {
    const result = decide(parseConfig(fixture()), {
      memberName: 'Reviewer', taskText: 'review this', manualRoute: 'manual',
    });
    assert.deepEqual(result, {
      source: 'manual', routeName: 'manual', route: route('manual-model'),
    });
    assert.equal(Object.hasOwn(result, 'ruleId'), false);
  });

  it('gives task matches precedence over role and default', () => {
    assert.deepEqual(decide(parseConfig(fixture()), { memberName: 'Reviewer', taskText: 'Please REVIEW this' }), {
      source: 'task', routeName: 'task', route: route('task-model'), ruleId: 'task-rule',
    });
  });

  it('uses exact role mapping before the default', () => {
    const result = parseConfig(fixture());
    assert.equal(decide(result, { memberName: 'Reviewer', taskText: 'nothing relevant' }).source, 'role');
    assert.equal(decide(result, { memberName: 'reviewer' }).source, 'default');
    assert.equal(decide(result, { memberName: ' Reviewer' }).source, 'default');
    assert.equal(decide(result, { memberName: 'Reviewer ' }).source, 'default');
  });

  it('does not trim member names when matching role keys', () => {
    const config = parseConfig({ routes: { base: route('base') }, roles: { ' Reviewer ': 'base' } });
    assert.equal(decide(config, { memberName: ' Reviewer ' }).source, 'role');
    assert.equal(decide(config, { memberName: 'Reviewer' }).source, 'inherit');
  });

  it('uses default route when nothing else matches', () => {
    assert.deepEqual(decide(parseConfig(fixture()), { memberName: 'Unknown', taskText: 'specialist' }), {
      source: 'default', routeName: 'fallback', route: route('fallback-model'),
    });
  });

  it('inherits without a default or matching source', () => {
    const source = fixture();
    delete source.defaultRoute;
    assert.deepEqual(decide(parseConfig(source), { memberName: 'Unknown', taskText: 'unrelated' }), {
      source: 'inherit',
    });
  });

  it('rejects invalid manual routes rather than silently falling back', () => {
    const config = parseConfig(fixture());
    for (const manualRoute of ['missing', '', '   ', '__proto__', 'constructor', 'prototype']) {
      assert.throws(() => decide(config, { memberName: 'Reviewer', taskText: 'review', manualRoute }), TypeError);
    }
    assert.throws(() => decide(config, {
      memberName: 'Reviewer', manualRoute: null as unknown as string,
    }), TypeError);
  });

  it('chooses descending numeric priority and leaves config order untouched', () => {
    const config = parseConfig({
      routes: { low: route('low'), high: route('high') },
      rules: [
        { id: 'low', keywords: ['review'], route: 'low', priority: -1000 },
        { id: 'high', keywords: ['review'], route: 'high', priority: 1000 },
        { id: 'medium', keywords: ['review'], route: 'low' },
      ],
    });
    const before = structuredClone(config.rules);
    const decision = decide(config, { memberName: '', taskText: 'review' });
    assert.equal(decision.routeName, 'high');
    assert.equal(decision.ruleId, 'high');
    assert.deepEqual(config.rules, before);
  });

  it('breaks equal-priority ties by original config order, not rule id', () => {
    const config = parseConfig({
      routes: { first: route('first'), second: route('second') },
      rules: [
        { id: 'z-first', keywords: ['review'], route: 'first', priority: 7 },
        { id: 'a-second', keywords: ['review'], route: 'second', priority: 7 },
      ],
    });
    assert.equal(decide(config, { memberName: 'anyone', taskText: 'review' }).routeName, 'first');
    config.rules.reverse();
    assert.equal(decide(config, { memberName: 'anyone', taskText: 'review' }).routeName, 'second');
  });

  it('does not let a high-priority non-match mask lower-priority matches', () => {
    const config = parseConfig({
      routes: { yes: route('yes'), no: route('no') },
      rules: [
        { id: 'non-match', keywords: ['other'], route: 'no', priority: 1000 },
        { id: 'match', keywords: ['review'], route: 'yes', priority: -1000 },
      ],
    });
    assert.equal(decide(config, { memberName: '', taskText: 'review' }).routeName, 'yes');
  });

  it('does not apply any short-task heuristic to empty, whitespace, or short text', () => {
    const config = parseConfig(fixture());
    for (const taskText of [undefined, '', ' ', '\t\n', 'hi']) {
      assert.equal(decide(config, { memberName: 'Reviewer', taskText }).source, 'role');
      assert.equal(decide(config, { memberName: 'Unknown', taskText }).source, 'default');
    }
    assert.equal(decide(matchingConfig('go'), { memberName: '', taskText: 'go' }).source, 'task');
  });
});

describe('literal keyword matching', () => {
  it('matches any keyword case-insensitively', () => {
    const config = parseConfig(fixture());
    for (const taskText of ['REVIEW', 'please Review this', '请审查代码']) {
      assert.equal(decide(config, { memberName: '', taskText }).source, 'task', taskText);
    }
  });

  it('requires both ASCII word boundaries for pure ASCII word keywords', () => {
    const config = matchingConfig('list');
    for (const taskText of ['list', 'LIST!', '(list)', 'a list of items', '清单list项目', 'list-list']) {
      assert.equal(decide(config, { memberName: '', taskText }).source, 'task', taskText);
    }
    for (const taskText of ['specialist', 'listing', 'blacklist', '_list', 'list_', 'list2', '2list', 'xlistx']) {
      assert.equal(decide(config, { memberName: '', taskText }).source, 'inherit', taskText);
    }
  });

  it('checks later occurrences after an initial boundary failure', () => {
    assert.equal(decide(matchingConfig('list'), {
      memberName: '', taskText: 'specialist listing, then LIST.',
    }).source, 'task');
  });

  it('treats ASCII digits and underscores as word characters', () => {
    const config = matchingConfig('v2_plan');
    assert.equal(decide(config, { memberName: '', taskText: 'V2_PLAN!' }).source, 'task');
    assert.equal(decide(config, { memberName: '', taskText: 'v2_planning' }).source, 'inherit');
    assert.equal(decide(config, { memberName: '', taskText: 'xv2_plan' }).source, 'inherit');
  });

  it('uses substring matching for CJK and mixed non-ASCII keywords', () => {
    assert.equal(decide(matchingConfig('分析'), { memberName: '', taskText: '请分析代码' }).source, 'task');
    assert.equal(decide(matchingConfig('模型v2'), { memberName: '', taskText: '新模型V2测试' }).source, 'task');
    assert.equal(decide(matchingConfig('café'), { memberName: '', taskText: 'CAFÉTERIA' }).source, 'task');
  });

  it('treats regex metacharacters as literal text, never executable patterns', () => {
    for (const keyword of ['.*', '[abc]', '(a+)+$', '\\d+', 'a|b', 'c++', '^start$', 'x{2}', 'foo.bar', 'a?']) {
      const config = matchingConfig(keyword);
      assert.equal(decide(config, { memberName: '', taskText: `before ${keyword} after` }).source, 'task', keyword);
      assert.equal(decide(config, { memberName: '', taskText: 'unrelated normal text' }).source, 'inherit', keyword);
    }
    assert.equal(decide(matchingConfig('a.b'), { memberName: '', taskText: 'axb' }).source, 'inherit');
    assert.equal(decide(matchingConfig('(a+)+$'), { memberName: '', taskText: `${'a'.repeat(100_000)}!` }).source, 'inherit');
  });
});

describe('strict configuration validation', () => {
  it('requires a plain config and a routes record', () => {
    for (const input of [undefined, null, true, 1, 'config', [], new Date(), {}, { routes: undefined }, { routes: null }, { routes: [] }]) {
      assertRejected(input);
    }
    assertRejected(Object.assign(Object.create({ inherited: true }), { routes: {} }), /plain object/);
  });

  it('rejects unknown root, route, and rule fields', () => {
    assertRejected({ routes: {}, extra: true }, /unknown field/);
    assertRejected({ routes: { base: { ...route('base'), extra: true } } }, /unknown field/);
    assertRejected({
      routes: { base: route('base') },
      rules: [{ id: 'rule', keywords: ['x'], route: 'base', extra: true }],
    }, /unknown field/);
    assertRejected({ routes: {}, unknownEvenIfUndefined: undefined }, /unknown field/);
  });

  it('checks non-enumerable and symbol fields instead of silently discarding them', () => {
    const source = { routes: {} };
    Object.defineProperty(source, 'hidden', { value: true });
    assertRejected(source, /unknown field/);
    assertRejected({ routes: {}, [Symbol('hidden')]: true }, /symbol fields/);
    assertRejected({ routes: { base: { ...route('base'), [Symbol('hidden')]: true } } }, /symbol fields/);
  });

  it('rejects accessors without invoking them', () => {
    let invoked = false;
    const source = {};
    Object.defineProperty(source, 'routes', {
      enumerable: true,
      get() { invoked = true; throw new Error('must never run'); },
    });
    assertRejected(source, /data property/);
    assert.equal(invoked, false);
    const entry = { provider: 'provider' };
    Object.defineProperty(entry, 'model', {
      get() { invoked = true; return 'model'; },
    });
    assertRejected({ routes: { base: entry } }, /data property/);
    assert.equal(invoked, false);
  });

  it('rejects missing, non-string, or blank route fields', () => {
    for (const entry of [null, [], 'route', {}, { provider: 'p' }, { model: 'm' },
      { provider: 1, model: 'm' }, { provider: 'p', model: false },
      { provider: '', model: 'm' }, { provider: 'p', model: '\t ' },
      { provider: 'p', model: 'm', reasoningEffort: '' },
      { provider: 'p', model: 'm', reasoningEffort: null }]) {
      assertRejected({ routes: { base: entry } });
    }
    assertRejected({ routes: { ' ': route('base') } }, /empty/);
    assertRejected({ routes: { base: route('one'), ' base ': route('two') } }, /duplicate/);
  });

  it('requires well-formed rules and nonempty string ids and keywords', () => {
    const base = { routes: { base: route('base') } };
    for (const rules of [null, {}, 'rules', [null], [[]], [{}],
      [{ id: '', keywords: ['x'], route: 'base' }],
      [{ id: 'x', route: 'base' }],
      [{ id: 'x', keywords: 'x', route: 'base' }],
      [{ id: 'x', keywords: [''], route: 'base' }],
      [{ id: 'x', keywords: [' \n'], route: 'base' }],
      [{ id: 'x', keywords: [1], route: 'base' }],
      [{ id: 'x', keywords: ['x'] }]]) {
      assertRejected({ ...base, rules });
    }
  });

  it('rejects duplicate rule ids after trimming', () => {
    assertRejected({
      routes: { base: route('base') },
      rules: [
        { id: 'same', keywords: ['a'], route: 'base' },
        { id: ' same ', keywords: ['b'], route: 'base' },
      ],
    }, /duplicate rule id/);
  });

  it('requires defined route references everywhere', () => {
    const routes = { base: route('base') };
    assertRejected({ routes, defaultRoute: 'missing' }, /unknown route/);
    assertRejected({ routes, roles: { Member: 'missing' } }, /unknown route/);
    assertRejected({ routes, rules: [{ id: 'x', keywords: ['x'], route: 'missing' }] }, /unknown route/);
    for (const value of ['', '   ', null, 1]) {
      assertRejected({ routes, defaultRoute: value });
      assertRejected({ routes, roles: { Member: value } });
      assertRejected({ routes, rules: [{ id: 'x', keywords: ['x'], route: value }] });
    }
  });

  it('requires roles to be a direct member-name to route-name dictionary', () => {
    for (const roles of [null, [], 'Reviewer', { Reviewer: { route: 'base' } }, { ' ': 'base' }]) {
      assertRejected({ routes: { base: route('base') }, roles });
    }
  });

  it('rejects sparse arrays, accessors, extra properties, and custom array prototypes', () => {
    const routes = { base: route('base') };
    assertRejected({ routes, rules: new Array(1) }, /missing/);
    assertRejected({ routes, rules: Object.assign([], { extra: true }) }, /array field/);
    assertRejected({ routes, rules: [{ id: 'x', route: 'base', keywords: new Array(1) }] }, /missing/);
    assertRejected({ routes, rules: [{ id: 'x', route: 'base', keywords: Object.assign(['x'], { extra: true }) }] }, /array field/);
    const keywords = ['x'];
    Object.defineProperty(keywords, '0', { get() { throw new Error('must never run'); } });
    assertRejected({ routes, rules: [{ id: 'x', route: 'base', keywords }] }, /data property/);
    const rules: unknown[] = [];
    Object.setPrototypeOf(rules, Object.create(Array.prototype));
    assertRejected({ routes, rules }, /array/);
  });
});

describe('configuration bounds', () => {
  it('accepts 64 routes, 64 rules, 32 keywords, and 100-character keywords', () => {
    const routes = Object.fromEntries(Array.from({ length: 64 }, (_, index) => [`r${index}`, route(`m${index}`)]));
    const rules = Array.from({ length: 64 }, (_, index) => ({
      id: `rule${index}`, route: `r${index}`, keywords: Array.from({ length: 32 }, () => 'x'.repeat(100)),
    }));
    const config = parseConfig({ routes, rules });
    assert.equal(Object.keys(config.routes).length, 64);
    assert.equal(config.rules.length, 64);
    assert.equal(config.rules[0].keywords.length, 32);
    assert.equal(config.rules[0].keywords[0].length, 100);
  });

  it('rejects one item or character beyond collection limits', () => {
    assertRejected({ routes: Object.fromEntries(Array.from({ length: 65 }, (_, index) => [`r${index}`, route('m')])) }, /64 routes/);
    const routes = { base: route('base') };
    assertRejected({ routes, rules: Array.from({ length: 65 }, (_, index) => ({ id: `${index}`, keywords: [], route: 'base' })) }, /64 items/);
    assertRejected({ routes, rules: [{ id: 'x', keywords: Array(33).fill('x'), route: 'base' }] }, /32 items/);
    assertRejected({ routes, rules: [{ id: 'x', keywords: ['x'.repeat(101)], route: 'base' }] }, /100 characters/);
  });

  it('accepts history limits exactly at both bounds', () => {
    for (const historyLimit of [1, 1000]) {
      assert.equal(parseConfig({ routes: {}, historyLimit }).historyLimit, historyLimit);
    }
  });

  it('rejects invalid, noninteger, nonfinite, or coerced history limits', () => {
    for (const historyLimit of [0, -1, 1001, 1.5, NaN, Infinity, -Infinity, '100', null, true]) {
      assertRejected({ routes: {}, historyLimit }, /finite integer/);
    }
  });

  it('accepts priority bounds and defaults missing priority to zero', () => {
    const config = parseConfig({
      routes: { base: route('base') },
      rules: [
        { id: 'min', keywords: [], route: 'base', priority: -1000 },
        { id: 'max', keywords: [], route: 'base', priority: 1000 },
        { id: 'default', keywords: [], route: 'base' },
      ],
    });
    assert.deepEqual(config.rules.map((entry) => entry.priority), [-1000, 1000, 0]);
  });

  it('rejects invalid, noninteger, nonfinite, or coerced priorities', () => {
    for (const priority of [-1001, 1001, 0.5, NaN, Infinity, -Infinity, '1', null, true]) {
      assertRejected({
        routes: { base: route('base') },
        rules: [{ id: 'x', keywords: ['x'], route: 'base', priority }],
      }, /finite integer/);
    }
  });
});

describe('mutation isolation and prototype safety', () => {
  it('detaches all normalized nested collections and route objects from source', () => {
    const source = fixture();
    source.routes.task.reasoningEffort = 'high';
    const config = parseConfig(source);
    assert.notEqual(config.routes, source.routes);
    assert.notEqual(config.routes.task, source.routes.task);
    assert.notEqual(config.rules, source.rules);
    assert.notEqual(config.rules[0], source.rules![0]);
    assert.notEqual(config.rules[0].keywords, source.rules![0].keywords);
    assert.notEqual(config.roles, source.roles);
    source.routes.task.model = 'mutated';
    source.routes.task.reasoningEffort = 'low';
    source.rules![0].keywords[0] = 'no-longer-review';
    source.rules![0].route = 'manual';
    source.roles!.Reviewer = 'manual';
    source.defaultRoute = 'manual';
    const decision = decide(config, { memberName: 'Reviewer', taskText: 'review' });
    assert.equal(decision.routeName, 'task');
    assert.deepEqual(decision.route, { ...route('task-model'), reasoningEffort: 'high' });
    assert.equal(decide(config, { memberName: 'Reviewer' }).routeName, 'role');
    assert.equal(decide(config, { memberName: 'Other' }).routeName, 'fallback');
  });

  it('does not mutate the original input while normalizing', () => {
    const source = fixture();
    source.routes.task.model = ' task-model ';
    source.rules![0].id = ' task-rule ';
    const before = structuredClone(source);
    parseConfig(source);
    assert.deepEqual(source, before);
  });

  it('isolates repeated parses, previous decisions, and returned routes', () => {
    const source = fixture();
    const first = parseConfig(source);
    const second = parseConfig(source);
    first.routes.manual.model = 'changed-only-first';
    first.rules[0].keywords.push('first-only');
    first.roles.NewMember = 'manual';
    assert.equal(second.routes.manual.model, 'manual-model');
    assert.deepEqual(second.rules[0].keywords, ['review', '审查']);
    assert.equal(Object.hasOwn(second.roles, 'NewMember'), false);
    assert.equal(source.routes.manual.model, 'manual-model');
    const decision = decide(second, { memberName: '', manualRoute: 'manual' });
    assert.notEqual(decision.route, second.routes.manual);
    decision.route!.model = 'changed-decision';
    assert.equal(second.routes.manual.model, 'manual-model');
    const next = decide(second, { memberName: '', manualRoute: 'manual' });
    assert.equal(next.route!.model, 'manual-model');
    assert.notEqual(next.route, decision.route);
    second.routes.manual.model = 'changed-config';
    assert.equal(next.route!.model, 'manual-model');
  });

  it('does not mutate frozen configs or decision inputs', () => {
    const config = parseConfig(fixture());
    for (const value of Object.values(config.routes)) Object.freeze(value);
    for (const value of config.rules) { Object.freeze(value.keywords); Object.freeze(value); }
    Object.freeze(config.routes);
    Object.freeze(config.roles);
    Object.freeze(config.rules);
    Object.freeze(config);
    const input = Object.freeze({ memberName: 'Reviewer', taskText: 'review' });
    assert.equal(decide(config, input).source, 'task');
    assert.equal(decide(config, input).source, 'task');
  });

  it('rejects dangerous own keys at root, routes, route entries, rules, and roles', () => {
    for (const key of ['__proto__', 'constructor', 'prototype']) {
      const unsafe = () => Object.fromEntries([[key, 'unsafe']]);
      assertRejected({ routes: {}, ...unsafe() }, /unsafe key/);
      assertRejected({ routes: unsafe() }, /unsafe key/);
      assertRejected({ routes: { base: { ...route('base'), ...unsafe() } } }, /unsafe key/);
      assertRejected({ routes: { base: route('base') }, roles: unsafe() }, /unsafe key/);
      assertRejected({
        routes: { base: route('base') },
        rules: [{ id: 'x', route: 'base', keywords: ['x'], ...unsafe() }],
      }, /unsafe key/);
      assertRejected({ routes: { [` ${key} `]: route('base') } }, /unsafe route name/);
    }
    assert.equal(Object.hasOwn(Object.prototype, 'unsafe'), false);
  });

  it('rejects JSON prototype keys and custom inherited properties', () => {
    assertRejected(JSON.parse('{"routes":{"__proto__":{"provider":"p","model":"m"}}}'), /unsafe key/);
    assertRejected({ routes: { __proto__: { polluted: true } } }, /plain object/);
    const inheritedRoutes = Object.create({ base: route('base') });
    assertRejected({ routes: inheritedRoutes }, /plain object/);
    const inheritedFields = Object.create({ provider: 'p', model: 'm' });
    assertRejected({ routes: { base: inheritedFields } }, /plain object/);
    const inheritedRoles = Object.create({ Reviewer: 'base' });
    assertRejected({ routes: { base: route('base') }, roles: inheritedRoles }, /plain object/);
  });

  it('never resolves inherited route or member names', () => {
    const config = parseConfig({ routes: {} });
    for (const name of ['toString', 'valueOf', 'hasOwnProperty', '__proto__', 'constructor']) {
      assert.deepEqual(decide(config, { memberName: name }), { source: 'inherit' });
      assert.throws(() => decide(config, { memberName: '', manualRoute: name }), TypeError);
      assertRejected({ routes: {}, defaultRoute: name });
      assertRejected({ routes: {}, roles: { Reviewer: name } });
    }
  });

  it('supports safe own names that overlap ordinary Object prototype methods', () => {
    const config = parseConfig({
      routes: { toString: route('safe'), hasOwnProperty: route('also-safe') },
      roles: { valueOf: 'toString', toString: 'hasOwnProperty' },
    });
    assert.equal(decide(config, { memberName: 'valueOf' }).routeName, 'toString');
    assert.equal(decide(config, { memberName: 'toString' }).routeName, 'hasOwnProperty');
    assert.equal(decide(config, { memberName: '', manualRoute: 'toString' }).route!.model, 'safe');
  });
});
