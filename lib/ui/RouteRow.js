import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { Icon, ModelPicker } from "./ModelPicker.js";
export const fieldKey = (section, field) => `${section}:${field}`;
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
export function targetSummary(t, target, catalog, catalogReady) {
    const explicit = target.mode === 'explicit' ? target : undefined;
    const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.model);
    const base = display.detail ? `${display.label} · ${display.detail}` : display.label;
    return explicit?.reasoningEffort ? `${base} · ${explicit.reasoningEffort}` : base;
}
export function bindingSummary(t, binding, catalog, catalogReady) {
    return binding.mode === 'default' ? t('useDefault') : targetSummary(t, binding, catalog, catalogReady);
}
export const RouteRow = React.memo(function RouteRow({ t, section, name, purpose, instance, catalog, catalogReady, catalogStatus, provider, model, effort, followsDefault, defaultSummary, enabled = true, proactive = false, disabled, issueField, registerField, onToggleEnabled, onModel, onEffort, extraActions, children, }) {
    const baseId = `dtr-${instance}-${section}`;
    const titleId = `${baseId}-title`;
    const issueId = `dtr-${instance}-issue`;
    const isCategory = section !== 'default';
    const customized = isCategory && !followsDefault;
    const mode = followsDefault ? 'default' : model === undefined ? 'inherit' : 'explicit';
    const display = followsDefault ? { label: t('useDefault'), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
    const group = provider ? catalog.get(provider) : undefined;
    const catalogModel = model ? group?.models.get(model)?.model : undefined;
    const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
    const showEffort = enabled && !followsDefault && provider !== undefined && model !== undefined && (efforts.length > 0 || effort !== undefined);
    const pickerButton = React.useRef(null);
    const registerModel = React.useCallback((node) => {
        pickerButton.current = node;
        registerField(section, 'model', node);
        registerField(section, 'provider', node);
    }, [registerField, section]);
    const registerEffort = React.useCallback((node) => registerField(section, 'effort', node), [registerField, section]);
    const chooseModel = React.useCallback((choice) => onModel(section, choice), [onModel, section]);
    const dormantSummary = !enabled && customized
        ? (model === undefined ? t('inherit') : `${display.label}${display.detail ? ` · ${display.detail}` : ''}${effort ? ` · ${effort}` : ''}`)
        : undefined;
    return _jsxs("div", { className: `dtr-card dtr-route${section === 'default' ? ' dtr-route-default' : ''}${!enabled ? ' dtr-route-disabled' : ''}`, role: "group", "aria-labelledby": titleId, children: [_jsxs("div", { className: "dtr-stack", children: [_jsxs("div", { className: "dtr-inline dtr-route-title", children: [isCategory && onToggleEnabled && _jsx("button", { type: "button", role: "switch", "aria-checked": enabled, "aria-label": t(enabled ? 'disableCategory' : 'enableCategory', { name }), className: "dtr-switch dtr-switch-sm", disabled: disabled, onClick: () => onToggleEnabled(section, !enabled) }), _jsx("h4", { id: titleId, children: name || section }), isCategory && _jsx("code", { className: "dtr-route-id", children: section }), isCategory && enabled && _jsx("span", { className: `dtr-pill${customized ? ' dtr-pill-brand' : ''}`, children: t(customized ? 'customized' : 'useDefault') }), isCategory && enabled && proactive && _jsx("span", { className: "dtr-pill dtr-pill-accent", children: t('proactive') }), isCategory && !enabled && _jsx("span", { className: "dtr-pill dtr-pill-muted", children: t('disabledBadge') })] }), purpose && _jsx("p", { className: "dtr-route-purpose", children: purpose }), !enabled && _jsxs("p", { className: "dtr-muted dtr-dormant-note", children: [t('disabledNote'), dormantSummary ? ` · ${t('dormantBinding', { summary: dormantSummary })}` : ''] })] }), _jsxs("div", { className: "dtr-controls", children: [enabled && _jsxs(_Fragment, { children: [_jsx(ModelPicker, { t: t, catalog: catalog, status: catalogStatus, mode: mode, provider: provider, model: model, label: display.label, detail: display.detail, defaultSummary: defaultSummary, id: `${baseId}-model`, titleId: titleId, invalid: issueField === 'model' || issueField === 'provider', issueId: issueId, disabled: disabled, register: registerModel, onSelect: chooseModel }), showEffort && _jsxs("label", { className: "dtr-field dtr-effort", children: [t('effort'), _jsxs("select", { ref: registerEffort, id: `${baseId}-effort`, "aria-invalid": issueField === 'effort' || undefined, "aria-describedby": issueField === 'effort' ? issueId : undefined, value: effort ?? '', disabled: disabled || !catalogReady || !catalogModel || group?.failed, onChange: event => onEffort(section, provider, model, event.currentTarget.value), children: [_jsx("option", { value: "", children: t('modelDefault') }), effort && !efforts.some(item => item.id === effort) && _jsx("option", { value: effort, children: t('unavailableOption', { name: effort }) }), efforts.map(item => _jsx("option", { value: item.id, children: item.name }, item.id))] })] }), customized && _jsx("button", { type: "button", className: "dtr-icon-button", title: t('reset'), "aria-label": t('reset'), disabled: disabled, onClick: () => chooseModel({ mode: 'default' }), children: _jsx(Icon, { name: "reset" }) })] }), extraActions] }), children] });
});
//# sourceMappingURL=RouteRow.js.map