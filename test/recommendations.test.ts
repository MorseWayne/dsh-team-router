import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CATEGORY_IDS } from '../src/categories.ts';
import { createDefaultRoutingPolicy } from '../src/routing-policy.ts';
import { RECOMMENDATION_CANDIDATES, RECOMMENDATION_VERSION, previewRecommendations, routingPolicyFingerprint } from '../src/recommendations.ts';
import type { ModelCatalog } from '../src/recommendations.ts';

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

describe('versioned exact recommendations', () => {
  it('defines candidates for exactly the seven categories and freezes the manifest', () => {
    assert.match(RECOMMENDATION_VERSION, /^\d{4}-\d{2}-\d{2}\.\d+$/);
    assert.deepEqual(Object.keys(RECOMMENDATION_CANDIDATES), CATEGORY_IDS);
    assert.ok(Object.isFrozen(RECOMMENDATION_CANDIDATES));
    for (const id of CATEGORY_IDS) {
      assert.ok(RECOMMENDATION_CANDIDATES[id].length > 0);
      assert.ok(Object.isFrozen(RECOMMENDATION_CANDIDATES[id]));
      assert.ok(RECOMMENDATION_CANDIDATES[id].every(entry => Object.isFrozen(entry)));
    }
  });

  it('uses the actual test catalog to resolve every category in manifest order', () => {
    const preview = previewRecommendations(createDefaultRoutingPolicy(), catalog());
    assert.equal(preview.changes.length, 7);
    assert.equal(preview.manifestVersion, RECOMMENDATION_VERSION);
    for (const change of preview.changes) {
      const expected = RECOMMENDATION_CANDIDATES[change.category].find(entry => catalog().groups.some(group => group.id === entry.provider && group.models.some(model => model.id === entry.model)))!;
      assert.deepEqual(change.after.target, {
        executor: 'native', model: { mode: 'explicit', provider: expected.provider, id: expected.model },
      });
    }
    assert.deepEqual(preview.unavailable, []);
  });

  it('matches installed subscription adapter namespaces without selecting external executors', () => {
    const available: ModelCatalog = { groups: [
      { id: 'openai-codex', name: 'Codex subscription', models: [{ id: 'gpt-6-astra', name: 'Astra' }, { id: 'gpt-5.4-mini', name: 'Mini' }] },
      { id: 'antigravity', name: 'Antigravity', models: ['gemini-4-argon', 'claude-opus-5-5', 'claude-sonnet-5-5', 'gemini-3.8-flash'].map(id => ({ id, name: id })) },
    ], failures: [] };
    const preview = previewRecommendations(createDefaultRoutingPolicy(), available);
    assert.equal(preview.changes.length, 7);
    assert.ok(preview.changes.every(change => change.after.target.executor === 'native'));
    assert.deepEqual(preview.policy.categories.deep, { mode: 'target', target: { executor: 'native', model: { mode: 'explicit', provider: 'openai-codex', id: 'gpt-6-astra' } } });
  });

  it('never guesses provider aliases, case, model substrings, or advertised display names', () => {
    const wrong: ModelCatalog = { groups: [
      { id: 'OpenAI', name: 'openai', models: [{ id: 'gpt-5-mini', name: 'gpt-5-mini' }] },
      { id: 'openai', name: 'OpenAI', models: [{ id: 'gpt-5-mini-latest', name: 'gpt-5-mini' }] },
      { id: 'google', name: 'Google', models: [{ id: 'gemini-2.5-pro-preview', name: 'gemini-2.5-pro' }] },
    ], failures: [] };
    const result = previewRecommendations(createDefaultRoutingPolicy(), wrong);
    assert.equal(result.changes.length, 0);
    assert.deepEqual(result.unavailable, CATEGORY_IDS);
    assert.deepEqual(result.policy.defaultTarget, { executor: 'native', model: { mode: 'inherit' } });
    assert.deepEqual(Object.keys(result.policy.categories), []);
  });

  it('falls to the next exact candidate and excludes failed provider groups', () => {
    const available = catalog();
    available.failures.push({ id: 'google', name: 'Google', message: 'timeout' });
    const result = previewRecommendations(createDefaultRoutingPolicy(), available);
    assert.deepEqual(result.policy.categories['visual-engineering'], {
      mode: 'target', target: { executor: 'native', model: { mode: 'explicit', provider: 'anthropic', id: 'claude-sonnet-4-5' } },
    });
  });

  it('does not mutate its inputs or change the default target', () => {
    const policy = createDefaultRoutingPolicy();
    policy.defaultTarget = { executor: 'native', model: { mode: 'explicit', provider: 'private', id: 'private-model' } };
    const available = catalog();
    const original = structuredClone(available);
    const fingerprint = routingPolicyFingerprint(policy);
    const result = previewRecommendations(policy, available);
    assert.equal(routingPolicyFingerprint(policy), fingerprint);
    assert.deepEqual(available, original);
    assert.deepEqual(result.policy.defaultTarget, policy.defaultTarget);
    result.policy.defaultTarget = { executor: 'native', model: { mode: 'inherit' } };
    assert.equal(policy.defaultTarget.model.mode, 'explicit');
  });

  it('preserves all explicit user targets, including inheritance and external agents', () => {
    const policy = createDefaultRoutingPolicy();
    policy.categories.quick = { mode: 'target', target: { executor: 'native', model: { mode: 'inherit' } } };
    policy.categories.deep = { mode: 'target', target: { executor: 'codex', model: { mode: 'explicit', id: 'chosen' } } };
    const result = previewRecommendations(policy, catalog());
    assert.deepEqual(result.preserved, ['deep', 'quick']);
    assert.deepEqual(result.policy.categories.deep, policy.categories.deep);
    assert.deepEqual(result.policy.categories.quick, policy.categories.quick);
    assert.equal(result.changes.length, 5);
  });

  it('replaces explicit choices only when overwrite is requested and still only with native candidates', () => {
    const policy = createDefaultRoutingPolicy();
    policy.categories.deep = { mode: 'target', target: { executor: 'agy', model: { mode: 'executor-default' } } };
    const result = previewRecommendations(policy, catalog(), { overwrite: true });
    assert.equal(result.overwrite, true);
    assert.deepEqual(result.preserved, []);
    assert.equal(result.changes.length, 7);
    assert.ok(result.changes.every(change => change.after.target.executor === 'native'));
    assert.deepEqual(result.changes.find(change => change.category === 'deep')?.before, policy.categories.deep);
  });

  it('keeps an explicit target when overwrite has no available candidate', () => {
    const policy = createDefaultRoutingPolicy();
    policy.categories.quick = { mode: 'target', target: { executor: 'native', model: { mode: 'explicit', provider: 'custom', id: 'chosen' } } };
    const result = previewRecommendations(policy, { groups: [], failures: [] }, { overwrite: true });
    assert.deepEqual(result.policy.categories.quick, policy.categories.quick);
    assert.equal(result.changes.length, 0);
  });

  it('skips identical candidate bindings and never sets an unverified reasoning effort', () => {
    const first = previewRecommendations(createDefaultRoutingPolicy(), catalog());
    const second = previewRecommendations(first.policy, catalog(), { overwrite: true });
    assert.equal(second.changes.length, 0);
    for (const id of CATEGORY_IDS) {
      const binding = first.policy.categories[id]!;
      assert.equal(binding.mode, 'target');
      if (binding.mode === 'target') assert.equal(Object.hasOwn(binding.target.model, 'reasoningEffort'), false);
    }
  });

  it('fingerprints missing and explicit default bindings consistently', () => {
    const first = createDefaultRoutingPolicy();
    const second = createDefaultRoutingPolicy();
    second.categories.writing = { mode: 'default' };
    second.categories.deep = { mode: 'default' };
    assert.equal(routingPolicyFingerprint(first), routingPolicyFingerprint(second));
    second.historyLimit = 1;
    assert.notEqual(routingPolicyFingerprint(first), routingPolicyFingerprint(second));
  });
});
