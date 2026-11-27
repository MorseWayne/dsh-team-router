import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUILTIN_IDS } from '../src/core/categories.ts';
import { createDefaultRoutingConfig, routingConfigFingerprint } from '../src/core/routing-policy.ts';
import { RECOMMENDATION_CANDIDATES, RECOMMENDATION_VERSION, previewRecommendations } from '../src/core/recommendations.ts';
import type { ModelCatalog } from '../src/core/recommendations.ts';

function catalog(): ModelCatalog {
  return {
    groups: [
      { id: 'openai', name: 'OpenAI', models: [{ id: 'gpt-5-codex', name: 'Codex' }, { id: 'gpt-5-mini', name: 'Mini' }] },
      { id: 'anthropic', name: 'Anthropic', models: [{ id: 'claude-sonnet-4-5', name: 'Sonnet' }, { id: 'claude-opus-4-1', name: 'Opus' }] },
      { id: 'google', name: 'Google', models: [{ id: 'gemini-2.5-pro', name: 'Pro' }, { id: 'gemini-2.5-flash', name: 'Flash' }] },
      { id: 'deepseek', name: 'DeepSeek', models: [{ id: 'deepseek-chat', name: 'Chat' }, { id: 'deepseek-reasoner', name: 'Reasoner' }] },
    ], failures: [],
  };
}

test('ships a frozen versioned exact manifest with diverse makers for all thirteen categories', () => {
  assert.equal(RECOMMENDATION_VERSION, '2026-11-27.2');
  assert.deepEqual(Object.keys(RECOMMENDATION_CANDIDATES), BUILTIN_IDS);
  assert.ok(Object.isFrozen(RECOMMENDATION_CANDIDATES));
  for (const id of BUILTIN_IDS) {
    const candidates = RECOMMENDATION_CANDIDATES[id];
    assert.ok(Object.isFrozen(candidates) && candidates.every(Object.isFrozen));
    assert.equal(new Set(candidates.slice(0, 3).map(({ model }) => /^(gpt|claude|gemini|deepseek)-/.exec(model)?.[1])).size, 3, id);
  }
});

test('chooses the first exact catalog match, never a substring, alias, failure or unverified reasoning effort', () => {
  const available = catalog();
  available.failures.push({ id: 'google', name: 'Google', message: 'timeout' });
  const result = previewRecommendations(createDefaultRoutingConfig(), available);
  assert.deepEqual(result.changes.map(change => change.category), BUILTIN_IDS);
  assert.deepEqual(result.unavailable, []);
  assert.equal(result.manifestVersion, RECOMMENDATION_VERSION);
  for (const change of result.changes) {
    const expected = RECOMMENDATION_CANDIDATES[change.category].find(entry => entry.provider !== 'google'
      && available.groups.some(group => group.id === entry.provider && group.models.some(model => model.id === entry.model)))!;
    assert.deepEqual(change.after, { mode: 'explicit', provider: expected.provider, model: expected.model });
  }
  const wrong: ModelCatalog = { groups: [
    { id: 'OpenAI', name: 'openai', models: [{ id: 'gpt-5-mini', name: 'gpt-5-mini' }] },
    { id: 'openai', name: 'OpenAI', models: [{ id: 'gpt-5-mini-latest', name: 'gpt-5-mini' }] },
    { id: 'google', name: 'Google', models: [{ id: 'gemini-2.5-pro-preview', name: 'gemini-2.5-pro' }] },
  ], failures: [] };
  assert.deepEqual(previewRecommendations(createDefaultRoutingConfig(), wrong).unavailable, BUILTIN_IDS);
});

test('matches installed subscription adapter IDs by exact native catalog entries', () => {
  const available: ModelCatalog = { groups: [
    { id: 'openai-codex', name: 'Codex subscription', models: ['gpt-6-astra', 'gpt-5.4-mini'].map(id => ({ id, name: id })) },
    { id: 'antigravity', name: 'Antigravity', models: ['gemini-4-argon', 'claude-opus-5-5', 'claude-sonnet-5-5', 'gemini-3.8-flash'].map(id => ({ id, name: id })) },
  ], failures: [] };
  const { config, changes } = previewRecommendations({ version: 3 }, available);
  assert.equal(changes.length, 12); // Saved V3 never opts into scout implicitly.
  assert.equal(config.builtins.scout, undefined);
  assert.deepEqual(config.builtins.ultrabrain?.binding, { mode: 'explicit', provider: 'openai-codex', model: 'gpt-6-astra' });
  assert.deepEqual(config.builtins.deep?.binding, { mode: 'explicit', provider: 'antigravity', model: 'claude-sonnet-5-5' });
});

