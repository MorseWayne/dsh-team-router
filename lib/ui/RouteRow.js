import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Icon, ModelPicker } from "./ModelPicker.js";
export const fieldKey = (section, field) => `${section}:${field}`;
const EXECUTOR_LABELS = { codex: 'Codex', agy: 'Antigravity (agy)', cursor: 'Cursor' };
const NO_EFFORTS = [];
function nativeDisplay(t, catalog, catalogReady, provider, id) {
    if (id === undefined)
        return { label: t('inherit') };
    if (!id)
        return { label: t('chooseModel') };
    const group = provider ? catalog.get(provider) : undefined;
    const model = group?.models.get(id)?.model;
    if (model && group && !group.failed)
        return { label: model.name, detail: group.duplicateNames.has(model.name) ? `${group.name} · ${model.id}` : group.name };
    return { label: catalogReady ? t('unavailableOption', { name: id }) : id, ...(provider ? { detail: group?.name ?? provider } : {}) };
}
export function externalModelSummary(target, t) {
    if (target.model.mode === 'executor-default')
        return t('executorDefault');
    return target.model.reasoningEffort ? `${target.model.id} · ${target.model.reasoningEffort}` : target.model.id;
}
export function defaultTargetSummary(t, target, catalog, catalogReady) {
    if (target.executor !== 'native')
        return `${EXECUTOR_LABELS[target.executor]} · ${externalModelSummary(target, t)}`;
    const explicit = target.model.mode === 'explicit' ? target.model : undefined;
    const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.id);
    return display.detail ? `${display.label} · ${display.detail}` : display.label;
}
// RoutingEditor clones its draft on each edit; only primitive row data crosses this memo boundary.
export const RouteRow = React.memo(function RouteRow({ t, section, name, purpose, instance, catalog, catalogReady, catalogStatus, executor, legacyModel, provider, model, effort, followsDefault, defaultSummary, disabled, issueField, registerField, onModel, onEffort }) {
    const baseId = `dtr-${instance}-${section}`;
    const titleId = `${baseId}-title`;
    const issueId = `dtr-${instance}-issue`;
    const customized = section !== 'default' && !followsDefault;
    const showExecutor = !followsDefault && executor !== 'native';
    const mode = followsDefault ? 'default' : model === undefined ? 'inherit' : 'explicit';
    const display = followsDefault ? { label: t('useDefault'), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
    const group = provider ? catalog.get(provider) : undefined;
    const catalogModel = model ? group?.models.get(model)?.model : undefined;
    const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
    const showEffort = !followsDefault && executor === 'native' && provider !== undefined && model !== undefined && (efforts.length > 0 || effort !== undefined);
    const focusAfterReset = React.useRef(false);
    const pickerButton = React.useRef(null);
    const registerModel = React.useCallback((node) => {
        pickerButton.current = node;
        registerField(section, 'model', node);
        registerField(section, 'provider', node);
    }, [registerField, section]);
    const registerEffort = React.useCallback((node) => registerField(section, 'effort', node), [registerField, section]);
    const registerExecutor = React.useCallback((node) => registerField(section, 'executor', node), [registerField, section]);
    const chooseModel = React.useCallback((choice) => onModel(section, choice), [onModel, section]);
    React.useLayoutEffect(() => {
        if (!focusAfterReset.current || (!followsDefault && showExecutor))
            return;
        focusAfterReset.current = false;
        pickerButton.current?.focus({ preventScroll: true });
    }, [followsDefault, showExecutor]);
    return _jsxs("div", { className: `dtr-card dtr-route${section === 'default' ? ' dtr-route-default' : ''}`, role: "group", "aria-labelledby": titleId, children: [_jsxs("div", { className: "dtr-stack", children: [_jsxs("div", { className: "dtr-inline dtr-route-title", children: [_jsx("h4", { id: titleId, children: name }), section !== 'default' && _jsxs(_Fragment, { children: [_jsx("code", { className: "dtr-route-id", children: section }), _jsx("span", { className: `dtr-pill${customized ? ' dtr-pill-brand' : ''}`, children: t(customized ? 'customized' : 'useDefault') })] })] }), _jsx("p", { className: "dtr-route-purpose", children: purpose })] }), _jsxs("div", { className: "dtr-controls", children: [showExecutor ? _jsxs(_Fragment, { children: [_jsxs("label", { className: "dtr-field dtr-executor", children: [t('executor'), _jsxs("select", { ref: registerExecutor, id: `${baseId}-executor`, "aria-invalid": issueField === 'executor' || undefined, "aria-describedby": issueField === 'executor' ? issueId : undefined, value: executor, onChange: () => {
                                            focusAfterReset.current = true;
                                            chooseModel({ mode: 'inherit' });
                                        }, children: [_jsx("option", { value: "native", children: t('native') }), _jsx("option", { value: executor, disabled: true, children: EXECUTOR_LABELS[executor] })] })] }), legacyModel && _jsxs("div", { className: "dtr-field dtr-legacy-model", children: [_jsx("span", { children: t('model') }), _jsx("strong", { children: legacyModel })] })] }) : _jsx(ModelPicker, { t: t, catalog: catalog, status: catalogStatus, mode: mode, provider: provider, model: model, label: display.label, detail: display.detail, defaultSummary: defaultSummary, id: `${baseId}-model`, titleId: titleId, invalid: issueField === 'model' || issueField === 'provider' || issueField === 'executor', issueId: issueId, disabled: disabled, register: registerModel, onSelect: chooseModel }), showEffort && _jsxs("label", { className: "dtr-field dtr-effort", children: [t('effort'), _jsxs("select", { ref: registerEffort, id: `${baseId}-effort`, "aria-invalid": issueField === 'effort' || undefined, "aria-describedby": issueField === 'effort' ? issueId : undefined, value: effort ?? '', disabled: !catalogReady || !catalogModel || group?.failed, onChange: event => onEffort(section, provider, model, event.currentTarget.value), children: [_jsx("option", { value: "", children: t('modelDefault') }), effort && !efforts.some(item => item.id === effort) && _jsx("option", { value: effort, children: t('unavailableOption', { name: effort }) }), efforts.map(item => _jsx("option", { value: item.id, children: item.name }, item.id))] })] }), customized && _jsx("button", { type: "button", className: "dtr-icon-button", title: t('reset'), "aria-label": t('reset'), onClick: () => {
                            focusAfterReset.current = true;
                            chooseModel({ mode: 'default' });
                        }, children: _jsx(Icon, { name: "reset" }) })] }), showExecutor && _jsx("p", { className: "dtr-muted dtr-warning", children: t('externalBlocked') })] });
});
//# sourceMappingURL=RouteRow.js.map