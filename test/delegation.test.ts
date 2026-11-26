import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATEGORY_IDS, getCategory } from '../src/core/categories.ts';
import { DESCRIPTION_LIMIT, PROMPT_LIMIT, buildCategoryPrompt, outcomeState, validateDelegateArgs } from '../src/core/delegation.ts';

const base = { category: 'writing', prompt: 'Write notes', description: 'notes' };

test('delegation arguments are validated before any host side effect', () => {
  validateDelegateArgs(base);
  validateDelegateArgs({ ...base, name: 'writer', cwd: '/tmp' });
  assert.throws(() => validateDelegateArgs({ ...base, extra: 'x' } as never), /Unknown delegation field: extra/);
  assert.throws(() => validateDelegateArgs({ ...base, name: '  ' }), /name must be a non-empty string/);
  assert.throws(() => validateDelegateArgs({ ...base, prompt: '' }), /prompt must be a non-empty string/);
  assert.throws(() => validateDelegateArgs({ ...base, prompt: 'x'.repeat(PROMPT_LIMIT + 1) }), /exceeds the routing limit/);
  assert.throws(() => validateDelegateArgs({ ...base, description: 'x'.repeat(DESCRIPTION_LIMIT + 1) }), /exceeds the routing limit/);
});

test('every category prompt carries its purpose and the no-extra-permission notice', () => {
  for (const id of CATEGORY_IDS) {
    const text = buildCategoryPrompt(id, 'TASK');
    assert.ok(text.startsWith(`[Task category: ${id}]\n${getCategory(id).en.purpose}\n`));
    assert.match(text, /does not grant additional permissions/);
    assert.ok(text.endsWith('\n\nTASK'));
  }
});

test('host stop reasons map onto audit states', () => {
  assert.equal(outcomeState('completed'), 'completed');
  assert.equal(outcomeState('aborted'), 'cancelled');
  assert.equal(outcomeState('error'), 'failed');
  assert.equal(outcomeState('max_turns'), 'failed');
});