test('prefers fast models, requests only an exact advertised low effort on fallbacks, and respects manual bindings', () => {
  for (const [provider, model] of [['antigravity-acp', 'gemini-4-hydrogen'], ['openai-codex', 'gpt-6.2-sol']] as const) {
    for (const ids of [[], ['high', 'LOW'], ['high', 'low']]) {
      const available: ModelCatalog = { failures: [], groups: [{ id: provider, name: provider, models: [{ id: model, name: model,
        reasoning: { efforts: ids.map(id => ({ id, name: id })), defaultEffort: 'high' },
      }] }] };
      const config = createDefaultRoutingConfig();
      const manual = { mode: 'explicit', provider, model, reasoningEffort: 'high' } as const;
      config.builtins.scout!.binding = manual;
      assert.deepEqual(previewRecommendations(config, available).config.builtins.scout!.binding, manual);
      const expected = { mode: 'explicit', provider, model, ...(ids.includes('low') ? { reasoningEffort: 'low' } : {}) };
      const preview = previewRecommendations(config, available, { overwrite: true });
      for (const id of ['quick', 'scout'] as const) assert.deepEqual(preview.config.builtins[id]!.binding, expected);
      available.groups.push({ id: 'google', name: 'Google', models: [{ id: 'gemini-2.5-flash', name: 'Flash', reasoning: { efforts: [{ id: 'low', name: 'Low' }] } }] });
      assert.deepEqual(previewRecommendations(config, available, { overwrite: true }).config.builtins.scout!.binding,
        { mode: 'explicit', provider: 'google', model: 'gemini-2.5-flash' });
    }
  }
});

test('scopes group previews, skips disabled categories and never recommends in custom categories', () => {
  const config = createDefaultRoutingConfig();
  config.builtins.debugging = { enabled: false, binding: { mode: 'explicit', provider: 'locked', model: 'preserve-disabled' } };
  config.builtins['code-review'] = { binding: { mode: 'inherit' } };
  config.builtins.writing = { enabled: false };
  config.custom = [{ id: 'custom-review', name: 'Review', purpose: 'Check facts.', enabled: true, proactive: false, binding: { mode: 'default' } }];
  const fingerprint = routingConfigFingerprint(config);
  const available = catalog(); const original = structuredClone(available);
  const result = previewRecommendations(config, available, { group: 'quality' });
  assert.equal(result.group, 'quality');
  assert.equal(result.baselineFingerprint, fingerprint);
  assert.deepEqual(result.changes.map(change => change.category), ['verification-automation']);
  assert.deepEqual(result.skippedDisabled, ['debugging']);
  assert.deepEqual(result.preserved, ['code-review']);
  assert.deepEqual(result.config.builtins.debugging, config.builtins.debugging);
  assert.deepEqual(result.config.custom, config.custom);
  assert.notEqual(result.config.custom[0], config.custom[0]);
  assert.equal(routingConfigFingerprint(config), fingerprint);
  assert.deepEqual(available, original);
});

test('only overwrites existing bindings on request, leaves missing candidates intact, and is idempotent', () => {
  const config = createDefaultRoutingConfig();
  config.defaultTarget = { mode: 'explicit', provider: 'private', model: 'parent-target' };
  config.builtins.quick = { binding: { mode: 'inherit' } };
  const stable = previewRecommendations(config, catalog());
  assert.deepEqual(stable.preserved, ['quick']);
  assert.deepEqual(stable.config.builtins.quick, config.builtins.quick);
  const replaced = previewRecommendations(config, catalog(), { overwrite: true });
  assert.deepEqual(replaced.config.defaultTarget, config.defaultTarget);
  assert.equal(replaced.overwrite, true);
  assert.deepEqual(replaced.changes.find(change => change.category === 'quick')?.before, { mode: 'inherit' });
  assert.equal(previewRecommendations(replaced.config, catalog(), { overwrite: true }).changes.length, 0);
  const unavailable = previewRecommendations(config, { groups: [], failures: [] }, { overwrite: true });
  assert.deepEqual(unavailable.unavailable, BUILTIN_IDS);
  assert.deepEqual(unavailable.config, config);
});
