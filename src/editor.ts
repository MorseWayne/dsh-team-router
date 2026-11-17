import { parseConfig } from './policy.ts';
import type { NormalizedConfig, Route } from './policy.ts';

export interface RouteRow { key: string; name: string; provider: string; model: string; reasoningEffort: string }
export interface RuleRow { key: string; id: string; keywords: string; route: string; priority: string }
export interface RoleRow { key: string; name: string; route: string }
export interface EditorDraft { routes: RouteRow[]; rules: RuleRow[]; roles: RoleRow[]; defaultRoute: string; historyLimit: string }
export type EditorMutation = { op: 'set'; path: string[]; value: unknown } | { op: 'unset'; path: string[] };
export type FormPolicy = Omit<NormalizedConfig, 'defaultRoute'> & { defaultRoute?: string | null };
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
export type EditorError = { kind: 'validation' | 'refused' | 'transport'; detail: string };
export interface EditorSnapshot {
  draft: EditorDraft | undefined;
  revision: number | undefined;
  dirty: boolean;
  saving: boolean;
  stale: boolean;
  error: EditorError | undefined;
  notice: 'saved' | 'reset' | undefined;
}
let sequence = 0;
export function rowKey(): string { return `row-${++sequence}`; }

/** Detached edit rows preserve duplicate names until validation rather than losing them in a map. */
export function policyToDraft(policy: FormPolicy): EditorDraft {
  return {
    routes: Object.entries(policy.routes).map(([name, route]) => ({ key: rowKey(), name, ...route, reasoningEffort: route.reasoningEffort ?? '' })),
    rules: policy.rules.map(rule => ({ key: rowKey(), id: rule.id, keywords: rule.keywords.join('\n'), route: rule.route, priority: String(rule.priority) })),
    roles: Object.entries(policy.roles).map(([name, route]) => ({ key: rowKey(), name, route })),
    defaultRoute: policy.defaultRoute ?? '', historyLimit: String(policy.historyLimit),
  };
}

/** The Host's parser remains the final structural authority; no YAML or JSON text is edited. */
export function draftToPolicy(draft: EditorDraft): NormalizedConfig {
  const routes: Record<string, Route> = Object.create(null);
  for (const row of draft.routes) {
    const name = row.name.trim();
    if (Object.hasOwn(routes, name)) throw new TypeError(`config.routes: duplicate route name ${JSON.stringify(name)}`);
    routes[name] = {
      provider: row.provider.trim(), model: row.model.trim(),
      ...(row.reasoningEffort.trim() === '' ? {} : { reasoningEffort: row.reasoningEffort.trim() }),
    };
  }
  const roles: Record<string, string> = Object.create(null);
  for (const row of draft.roles) {
    if (Object.hasOwn(roles, row.name)) throw new TypeError(`config.roles: duplicate member name ${JSON.stringify(row.name)}`);
    roles[row.name] = row.route;
  }
  return parseConfig({
    routes,
    rules: draft.rules.map(row => ({
      id: row.id, keywords: row.keywords.split(/\r?\n/).map(word => word.trim()).filter(Boolean),
      route: row.route, priority: row.priority.trim() === '' ? 0 : Number(row.priority),
    })),
    roles,
    ...(draft.defaultRoute.trim() === '' ? {} : { defaultRoute: draft.defaultRoute }),
    historyLimit: Number(draft.historyLimit),
  });
}

