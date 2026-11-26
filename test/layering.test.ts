import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// Source-only guard for the core / adapter / ui split. Host upgrades should only
// ever require edits under src/adapter; see docs/ARCHITECTURE.md.
const src = fileURLToPath(new URL('../src/', import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}
function imports(path: string): string[] {
  const text = readFileSync(path, 'utf8');
  return [...text.matchAll(/(?:^|\n)\s*(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]/g)].map(match => match[1]!);
}
const layer = (path: string) => relative(src, path).split(/[\\/]/)[0]!;

test('core never imports host packages, the adapter or the UI', () => {
  for (const file of files(join(src, 'core'))) {
    for (const specifier of imports(file)) {
      assert.ok(!specifier.startsWith('@deepseek-ai/'), `${relative(src, file)} imports host package ${specifier}`);
      assert.ok(specifier.startsWith('node:') || specifier === 'zod' || specifier.startsWith('./'),
        `${relative(src, file)} must stay within core: ${specifier}`);
    }
  }
});

test('adapter and UI only depend downward on core, never on each other', () => {
  for (const file of files(src)) {
    const own = layer(file);
    if (own !== 'adapter' && own !== 'ui') continue;
    for (const specifier of imports(file)) {
      const other = own === 'adapter' ? '/ui/' : '/adapter/';
      assert.ok(!specifier.includes(other), `${relative(src, file)} crosses into ${other}: ${specifier}`);
    }
  }
});

test('host runtime packages are only imported by the DSH adapter (UI may use client-side host types)', () => {
  const runtimeHost = /^@deepseek-ai\/dsh-(?!client)/;
  for (const file of files(src)) {
    if (layer(file) === 'adapter') continue;
    for (const specifier of imports(file)) {
      assert.ok(!runtimeHost.test(specifier), `${relative(src, file)} imports host runtime ${specifier}`);
    }
  }
});
