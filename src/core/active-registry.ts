import { BUILTIN_LIST } from './categories.ts';
import type { BuiltinGroupId } from './categories.ts';
import { parseRoutingConfig } from './routing-policy.ts';
import type { Binding, FrozenTarget, RoutingConfig } from './routing-policy.ts';
import { compareCategoryIds, fingerprintNormalized } from './routing-fingerprint.ts';
import { sha256 } from './sha256.ts';

export interface ActiveCategory {
  readonly id: string;
  readonly origin: 'builtin' | 'custom';
  readonly group: BuiltinGroupId | 'custom';
  readonly nameEn: string;
  readonly nameZh: string;
  readonly purposeEn: string;
  readonly purposeZh: string;
  readonly shortPurposeEn: string;
  readonly avoidEn?: string;
  readonly deliverableCheckEn?: string;
  readonly proactive: boolean;
  readonly bindingSource: 'default' | 'category';
  readonly effectiveTarget: FrozenTarget;
}
export interface ActiveRegistry {
  readonly config: RoutingConfig;
  readonly configDigest: string;
  readonly entries: readonly ActiveCategory[];
  readonly byId: ReadonlyMap<string, ActiveCategory>;
}

function freeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) freeze(nested);
    Object.freeze(value);
  }
  return value;
}

/** Freezing a Map does not freeze its entries. Never expose the mutable backing Map. */
function indexById(entries: readonly ActiveCategory[]): ReadonlyMap<string, ActiveCategory> {
  const map = new Map(entries.map(entry => [entry.id, entry] as const));
  const view: ReadonlyMap<string, ActiveCategory> = Object.freeze({
    size: map.size,
    get: map.get.bind(map), has: map.has.bind(map), entries: map.entries.bind(map),
    keys: map.keys.bind(map), values: map.values.bind(map), [Symbol.iterator]: map[Symbol.iterator].bind(map),
    forEach(callback: (value: ActiveCategory, key: string, map: ReadonlyMap<string, ActiveCategory>) => void, thisArg?: unknown) {
      map.forEach((value, key) => Reflect.apply(callback, thisArg, [value, key, view]));
    },
  });
  return view;
}

export function resolveActiveRegistry(input: unknown): ActiveRegistry {
  const config = freeze(parseRoutingConfig(input));
  const entries: ActiveCategory[] = [];
  const routing = (binding: Binding | undefined): Pick<ActiveCategory, 'bindingSource' | 'effectiveTarget'> => (
    binding === undefined || binding.mode === 'default'
      ? { bindingSource: 'default', effectiveTarget: config.defaultTarget }
      : { bindingSource: 'category', effectiveTarget: binding }
  );
  for (const { id, group, en, zh, proactive, defaultEnabled } of BUILTIN_LIST) {
    const entry = config.builtins[id];
    if (!(entry?.enabled ?? defaultEnabled)) continue;
    entries.push(Object.freeze({
      id, origin: 'builtin', group, nameEn: en.name, nameZh: zh.name, purposeEn: en.purpose, purposeZh: zh.purpose,
      shortPurposeEn: en.shortPurpose, avoidEn: en.avoid, deliverableCheckEn: en.deliverableCheck, proactive,
      ...routing(entry?.binding),
    }));
  }
  for (const entry of [...config.custom].sort(compareCategoryIds)) {
    if (!entry.enabled) continue;
    const points = [...entry.purpose];
    entries.push(Object.freeze({
      id: entry.id, origin: 'custom', group: 'custom', nameEn: entry.name, nameZh: entry.name,
      purposeEn: entry.purpose, purposeZh: entry.purpose,
      shortPurposeEn: points.length > 40 ? `${points.slice(0, 39).join('')}…` : entry.purpose,
      ...(entry.avoid === undefined ? {} : { avoidEn: entry.avoid }), proactive: entry.proactive,
      ...routing(entry.binding),
    }));
  }
  return Object.freeze({ config, configDigest: sha256(fingerprintNormalized(config)), entries: Object.freeze(entries), byId: indexById(entries) });
}

export function requiredGrantPairs(registry: ActiveRegistry): Array<{ provider: string; model: string }> {
  const pairs = new Map<string, { provider: string; model: string }>();
  for (const { effectiveTarget } of registry.entries) {
    if (effectiveTarget.mode !== 'explicit') continue;
    const { provider, model } = effectiveTarget;
    pairs.set(JSON.stringify([provider, model]), { provider, model });
  }
  return [...pairs.values()];
}
export function resolveActiveCategory(registry: ActiveRegistry, id: unknown): ActiveCategory | undefined {
  return typeof id === 'string' ? registry.byId.get(id) : undefined;
}