export type ValidationField = 'routeName' | 'provider' | 'model' | 'effort' | 'ruleId' | 'priority' | 'keywords' | 'target' | 'memberName' | 'defaultRoute' | 'historyLimit';
export type ValidationReason = 'validationRequired' | 'validationDuplicateRoute' | 'validationUnsafeName' | 'validationRouteLimit' | 'validationDuplicateRule' | 'validationRuleLimit' | 'validationPriority' | 'validationKeywordLimit' | 'validationKeywordLength' | 'validationDuplicateRole' | 'validationUnknownRoute' | 'validationHistory' | 'validationCatalog';
export interface DraftValidationIssue { rowKey: string; field: ValidationField; reasonKey: ValidationReason }
const unsafeNames = new Set(['__proto__', 'prototype', 'constructor']);
/** Locate the first invalid visual control without mutating or collapsing duplicate rows. */
export function draftValidationIssue(draft: EditorDraft): DraftValidationIssue | undefined {
  const issue = (rowKey: string, field: ValidationField, reasonKey: ValidationReason): DraftValidationIssue => ({ rowKey, field, reasonKey });
  const routes = new Set<string>();
  for (const [index, row] of draft.routes.entries()) {
    const name = row.name.trim();
    if (index >= 64) return issue(row.key, 'routeName', 'validationRouteLimit');
    if (!name) return issue(row.key, 'routeName', 'validationRequired');
    if (unsafeNames.has(name)) return issue(row.key, 'routeName', 'validationUnsafeName');
    if (routes.has(name)) return issue(row.key, 'routeName', 'validationDuplicateRoute');
    routes.add(name);
    if (!row.provider.trim()) return issue(row.key, 'provider', 'validationRequired');
    if (!row.model.trim()) return issue(row.key, 'model', 'validationRequired');
  }
  const ruleIds = new Set<string>();
  for (const [index, row] of draft.rules.entries()) {
    const id = row.id.trim();
    if (index >= 64) return issue(row.key, 'ruleId', 'validationRuleLimit');
    if (!id) return issue(row.key, 'ruleId', 'validationRequired');
    if (ruleIds.has(id)) return issue(row.key, 'ruleId', 'validationDuplicateRule');
    ruleIds.add(id);
    const priority = row.priority.trim() === '' ? 0 : Number(row.priority);
    if (!Number.isInteger(priority) || priority < -1000 || priority > 1000) return issue(row.key, 'priority', 'validationPriority');
    const words = row.keywords.split(/\r?\n/).map(word => word.trim()).filter(Boolean);
    if (words.length > 32) return issue(row.key, 'keywords', 'validationKeywordLimit');
    if (words.some(word => word.length > 100)) return issue(row.key, 'keywords', 'validationKeywordLength');
    if (!row.route.trim()) return issue(row.key, 'target', 'validationRequired');
    if (!routes.has(row.route.trim())) return issue(row.key, 'target', 'validationUnknownRoute');
  }
  const roles = new Set<string>();
  for (const row of draft.roles) {
    if (!row.name.trim()) return issue(row.key, 'memberName', 'validationRequired');
    if (unsafeNames.has(row.name)) return issue(row.key, 'memberName', 'validationUnsafeName');
    if (roles.has(row.name)) return issue(row.key, 'memberName', 'validationDuplicateRole');
    roles.add(row.name);
    if (!row.route.trim()) return issue(row.key, 'target', 'validationRequired');
    if (!routes.has(row.route.trim())) return issue(row.key, 'target', 'validationUnknownRoute');
  }
  if (draft.defaultRoute.trim() && !routes.has(draft.defaultRoute.trim())) return issue('defaults', 'defaultRoute', 'validationUnknownRoute');
  const limit = Number(draft.historyLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) return issue('defaults', 'historyLimit', 'validationHistory');
  return undefined;
}
/** Turning all named routes off needs no provider metadata or credential-dependent catalog. */
export function policyRequiresCatalog(policy: NormalizedConfig): boolean { return Object.keys(policy.routes).length > 0; }

