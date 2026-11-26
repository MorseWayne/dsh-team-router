import type { CategoryId } from './categories.ts';
import type { CategoryBinding, RoutingPolicyV2, Target } from './routing-policy.ts';
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
}
/**
 * Curated, exact IDs, not benchmark rankings or a promise of account availability.
 * These public model names are examples of suitable capabilities. Provider IDs must
 * match the actual Host exactly; no aliases, fuzzy matching, price or authorization claims.
 */
export declare const RECOMMENDATION_VERSION = "2026-11-24.1";
export declare const RECOMMENDATION_CANDIDATES: Readonly<Record<CategoryId, readonly RecommendationCandidate[]>>;
export interface RecommendationChange {
    category: CategoryId;
    before: CategoryBinding;
    after: {
        mode: 'target';
        target: Target;
    };
}
export interface RecommendationPreview {
    manifestVersion: string;
    baselineFingerprint: string;
    policy: RoutingPolicyV2;
    changes: RecommendationChange[];
    preserved: CategoryId[];
    unavailable: CategoryId[];
    overwrite: boolean;
}
/** Stable across category insertion order and absent versus explicit default bindings. */
export declare function routingPolicyFingerprint(input: unknown): string;
/** Read-only preview. Applying it to a draft and persisting it are separate user actions. */
export declare function previewRecommendations(input: unknown, catalog: ModelCatalog, options?: {
    overwrite?: boolean;
}): RecommendationPreview;
