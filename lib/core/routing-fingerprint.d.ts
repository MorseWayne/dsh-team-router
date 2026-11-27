import type { RoutingConfig } from './routing-policy.ts';
export declare function compareCategoryIds(a: {
    id: string;
}, b: {
    id: string;
}): number;
/** Internal canonical representation of an already parsed configuration. */
export declare function fingerprintNormalized(config: RoutingConfig): string;