/** Exactly five policy fields; stateDir and future unrelated Host fields are never overwritten. */
export function policyMutations(policy: NormalizedConfig): EditorMutation[] {
  return [
    { op: 'set', path: ['routes'], value: policy.routes },
    { op: 'set', path: ['rules'], value: policy.rules },
    { op: 'set', path: ['roles'], value: policy.roles },
    // null explicitly disables a composition default; unset would re-inherit it.
    { op: 'set', path: ['defaultRoute'], value: policy.defaultRoute ?? null },
    { op: 'set', path: ['historyLimit'], value: policy.historyLimit },
  ];
}
export function resetMutations(): EditorMutation[] {
  return ['routes', 'rules', 'roles', 'defaultRoute', 'historyLimit'].map(field => ({ op: 'unset', path: [field] }));
}
export function moveRule(rows: readonly RuleRow[], index: number, delta: number): RuleRow[] {
  const next = [...rows];
  const target = index + delta;
  if (index < 0 || index >= rows.length || target < 0 || target >= rows.length) return next;
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

/** Staged CAS editor. A refused write or a pushed update can never discard a local draft. */
export class PolicyEditor {
  private snapshot: EditorSnapshot = { draft: undefined, revision: undefined, dirty: false, saving: false, stale: false, error: undefined, notice: undefined };
  private listeners = new Set<() => void>();
  private readonly stop: () => void;
  private disposed = false;
  private readonly form: EditorForm;
  constructor(form: EditorForm) {
    this.form = form;
    this.accept();
    this.stop = form.subscribe(() => {
      if (this.snapshot.saving) return;
      if (!this.snapshot.dirty) this.accept();
      else this.publish({ ...this.snapshot, stale: form.getSnapshot().revision !== this.snapshot.revision });
    });
  }
  readonly getSnapshot = (): EditorSnapshot => this.snapshot;
  readonly subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  dispose(): void { this.disposed = true; this.stop(); this.listeners.clear(); }
  private publish(snapshot: EditorSnapshot): void {
    if (this.disposed) return;
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
  private accept(notice?: 'saved' | 'reset'): void {
    const host = this.form.getSnapshot();
    this.publish({ draft: host.value === undefined ? undefined : policyToDraft(host.value), revision: host.revision, dirty: false, saving: false, stale: false, error: undefined, notice });
  }
  edit(draft: EditorDraft, revision = this.snapshot.revision): void {
    if (this.snapshot.saving || !this.form.getSnapshot().writable) return;
    // The UI may still dispatch an event from a render immediately preceding a Host push.
    this.publish({ ...this.snapshot, draft, revision, dirty: true, stale: this.form.getSnapshot().revision !== revision, error: undefined, notice: undefined });
  }
  /** Explicit cancel/reload is the only operation that drops a stale dirty draft. */
  discard(): void { if (!this.snapshot.saving) this.accept(); }
  save(): Promise<boolean> { return this.commit(false, this.snapshot.revision); }
  reset(confirmedRevision = this.snapshot.revision): Promise<boolean> { return this.commit(true, confirmedRevision); }
  private async commit(reset: boolean, confirmedRevision: number | undefined): Promise<boolean> {
    const state = this.snapshot;
    const host = this.form.getSnapshot();
    if (state.saving || state.draft === undefined || confirmedRevision === undefined || host.status !== 'ready' || !host.writable) return false;
    // A confirmation authorizes only the exact values visible when it opened, never later pushes.
    if (reset && (state.dirty || host.revision !== confirmedRevision || state.revision !== confirmedRevision)) return false;
    let ops: EditorMutation[];
    try { ops = reset ? resetMutations() : policyMutations(draftToPolicy(state.draft)); }
    catch (error) {
      this.publish({ ...state, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) }, notice: undefined });
      return false;
    }
    this.publish({ ...state, saving: true, error: undefined, notice: undefined });
    try {
      const accepted = await this.form.mutate(ops, confirmedRevision);
      if (accepted) this.accept(reset ? 'reset' : 'saved');
      else this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision, error: { kind: 'refused', detail: '' }, notice: undefined });
      return accepted;
    } catch (error) {
      this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision, error: { kind: 'transport', detail: error instanceof Error ? error.message : String(error) }, notice: undefined });
      return false;
    }
  }
}
