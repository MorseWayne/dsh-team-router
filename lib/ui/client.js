import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { resolveActiveRegistry } from "../core/active-registry.js";
import { BUILTIN_GROUPS, BUILTIN_IDS, BUILTIN_LIST, BUILTINS, isBuiltinId, } from "../core/categories.js";
import { previewRecommendations, RECOMMENDATION_VERSION, } from "../core/recommendations.js";
import { DELEGATION_MODES } from "../core/routing-policy.js";
import { indexCatalog } from "./catalog-index.js";
import { CategoryGroup } from "./CategoryGroup.js";
import { CustomCategoryEditor } from "./CustomCategoryEditor.js";
import { GrantDiagnostics } from "./GrantDiagnostics.js";
import { MODEL_AUTHORIZATION_ENTRY, planModelGrant, requiredModelRoutes, } from "./model-grants.js";
import { Icon } from "./ModelPicker.js";
import { fieldKey, RouteRow, targetSummary } from "./RouteRow.js";
import { RoutingEditor, routingDraftToConfig, } from "./routing-editor.js";
import { en, NS, zh } from "./settings-copy.js";
import { editorStyles } from "./settings-styles.js";
const DELEGATION_COPY = {
    passive: { label: 'delegationPassive', note: 'delegationPassiveNote' },
    'specialist-first': { label: 'delegationSpecialistFirst', note: 'delegationSpecialistNote' },
    orchestrator: { label: 'delegationOrchestrator', note: 'delegationOrchestratorNote' },
};
const GROUP_ORDER = ['implementation', 'quality', 'analysis', 'general'];
const GROUP_ENTRIES = {
    implementation: BUILTIN_LIST.filter(entry => entry.group === 'implementation'),
    quality: BUILTIN_LIST.filter(entry => entry.group === 'quality'),
    analysis: BUILTIN_LIST.filter(entry => entry.group === 'analysis'),
    general: BUILTIN_LIST.filter(entry => entry.group === 'general'),
};
function fieldLabel(t, field) {
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
function reasonLabel(t, reason) {
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
function DelegationSettings({ t, id, mode, strict, summary, onMode, onToggleStrict }) {
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
                }) }), _jsxs("p", { className: "dtr-summary-bar", role: "status", children: [_jsx(Icon, { name: "info" }), _jsx("span", { children: summary })] }), scope && _jsxs("p", { className: "dtr-muted dtr-scope", id: `${id}-scope`, children: [_jsx(Icon, { name: "info" }), t('delegationScope')] }), _jsxs("div", { className: "dtr-card dtr-toggle-row", children: [_jsxs("div", { children: [_jsx("strong", { id: `${id}-switch`, children: t('enforceRouting') }), _jsx("p", { id: `${id}-switch-hint`, className: "dtr-muted", children: t('enforceHint') })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": strict, "aria-labelledby": `${id}-switch`, "aria-describedby": `${id}-switch-hint`, className: "dtr-switch", onClick: onToggleStrict })] })] });
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
    const recheck = async () => {
        const reply = await describe?.();
        if (!reply?.ok)
            return 'unknown';
        const row = reply.value.namespaces.find(item => item.ns === MODEL_AUTHORIZATION_ENTRY);
        const v = row?.value;
        return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && Array.isArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
    };
    const readGrants = () => grants.getSnapshot();
    const subscribeGrants = (listener) => grants.subscribe(listener);
    const readForm = () => form.getSnapshot();
    const subscribeForm = (listener) => form.subscribe(listener);
    function Editor({ t }) {
        const [editor, setEditor] = React.useState();
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
        const [retry, setRetry] = React.useState(0);
        const [overwrite, setOverwrite] = React.useState(false);
        const [scope, setScope] = React.useState('all');
        const [preview, setPreview] = React.useState();
        const [previewError, setPreviewError] = React.useState();
        const [focus, setFocus] = React.useState();
        const fields = React.useRef(new Map());
        const issueSummary = React.useRef(null);
        const previewButton = React.useRef(null);
        const restorePreviewFocus = React.useRef(false);
        const instance = React.useId();
        const locale = t('language') === 'zh' ? 'zh' : 'en';
        const draft = state.draft;
        const grantPlan = React.useMemo(() => {
            if (!draft)
                return undefined;
            try {
                return planModelGrant(requiredModelRoutes(routingDraftToConfig(draft)), grantSnapshot);
            }
            catch {
                return undefined;
            }
        }, [draft, grantSnapshot]);
        const needsGrant = grantPlan !== undefined && grantPlan.kind !== 'complete';
        const grantProblem = grantPlan?.kind === 'unavailable' ? grantPlan.reason : grantPlan?.kind === 'readOnly' ? 'readOnly' : undefined;
        const navigation = grantProblem ? client.get('pluginNavigation') : undefined;
        const openBundle = React.useCallback((name) => navigation?.openBundle(name), [navigation]);
        const hostDisabled = state.saving || host.status !== 'ready' || !host.writable;
        const disabled = hostDisabled || preview !== undefined;
        const catalogReady = catalog !== undefined && !catalogBusy && catalogError === undefined;
        const catalogIndex = React.useMemo(() => indexCatalog(catalog), [catalog]);
        const catalogStatus = catalogBusy ? t('catalogLoading') : catalogError === undefined ? undefined : t('catalogError', { message: catalogError });
        const defaultSummary = draft && targetSummary(t, draft.defaultTarget, catalogIndex, catalogReady);
        const activeSummaryText = React.useMemo(() => {
            if (!draft)
                return '';
            try {
                const registry = resolveActiveRegistry(routingDraftToConfig(draft));
                const builtinEnabled = registry.entries.filter(entry => entry.origin === 'builtin').length;
                const customEnabled = registry.entries.filter(entry => entry.origin === 'custom').length;
                const proactive = registry.entries.filter(entry => entry.proactive).length;
                return t('activeSummary', {
                    builtinEnabled, builtinTotal: BUILTIN_IDS.length,
                    customEnabled, customTotal: draft.custom.length, proactive,
                });
            }
            catch {
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
            const refresh = async () => {
                const current = ++generation;
                setCatalogBusy(true);
                try {
                    const response = await client.remote.session.modelCatalog();
                    if (!active || current !== generation)
                        return;
                    if (response.ok) {
                        setCatalog(response.value);
                        setCatalogError(undefined);
                    }
                    else
                        setCatalogError(response.error.message);
                }
                catch (error) {
                    if (active && current === generation)
                        setCatalogError(error instanceof Error ? error.message : String(error));
                }
                finally {
                    if (active && current === generation)
                        setCatalogBusy(false);
                }
            };
            const stops = [
                ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated']
                    .map(event => client.remote.$on(event, () => { void refresh(); })),
                client.on('connection/reset', () => { void refresh(); }),
            ];
            void refresh();
            return () => { active = false; generation++; for (const stop of stops)
                stop(); };
        }, [retry]);
        React.useLayoutEffect(() => {
            if (!focus)
                return;
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
                if (previewButton.current?.matches(':enabled'))
                    previewButton.current.focus({ preventScroll: true });
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
                editor.setNativeModelMode(section, 'explicit', revision, { provider: choice.provider, model: choice.id });
            }
        }, [editor, revision]);
        const chooseEffort = React.useCallback((section, provider, model, effort) => {
            editor.setSectionEffort(section, provider, model, effort, revision);
        }, [editor, revision]);
        const toggleBuiltin = React.useCallback((id, enabled) => {
            editor.setBuiltinEnabled(id, enabled, revision);
        }, [editor, revision]);
        const applyPreset = React.useCallback((preset) => {
            editor.applyBuiltinPreset(preset, revision);
        }, [editor, revision]);
        const addCustom = React.useCallback((seed) => editor.addCustomCategory(seed, revision), [editor, revision]);
        const updateCustom = React.useCallback((id, patch) => {
            editor.updateCustomCategory(id, patch, revision);
        }, [editor, revision]);
        const removeCustom = React.useCallback((id) => editor.removeCustomCategory(id, revision), [editor, revision]);
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
                setPreview({
                    value: previewRecommendations(routingDraftToConfig(draft), catalog, {
                        overwrite,
                        ...(scope === 'all' ? {} : { group: scope }),
                    }),
                    revision,
                });
                setPreviewError(undefined);
            }
            catch (error) {
                setPreviewError(error instanceof Error ? error.message : String(error));
            }
        };
        const closePreview = () => { restorePreviewFocus.current = true; setPreview(undefined); };
        const previewStale = preview !== undefined && (preview.revision !== host.revision || preview.revision !== revision);
        const status = needsGrant ? 'needsGrant' : state.dirty ? 'dirty' : state.notice ?? 'current';
        const historyInvalid = state.issue?.section === 'default' && state.issue.field === 'historyLimit';
        const catalogPartial = catalog?.failures.length
            ? t('catalogPartial', { message: catalog.failures.map(failure => `${failure.name}: ${failure.message}`).join('; ') })
            : undefined;
        const issueSectionName = (section) => {
            if (section === 'default')
                return t('defaults');
            if (isBuiltinId(section))
                return BUILTINS[section][locale].name;
            return draft?.custom.find(entry => entry.id === section)?.name || section;
        };
        const defaultExplicit = draft?.defaultTarget.mode === 'explicit' ? draft.defaultTarget : undefined;
        return _jsxs("div", { className: "dtr-editor", "aria-busy": state.saving, children: [editorStyles, _jsxs("header", { className: "dtr-header", children: [_jsx("h2", { children: t('title') }), _jsx("p", { className: "dtr-muted", children: t('description') }), host.status === 'loading' && _jsx("p", { role: "status", className: "dtr-muted", children: t('loading') }), host.status === 'unavailable' && _jsx("p", { role: "status", className: "dtr-muted", children: t('unavailable') }), host.status === 'ready' && !host.writable && _jsx("p", { className: "dtr-muted dtr-warning", role: "status", children: t('readOnly') })] }), draft && _jsxs(_Fragment, { children: [_jsx("fieldset", { disabled: disabled, children: _jsx(DelegationSettings, { t: t, id: `dtr-${instance}-behavior`, mode: draft.behavior.delegationMode, strict: draft.behavior.strict, summary: activeSummaryText, onMode: delegationMode => editor.editBehavior({ delegationMode }, revision), onToggleStrict: () => editor.editBehavior({ strict: !draft.behavior.strict }, revision) }) }), _jsxs("section", { className: "dtr-section", "aria-labelledby": `dtr-${instance}-routing`, children: [_jsx("h3", { id: `dtr-${instance}-routing`, children: t('routingTitle') }), _jsx("fieldset", { disabled: disabled, children: _jsx(RouteRow, { t: t, section: "default", name: t('defaults'), purpose: t('defaultPurpose'), instance: instance, catalog: catalogIndex, catalogReady: catalogReady, catalogStatus: catalogStatus, provider: defaultExplicit?.provider, model: defaultExplicit?.model, effort: defaultExplicit?.reasoningEffort, followsDefault: false, defaultSummary: undefined, disabled: disabled, issueField: state.issue?.section === 'default' ? state.issue.field : undefined, registerField: registerField, onModel: chooseModel, onEffort: chooseEffort }) }), _jsxs("fieldset", { disabled: disabled, children: [_jsxs("div", { className: "dtr-inline dtr-toolbar", children: [_jsxs("div", { className: "dtr-inline dtr-preset-bar", children: [_jsx("span", { className: "dtr-muted", children: t('presetLabel') }), _jsx("button", { type: "button", onClick: () => applyPreset('all12'), children: t('presetAll12') }), _jsx("button", { type: "button", onClick: () => applyPreset('classic7'), children: t('presetClassic7') })] }), _jsxs("div", { className: "dtr-inline dtr-toolset", children: [_jsxs("select", { "aria-label": t('recommendationScope'), className: "dtr-scope-select", value: scope, onChange: event => setScope(event.currentTarget.value), children: [_jsx("option", { value: "all", children: t('scopeAll') }), GROUP_ORDER.map(groupId => _jsx("option", { value: groupId, children: BUILTIN_GROUPS[groupId][locale] }, groupId))] }), _jsx("button", { type: "button", ref: previewButton, disabled: !catalogReady || state.stale, onClick: makePreview, "aria-describedby": `dtr-${instance}-recommendation-help`, children: t('recommendations') }), _jsx("span", { id: `dtr-${instance}-recommendation-help`, className: "dtr-sr-only", children: t('recommendationHint', { version: RECOMMENDATION_VERSION }) }), _jsxs("label", { className: "dtr-inline dtr-check dtr-muted", children: [_jsx("input", { type: "checkbox", checked: overwrite, onChange: event => setOverwrite(event.currentTarget.checked) }), t('overwrite')] })] }), (catalogBusy || catalogError !== undefined || catalogPartial) && _jsxs("div", { className: "dtr-inline dtr-catalog-status", children: [_jsx("p", { className: `dtr-muted${catalogBusy ? '' : ' dtr-warning'}`, role: "status", children: catalogStatus ?? catalogPartial }), !catalogBusy && _jsx("button", { type: "button", onClick: () => setRetry(value => value + 1), children: t('retry') })] })] }), _jsx("p", { className: "dtr-muted", children: t('presetHint') })] }), preview && _jsxs("section", { className: "dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-preview-title`, children: [_jsx("h4", { id: `dtr-${instance}-preview-title`, children: t('previewTitle') }), _jsx("p", { className: "dtr-muted", children: t('previewHint') }), _jsx("p", { className: "dtr-muted", children: t('recommendationHint', { version: RECOMMENDATION_VERSION }) }), preview.value.changes.length ? _jsx("ul", { className: "dtr-preview-list", children: preview.value.changes.map(change => _jsxs("li", { children: [_jsx("strong", { children: BUILTINS[change.category][locale].name }), _jsxs("div", { className: "dtr-inline dtr-diff", children: [_jsxs("span", { className: "dtr-pill", children: [_jsxs("span", { className: "dtr-sr-only", children: [t('before'), " "] }), change.before.mode === 'default' ? `${t('useDefault')} · ${defaultSummary}` : previewTarget(change.before, t)] }), _jsx(Icon, { name: "arrow" }), _jsxs("span", { className: "dtr-pill dtr-pill-brand", children: [_jsxs("span", { className: "dtr-sr-only", children: [t('after'), " "] }), previewTarget(change.after, t)] })] })] }, change.category)) }) : _jsx("p", { children: t('noChanges') }), previewStale && _jsx("p", { className: "dtr-muted dtr-warning", role: "status", children: t('previewChanged') }), _jsxs("p", { className: "dtr-muted", children: [t('preserved', { count: preview.value.preserved.length }), " \u00B7 ", t('unmatched', { count: preview.value.unavailable.length }), " \u00B7 ", t('skippedDisabled', { count: preview.value.skippedDisabled.length })] }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", autoFocus: true, onClick: closePreview, children: t('cancelPreview') }), _jsx("button", { type: "button", className: "dtr-primary", disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale, onClick: () => { if (editor.applyRecommendations(preview.value, preview.revision))
                                                        closePreview(); }, children: t('applyPreview') })] })] }), _jsx("fieldset", { disabled: disabled, children: _jsxs("div", { className: "dtr-groups-stack", children: [GROUP_ORDER.map(groupId => _jsx(CategoryGroup, { t: t, locale: locale, groupId: groupId, entries: GROUP_ENTRIES[groupId], draftBuiltins: draft.builtins, instance: instance, catalog: catalogIndex, catalogReady: catalogReady, catalogStatus: catalogStatus, defaultSummary: defaultSummary, disabled: disabled, issue: state.issue, registerField: registerField, onToggleEnabled: toggleBuiltin, onModel: chooseModel, onEffort: chooseEffort }, groupId)), _jsx(CustomCategoryEditor, { t: t, locale: locale, custom: draft.custom, instance: instance, catalog: catalogIndex, catalogReady: catalogReady, catalogStatus: catalogStatus, defaultSummary: defaultSummary, disabled: disabled, issue: state.issue, registerField: registerField, onAdd: addCustom, onUpdate: updateCustom, onRemove: removeCustom, onModel: chooseModel, onEffort: chooseEffort })] }) })] }), _jsxs("details", { className: "dtr-section dtr-card dtr-advanced", children: [_jsx("summary", { children: t('advanced') }), _jsxs("div", { className: "dtr-advanced-body", children: [_jsxs("div", { className: "dtr-toggle-row", children: [_jsxs("div", { children: [_jsx("strong", { id: `dtr-${instance}-guidance`, children: t('guidanceToggle') }), _jsx("p", { id: `dtr-${instance}-guidance-hint`, className: "dtr-muted", children: t('guidanceHint') })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": draft.behavior.guidance, "aria-labelledby": `dtr-${instance}-guidance`, "aria-describedby": `dtr-${instance}-guidance-hint`, className: "dtr-switch", disabled: disabled, onClick: () => editor.editBehavior({ guidance: !draft.behavior.guidance }, revision) })] }), _jsxs("label", { className: "dtr-field dtr-history", children: [t('historyLimit'), _jsx("input", { ref: registerHistory, id: `dtr-${instance}-history`, "aria-invalid": historyInvalid || undefined, "aria-describedby": historyInvalid ? `dtr-${instance}-issue` : undefined, type: "number", min: 1, max: 1000, step: 1, disabled: disabled, value: draft.historyLimit, onChange: event => editor.edit({ ...draft, historyLimit: event.currentTarget.value }, revision) })] })] })] })] }), _jsxs("div", { className: "dtr-feedback", "aria-live": "polite", children: [state.stale && _jsx("p", { className: "dtr-muted dtr-warning", children: t('stale') }), state.issue && _jsxs("p", { ref: issueSummary, tabIndex: -1, id: `dtr-${instance}-issue`, role: "alert", className: "dtr-error", children: [issueSectionName(state.issue.section), " \u00B7 ", fieldLabel(t, state.issue.field), ": ", state.issue.detail ?? reasonLabel(t, state.issue.reason)] }), previewError && _jsx("p", { role: "alert", className: "dtr-error", children: t('validationError', { message: previewError }) }), grantProblem && _jsx(GrantDiagnostics, { id: `dtr-${instance}-grants`, problem: grantProblem, locale: locale, inventory: inventory, recheck: recheck, dirty: state.dirty, openBundle: navigation ? openBundle : undefined }, grantProblem), state.error && state.error.kind !== 'grantUnavailable' && state.error.kind !== 'grantReadOnly' && _jsx("p", { role: "alert", className: "dtr-error", children: state.error.kind === 'grantFailed' ? t('grantFailed')
                                : state.error.kind === 'refused' ? t('refused')
                                    : state.error.kind === 'previewChanged' ? t('previewChanged')
                                        : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail }) })] }), draft && _jsxs("footer", { className: "dtr-footer", children: [_jsx("span", { className: "dtr-status dtr-muted", "data-status": status, role: "status", children: t(status) }), _jsxs("div", { className: "dtr-inline dtr-footer-actions", children: [_jsx("button", { type: "button", disabled: state.saving || preview !== undefined || (!state.dirty && !state.stale), onClick: () => { setPreviewError(undefined); editor.discard(); }, children: t(state.stale ? 'reload' : 'cancel') }), _jsx("button", { type: "button", className: "dtr-primary", disabled: disabled || !!grantProblem || (!state.dirty && !needsGrant) || state.stale, onClick: save, children: t(state.saving ? 'saving' : 'save') })] })] })] });
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
    if (target.mode === 'inherit')
        return t('inherit');
    return `${target.provider} / ${target.model}${target.reasoningEffort ? ` · ${target.reasoningEffort}` : ''}`;
}
//# sourceMappingURL=client.js.map