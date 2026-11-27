import * as React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { CATEGORIES, CATEGORY_LIST, type CategoryLocale } from '../core/categories.ts';
import { DELEGATION_MODES, PROACTIVE_SPECIALIST_CATEGORIES, type DelegationMode } from '../core/native-subagent.ts';
import { previewRecommendations, RECOMMENDATION_VERSION, type ModelCatalog, type RecommendationPreview } from '../core/recommendations.ts';
import type { CategoryBinding, Target } from '../core/routing-policy.ts';
import { indexCatalog } from './catalog-index.ts';
import { GrantDiagnostics } from './GrantDiagnostics.tsx';
import type { InventoryReader } from './grant-diagnostics.ts';
import { isAllowedModelArray, MODEL_AUTHORIZATION_ENTRY, requiredModelRoutes, planModelGrant, type ModelAuthorizationForm } from './model-grants.ts';
import { Icon, type ModelChoice } from './ModelPicker.tsx';
import { defaultTargetSummary, externalModelSummary, fieldKey, RouteRow, type FieldNode, type RegisterField } from './RouteRow.tsx';
import { RoutingEditor, routingDraftToPolicy, type RoutingForm, type RoutingSection } from './routing-editor.ts';
import { en, NS, zh, type Translate } from './settings-copy.ts';
import { editorStyles } from './settings-styles.tsx';

const DELEGATION_COPY = {
  passive: { label: 'delegationPassive', note: 'delegationPassiveNote' },
  'specialist-first': { label: 'delegationSpecialistFirst', note: 'delegationSpecialistNote' },
  orchestrator: { label: 'delegationOrchestrator', note: 'delegationOrchestratorNote' },
} as const;
const SPECIALIST_TASKS = CATEGORY_LIST.filter(category => PROACTIVE_SPECIALIST_CATEGORIES.has(category.id));
const GENERAL_TASKS = CATEGORY_LIST.filter(category => !PROACTIVE_SPECIALIST_CATEGORIES.has(category.id));

interface ClientServices {
  locale: { register(ns: string, dictionaries: { en: typeof en; zh: typeof zh }): () => void; bind(ns: string): Translate };
  configForms: { get(entry: typeof MODEL_AUTHORIZATION_ENTRY): ModelAuthorizationForm; get(entry: 'team-router'): RoutingForm; whileServed(namespaces: string[], register: () => () => void): () => void };
  slots: { inject(key: string, register: () => () => void): () => void; register(options: Record<string, unknown>, component: (props: { t: Translate }) => React.ReactNode): () => void };
  get(key: 'pluginNavigation'): {openBundle(name: string): void} | undefined;
  remote: { pluginManager?: InventoryReader; settings?: {describe(): Promise<{ok: true; value: {writable: boolean; namespaces: {ns: string; revision: number; value: unknown}[]}} | {ok: false}>}; session: { modelCatalog(): Promise<{ ok: true; value: ModelCatalog } | { ok: false; error: { message: string } }> }; $on(event: string, listener: () => void): () => void };
  on(event: string, listener: () => void): () => void;
}

function DelegationSettings({ t, id, mode, enforced, onMode, onToggle }: {
  t: Translate; id: string; mode: DelegationMode; enforced: boolean; onMode(mode: DelegationMode): void; onToggle(): void;
}) {
  const scope = mode !== 'passive';
  return <section className="dtr-section" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{t('behaviorTitle')}</h3>
    <span id={`${id}-mode`} className="dtr-sr-only">{t('delegationMode')}</span>
    <div role="radiogroup" aria-labelledby={`${id}-mode`} aria-describedby={scope ? `${id}-scope` : undefined} className="dtr-mode-grid" onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      const index = DELEGATION_MODES.indexOf(mode);
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const step = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1
        : event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? DELEGATION_MODES.length - 1
        : step !== 0 ? (index + step + DELEGATION_MODES.length) % DELEGATION_MODES.length : -1;
      const next = DELEGATION_MODES[nextIndex];
      if (next === undefined) return;
      event.preventDefault();
      onMode(next);
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
    }}>
      {DELEGATION_MODES.map(option => {
        const active = mode === option;
        const label = `${id}-${option}`;
        return <button key={option} type="button" role="radio" aria-checked={active} aria-labelledby={label} aria-describedby={`${label}-note`} tabIndex={active ? 0 : -1} className="dtr-mode" onClick={() => { if (!active) onMode(option); }}>
          <span className="dtr-mode-icon"><Icon name={option} /></span>
          {active && <span className="dtr-mode-check"><Icon name="check" /></span>}
          <span className="dtr-mode-title" id={label}>{t(DELEGATION_COPY[option].label)}</span>
          <span className="dtr-mode-copy" id={`${label}-note`}>{t(DELEGATION_COPY[option].note)}</span>
        </button>;
      })}
    </div>
    {scope && <p className="dtr-muted dtr-scope" id={`${id}-scope`}><Icon name="info" />{t('delegationScope')}</p>}
    <div className="dtr-card dtr-toggle-row">
      <div><strong id={`${id}-switch`}>{t('enforceRouting')}</strong><p id={`${id}-switch-hint`} className="dtr-muted">{t('enforceHint')}</p></div>
      <button type="button" role="switch" aria-checked={enforced} aria-labelledby={`${id}-switch`} aria-describedby={`${id}-switch-hint`} className="dtr-switch" onClick={onToggle} />
    </div>
  </section>;
}

