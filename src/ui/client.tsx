import * as React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { resolveActiveRegistry } from '../core/active-registry.ts';
import {
  BUILTIN_GROUPS, BUILTIN_IDS, BUILTIN_LIST, BUILTINS, isBuiltinId,
  type BuiltinGroupId, type BuiltinId,
} from '../core/categories.ts';
import {
  previewRecommendations, RECOMMENDATION_VERSION,
  type ModelCatalog, type RecommendationPreview,
} from '../core/recommendations.ts';
import { DELEGATION_MODES, type DelegationMode, type Target } from '../core/routing-policy.ts';
import { indexCatalog } from './catalog-index.ts';
import { CategoryGroup } from './CategoryGroup.tsx';
import { CustomCategoryEditor } from './CustomCategoryEditor.tsx';
import { GrantDiagnostics } from './GrantDiagnostics.tsx';
import type { InventoryReader } from './grant-diagnostics.ts';
import {
  MODEL_AUTHORIZATION_ENTRY, planModelGrant, requiredModelRoutes,
  type ModelAuthorizationForm,
} from './model-grants.ts';
import { Icon, type ModelChoice } from './ModelPicker.tsx';
import { fieldKey, RouteRow, targetSummary, type FieldNode, type RegisterField } from './RouteRow.tsx';
import {
  RoutingEditor, routingDraftToConfig,
  type BuiltinPreset, type CustomCategoryDraft, type CustomCategorySeed,
  type RoutingField, type RoutingForm, type RoutingIssueReason, type RoutingSection,
} from './routing-editor.ts';
import { en, NS, zh, type Translate } from './settings-copy.ts';
import { editorStyles } from './settings-styles.tsx';

const DELEGATION_COPY = {
  passive: { label: 'delegationPassive', note: 'delegationPassiveNote' },
  'specialist-first': { label: 'delegationSpecialistFirst', note: 'delegationSpecialistNote' },
  orchestrator: { label: 'delegationOrchestrator', note: 'delegationOrchestratorNote' },
} as const;

const GROUP_ORDER: readonly BuiltinGroupId[] = ['implementation', 'quality', 'analysis', 'general'];
const GROUP_ENTRIES: Readonly<Record<BuiltinGroupId, typeof BUILTIN_LIST>> = {
  implementation: BUILTIN_LIST.filter(entry => entry.group === 'implementation'),
  quality: BUILTIN_LIST.filter(entry => entry.group === 'quality'),
  analysis: BUILTIN_LIST.filter(entry => entry.group === 'analysis'),
  general: BUILTIN_LIST.filter(entry => entry.group === 'general'),
};

interface ClientServices {
  locale: { register(ns: string, dictionaries: { en: typeof en; zh: typeof zh }): () => void; bind(ns: string): Translate };
  configForms: {
    get(entry: typeof MODEL_AUTHORIZATION_ENTRY): ModelAuthorizationForm;
    get(entry: 'team-router'): RoutingForm;
    whileServed(namespaces: string[], register: () => () => void): () => void;
  };
  slots: {
    inject(key: string, register: () => () => void): () => void;
    register(options: Record<string, unknown>, component: (props: { t: Translate }) => React.ReactNode): () => void;
  };
  get(key: 'pluginNavigation'): { openBundle(name: string): void } | undefined;
  remote: {
    pluginManager?: InventoryReader;
    settings?: { describe(): Promise<{ ok: true; value: { writable: boolean; namespaces: { ns: string; revision: number; value: unknown }[] } } | { ok: false }> };
    session: { modelCatalog(): Promise<{ ok: true; value: ModelCatalog } | { ok: false; error: { message: string } }> };
    $on(event: string, listener: () => void): () => void;
  };
  on(event: string, listener: () => void): () => void;
}

