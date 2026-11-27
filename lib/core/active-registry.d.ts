import type { BuiltinGroupId } from './categories.ts';
import type { FrozenTarget, RoutingConfig } from './routing-policy.ts';
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
export declare function resolveActiveRegistry(input: unknown): ActiveRegistry;
export declare function requiredGrantPairs(registry: ActiveRegistry): Array<{
    provider: string;
    model: string;
}>;
export declare function resolveActiveCategory(registry: ActiveRegistry, id: unknown): ActiveCategory | undefined;