export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session'];
export function apply(ctx: Context): void {
  const client = ctx as unknown as ClientServices;
  ctx.effect(() => client.locale.register(NS, { en, zh }), 'team-router: editor dictionaries');
  const form = client.configForms.get('team-router');
  const grants = client.configForms.get(MODEL_AUTHORIZATION_ENTRY);
  let reader: InventoryReader | undefined;
  const inventory = () => reader;
  const optional = ctx as unknown as {inject(keys: string[], callback: (child: Context) => void): void};
  optional.inject(['remote.pluginManager'], child => {
    reader = (child as unknown as ClientServices).remote.pluginManager;
    child.effect(() => () => { reader = undefined; }, 'team-router: release diagnostics reader');
  });
  let describe: (() => ReturnType<NonNullable<ClientServices['remote']['settings']>['describe']>) | undefined;
  optional.inject(['remote.settings'], child => {
    const settings = (child as unknown as ClientServices).remote.settings!;
    describe = () => settings.describe();
    child.effect(() => () => { describe = undefined; }, 'team-router: release settings probe');
  });
  // This read is diagnostic only. The shared Host form remains authoritative for writes and CAS.
  const recheck = async (): Promise<'available' | 'unchanged' | 'unknown'> => {
    const reply = await describe?.();
    if (!reply?.ok) return 'unknown';
    const row = reply.value.namespaces.find(item => item.ns === MODEL_AUTHORIZATION_ENTRY);
    const v = row?.value as { enabled?: unknown; allowedModels?: unknown } | undefined;
    return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && isAllowedModelArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
  };
  const readGrants = () => grants.getSnapshot();
  const subscribeGrants = (listener: () => void) => grants.subscribe(listener);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener: () => void) => form.subscribe(listener);

  function Editor({ t }: { t: Translate }): React.ReactNode {
    const [editor, setEditor] = React.useState<RoutingEditor>();
    // Both pages observe the same Host config, but neither carries an unsaved
    // draft or migration confirmation into the other. Subscribe only on mount.
    React.useLayoutEffect(() => {
      const mounted = new RoutingEditor(form, grants);
      setEditor(mounted);
      return () => mounted.dispose();
    }, []);
    return editor ? <EditorForm t={t} editor={editor} /> : null;
  }

  function EditorForm({ t, editor }: { t: Translate; editor: RoutingEditor }): React.ReactNode {
    const host = React.useSyncExternalStore(subscribeForm, readForm);
    const grantSnapshot = React.useSyncExternalStore(subscribeGrants, readGrants);
    const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React.useState<ModelCatalog>();
    const [catalogBusy, setCatalogBusy] = React.useState(true);
    const [catalogError, setCatalogError] = React.useState<string>();
    const requestCatalogRefresh = React.useRef<() => void>();
    const [overwrite, setOverwrite] = React.useState(false);
    const [preview, setPreview] = React.useState<{ value: RecommendationPreview; revision: number | undefined; catalog: ModelCatalog }>();
    const [previewError, setPreviewError] = React.useState<string>();
    const [focus, setFocus] = React.useState<string>();
    const fields = React.useRef(new Map<string, FieldNode>());
    const issueSummary = React.useRef<HTMLParagraphElement>(null);
    const previewButton = React.useRef<HTMLButtonElement>(null);
    const routingHeading = React.useRef<HTMLHeadingElement>(null);
    const restorePreviewFocus = React.useRef(false);
    const instance = React.useId();
    const locale: CategoryLocale = t('language') === 'zh' ? 'zh' : 'en';
    const draft = state.draft;
    const grantPlan = React.useMemo(() => draft && planModelGrant(requiredModelRoutes(draft), grantSnapshot), [draft, grantSnapshot]);
    const needsGrant = grantPlan?.kind === 'write';
    const grantProblem = grantPlan?.kind === 'unavailable' ? grantPlan.reason : grantPlan?.kind === 'readOnly' ? 'readOnly' : undefined;
    const navigation = grantProblem ? client.get('pluginNavigation') : undefined;
    const openBundle = React.useCallback((name: string) => navigation?.openBundle(name), [navigation]);
    const hostDisabled = state.saving || host.status !== 'ready' || !host.writable;
    const disabled = hostDisabled || preview !== undefined || state.stale;
    const catalogReady = catalog !== undefined && !catalogBusy && catalogError === undefined;
    const catalogIndex = React.useMemo(() => indexCatalog(catalog), [catalog]);
    const catalogStatus = catalogBusy ? t('catalogLoading') : catalogError === undefined ? undefined : t('catalogError', { message: catalogError });
    const pickerStatus = catalog === undefined ? catalogStatus : undefined;
    const defaultSummary = draft && defaultTargetSummary(t, draft.defaultTarget, catalogIndex, catalogReady);
    const closePreview = React.useCallback(() => { restorePreviewFocus.current = true; setPreview(undefined); }, []);

    React.useEffect(() => {
      let active = true;
      let running = false;
      let queued = false;
      const refresh = (): void => {
        if (!active) return;
        if (running) { queued = true; return; }
        running = true;
        setCatalogBusy(true);
        void (async () => {
          try {
            do {
              queued = false;
              try {
                const response = await client.remote.session.modelCatalog();
                if (!active) return;
                if (response.ok) { setCatalog(response.value); setCatalogError(undefined); }
                else setCatalogError(response.error.message);
              } catch (error) {
                if (active) setCatalogError(error instanceof Error ? error.message : String(error));
              }
            } while (active && queued);
          } finally {
            running = false;
            if (active) setCatalogBusy(false);
          }
        })();
      };
      requestCatalogRefresh.current = refresh;
      const stops = [
        ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated'].map(event => client.remote.$on(event, refresh)),
        client.on('connection/reset', refresh),
      ];
      refresh();
      return () => { active = false; requestCatalogRefresh.current = undefined; for (const stop of stops) stop(); };
    }, []);
    React.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      const target = field && !field.matches(':disabled') ? field : issueSummary.current;
      if (target) {
        const details = target.closest('details');
        if (details) details.open = true;
        target.scrollIntoView({ block: 'nearest' });
        target.focus({ preventScroll: true });
      }
      setFocus(undefined);
    }, [focus, state.issue, draft]);
    React.useLayoutEffect(() => {
      if (!preview) return;
      const onEscape = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape' || event.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        closePreview();
      };
      document.addEventListener('keydown', onEscape, true);
      return () => document.removeEventListener('keydown', onEscape, true);
    }, [preview, closePreview]);
    React.useLayoutEffect(() => {
      if (!preview && restorePreviewFocus.current) {
        restorePreviewFocus.current = false;
        const target = previewButton.current?.matches(':enabled') ? previewButton.current : routingHeading.current;
        target?.focus({ preventScroll: true });
      }
    }, [preview]);
    const registerField = React.useCallback<RegisterField>((section, field, node) => {
      const key = fieldKey(section, field);
      if (node) fields.current.set(key, node); else fields.current.delete(key);
    }, []);
    const registerHistory = React.useCallback((node: HTMLInputElement | null) => registerField('default', 'historyLimit', node), [registerField]);
    const revision = state.revision;
    const chooseModel = React.useCallback((section: RoutingSection, choice: ModelChoice) => {
      if (choice.mode === 'default') {
        if (section !== 'default') editor.setCategoryMode(section, 'default', revision);
      } else if (choice.mode === 'inherit') {
        editor.setNativeModelMode(section, 'inherit', revision);
      } else {
        editor.setNativeModelMode(section, 'explicit', revision, { provider: choice.provider, id: choice.id });
      }
    }, [editor, revision]);
    const chooseEffort = React.useCallback((section: RoutingSection, provider: string, id: string, effort: string) => {
      const current = editor.getSnapshot().draft;
      if (!current) return;
      const target: Target = { executor: 'native', model: { mode: 'explicit', provider, id, ...(effort ? { reasoningEffort: effort } : {}) } };
      editor.edit(section === 'default' ? { ...current, defaultTarget: target }
        : { ...current, categories: { ...current.categories, [section]: { mode: 'target', target } } }, revision);
    }, [editor, revision]);
    const routeRow = (section: RoutingSection, name: string, purpose: string, binding: CategoryBinding): React.ReactNode => {
      const followsDefault = binding.mode === 'default';
      const target = binding.mode === 'target' ? binding.target : undefined;
      const explicit = target?.executor === 'native' && target.model.mode === 'explicit' ? target.model : undefined;
      const legacyModel = target && target.executor !== 'native' ? externalModelSummary(target, t) : undefined;
      return <RouteRow key={section} t={t} section={section} name={name} purpose={purpose} instance={instance}
        catalog={catalogIndex} catalogStatus={pickerStatus} catalogReady={catalogReady} executor={target?.executor ?? 'native'} legacyModel={legacyModel}
        provider={explicit?.provider} model={explicit?.id} effort={explicit?.reasoningEffort} followsDefault={followsDefault}
        defaultSummary={section === 'default' ? undefined : defaultSummary} disabled={disabled}
        issueField={state.issue?.section === section ? state.issue.field : undefined} registerField={registerField} onModel={chooseModel} onEffort={chooseEffort} />;
    };
    const taskGroup = (entries: typeof CATEGORY_LIST, specialist: boolean): React.ReactNode => {
      const group = specialist ? 'specialist' : 'general';
      return <section className="dtr-group" aria-labelledby={`dtr-${instance}-${group}`}>
        <div className="dtr-inline dtr-group-heading"><h4 id={`dtr-${instance}-${group}`}>{t(group)}</h4><span className="dtr-count">{entries.length}</span>{specialist && <span className="dtr-pill dtr-pill-brand">{t('proactive')}</span>}</div>
        {draft && entries.map(entry => routeRow(entry.id, entry[locale].name, entry[locale].purpose, draft.categories[entry.id]))}
      </section>;
    };
    const save = (): void => {
      void editor.save({ ...(catalog === undefined ? {} : { catalog }), catalogReady }).then(() => {
        const issue = editor.getSnapshot().issue;
        if (issue) setFocus(fieldKey(issue.section, issue.field));
      });
    };
    const makePreview = (): void => {
      if (!draft || !catalog || !catalogReady) return;
      try {
        setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision, catalog });
        setPreviewError(undefined);
      } catch (error) { setPreviewError(error instanceof Error ? error.message : String(error)); }
    };
    const previewStale = preview !== undefined && (!catalogReady || preview.catalog !== catalog || preview.revision !== host.revision || preview.revision !== revision);
    const migrationPending = state.migrationRequired && !state.migrationConfirmed;
    const saveError = state.error?.kind === 'grantUnavailable' || state.error?.kind === 'grantReadOnly' ? undefined : state.error;
    const feedbackId = `dtr-${instance}`;
    const problem = state.stale ? { status: 'draftStale', target: 'stale' } as const
      : grantProblem ? { status: grantProblem === 'readOnly' ? 'authorizationReadOnly' : 'authorizationUnavailable', target: 'grant-problem' } as const
      : migrationPending ? { status: 'migrationPending', target: 'migration-card' } as const
      : state.issue || previewError !== undefined || saveError ? { status: 'saveProblem', target: state.issue ? 'issue' : previewError !== undefined ? 'preview-error' : 'save-error' } as const
      : undefined;
    const status = problem?.status ?? (needsGrant ? 'needsGrant' : state.dirty ? 'dirty' : state.notice ?? 'current');
    const reviewProblem = (): void => {
      if (!problem) return;
      const target = document.getElementById(`${feedbackId}-${problem.target}`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    const historyInvalid = state.issue?.section === 'default' && state.issue.field === 'historyLimit';
    const catalogPartial = catalog?.failures.length ? t('catalogPartial', { message: catalog.failures.map(failure => `${failure.name}: ${failure.message}`).join('; ') }) : undefined;

    return <div className="dtr-editor" aria-busy={state.saving}>
      {editorStyles}
      <header className="dtr-header">
        <h2>{t('title')}</h2><p className="dtr-muted">{t('description')}</p>
        {host.status === 'loading' && <p role="status" className="dtr-muted">{t('loading')}</p>}
        {host.status === 'unavailable' && <p role="status" className="dtr-muted">{t('unavailable')}</p>}
        {host.status === 'ready' && !host.writable && <p className="dtr-muted dtr-warning" role="status">{t('readOnly')}</p>}
      </header>
      {draft && <>
        <fieldset disabled={disabled}>
          <DelegationSettings t={t} id={`dtr-${instance}-behavior`} mode={state.behavior.delegationMode} enforced={state.behavior.enforceNativeSubagentRouting}
            onMode={mode => editor.editBehavior({ delegationMode: mode }, revision)}
            onToggle={() => editor.editBehavior({ enforceNativeSubagentRouting: !state.behavior.enforceNativeSubagentRouting }, revision)} />
        </fieldset>
        {state.migrationRequired && <section id={`${feedbackId}-migration-card`} tabIndex={-1} className="dtr-section dtr-card dtr-note" aria-labelledby={`dtr-${instance}-migration`}>
          <h3 id={`dtr-${instance}-migration`}>{t('migrationTitle')}</h3><p className="dtr-muted">{t('migrationHint')}</p>
          <p>{t('migrationCounts', { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 })}</p>
          <div className="dtr-inline">{state.migrationConfirmed ? <p role="status">{t('migrationConfirmed')}</p> : <button type="button" disabled={disabled || state.stale} onClick={() => editor.confirmMigration(revision)}>{t('confirmMigration')}</button>}</div>
        </section>}
        <section className="dtr-section" aria-labelledby={`dtr-${instance}-routing`}>
          <h3 id={`dtr-${instance}-routing`} ref={routingHeading} tabIndex={-1}>{t('routingTitle')}</h3>
          <fieldset disabled={disabled}>{routeRow('default', t('defaults'), t('defaultPurpose'), { mode: 'target', target: draft.defaultTarget })}</fieldset>
          <fieldset disabled={disabled}>
            <div className="dtr-inline dtr-toolbar">
              <div className="dtr-inline dtr-toolset">
                <button type="button" ref={previewButton} disabled={!catalogReady || state.stale} onClick={makePreview} aria-describedby={`dtr-${instance}-recommendation-help`}>{t('recommendations')}</button>
                <span id={`dtr-${instance}-recommendation-help`} className="dtr-sr-only">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</span>
                <label className="dtr-inline dtr-check dtr-muted"><input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.currentTarget.checked)} />{t('overwrite')}</label>
              </div>
              {(catalogBusy || catalogError !== undefined || catalogPartial) && <div className="dtr-inline dtr-catalog-status">
                <p className={`dtr-muted${catalogBusy ? '' : ' dtr-warning'}`} role="status">{catalogStatus ?? catalogPartial}</p>
                {!catalogBusy && <button type="button" onClick={() => requestCatalogRefresh.current?.()}>{t('retry')}</button>}
              </div>}
            </div>
          </fieldset>
          {preview && <section className="dtr-card dtr-note" aria-labelledby={`dtr-${instance}-preview-title`}>
            <h4 id={`dtr-${instance}-preview-title`}>{t('previewTitle')}</h4>
            <p className="dtr-muted">{t('previewHint')}</p>
            <p className="dtr-muted">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</p>
            {preview.value.changes.length ? <ul className="dtr-preview-list">{preview.value.changes.map(change => <li key={change.category}>
              <strong>{CATEGORIES[change.category][locale].name}</strong>
              <div className="dtr-inline dtr-diff">
                <span className="dtr-pill"><span className="dtr-sr-only">{t('before')} </span>{change.before.mode === 'default' ? `${t('useDefault')} · ${defaultSummary}` : previewTarget(change.before.target, t)}</span>
                <Icon name="arrow" />
                <span className="dtr-pill dtr-pill-brand"><span className="dtr-sr-only">{t('after')} </span>{previewTarget(change.after.target, t)}</span>
              </div>
            </li>)}</ul> : <p>{t('noChanges')}</p>}
            {previewStale && <p className="dtr-muted dtr-warning" role="status">{t('previewChanged')}</p>}
            <p className="dtr-muted">{t('preserved', { count: preview.value.preserved.length })} · {t('unmatched', { count: preview.value.unavailable.length })}</p>
            <div className="dtr-inline"><button type="button" autoFocus onClick={closePreview}>{t('cancelPreview')}</button><button type="button" className="dtr-primary" disabled={hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale} onClick={() => { if (editor.applyRecommendations(preview.value, preview.revision)) closePreview(); }}>{t('applyPreview')}</button></div>
          </section>}
          <fieldset disabled={disabled}><div className="dtr-group">{taskGroup(SPECIALIST_TASKS, true)}{taskGroup(GENERAL_TASKS, false)}</div></fieldset>
        </section>
        <details className="dtr-section dtr-card dtr-advanced"><summary>{t('advanced')}</summary>
          <div className="dtr-advanced-body">
            <label className="dtr-field dtr-history">{t('historyLimit')}
              <input ref={registerHistory} id={`dtr-${instance}-history`} aria-invalid={historyInvalid || undefined} aria-describedby={historyInvalid ? `dtr-${instance}-issue` : undefined}
                type="number" min={1} max={1000} step={1} disabled={disabled} value={draft.historyLimit} onChange={event => editor.edit({ ...draft, historyLimit: event.currentTarget.value }, revision)} />
            </label>
            <p className="dtr-muted dtr-warning">Codex / Antigravity (agy) / Cursor: {t('externalBlocked')}</p>
          </div>
        </details>
      </>}
      <div className="dtr-feedback" aria-live="polite">
        {state.stale && <p id={`${feedbackId}-stale`} tabIndex={-1} className="dtr-muted dtr-warning">{t('stale')}</p>}
        {state.issue && <p ref={issueSummary} tabIndex={-1} id={`${feedbackId}-issue`} role="alert" className="dtr-error">{state.issue.section === 'default' ? t('defaults') : CATEGORIES[state.issue.section][locale].name} · {t(state.issue.field)}: {state.issue.detail ?? t(state.issue.reason)}</p>}
        {previewError !== undefined && <p id={`${feedbackId}-preview-error`} tabIndex={-1} role="alert" className="dtr-error">{t('validationError', { message: previewError })}</p>}
        {grantProblem && <GrantDiagnostics key={grantProblem} id={`${feedbackId}-grant-problem`} problem={grantProblem} locale={locale} inventory={inventory} recheck={recheck} dirty={state.dirty} openBundle={navigation ? openBundle : undefined} />}
        {saveError && !(state.stale && saveError.kind === 'refused') && <p id={`${feedbackId}-save-error`} tabIndex={-1} role="alert" className="dtr-error">{saveError.kind === 'grantFailed' ? t('grantFailed') : saveError.kind === 'refused' ? t('refused') : saveError.kind === 'migration' ? t('migrationRequired') : saveError.kind === 'previewChanged' ? t('previewChanged') : t(saveError.kind === 'validation' ? 'validationError' : 'transportError', { message: saveError.detail })}</p>}
      </div>
      {draft && <footer className="dtr-footer">
        <div className="dtr-inline">
          <span className="dtr-status dtr-muted" data-status={status} role="status">{t(status)}</span>
          {problem && <button type="button" className="dtr-review-problem" aria-controls={`${feedbackId}-${problem.target}`} onClick={reviewProblem}>{t('reviewProblem')}</button>}
        </div>
        <div className="dtr-inline dtr-footer-actions">
          <button type="button" disabled={state.saving || (!state.stale && (preview !== undefined || !state.dirty))} onClick={() => {
            setPreview(undefined); setPreviewError(undefined); editor.discard();
          }}>{t(state.stale ? 'reload' : 'cancel')}</button>
          <button type="button" className="dtr-primary" disabled={disabled || !!grantProblem || (!state.dirty && !needsGrant)} onClick={save}>{t(state.saving ? 'saving' : 'save')}</button>
        </div>
      </footer>}
    </div>;
  }
  const t = client.locale.bind(NS);
  // The bundle detail is keyed by npm package name, not the Host configuration row ID.
  // Subscribe independently: a peer without the Plugins page can still use Settings.
  ctx.effect(() => client.configForms.whileServed(['team-router'], () => client.slots.inject('plugins.bundle.config', () => client.slots.register({
    name: 'plugins.bundle.config', key: 'dsh-team-router', locale: NS,
  }, Editor))), 'team-router: bundle detail configuration');
  ctx.effect(() => client.configForms.whileServed(['team-router'], () => client.slots.inject('settings.section', () => client.slots.register({
    name: 'settings.section', id: 'team-router', order: 35, label: () => t('title'), locale: NS,
  }, Editor))), 'team-router: settings section');
}

function previewTarget(target: Target, t: Translate): string {
  const executor = target.executor === 'native' ? t('native') : target.executor;
  if (target.model.mode === 'inherit') return `${executor} · ${t('inherit')}`;
  if (target.model.mode === 'executor-default') return `${executor} · ${t('executorDefault')}`;
  const model = target.model;
  return `${executor} · ${'provider' in model ? `${model.provider} / ` : ''}${model.id}${model.reasoningEffort ? ` · ${model.reasoningEffort}` : ''}`;
}
