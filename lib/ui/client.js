import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CATEGORIES, CATEGORY_LIST } from "../core/categories.js";
import { DELEGATION_MODES, PROACTIVE_SPECIALIST_CATEGORIES } from "../core/native-subagent.js";
import { previewRecommendations, RECOMMENDATION_VERSION } from "../core/recommendations.js";
import { indexCatalog } from "./catalog-index.js";
import { GrantDiagnostics } from "./GrantDiagnostics.js";
import { isAllowedModelArray, MODEL_AUTHORIZATION_ENTRY, requiredModelRoutes, planModelGrant } from "./model-grants.js";
import { Icon } from "./ModelPicker.js";
import { defaultTargetSummary, externalModelSummary, fieldKey, RouteRow } from "./RouteRow.js";
import { RoutingEditor, routingDraftToPolicy } from "./routing-editor.js";
import { en, NS, zh } from "./settings-copy.js";
import { editorStyles } from "./settings-styles.js";
const DELEGATION_COPY = {
    passive: { label: 'delegationPassive', note: 'delegationPassiveNote' },
    'specialist-first': { label: 'delegationSpecialistFirst', note: 'delegationSpecialistNote' },
    orchestrator: { label: 'delegationOrchestrator', note: 'delegationOrchestratorNote' },
};
const SPECIALIST_TASKS = CATEGORY_LIST.filter(category => PROACTIVE_SPECIALIST_CATEGORIES.has(category.id));
const GENERAL_TASKS = CATEGORY_LIST.filter(category => !PROACTIVE_SPECIALIST_CATEGORIES.has(category.id));
function DelegationSettings({ t, id, mode, enforced, onMode, onToggle }) {
    const scope = mode !== 'passive';
    return _jsxs("section", { className: "dtr-section", "aria-labelledby": `${id}-title`, children: [_jsx("h3", { id: `${id}-title`, children: t('behaviorTitle') }), _jsx("span", { id: `${id}-mode`, className: "dtr-sr-only", children: t('delegationMode') }), _jsx("div", { role: "radiogroup", "aria-labelledby": `${id}-mode`, "aria-describedby": scope ? `${id}-scope` : undefined, className: "dtr-mode-grid", onKeyDown: event => {
                    if (event.nativeEvent.isComposing)
                        return;
                    const index = DELEGATION_MODES.indexOf(mode);
                    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
                    const step = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1
                        : event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
                    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? DELEGATION_MODES.length - 1
                        : step !== 0 ? (index + step + DELEGATION_MODES.length) % DELEGATION_MODES.length : -1;
                    const next = DELEGATION_MODES[nextIndex];
                    if (next === undefined)
                        return;
                    event.preventDefault();
                    onMode(next);
                    event.currentTarget.querySelectorAll('[role="radio"]')[nextIndex]?.focus();
                }, children: DELEGATION_MODES.map(option => {
                    const active = mode === option;
                    const label = `${id}-${option}`;
                    return _jsxs("button", { type: "button", role: "radio", "aria-checked": active, "aria-labelledby": label, "aria-describedby": `${label}-note`, tabIndex: active ? 0 : -1, className: "dtr-mode", onClick: () => { if (!active)
                            onMode(option); }, children: [_jsx("span", { className: "dtr-mode-icon", children: _jsx(Icon, { name: option }) }), active && _jsx("span", { className: "dtr-mode-check", children: _jsx(Icon, { name: "check" }) }), _jsx("span", { className: "dtr-mode-title", id: label, children: t(DELEGATION_COPY[option].label) }), _jsx("span", { className: "dtr-mode-copy", id: `${label}-note`, children: t(DELEGATION_COPY[option].note) })] }, option);
                }) }), scope && _jsxs("p", { className: "dtr-muted dtr-scope", id: `${id}-scope`, children: [_jsx(Icon, { name: "info" }), t('delegationScope')] }), _jsxs("div", { className: "dtr-card dtr-toggle-row", children: [_jsxs("div", { children: [_jsx("strong", { id: `${id}-switch`, children: t('enforceRouting') }), _jsx("p", { id: `${id}-switch-hint`, className: "dtr-muted", children: t('enforceHint') })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": enforced, "aria-labelledby": `${id}-switch`, "aria-describedby": `${id}-switch-hint`, className: "dtr-switch", onClick: onToggle })] })] });
}
export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session'];
export function apply(ctx) {
    const client = ctx;
    ctx.effect(() => client.locale.register(NS, { en, zh }), 'team-router: editor dictionaries');
    const form = client.configForms.get('team-router');
    const grants = client.configForms.get(MODEL_AUTHORIZATION_ENTRY);
    let reader;
    const inventory = () => reader;
    const optional = ctx;
    optional.inject(['remote.pluginManager'], child => {
        reader = child.remote.pluginManager;
        child.effect(() => () => { reader = undefined; }, 'team-router: release diagnostics reader');
    });
    let describe;
    optional.inject(['remote.settings'], child => {
        const settings = child.remote.settings;
        describe = () => settings.describe();
        child.effect(() => () => { describe = undefined; }, 'team-router: release settings probe');
    });
    // This read is diagnostic only. The shared Host form remains authoritative for writes and CAS.
    const recheck = async () => {
        const reply = await describe?.();
        if (!reply?.ok)
            return 'unknown';
        const row = reply.value.namespaces.find(item => item.ns === MODEL_AUTHORIZATION_ENTRY);
        const v = row?.value;
        return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && isAllowedModelArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
    };
    const readGrants = () => grants.getSnapshot();
    const subscribeGrants = (listener) => grants.subscribe(listener);
    const readForm = () => form.getSnapshot();
    const subscribeForm = (listener) => form.subscribe(listener);
    function Editor({ t }) {
        const [editor, setEditor] = React.useState();
        // Both pages observe the same Host config, but neither carries an unsaved
        // draft or migration confirmation into the other. Subscribe only on mount.
        React.useLayoutEffect(() => {
            const mounted = new RoutingEditor(form, grants);
            setEditor(mounted);
            return () => mounted.dispose();
        }, []);
        return editor ? _jsx(EditorForm, { t: t, editor: editor }) : null;
    }
    function EditorForm({ t, editor }) {
        const host = React.useSyncExternalStore(subscribeForm, readForm);
        const grantSnapshot = React.useSyncExternalStore(subscribeGrants, readGrants);
        const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
        const [catalog, setCatalog] = React.useState();
        const [catalogBusy, setCatalogBusy] = React.useState(true);
        const [catalogError, setCatalogError] = React.useState();
        const requestCatalogRefresh = React.useRef();
        const [overwrite, setOverwrite] = React.useState(false);
        const [preview, setPreview] = React.useState();
        const [previewError, setPreviewError] = React.useState();
        const [focus, setFocus] = React.useState();
        const fields = React.useRef(new Map());
        const issueSummary = React.useRef(null);
        const previewButton = React.useRef(null);
        const routingHeading = React.useRef(null);
        const restorePreviewFocus = React.useRef(false);
        const instance = React.useId();
        const locale = t('language') === 'zh' ? 'zh' : 'en';
        const draft = state.draft;
        const grantPlan = React.useMemo(() => draft && planModelGrant(requiredModelRoutes(draft), grantSnapshot), [draft, grantSnapshot]);
        const needsGrant = grantPlan?.kind === 'write';
        const grantProblem = grantPlan?.kind === 'unavailable' ? grantPlan.reason : grantPlan?.kind === 'readOnly' ? 'readOnly' : undefined;
        const navigation = grantProblem ? client.get('pluginNavigation') : undefined;
        const openBundle = React.useCallback((name) => navigation?.openBundle(name), [navigation]);
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
            const refresh = () => {
                if (!active)
                    return;
                if (running) {
                    queued = true;
                    return;
                }
                running = true;
                setCatalogBusy(true);
                void (async () => {
                    try {
                        do {
                            queued = false;
                            try {
                                const response = await client.remote.session.modelCatalog();
                                if (!active)
                                    return;
                                if (response.ok) {
                                    setCatalog(response.value);
                                    setCatalogError(undefined);
                                }
                                else
                                    setCatalogError(response.error.message);
                            }
                            catch (error) {
                                if (active)
                                    setCatalogError(error instanceof Error ? error.message : String(error));
                            }
                        } while (active && queued);
                    }
                    finally {
                        running = false;
                        if (active)
                            setCatalogBusy(false);
                    }
                })();
            };
            requestCatalogRefresh.current = refresh;
            const stops = [
                ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated'].map(event => client.remote.$on(event, refresh)),
                client.on('connection/reset', refresh),
            ];
            refresh();
            return () => { active = false; requestCatalogRefresh.current = undefined; for (const stop of stops)
                stop(); };
        }, []);
        React.useLayoutEffect(() => {
            if (!focus)
                return;
            const field = fields.current.get(focus);
            const target = field && !field.matches(':disabled') ? field : issueSummary.current;
            if (target) {
                const details = target.closest('details');
                if (details)
                    details.open = true;
                target.scrollIntoView({ block: 'nearest' });
                target.focus({ preventScroll: true });
            }
            setFocus(undefined);
        }, [focus, state.issue, draft]);
        React.useLayoutEffect(() => {
            if (!preview)
                return;
            const onEscape = (event) => {
                if (event.key !== 'Escape' || event.isComposing)
                    return;
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
        const registerField = React.useCallback((section, field, node) => {
            const key = fieldKey(section, field);
            if (node)
                fields.current.set(key, node);
            else
                fields.current.delete(key);
        }, []);
        const registerHistory = React.useCallback((node) => registerField('default', 'historyLimit', node), [registerField]);
        const revision = state.revision;
        const chooseModel = React.useCallback((section, choice) => {
            if (choice.mode === 'default') {
                if (section !== 'default')
                    editor.setCategoryMode(section, 'default', revision);
            }
            else if (choice.mode === 'inherit') {
                editor.setNativeModelMode(section, 'inherit', revision);
            }
            else {
                editor.setNativeModelMode(section, 'explicit', revision, { provider: choice.provider, id: choice.id });
            }
        }, [editor, revision]);
        const chooseEffort = React.useCallback((section, provider, id, effort) => {
            const current = editor.getSnapshot().draft;
            if (!current)
                return;
            const target = { executor: 'native', model: { mode: 'explicit', provider, id, ...(effort ? { reasoningEffort: effort } : {}) } };
            editor.edit(section === 'default' ? { ...current, defaultTarget: target }
                : { ...current, categories: { ...current.categories, [section]: { mode: 'target', target } } }, revision);
        }, [editor, revision]);
        const routeRow = (section, name, purpose, binding) => {
            const followsDefault = binding.mode === 'default';
            const target = binding.mode === 'target' ? binding.target : undefined;
            const explicit = target?.executor === 'native' && target.model.mode === 'explicit' ? target.model : undefined;
            const legacyModel = target && target.executor !== 'native' ? externalModelSummary(target, t) : undefined;
            return _jsx(RouteRow, { t: t, section: section, name: name, purpose: purpose, instance: instance, catalog: catalogIndex, catalogStatus: pickerStatus, catalogReady: catalogReady, executor: target?.executor ?? 'native', legacyModel: legacyModel, provider: explicit?.provider, model: explicit?.id, effort: explicit?.reasoningEffort, followsDefault: followsDefault, defaultSummary: section === 'default' ? undefined : defaultSummary, disabled: disabled, issueField: state.issue?.section === section ? state.issue.field : undefined, registerField: registerField, onModel: chooseModel, onEffort: chooseEffort }, section);
        };
        const taskGroup = (entries, specialist) => {
            const group = specialist ? 'specialist' : 'general';
            return _jsxs("section", { className: "dtr-group", "aria-labelledby": `dtr-${instance}-${group}`, children: [_jsxs("div", { className: "dtr-inline dtr-group-heading", children: [_jsx("h4", { id: `dtr-${instance}-${group}`, children: t(group) }), _jsx("span", { className: "dtr-count", children: entries.length }), specialist && _jsx("span", { className: "dtr-pill dtr-pill-brand", children: t('proactive') })] }), draft && entries.map(entry => routeRow(entry.id, entry[locale].name, entry[locale].purpose, draft.categories[entry.id]))] });
        };
        const save = () => {
            void editor.save({ ...(catalog === undefined ? {} : { catalog }), catalogReady }).then(() => {
                const issue = editor.getSnapshot().issue;
                if (issue)
                    setFocus(fieldKey(issue.section, issue.field));
            });
        };
        const makePreview = () => {
            if (!draft || !catalog || !catalogReady)
                return;
            try {
                setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision, catalog });
                setPreviewError(undefined);
            }
            catch (error) {
                setPreviewError(error instanceof Error ? error.message : String(error));
            }
        };
        const previewStale = preview !== undefined && (!catalogReady || preview.catalog !== catalog || preview.revision !== host.revision || preview.revision !== revision);
        const migrationPending = state.migrationRequired && !state.migrationConfirmed;
        const saveError = state.error?.kind === 'grantUnavailable' || state.error?.kind === 'grantReadOnly' ? undefined : state.error;
        const feedbackId = `dtr-${instance}`;
        const problem = state.stale ? { status: 'draftStale', target: 'stale' }
            : grantProblem ? { status: grantProblem === 'readOnly' ? 'authorizationReadOnly' : 'authorizationUnavailable', target: 'grant-problem' }
                : migrationPending ? { status: 'migrationPending', target: 'migration-card' }
                    : state.issue || previewError !== undefined || saveError ? { status: 'saveProblem', target: state.issue ? 'issue' : previewError !== undefined ? 'preview-error' : 'save-error' }
                        : undefined;
        const status = problem?.status ?? (needsGrant ? 'needsGrant' : state.dirty ? 'dirty' : state.notice ?? 'current');
        const reviewProblem = () => {
            if (!problem)
                return;
            const target = document.getElementById(`${feedbackId}-${problem.target}`);
            target?.focus({ preventScroll: true });
            target?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        };
        const historyInvalid = state.issue?.section === 'default' && state.issue.field === 'historyLimit';
        const catalogPartial = catalog?.failures.length ? t('catalogPartial', { message: catalog.failures.map(failure => `${failure.name}: ${failure.message}`).join('; ') }) : undefined;
        return _jsxs("div", { className: "dtr-editor", "aria-busy": state.saving, children: [editorStyles, _jsxs("header", { className: "dtr-header", children: [_jsx("h2", { children: t('title') }), _jsx("p", { className: "dtr-muted", children: t('description') }), host.status === 'loading' && _jsx("p", { role: "status", className: "dtr-muted", children: t('loading') }), host.status === 'unavailable' && _jsx("p", { role: "status", className: "dtr-muted", children: t('unavailable') }), host.status === 'ready' && !host.writable && _jsx("p", { className: "dtr-muted dtr-warning", role: "status", children: t('readOnly') })] }), draft && _jsxs(_Fragment, { children: [_jsx("fieldset", { disabled: disabled, children: _jsx(DelegationSettings, { t: t, id: `dtr-${instance}-behavior`, mode: state.behavior.delegationMode, enforced: state.behavior.enforceNativeSubagentRouting, onMode: mode => editor.editBehavior({ delegationMode: mode }, revision), onToggle: () => editor.editBehavior({ enforceNativeSubagentRouting: !state.behavior.enforceNativeSubagentRouting }, revision) }) }), state.migrationRequired && _jsxs("section", { id: `${feedbackId}-migration-card`, tabIndex: -1, className: "dtr-section dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-migration`, children: [_jsx("h3", { id: `dtr-${instance}-migration`, children: t('migrationTitle') }), _jsx("p", { className: "dtr-muted", children: t('migrationHint') }), _jsx("p", { children: t('migrationCounts', { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 }) }), _jsx("div", { className: "dtr-inline", children: state.migrationConfirmed ? _jsx("p", { role: "status", children: t('migrationConfirmed') }) : _jsx("button", { type: "button", disabled: disabled || state.stale, onClick: () => editor.confirmMigration(revision), children: t('confirmMigration') }) })] }), _jsxs("section", { className: "dtr-section", "aria-labelledby": `dtr-${instance}-routing`, children: [_jsx("h3", { id: `dtr-${instance}-routing`, ref: routingHeading, tabIndex: -1, children: t('routingTitle') }), _jsx("fieldset", { disabled: disabled, children: routeRow('default', t('defaults'), t('defaultPurpose'), { mode: 'target', target: draft.defaultTarget }) }), _jsx("fieldset", { disabled: disabled, children: _jsxs("div", { className: "dtr-inline dtr-toolbar", children: [_jsxs("div", { className: "dtr-inline dtr-toolset", children: [_jsx("button", { type: "button", ref: previewButton, disabled: !catalogReady || state.stale, onClick: makePreview, "aria-describedby": `dtr-${instance}-recommendation-help`, children: t('recommendations') }), _jsx("span", { id: `dtr-${instance}-recommendation-help`, className: "dtr-sr-only", children: t('recommendationHint', { version: RECOMMENDATION_VERSION }) }), _jsxs("label", { className: "dtr-inline dtr-check dtr-muted", children: [_jsx("input", { type: "checkbox", checked: overwrite, onChange: event => setOverwrite(event.currentTarget.checked) }), t('overwrite')] })] }), (catalogBusy || catalogError !== undefined || catalogPartial) && _jsxs("div", { className: "dtr-inline dtr-catalog-status", children: [_jsx("p", { className: `dtr-muted${catalogBusy ? '' : ' dtr-warning'}`, role: "status", children: catalogStatus ?? catalogPartial }), !catalogBusy && _jsx("button", { type: "button", onClick: () => requestCatalogRefresh.current?.(), children: t('retry') })] })] }) }), preview && _jsxs("section", { className: "dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-preview-title`, children: [_jsx("h4", { id: `dtr-${instance}-preview-title`, children: t('previewTitle') }), _jsx("p", { className: "dtr-muted", children: t('previewHint') }), _jsx("p", { className: "dtr-muted", children: t('recommendationHint', { version: RECOMMENDATION_VERSION }) }), preview.value.changes.length ? _jsx("ul", { className: "dtr-preview-list", children: preview.value.changes.map(change => _jsxs("li", { children: [_jsx("strong", { children: CATEGORIES[change.category][locale].name }), _jsxs("div", { className: "dtr-inline dtr-diff", children: [_jsxs("span", { className: "dtr-pill", children: [_jsxs("span", { className: "dtr-sr-only", children: [t('before'), " "] }), change.before.mode === 'default' ? `${t('useDefault')} · ${defaultSummary}` : previewTarget(change.before.target, t)] }), _jsx(Icon, { name: "arrow" }), _jsxs("span", { className: "dtr-pill dtr-pill-brand", children: [_jsxs("span", { className: "dtr-sr-only", children: [t('after'), " "] }), previewTarget(change.after.target, t)] })] })] }, change.category)) }) : _jsx("p", { children: t('noChanges') }), previewStale && _jsx("p", { className: "dtr-muted dtr-warning", role: "status", children: t('previewChanged') }), _jsxs("p", { className: "dtr-muted", children: [t('preserved', { count: preview.value.preserved.length }), " \u00B7 ", t('unmatched', { count: preview.value.unavailable.length })] }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", autoFocus: true, onClick: closePreview, children: t('cancelPreview') }), _jsx("button", { type: "button", className: "dtr-primary", disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale, onClick: () => { if (editor.applyRecommendations(preview.value, preview.revision))
                                                        closePreview(); }, children: t('applyPreview') })] })] }), _jsx("fieldset", { disabled: disabled, children: _jsxs("div", { className: "dtr-group", children: [taskGroup(SPECIALIST_TASKS, true), taskGroup(GENERAL_TASKS, false)] }) })] }), _jsxs("details", { className: "dtr-section dtr-card dtr-advanced", children: [_jsx("summary", { children: t('advanced') }), _jsxs("div", { className: "dtr-advanced-body", children: [_jsxs("label", { className: "dtr-field dtr-history", children: [t('historyLimit'), _jsx("input", { ref: registerHistory, id: `dtr-${instance}-history`, "aria-invalid": historyInvalid || undefined, "aria-describedby": historyInvalid ? `dtr-${instance}-issue` : undefined, type: "number", min: 1, max: 1000, step: 1, disabled: disabled, value: draft.historyLimit, onChange: event => editor.edit({ ...draft, historyLimit: event.currentTarget.value }, revision) })] }), _jsxs("p", { className: "dtr-muted dtr-warning", children: ["Codex / Antigravity (agy) / Cursor: ", t('externalBlocked')] })] })] })] }), _jsxs("div", { className: "dtr-feedback", "aria-live": "polite", children: [state.stale && _jsx("p", { id: `${feedbackId}-stale`, tabIndex: -1, className: "dtr-muted dtr-warning", children: t('stale') }), state.issue && _jsxs("p", { ref: issueSummary, tabIndex: -1, id: `${feedbackId}-issue`, role: "alert", className: "dtr-error", children: [state.issue.section === 'default' ? t('defaults') : CATEGORIES[state.issue.section][locale].name, " \u00B7 ", t(state.issue.field), ": ", state.issue.detail ?? t(state.issue.reason)] }), previewError !== undefined && _jsx("p", { id: `${feedbackId}-preview-error`, tabIndex: -1, role: "alert", className: "dtr-error", children: t('validationError', { message: previewError }) }), grantProblem && _jsx(GrantDiagnostics, { id: `${feedbackId}-grant-problem`, problem: grantProblem, locale: locale, inventory: inventory, recheck: recheck, dirty: state.dirty, openBundle: navigation ? openBundle : undefined }, grantProblem), saveError && !(state.stale && saveError.kind === 'refused') && _jsx("p", { id: `${feedbackId}-save-error`, tabIndex: -1, role: "alert", className: "dtr-error", children: saveError.kind === 'grantFailed' ? t('grantFailed') : saveError.kind === 'refused' ? t('refused') : saveError.kind === 'migration' ? t('migrationRequired') : saveError.kind === 'previewChanged' ? t('previewChanged') : t(saveError.kind === 'validation' ? 'validationError' : 'transportError', { message: saveError.detail }) })] }), draft && _jsxs("footer", { className: "dtr-footer", children: [_jsxs("div", { className: "dtr-inline", children: [_jsx("span", { className: "dtr-status dtr-muted", "data-status": status, role: "status", children: t(status) }), problem && _jsx("button", { type: "button", className: "dtr-review-problem", "aria-controls": `${feedbackId}-${problem.target}`, onClick: reviewProblem, children: t('reviewProblem') })] }), _jsxs("div", { className: "dtr-inline dtr-footer-actions", children: [_jsx("button", { type: "button", disabled: state.saving || (!state.stale && (preview !== undefined || !state.dirty)), onClick: () => {
                                        setPreview(undefined);
                                        setPreviewError(undefined);
                                        editor.discard();
                                    }, children: t(state.stale ? 'reload' : 'cancel') }), _jsx("button", { type: "button", className: "dtr-primary", disabled: disabled || !!grantProblem || (!state.dirty && !needsGrant), onClick: save, children: t(state.saving ? 'saving' : 'save') })] })] })] });
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
function previewTarget(target, t) {
    const executor = target.executor === 'native' ? t('native') : target.executor;
    if (target.model.mode === 'inherit')
        return `${executor} · ${t('inherit')}`;
    if (target.model.mode === 'executor-default')
        return `${executor} · ${t('executorDefault')}`;
    const model = target.model;
    return `${executor} · ${'provider' in model ? `${model.provider} / ` : ''}${model.id}${model.reasoningEffort ? ` · ${model.reasoningEffort}` : ''}`;
}
//# sourceMappingURL=client.js.map