import { getCategory } from './categories.ts';
import type { CategoryId } from './categories.ts';

export type { CategoryId } from './categories.ts';
export type ExternalExecutor = 'codex' | 'agy' | 'cursor';
export type ExecutorId = 'native' | ExternalExecutor;

export type Target =
  | { executor: 'native'; model: { mode: 'inherit' } }
  | { executor: 'native'; model: {
    mode: 'explicit'; provider: string; id: string; reasoningEffort?: string;
  } }
  | { executor: ExternalExecutor; model: { mode: 'executor-default' } }
  | { executor: ExternalExecutor; model: {
    mode: 'explicit'; id: string; reasoningEffort?: string;
  } };

export type CategoryBinding = { mode: 'default' } | { mode: 'target'; target: Target };

export interface RoutingPolicyV2 {
  version: 2;
  defaultTarget: Target;
  categories: Partial<Record<CategoryId, CategoryBinding>>;
  historyLimit: number;
}

export type FrozenTarget = Target extends infer T
  ? T extends Target ? Readonly<Omit<T, 'model'>> & { readonly model: Readonly<T['model']> } : never
  : never;

/** A decision about a requested target, not proof of authorization or actual execution. */
export interface RoutingSnapshot {
  readonly category: CategoryId;
  readonly source: 'category' | 'default';
  readonly target: FrozenTarget;
  readonly historyLimit: number;
  readonly revision?: number;
}

const POLICY_FIELDS = ['version', 'defaultTarget', 'categories', 'historyLimit'];
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function fail(path: string, message: string): never {
  throw new TypeError(`${path}: ${message}`);
}

/** Copy own data descriptors before using values; no accessors or inherited data are read. */
function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be a plain object');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) fail(path, 'must be a plain object');
  const result: Record<string, unknown> = Object.create(null);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') fail(path, 'symbol fields are not allowed');
    if (UNSAFE_KEYS.has(key)) fail(path, `unsafe key ${JSON.stringify(key)}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, 'value')) {
      fail(`${path}.${key}`, 'must be a data property');
    }
    result[key] = descriptor.value;
  }
  return result;
}

function exactFields(value: Record<string, unknown>, allowed: readonly string[], path: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(`${path}.${key}`, 'unknown field');
  }
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string') fail(path, 'must be a string');
  const result = value.trim();
  if (result.length === 0) fail(path, 'must not be empty');
  return result;
}

function integer(value: unknown, minimum: number, maximum: number, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(path, `must be a safe integer from ${minimum} to ${maximum}`);
  }
  return value;
}

/** Validate one target's discriminated union; never discover models or grant capabilities. */
export function parseTarget(input: unknown): Target {
  return target(input, 'target');
}

function target(input: unknown, path: string): Target {
  const entry = record(input, path);
  exactFields(entry, ['executor', 'model'], path);
  const executor = entry.executor;
  if (executor !== 'native' && executor !== 'codex' && executor !== 'agy' && executor !== 'cursor') {
    fail(`${path}.executor`, 'expected native, codex, agy, or cursor');
  }
  const modelPath = `${path}.model`;
  const model = record(entry.model, modelPath);
  if (executor === 'native' && model.mode === 'inherit') {
    exactFields(model, ['mode'], modelPath);
    return { executor, model: { mode: 'inherit' } };
  }
  if (executor !== 'native' && model.mode === 'executor-default') {
    exactFields(model, ['mode'], modelPath);
    return { executor, model: { mode: 'executor-default' } };
  }
  if (model.mode !== 'explicit') {
    fail(`${modelPath}.mode`, executor === 'native'
      ? 'expected inherit or explicit for native'
      : 'expected executor-default or explicit for an external executor');
  }
  exactFields(model, executor === 'native'
    ? ['mode', 'provider', 'id', 'reasoningEffort']
    : ['mode', 'id', 'reasoningEffort'], modelPath);
  const id = text(model.id, `${modelPath}.id`);
  // An explicitly undefined optional effort is omission, never inheritance from a prior model.
  const effort = model.reasoningEffort === undefined ? {} : {
    reasoningEffort: text(model.reasoningEffort, `${modelPath}.reasoningEffort`),
  };
  if (executor === 'native') {
    return { executor, model: {
      mode: 'explicit', provider: text(model.provider, `${modelPath}.provider`), id, ...effort,
    } };
  }
  return { executor, model: { mode: 'explicit', id, ...effort } };
}

function binding(input: unknown, path: string): CategoryBinding {
  const entry = record(input, path);
  if (entry.mode === 'default') {
    exactFields(entry, ['mode'], path);
    return { mode: 'default' };
  }
  if (entry.mode === 'target') {
    exactFields(entry, ['mode', 'target'], path);
    return { mode: 'target', target: target(entry.target, `${path}.target`) };
  }
  fail(`${path}.mode`, 'expected default or target');
}

/** A new, independent safe default for each caller; never reuses a mutable global object. */
export function createDefaultRoutingPolicy(): RoutingPolicyV2 {
  return {
    version: 2,
    defaultTarget: { executor: 'native', model: { mode: 'inherit' } },
    categories: Object.create(null) as RoutingPolicyV2['categories'],
    historyLimit: 100,
  };
}

/**
 * Parse untrusted V2 policy into a detached editable graph. version:2 is required;
 * absent defaultTarget/categories/historyLimit default to native inheritance/{}/100.
 * Present invalid values (including null/undefined) are rejected rather than reset.
 * This is structural validation only: authorization and live model preflight belong to the Host.
 */
export function parseRoutingPolicy(input: unknown): RoutingPolicyV2 {
  const source = record(input, 'policy');
  exactFields(source, POLICY_FIELDS, 'policy');
  if (source.version !== 2) fail('policy.version', 'must be 2');
  const result = createDefaultRoutingPolicy();
  if (Object.hasOwn(source, 'defaultTarget')) result.defaultTarget = target(source.defaultTarget, 'policy.defaultTarget');
  if (Object.hasOwn(source, 'historyLimit')) {
    result.historyLimit = integer(source.historyLimit, 1, 1000, 'policy.historyLimit');
  }
  if (Object.hasOwn(source, 'categories')) {
    const entries = record(source.categories, 'policy.categories');
    for (const key of Object.keys(entries)) {
      const path = `policy.categories[${JSON.stringify(key)}]`;
      let id: CategoryId;
      try { id = getCategory(key).id; }
      catch (error) { fail(path, error instanceof Error ? error.message : 'invalid category'); }
      result.categories[id] = binding(entries[key], path);
    }
  }
  return result;
}

/**
 * Revalidate and detach once, then freeze one requested-target snapshot. Missing and
 * explicit default bindings share source:'default'; executor-default remains an
 * external target and is never resolved to the parent model. No actual-model claims.
 */
export function resolveRoutingSnapshot(input: unknown, category: unknown, revision?: number): RoutingSnapshot {
  const id = getCategory(category).id;
  const policy = parseRoutingPolicy(input);
  const entry = policy.categories[id];
  const source = entry?.mode === 'target' ? 'category' : 'default';
  const selected = entry?.mode === 'target' ? entry.target : policy.defaultTarget;
  Object.freeze(selected.model);
  const snapshot: RoutingSnapshot = {
    category: id,
    source,
    target: Object.freeze(selected),
    historyLimit: policy.historyLimit,
    ...(revision === undefined ? {} : { revision: integer(revision, 0, Number.MAX_SAFE_INTEGER, 'revision') }),
  };
  return Object.freeze(snapshot);
}
