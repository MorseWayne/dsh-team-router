import type { BuiltinGroupId, BuiltinId } from './categories.ts';
import type { Binding, RoutingConfig, Target } from './routing-policy.ts';
export interface CatalogModel {
    id: string;
    name: string;
    reasoning?: {
        efforts: Array<{
            id: string;
            name: string;
        }>;
        defaultEffort?: string;
    };
}
export interface ModelCatalog {
    groups: Array<{
        id: string;
        name: string;
        models: CatalogModel[];
    }>;
    failures: Array<{
        id: string;
        name: string;
        message: string;
    }>;
}
export interface RecommendationCandidate {
    readonly provider: string;
    readonly model: string;
    readonly preferredEffort?: string;
}
/** Curated exact IDs, not benchmark rankings or promises of availability or authorization. */
export declare const RECOMMENDATION_VERSION = "2026-11-28.1";
export declare const RECOMMENDATION_CANDIDATES: Readonly<Record<BuiltinId, readonly RecommendationCandidate[]>>;
export interface RecommendationChange {
    category: BuiltinId;
    before: Binding;
    after: Extract<Target, {
        mode: 'explicit';
    }>;
}
export interface RecommendationPreview {
    manifestVersion: string;
    baselineFingerprint: string;
    config: RoutingConfig;
    changes: RecommendationChange[];
    preserved: BuiltinId[];
    unavailable: BuiltinId[];
    skippedDisabled: BuiltinId[];
    overwrite: boolean;
    group?: BuiltinGroupId;
}
export declare function previewRecommendations(input: unknown, catalog: ModelCatalog, options?: {
    overwrite?: boolean;
    group?: BuiltinGroupId;
}): RecommendationPreview;
