import type { ModelAuthorizationForm } from './model-grants.ts';
import type { CategoryId } from '../core/categories.ts';
import type { MigrationPreview } from '../core/migration.ts';
import type { DelegationMode } from '../core/native-subagent.ts';
import type { CategoryBinding, RoutingPolicyV2, Target } from '../core/routing-policy.ts';
import type { RouterConfig } from '../core/policy.ts';
import type { ModelCatalog, RecommendationPreview } from '../core/recommendations.ts';
export interface RoutingBehaviorSettings {
    delegationMode: DelegationMode;
    enforceNativeSubagentRouting: boolean;
}
export interface RoutingFormValue {
    policyV2?: RoutingPolicyV2 | null;
    routes?: RouterConfig['routes'];
    rules?: RouterConfig['rules'];
    roles?: RouterConfig['roles'];
    defaultRoute?: string | null;
    historyLimit?: number;
    delegationMode?: DelegationMode;
    enforceNativeSubagentRouting?: boolean;
}
export interface RoutingFormSnapshot {
    status: 'loading' | 'ready' | 'unavailable';
    value: RoutingFormValue | undefined;
    revision: number | undefined;
    writable: boolean;
}
export type RoutingMutation = {
    op: 'set';
    path: ['policyV2'];
    value: RoutingPolicyV2;
} | {
    op: 'set';
    path: ['delegationMode'];
    value: DelegationMode;
} | {
    op: 'set';
    path: ['enforceNativeSubagentRouting'];
    value: boolean;
};
export interface RoutingForm {
    getSnapshot(): RoutingFormSnapshot;
    subscribe(listener: () => void): () => void;
    mutate(ops: readonly RoutingMutation[], expectedRevision?: number): Promise<boolean>;
}
export interface RoutingDraft {
    defaultTarget: Target;
    categories: Record<CategoryId, CategoryBinding>;
    historyLimit: string;
}
export type RoutingSection = CategoryId | 'default';
export type RoutingField = 'executor' | 'provider' | 'model' | 'effort' | 'historyLimit';
export type RoutingIssueReason = 'required' | 'history' | 'catalog' | 'catalogRequired' | 'externalUnavailable' | 'structure';
export interface RoutingValidationIssue {
    section: RoutingSection;
    field: RoutingField;
    reason: RoutingIssueReason;
    detail?: string;
}
export type RoutingEditorError = {
    kind: 'validation' | 'refused' | 'transport' | 'migration' | 'previewChanged' | 'grantUnavailable' | 'grantReadOnly' | 'grantFailed';
    detail: string;
};
export interface RoutingEditorSnapshot {
    draft: RoutingDraft | undefined;
    behavior: RoutingBehaviorSettings;
    revision: number | undefined;
    dirty: boolean;
    saving: boolean;
    stale: boolean;
    migrationRequired: boolean;
    migrationConfirmed: boolean;
    retired: MigrationPreview['retired'] | undefined;
    issue: RoutingValidationIssue | undefined;
    error: RoutingEditorError | undefined;
    notice: 'saved' | undefined;
}
export declare function readBehaviorSettings(value: RoutingFormValue | undefined): RoutingBehaviorSettings;
export declare function routingPolicyToDraft(input: unknown): RoutingDraft;
export declare function routingDraftToPolicy(draft: RoutingDraft): RoutingPolicyV2;
/** Select legacy fields explicitly; stateDir and future Host fields are not policy inputs. */
export declare function routingFormPreview(value: RoutingFormValue): {
    policy: RoutingPolicyV2;
    required: boolean;
    retired: MigrationPreview['retired'] | undefined;
};
/** No unset operation exists: clearing V2 would revive legacy composition fields. */
export declare function routingPolicyMutations(input: unknown): RoutingMutation[];
export declare function routingDraftIssue(draft: RoutingDraft, catalog?: ModelCatalog, catalogReady?: boolean): RoutingValidationIssue | undefined;
/** Staged, revision-bound V2 editor. Migration, preview application, and save are explicit actions. */
export declare class RoutingEditor {
    private state;
    private listeners;
    private readonly customTargets;
    private readonly nativeModels;
    private policyDirty;
    private savedBehavior;
    private readonly stop;
    private disposed;
    private readonly form;
    private readonly grants;
    constructor(form: RoutingForm, grants: ModelAuthorizationForm);
    readonly getSnapshot: () => RoutingEditorSnapshot;
    readonly subscribe: (listener: () => void) => (() => void);
    dispose(): void;
    private publish;
    private remember;
    private accept;
    edit(draft: RoutingDraft, revision?: number | undefined): void;
    editBehavior(patch: Partial<RoutingBehaviorSettings>, revision?: number | undefined): void;
    /** Preserve dormant custom choices within this edit session, but never persist them in default bindings. */
    setCategoryMode(category: CategoryId, mode: 'default' | 'target', revision?: number | undefined): void;
    /** Returning from inheritance restores the last explicit native choice until save/reload. */
    setNativeModelMode(section: RoutingSection, mode: 'inherit' | 'explicit', revision?: number | undefined, choice?: {
        provider: string;
        id: string;
    }): void;
    discard(): void;
    confirmMigration(revision?: number | undefined): boolean;
    applyRecommendations(preview: RecommendationPreview, revision?: number | undefined): boolean;
    save(options?: {
        catalog?: ModelCatalog;
        catalogReady?: boolean;
    }): Promise<boolean>;
}