function fieldLabel(t: Translate, field: RoutingField): string {
  switch (field) {
    case 'id': return t('fieldId');
    case 'name': return t('fieldName');
    case 'purpose': return t('fieldPurpose');
    case 'avoid': return t('fieldAvoid');
    case 'provider': return t('provider');
    case 'model': return t('model');
    case 'effort': return t('effort');
    case 'historyLimit': return t('historyLimit');
  }
}

function reasonLabel(t: Translate, reason: RoutingIssueReason): string {
  switch (reason) {
    case 'customId': return t('customIdError');
    case 'customDuplicate': return t('customDuplicate');
    case 'customLimit': return t('customLimit');
    case 'text': return t('textError');
    case 'required': return t('required');
    case 'history': return t('history');
    case 'catalog': return t('catalog');
    case 'catalogRequired': return t('catalogRequired');
    case 'structure': return t('structure');
  }
}

function DelegationSettings({ t, id, mode, strict, summary, onMode, onToggleStrict }: {
  t: Translate; id: string; mode: DelegationMode; strict: boolean; summary: string;
  onMode(mode: DelegationMode): void; onToggleStrict(): void;
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
    <p className="dtr-summary-bar" role="status"><Icon name="info" /><span>{summary}</span></p>
    {scope && <p className="dtr-muted dtr-scope" id={`${id}-scope`}><Icon name="info" />{t('delegationScope')}</p>}
    <div className="dtr-card dtr-toggle-row">
      <div><strong id={`${id}-switch`}>{t('enforceRouting')}</strong><p id={`${id}-switch-hint`} className="dtr-muted">{t('enforceHint')}</p></div>
      <button type="button" role="switch" aria-checked={strict} aria-labelledby={`${id}-switch`} aria-describedby={`${id}-switch-hint`} className="dtr-switch" onClick={onToggleStrict} />
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
  const optional = ctx as unknown as { inject(keys: string[], callback: (child: Context) => void): void };
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
  const recheck = async (): Promise<'available' | 'unchanged' | 'unknown'> => {
    const reply = await describe?.();
    if (!reply?.ok) return 'unknown';
    const row = reply.value.namespaces.find(item => item.ns === MODEL_AUTHORIZATION_ENTRY);
    const v = row?.value as Partial<NonNullable<ReturnType<typeof grants.getSnapshot>['value']>> | undefined;
    return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && Array.isArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
  };
  const readGrants = () => grants.getSnapshot();
  const subscribeGrants = (listener: () => void) => grants.subscribe(listener);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener: () => void) => form.subscribe(listener);

  function Editor({ t }: { t: Translate }): React.ReactNode {
    const [editor, setEditor] = React.useState<RoutingEditor>();
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
    const [retry, setRetry] = React.useState(0);
    const [overwrite, setOverwrite] = React.useState(false);
    const [scope, setScope] = React.useState<'all' | BuiltinGroupId>('all');
    const [preview, setPreview] = React.useState<{ value: RecommendationPreview; revision: number | undefined }>();
    const [previewError, setPreviewError] = React.useState<string>();
    const [focus, setFocus] = React.useState<string>();
    const fields = React.useRef(new Map<string, FieldNode>());
    const issueSummary = React.useRef<HTMLParagraphElement>(null);
    const previewButton = React.useRef<HTMLButtonElement>(null);
    const restorePreviewFocus = React.useRef(false);
    const instance = React.useId();
    const locale: 'en' | 'zh' = t('language') === 'zh' ? 'zh' : 'en';
    const draft = state.draft;

    const grantPlan = React.useMemo(() => {
      if (!draft) return undefined;
      try {
        return planModelGrant(requiredModelRoutes(routingDraftToConfig(draft)), grantSnapshot);
      } catch {
        return undefined;
      }
    }, [draft, grantSnapshot]);
    const needsGrant = grantPlan !== undefined && grantPlan.kind !== 'complete';
    const grantProblem = grantPlan?.kind === 'unavailable' ? grantPlan.reason : grantPlan?.kind === 'readOnly' ? 'readOnly' : undefined;
    const navigation = grantProblem ? client.get('pluginNavigation') : undefined;
    const openBundle = React.useCallback((name: string) => navigation?.openBundle(name), [navigation]);
    const hostDisabled = state.saving || host.status !== 'ready' || !host.writable;
    const disabled = hostDisabled || preview !== undefined;
    const catalogReady = catalog !== undefined && !catalogBusy && catalogError === undefined;
    const catalogIndex = React.useMemo(() => indexCatalog(catalog), [catalog]);
    const catalogStatus = catalogBusy ? t('catalogLoading') : catalogError === undefined ? undefined : t('catalogError', { message: catalogError });
    const defaultSummary = draft && targetSummary(t, draft.defaultTarget, catalogIndex, catalogReady);

    const activeSummaryText = React.useMemo(() => {
      if (!draft) return '';
      try {
        const registry = resolveActiveRegistry(routingDraftToConfig(draft));
        const builtinEnabled = registry.entries.filter(entry => entry.origin === 'builtin').length;
        const customEnabled = registry.entries.filter(entry => entry.origin === 'custom').length;
        const proactive = registry.entries.filter(entry => entry.proactive).length;
        return t('activeSummary', {
          builtinEnabled, builtinTotal: BUILTIN_IDS.length,
          customEnabled, customTotal: draft.custom.length, proactive,
        });
      } catch {
        const builtinEnabled = BUILTIN_IDS.filter(id => draft.builtins[id].enabled).length;
        const customEnabled = draft.custom.filter(entry => entry.enabled).length;
        const proactive = BUILTIN_IDS.filter(id => draft.builtins[id].enabled && BUILTINS[id].proactive).length
          + draft.custom.filter(entry => entry.enabled && entry.proactive).length;
        return t('activeSummary', {
          builtinEnabled, builtinTotal: BUILTIN_IDS.length,
          customEnabled, customTotal: draft.custom.length, proactive,
        });
      }
    }, [draft, t]);

    React.useEffect(() => {
      let active = true;
      let generation = 0;
      const refresh = async (): Promise<void> => {
        const current = ++generation;
        setCatalogBusy(true);
        try {
          const response = await client.remote.session.modelCatalog();
          if (!active || current !== generation) return;
          if (response.ok) { setCatalog(response.value); setCatalogError(undefined); }
          else setCatalogError(response.error.message);
        } catch (error) {
          if (active && current === generation) setCatalogError(error instanceof Error ? error.message : String(error));
        } finally { if (active && current === generation) setCatalogBusy(false); }
      };
      const stops = [
        ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated']
          .map(event => client.remote.$on(event, () => { void refresh(); })),
        client.on('connection/reset', () => { void refresh(); }),
      ];
      void refresh();
      return () => { active = false; generation++; for (const stop of stops) stop(); };
    }, [retry]);

    React.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      const target = field && !field.matches(':disabled') ? field : issueSummary.current;
      if (target) {
        let details = target.closest('details');
        while (details) {
          details.open = true;
          details = details.parentElement?.closest('details') ?? null;
        }
        target.scrollIntoView({ block: 'nearest' });
        target.focus({ preventScroll: true });
      }
      setFocus(undefined);
    }, [focus, state.issue, draft]);

    React.useLayoutEffect(() => {
      if (!preview && restorePreviewFocus.current) {
        restorePreviewFocus.current = false;
        if (previewButton.current?.matches(':enabled')) previewButton.current.focus({ preventScroll: true });
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
        editor.setNativeModelMode(section, 'explicit', revision, { provider: choice.provider, model: choice.id });
      }
    }, [editor, revision]);

    const chooseEffort = React.useCallback((section: RoutingSection, provider: string, model: string, effort: string) => {
      editor.setSectionEffort(section, provider, model, effort, revision);
    }, [editor, revision]);

    const toggleBuiltin = React.useCallback((id: BuiltinId, enabled: boolean) => {
      editor.setBuiltinEnabled(id, enabled, revision);
    }, [editor, revision]);

    const applyPreset = React.useCallback((preset: BuiltinPreset) => {
      editor.applyBuiltinPreset(preset, revision);
    }, [editor, revision]);

    const addCustom = React.useCallback((seed?: CustomCategorySeed) => editor.addCustomCategory(seed, revision), [editor, revision]);
    const updateCustom = React.useCallback(
      (id: string, patch: Partial<Pick<CustomCategoryDraft, 'id' | 'name' | 'purpose' | 'avoid' | 'enabled' | 'proactive'>>) => {
        editor.updateCustomCategory(id, patch, revision);
      },
      [editor, revision],
    );
    const removeCustom = React.useCallback((id: string) => editor.removeCustomCategory(id, revision), [editor, revision]);

    const save = (): void => {
      void editor.save({ ...(catalog === undefined ? {} : { catalog }), catalogReady }).then(() => {
        const issue = editor.getSnapshot().issue;
        if (issue) setFocus(fieldKey(issue.section, issue.field));
      });
    };
    const makePreview = (): void => {
      if (!draft || !catalog || !catalogReady) return;
      try {
        setPreview({
          value: previewRecommendations(routingDraftToConfig(draft), catalog, {
            overwrite,
            ...(scope === 'all' ? {} : { group: scope }),
          }),
          revision,
        });
        setPreviewError(undefined);
      } catch (error) { setPreviewError(error instanceof Error ? error.message : String(error)); }
    };
    const closePreview = (): void => { restorePreviewFocus.current = true; setPreview(undefined); };
    const previewStale = preview !== undefined && (preview.revision !== host.revision || preview.revision !== revision);
    const status = needsGrant ? 'needsGrant' : state.dirty ? 'dirty' : state.notice ?? 'current';
    const historyInvalid = state.issue?.section === 'default' && state.issue.field === 'historyLimit';
    const catalogPartial = catalog?.failures.length
      ? t('catalogPartial', { message: catalog.failures.map(failure => `${failure.name}: ${failure.message}`).join('; ') })
      : undefined;

    const issueSectionName = (section: RoutingSection): string => {
      if (section === 'default') return t('defaults');
      if (isBuiltinId(section)) return BUILTINS[section][locale].name;
      return draft?.custom.find(entry => entry.id === section)?.name || section;
    };

    const defaultExplicit = draft?.defaultTarget.mode === 'explicit' ? draft.defaultTarget : undefined;

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
          <DelegationSettings
            t={t} id={`dtr-${instance}-behavior`}
            mode={draft.behavior.delegationMode} strict={draft.behavior.strict} summary={activeSummaryText}
            onMode={delegationMode => editor.editBehavior({ delegationMode }, revision)}
            onToggleStrict={() => editor.editBehavior({ strict: !draft.behavior.strict }, revision)}
          />
        </fieldset>

        <section className="dtr-section" aria-labelledby={`dtr-${instance}-routing`}>
          <h3 id={`dtr-${instance}-routing`}>{t('routingTitle')}</h3>
          <fieldset disabled={disabled}>
            <RouteRow
              t={t} section="default" name={t('defaults')} purpose={t('defaultPurpose')} instance={instance}
              catalog={catalogIndex} catalogReady={catalogReady} catalogStatus={catalogStatus}
              provider={defaultExplicit?.provider} model={defaultExplicit?.model} effort={defaultExplicit?.reasoningEffort}
              followsDefault={false} defaultSummary={undefined} disabled={disabled}
              issueField={state.issue?.section === 'default' ? state.issue.field : undefined}
              registerField={registerField} onModel={chooseModel} onEffort={chooseEffort}
            />
          </fieldset>

          <fieldset disabled={disabled}>
            <div className="dtr-inline dtr-toolbar">
              <div className="dtr-inline dtr-preset-bar">
                <span className="dtr-muted">{t('presetLabel')}</span>
                <button type="button" onClick={() => applyPreset('all')}>{t('presetAll', { count: BUILTIN_IDS.length })}</button>
                <button type="button" onClick={() => applyPreset('classic7')}>{t('presetClassic7')}</button>
              </div>
              <div className="dtr-inline dtr-toolset">
                <select aria-label={t('recommendationScope')} className="dtr-scope-select" value={scope}
                  onChange={event => setScope(event.currentTarget.value as 'all' | BuiltinGroupId)}>
                  <option value="all">{t('scopeAll')}</option>
                  {GROUP_ORDER.map(groupId => <option key={groupId} value={groupId}>{BUILTIN_GROUPS[groupId][locale]}</option>)}
                </select>
                <button type="button" ref={previewButton} disabled={!catalogReady || state.stale} onClick={makePreview}
                  aria-describedby={`dtr-${instance}-recommendation-help`}>{t('recommendations')}</button>
                <span id={`dtr-${instance}-recommendation-help`} className="dtr-sr-only">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</span>
                <label className="dtr-inline dtr-check dtr-muted">
                  <input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.currentTarget.checked)} />
                  {t('overwrite')}
                </label>
              </div>
              {(catalogBusy || catalogError !== undefined || catalogPartial) && <div className="dtr-inline dtr-catalog-status">
                <p className={`dtr-muted${catalogBusy ? '' : ' dtr-warning'}`} role="status">{catalogStatus ?? catalogPartial}</p>
                {!catalogBusy && <button type="button" onClick={() => setRetry(value => value + 1)}>{t('retry')}</button>}
              </div>}
            </div>
            <p className="dtr-muted">{t('presetHint')}</p>
          </fieldset>

          {preview && <section className="dtr-card dtr-note" aria-labelledby={`dtr-${instance}-preview-title`}>
            <h4 id={`dtr-${instance}-preview-title`}>{t('previewTitle')}</h4>
            <p className="dtr-muted">{t('previewHint')}</p>
            <p className="dtr-muted">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</p>
            {preview.value.changes.length ? <ul className="dtr-preview-list">{preview.value.changes.map(change => <li key={change.category}>
              <strong>{BUILTINS[change.category][locale].name}</strong>
              <div className="dtr-inline dtr-diff">
                <span className="dtr-pill">
                  <span className="dtr-sr-only">{t('before')} </span>
                  {change.before.mode === 'default' ? `${t('useDefault')} · ${defaultSummary}` : previewTarget(change.before, t)}
                </span>
                <Icon name="arrow" />
                <span className="dtr-pill dtr-pill-brand">
                  <span className="dtr-sr-only">{t('after')} </span>
                  {previewTarget(change.after, t)}
                </span>
              </div>
            </li>)}</ul> : <p>{t('noChanges')}</p>}
            {previewStale && <p className="dtr-muted dtr-warning" role="status">{t('previewChanged')}</p>}
            <p className="dtr-muted">
              {t('preserved', { count: preview.value.preserved.length })} · {t('unmatched', { count: preview.value.unavailable.length })} · {t('skippedDisabled', { count: preview.value.skippedDisabled.length })}
            </p>
            <div className="dtr-inline">
              <button type="button" autoFocus onClick={closePreview}>{t('cancelPreview')}</button>
              <button type="button" className="dtr-primary" disabled={hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale}
                onClick={() => { if (editor.applyRecommendations(preview.value, preview.revision)) closePreview(); }}>{t('applyPreview')}</button>
            </div>
          </section>}

          <fieldset disabled={disabled}>
            <div className="dtr-groups-stack">
              {GROUP_ORDER.map(groupId => <CategoryGroup
                key={groupId} t={t} locale={locale} groupId={groupId} entries={GROUP_ENTRIES[groupId]}
                draftBuiltins={draft.builtins} instance={instance}
                catalog={catalogIndex} catalogReady={catalogReady} catalogStatus={catalogStatus}
                defaultSummary={defaultSummary} disabled={disabled} issue={state.issue}
                registerField={registerField} onToggleEnabled={toggleBuiltin} onModel={chooseModel} onEffort={chooseEffort}
              />)}
              <CustomCategoryEditor
                t={t} locale={locale} custom={draft.custom} instance={instance}
                catalog={catalogIndex} catalogReady={catalogReady} catalogStatus={catalogStatus}
                defaultSummary={defaultSummary} disabled={disabled} issue={state.issue}
                registerField={registerField} onAdd={addCustom} onUpdate={updateCustom} onRemove={removeCustom}
                onModel={chooseModel} onEffort={chooseEffort}
              />
            </div>
          </fieldset>
        </section>

        <details className="dtr-section dtr-card dtr-advanced"><summary>{t('advanced')}</summary>
          <div className="dtr-advanced-body">
            <div className="dtr-toggle-row">
              <div>
                <strong id={`dtr-${instance}-guidance`}>{t('guidanceToggle')}</strong>
                <p id={`dtr-${instance}-guidance-hint`} className="dtr-muted">{t('guidanceHint')}</p>
              </div>
              <button type="button" role="switch" aria-checked={draft.behavior.guidance}
                aria-labelledby={`dtr-${instance}-guidance`} aria-describedby={`dtr-${instance}-guidance-hint`}
                className="dtr-switch" disabled={disabled}
                onClick={() => editor.editBehavior({ guidance: !draft.behavior.guidance }, revision)} />
            </div>
            <label className="dtr-field dtr-history">{t('historyLimit')}
              <input ref={registerHistory} id={`dtr-${instance}-history`} aria-invalid={historyInvalid || undefined}
                aria-describedby={historyInvalid ? `dtr-${instance}-issue` : undefined}
                type="number" min={1} max={1000} step={1} disabled={disabled} value={draft.historyLimit}
                onChange={event => editor.edit({ ...draft, historyLimit: event.currentTarget.value }, revision)} />
            </label>
          </div>
        </details>
      </>}

      <div className="dtr-feedback" aria-live="polite">
        {state.stale && <p className="dtr-muted dtr-warning">{t('stale')}</p>}
        {state.issue && <p ref={issueSummary} tabIndex={-1} id={`dtr-${instance}-issue`} role="alert" className="dtr-error">
          {issueSectionName(state.issue.section)} · {fieldLabel(t, state.issue.field)}: {state.issue.detail ?? reasonLabel(t, state.issue.reason)}
        </p>}
        {previewError && <p role="alert" className="dtr-error">{t('validationError', { message: previewError })}</p>}
        {grantProblem && <GrantDiagnostics id={`dtr-${instance}-grants`} key={grantProblem} problem={grantProblem} locale={locale} inventory={inventory} recheck={recheck} dirty={state.dirty} openBundle={navigation ? openBundle : undefined} />}
        {state.error && state.error.kind !== 'grantUnavailable' && state.error.kind !== 'grantReadOnly' && <p role="alert" className="dtr-error">
          {state.error.kind === 'grantFailed' ? t('grantFailed')
            : state.error.kind === 'refused' ? t('refused')
              : state.error.kind === 'previewChanged' ? t('previewChanged')
                : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail })}
        </p>}
      </div>

      {draft && <footer className="dtr-footer">
        <span className="dtr-status dtr-muted" data-status={status} role="status">{t(status)}</span>
        <div className="dtr-inline dtr-footer-actions">
          <button type="button" disabled={state.saving || preview !== undefined || (!state.dirty && !state.stale)}
            onClick={() => { setPreviewError(undefined); editor.discard(); }}>{t(state.stale ? 'reload' : 'cancel')}</button>
          <button type="button" className="dtr-primary" disabled={disabled || !!grantProblem || (!state.dirty && !needsGrant) || state.stale}
            onClick={save}>{t(state.saving ? 'saving' : 'save')}</button>
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
  if (target.mode === 'inherit') return t('inherit');
  return `${target.provider} / ${target.model}${target.reasoningEffort ? ` · ${t('effort')}: ${target.reasoningEffort}` : ''}`;
}
