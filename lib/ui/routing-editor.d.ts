import type { BuiltinId } from '../core/categories.ts';
import type { ModelCatalog, RecommendationPreview } from '../core/recommendations.ts';
import type { Binding, RoutingBehavior, RoutingConfig, Target } from '../core/routing-policy.ts';
import type { ModelAuthorizationForm } from './model-grants.ts';
export interface RoutingFormValue {
    routing?: RoutingConfig | null;
}
export interface RoutingFormSnapshot {
    status: 'loading' | 'ready' | 'unavailable';
    value: RoutingFormValue | undefined;
    revision: number | undefined;
    writable: boolean;
}
export type RoutingMutation = {
    op: 'set';
    path: ['routing'];
    value: RoutingConfig;
};
export interface RoutingForm {
    getSnapshot(): RoutingFormSnapshot;
    subscribe(listener: () => void): () => void;
    mutate(ops: readonly RoutingMutation[], expectedRevision?: number): Promise<boolean>;
}
export interface BuiltinDraftEntry {
    enabled: boolean;
    binding: Binding;
}
export interface CustomCategoryDraft {
    id: string;
    persisted: boolean;
    name: string;
    purpose: string;
    avoid: string;
    enabled: boolean;
    proactive: boolean;
    binding: Binding;
}
export interface RoutingDraft {
    defaultTarget: Target;
    behavior: RoutingBehavior;
    builtins: Record<BuiltinId, BuiltinDraftEntry>;
    custom: CustomCategoryDraft[];
    historyLimit: string;
}
export type RoutingSection = 'default' | BuiltinId | string;
export type RoutingField = 'provider' | 'model' | 'effort' | 'historyLimit' | 'id' | 'name' | 'purpose' | 'avoid';
export type RoutingIssueReason = 'required' | 'history' | 'catalog' | 'catalogRequired' | 'structure' | 'customId' | 'customDuplicate' | 'customLimit' | 'text';
export interface RoutingValidationIssue {
    section: RoutingSection;
    field: RoutingField;
    reason: RoutingIssueReason;
    detail?: string;
}
export type RoutingEditorError = {
    kind: 'validation' | 'refused' | 'transport' | 'previewChanged' | 'grantUnavailable' | 'grantReadOnly' | 'grantFailed';
    detail: string;
};
export interface RoutingEditorSnapshot {
    draft: RoutingDraft | undefined;
    revision: number | undefined;
    dirty: boolean;
    saving: boolean;
    stale: boolean;
    issue: RoutingValidationIssue | undefined;
    error: RoutingEditorError | undefined;
    notice: 'saved' | undefined;
}
export type BuiltinPreset = 'all' | 'classic7';
export interface CustomCategorySeed {
    id?: string;
    name?: string;
    purpose?: string;
    avoid?: string;
    proactive?: boolean;
}
export declare function routingFormConfig(value: RoutingFormValue): RoutingConfig;
export declare function routingConfigToDraft(input: unknown, persistedCustomIds?: ReadonlySet<string>): RoutingDraft;
export declare function routingDraftToConfig(draft: RoutingDraft): RoutingConfig;
export declare function routingConfigMutations(input: unknown): RoutingMutation[];
export declare function routingDraftIssue(draft: RoutingDraft, catalog?: ModelCatalog, catalogReady?: boolean): RoutingValidationIssue | undefined;
/** Staged, revision-bound V3 editor. Preset toggles, custom categories, previews, and saves are explicit actions. */
export declare class RoutingEditor {
    private state;
    private listeners;
    private readonly customBindings;
    private readonly explicitTargets;
    private savedConfig;
    private savedFingerprint;
    private persistedCustomIds;
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
    private computeDirty;
    private accept;
    edit(draft: RoutingDraft, revision?: number | undefined): void;
    editBehavior(patch: Partial<RoutingBehavior>, revision?: number | undefined): void;
    setBuiltinEnabled(id: BuiltinId, enabled: boolean, revision?: number | undefined): void;
    /** Bulk-toggle builtin enabled switches only; preserves bindings, custom categories, and requires explicit Save. */
    applyBuiltinPreset(preset: BuiltinPreset, revision?: number | undefined): void;
    setSectionBinding(section: RoutingSection, binding: Binding, revision?: number | undefined): void;
    setCategoryMode(section: Exclude<RoutingSection, 'default'>, mode: 'default' | 'target', revision?: number | undefined): void;
    setNativeModelMode(section: RoutingSection, mode: 'inherit' | 'explicit', revision?: number | undefined, choice?: {
        provider: string;
        model: string;
    }): void;
    setSectionEffort(section: RoutingSection, provider: string, model: string, effort: string, revision?: number | undefined): void;
    addCustomCategory(seed?: CustomCategorySeed, revision?: number | undefined): string | undefined;
    updateCustomCategory(id: string, patch: Partial<Pick<CustomCategoryDraft, 'id' | 'name' | 'purpose' | 'avoid' | 'enabled' | 'proactive' | 'binding'>>, revision?: number | undefined): void;
    removeCustomCategory(id: string, revision?: number | undefined): void;
    discard(): void;
    applyRecommendations(preview: RecommendationPreview, revision?: number | undefined): boolean;
    save(options?: {
        catalog?: ModelCatalog;
        catalogReady?: boolean;
    }): Promise<boolean>;
}
