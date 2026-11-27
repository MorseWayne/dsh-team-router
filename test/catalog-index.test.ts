import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ModelCatalog } from '../src/core/recommendations.ts';
import { indexCatalog, searchCatalog } from '../src/ui/catalog-index.ts';

const catalog: ModelCatalog = {
  groups: [
    { id: 'provider-1', name: 'DeepSeek', models: [
      { id: 'deepseek-chat', name: 'Chat' },
      { id: 'deepseek-reasoner', name: 'Reasoner', reasoning: { efforts: [{ id: 'high', name: 'High' }] } },
    ] },
    { id: 'provider-2', name: 'Second provider', models: [{ id: 'other-model', name: 'Model X' }] },
  ],
  failures: [{ id: 'provider-2', name: 'Second provider', message: 'Provider disconnected' }],
};

test('catalog indexing retains exact IDs, reasoning options and provider failure status', () => {
  const index = indexCatalog(catalog);
  assert.equal(index.get('provider-1')?.models.get('deepseek-reasoner')?.model, catalog.groups[0]?.models[1]);
  assert.equal(index.get('provider-1')?.failed, false);
  assert.equal(index.get('provider-2')?.failed, true);
  assert.equal(index.get('Provider-1'), undefined);
  assert.equal(indexCatalog().size, 0);
});

test('catalog search matches provider names and IDs and model names and IDs in source order', () => {
  const index = indexCatalog(catalog);
  const ids = (query: string) => searchCatalog(index, query, 5).groups.flatMap(group => group.models.map(item => item.id));
  assert.deepEqual(ids('deepseek'), ['deepseek-chat', 'deepseek-reasoner']);
  assert.deepEqual(ids('provider-1'), ['deepseek-chat', 'deepseek-reasoner']);
  assert.deepEqual(ids('reasoner'), ['deepseek-reasoner']);
  assert.deepEqual(ids('other-model'), ['other-model']);
  assert.deepEqual(ids('model x'), ['other-model']);
  assert.deepEqual(ids('absent'), []);
});

test('catalog marks display names as ambiguous only when distinct model IDs share them within one provider', () => {
  const shared = { id: 'first', name: 'Shared' };
  const index = indexCatalog({ failures: [], groups: [
    { id: 'p', name: 'P', models: [shared, shared, { id: 'second', name: 'Shared' }, { id: 'unique', name: 'Unique' }] },
    { id: 'q', name: 'Q', models: [shared] },
    { id: 'r', name: 'R', models: [shared, shared] },
  ] });
  assert.deepEqual([...index.get('p')!.duplicateNames], ['Shared']);
  assert.equal(index.get('q')!.duplicateNames.size, 0);
  assert.equal(index.get('r')!.duplicateNames.size, 0);
  assert.deepEqual(searchCatalog(index, 'shared', 5).groups[0]?.models.map(model => model.id), ['first', 'second']);
});

test('catalog search caps broad result lists and reports whether another page exists', () => {
  const index = indexCatalog(catalog);
  const first = searchCatalog(index, '', 1);
  assert.deepEqual(first.groups.flatMap(group => group.models.map(item => item.id)), ['deepseek-chat']);
  assert.equal(first.hasMore, true);
  const all = searchCatalog(index, '', 3);
  assert.deepEqual(all.groups.map(group => group.models.length), [2, 1]);
  assert.equal(all.hasMore, false);
  assert.deepEqual(searchCatalog(index, 'absent', 1), { groups: [], hasMore: false });
});
