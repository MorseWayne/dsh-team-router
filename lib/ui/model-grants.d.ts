import type { CategoryBinding, Target } from '../core/routing-policy.ts';
export declare const MODEL_AUTHORIZATION_ENTRY = "subagent-model-selection-settings";
type Route = {
    provider: string;
    model: string;
};
export interface ModelAuthorizationForm {
    getSnapshot(): {
        status: 'loading' | 'unavailable' | 'ready';
        writable: boolean;
        revision?: number | undefined;
        value?: {
            enabled: boolean;
            allowedModels: Route[];
        } | undefined;
    };
    subscribe(listener: () => void): () => void;
    mutate(ops: readonly ({
        op: 'set';
        path: ['enabled'];
        value: true;
    } | {
        op: 'set';
        path: ['allowedModels'];
        value: Route[];
    })[], revision: number): Promise<boolean>;
}
/** Only active, explicit native routes participate; neither effort nor unused editor choices grant access. */
export declare function requiredModelRoutes(policy: {
    defaultTarget: Target;
    categories: Partial<Record<string, CategoryBinding>>;
}): Route[];
export type GrantProblem = 'loading' | 'unserved' | 'invalid' | 'readOnly';
type GrantPlan = {
    kind: 'complete' | 'readOnly';
} | {
    kind: 'unavailable';
    reason: Exclude<GrantProblem, 'readOnly'>;
} | {
    kind: 'write';
    revision: number;
    routes: Route[];
};
export declare function planModelGrant(required: Route[], snapshot: ReturnType<ModelAuthorizationForm['getSnapshot']>): GrantPlan;
export {};
