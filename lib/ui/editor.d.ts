import type { NormalizedConfig } from '../core/policy.ts';
export interface RouteRow {
    key: string;
    name: string;
    provider: string;
    model: string;
    reasoningEffort: string;
}
export interface RuleRow {
    key: string;
    id: string;
    keywords: string;
    route: string;
    priority: string;
}
export interface RoleRow {
    key: string;
    name: string;
    route: string;
}
export interface EditorDraft {
    routes: RouteRow[];
    rules: RuleRow[];
    roles: RoleRow[];
    defaultRoute: string;
    historyLimit: string;
}
export type EditorMutation = {
    op: 'set';
    path: string[];
    value: unknown;
} | {
    op: 'unset';
    path: string[];
};
export type FormPolicy = Omit<NormalizedConfig, 'defaultRoute'> & {
    defaultRoute?: string | null;
};
export interface FormSnapshot {
    status: 'loading' | 'ready' | 'unavailable';
    value: FormPolicy | undefined;
    revision: number | undefined;
    writable: boolean;
}
export interface EditorForm {
    getSnapshot(): FormSnapshot;
    subscribe(listener: () => void): () => void;
    mutate(ops: readonly EditorMutation[], expectedRevision?: number): Promise<boolean>;
}
export type EditorError = {
    kind: 'validation' | 'refused' | 'transport';
    detail: string;
};
export interface EditorSnapshot {
    draft: EditorDraft | undefined;
    revision: number | undefined;
    dirty: boolean;
    saving: boolean;
    stale: boolean;
    error: EditorError | undefined;
    notice: 'saved' | 'reset' | undefined;
}
export declare function rowKey(): string;
/** Detached edit rows preserve duplicate names until validation rather than losing them in a map. */
export declare function policyToDraft(policy: FormPolicy): EditorDraft;
/** The Host's parser remains the final structural authority; no YAML or JSON text is edited. */
export declare function draftToPolicy(draft: EditorDraft): NormalizedConfig;
export type ValidationField = 'routeName' | 'provider' | 'model' | 'effort' | 'ruleId' | 'priority' | 'keywords' | 'target' | 'memberName' | 'defaultRoute' | 'historyLimit';
export type ValidationReason = 'validationRequired' | 'validationDuplicateRoute' | 'validationUnsafeName' | 'validationRouteLimit' | 'validationDuplicateRule' | 'validationRuleLimit' | 'validationPriority' | 'validationKeywordLimit' | 'validationKeywordLength' | 'validationDuplicateRole' | 'validationUnknownRoute' | 'validationHistory' | 'validationCatalog';
export interface DraftValidationIssue {
    rowKey: string;
    field: ValidationField;
    reasonKey: ValidationReason;
}
/** Locate the first invalid visual control without mutating or collapsing duplicate rows. */
export declare function draftValidationIssue(draft: EditorDraft): DraftValidationIssue | undefined;
/** Turning all named routes off needs no provider metadata or credential-dependent catalog. */
export declare function policyRequiresCatalog(policy: NormalizedConfig): boolean;
/** Exactly five policy fields; stateDir and future unrelated Host fields are never overwritten. */
export declare function policyMutations(policy: NormalizedConfig): EditorMutation[];
export declare function resetMutations(): EditorMutation[];
export declare function moveRule(rows: readonly RuleRow[], index: number, delta: number): RuleRow[];
/** Staged CAS editor. A refused write or a pushed update can never discard a local draft. */
export declare class PolicyEditor {
    private snapshot;
    private listeners;
    private readonly stop;
    private disposed;
    private readonly form;
    constructor(form: EditorForm);
    readonly getSnapshot: () => EditorSnapshot;
    readonly subscribe: (listener: () => void) => (() => void);
    dispose(): void;
    private publish;
    private accept;
    edit(draft: EditorDraft, revision?: number | undefined): void;
    /** Explicit cancel/reload is the only operation that drops a stale dirty draft. */
    discard(): void;
    save(): Promise<boolean>;
    reset(confirmedRevision?: number | undefined): Promise<boolean>;
    private commit;
}
