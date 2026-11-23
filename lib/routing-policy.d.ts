import type { CategoryId } from './categories.ts';
export type { CategoryId } from './categories.ts';
export type ExternalExecutor = 'codex' | 'agy' | 'cursor';
export type ExecutorId = 'native' | ExternalExecutor;
export type Target = {
    executor: 'native';
    model: {
        mode: 'inherit';
    };
} | {
    executor: 'native';
    model: {
        mode: 'explicit';
        provider: string;
        id: string;
        reasoningEffort?: string;
    };
} | {
    executor: ExternalExecutor;
    model: {
        mode: 'executor-default';
    };
} | {
    executor: ExternalExecutor;
    model: {
        mode: 'explicit';
        id: string;
        reasoningEffort?: string;
    };
};
export type CategoryBinding = {
    mode: 'default';
} | {
    mode: 'target';
    target: Target;
};
export interface RoutingPolicyV2 {
    version: 2;
    defaultTarget: Target;
    categories: Partial<Record<CategoryId, CategoryBinding>>;
    historyLimit: number;
}
export type FrozenTarget = Target extends infer T ? T extends Target ? Readonly<Omit<T, 'model'>> & {
    readonly model: Readonly<T['model']>;
} : never : never;
/** A decision about a requested target, not proof of authorization or actual execution. */
export interface RoutingSnapshot {
    readonly category: CategoryId;
    readonly source: 'category' | 'default';
    readonly target: FrozenTarget;
    readonly historyLimit: number;
    readonly revision?: number;
}
/** Validate one target's discriminated union; never discover models or grant capabilities. */
export declare function parseTarget(input: unknown): Target;
/** A new, independent safe default for each caller; never reuses a mutable global object. */
export declare function createDefaultRoutingPolicy(): RoutingPolicyV2;
/**
 * Parse untrusted V2 policy into a detached editable graph. version:2 is required;
 * absent defaultTarget/categories/historyLimit default to native inheritance/{}/100.
 * Present invalid values (including null/undefined) are rejected rather than reset.
 * This is structural validation only: authorization and live model preflight belong to the Host.
 */
export declare function parseRoutingPolicy(input: unknown): RoutingPolicyV2;
/**
 * Revalidate and detach once, then freeze one requested-target snapshot. Missing and
 * explicit default bindings share source:'default'; executor-default remains an
 * external target and is never resolved to the parent model. No actual-model claims.
 */
export declare function resolveRoutingSnapshot(input: unknown, category: unknown, revision?: number): RoutingSnapshot;
