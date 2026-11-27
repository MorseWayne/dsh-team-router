import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CUSTOM_CATEGORY_TEMPLATES, MAX_CUSTOM_CATEGORIES, generateCustomCategoryId, } from "../core/categories.js";
import { RouteRow } from "./RouteRow.js";
const META_FIELDS = new Set(['id', 'name', 'purpose', 'avoid']);
export const CustomCategoryEditor = React.memo(function CustomCategoryEditor({ t, locale, custom, instance, catalog, catalogReady, catalogStatus, defaultSummary, disabled, issue, registerField, onAdd, onUpdate, onRemove, onModel, onEffort, }) {
    const [editing, setEditing] = React.useState(() => new Set());
    const [manualIds, setManualIds] = React.useState(() => new Set());
    const [showTemplates, setShowTemplates] = React.useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = React.useState();
    const headingId = `dtr-${instance}-group-custom`;
    const issueId = `dtr-${instance}-issue`;
    const atLimit = custom.length >= MAX_CUSTOM_CATEGORIES;
    const openEditor = React.useCallback((id) => {
        setEditing(prev => { const next = new Set(prev); next.add(id); return next; });
    }, []);
    const toggleEditor = React.useCallback((id) => {
        setEditing(prev => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const addBlank = () => {
        const id = onAdd();
        if (id) {
            openEditor(id);
            setShowTemplates(false);
        }
    };
    const addFromTemplate = (template) => {
        const text = template[locale];
        const id = onAdd({ id: template.suggestedId, name: text.name, purpose: text.purpose, avoid: text.avoid, proactive: false });
        if (id) {
            openEditor(id);
            setShowTemplates(false);
        }
    };
    const handleToggle = React.useCallback((section, next) => {
        onUpdate(section, { enabled: next });
    }, [onUpdate]);
    return _jsxs("section", { className: "dtr-group dtr-custom-section", "aria-labelledby": headingId, children: [_jsxs("div", { className: "dtr-inline dtr-custom-header", children: [_jsxs("div", { className: "dtr-inline dtr-group-heading", children: [_jsx("h4", { id: headingId, children: t('customTitle') }), _jsxs("span", { className: "dtr-count", children: [custom.length, "/", MAX_CUSTOM_CATEGORIES] })] }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", disabled: disabled || atLimit, onClick: addBlank, children: t('customAddBlank') }), _jsx("button", { type: "button", disabled: disabled || atLimit, "aria-expanded": showTemplates, onClick: () => setShowTemplates(value => !value), children: t('customAddTemplate') })] })] }), _jsx("p", { className: "dtr-muted", children: t('customSubtitle', { max: MAX_CUSTOM_CATEGORIES }) }), atLimit && _jsx("p", { className: "dtr-muted dtr-warning", role: "status", children: t('customLimitReached', { max: MAX_CUSTOM_CATEGORIES }) }), showTemplates && !atLimit && _jsxs("section", { className: "dtr-card dtr-note", "aria-label": t('customTemplatesTitle'), children: [_jsxs("div", { className: "dtr-inline dtr-toolbar", children: [_jsx("strong", { children: t('customTemplatesTitle') }), _jsx("button", { type: "button", onClick: () => setShowTemplates(false), children: t('customCancelDelete') })] }), _jsx("div", { className: "dtr-template-grid", children: CUSTOM_CATEGORY_TEMPLATES.map(template => {
                            const text = template[locale];
                            return _jsxs("div", { className: "dtr-card dtr-template-card", children: [_jsxs("div", { className: "dtr-stack", children: [_jsxs("div", { className: "dtr-inline dtr-route-title", children: [_jsx("strong", { children: text.name }), _jsx("code", { className: "dtr-route-id", children: template.suggestedId })] }), _jsx("p", { className: "dtr-route-purpose", children: text.purpose }), _jsx("p", { className: "dtr-muted", children: t('customExample', { text: text.example }) }), _jsx("p", { className: "dtr-muted", children: text.nearBuiltin })] }), _jsx("button", { type: "button", disabled: disabled || atLimit, onClick: () => addFromTemplate(template), children: t('customUseTemplate') })] }, template.templateId);
                        }) })] }), custom.length === 0 && !showTemplates && _jsx("p", { className: "dtr-muted dtr-card dtr-note", children: t('customEmpty') }), custom.map(entry => {
                const hasMetaIssue = issue?.section === entry.id && META_FIELDS.has(issue.field);
                const isOpen = editing.has(entry.id) || hasMetaIssue;
                const followsDefault = entry.binding.mode === 'default';
                const explicit = entry.binding.mode === 'explicit' ? entry.binding : undefined;
                const confirming = confirmDeleteId === entry.id;
                const baseId = `dtr-${instance}-${entry.id}`;
                return _jsxs(RouteRow, { t: t, section: entry.id, name: entry.name || entry.id, purpose: entry.purpose, instance: instance, catalog: catalog, catalogReady: catalogReady, catalogStatus: catalogStatus, provider: explicit?.provider, model: explicit?.model, effort: explicit?.reasoningEffort, followsDefault: followsDefault, defaultSummary: defaultSummary, enabled: entry.enabled, proactive: entry.proactive, disabled: disabled, issueField: issue?.section === entry.id ? issue.field : undefined, registerField: registerField, onToggleEnabled: handleToggle, onModel: onModel, onEffort: onEffort, extraActions: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", disabled: disabled, "aria-expanded": isOpen, onClick: () => toggleEditor(entry.id), children: t(isOpen ? 'customDone' : 'customEdit') }), _jsx("button", { type: "button", className: "dtr-danger-button", disabled: disabled, onClick: () => setConfirmDeleteId(entry.id), children: t('customDelete') })] }), children: [confirming && _jsxs("div", { className: "dtr-custom-confirm", role: "alert", children: [_jsx("span", { children: t('customDeleteHint') }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", disabled: disabled, onClick: () => setConfirmDeleteId(undefined), children: t('customCancelDelete') }), _jsx("button", { type: "button", className: "dtr-danger-button", disabled: disabled, onClick: () => {
                                                setConfirmDeleteId(undefined);
                                                onRemove(entry.id);
                                            }, children: t('customDeleteConfirm') })] })] }), isOpen && _jsxs("div", { className: "dtr-custom-form", children: [_jsxs("div", { className: "dtr-custom-form-grid", children: [_jsxs("label", { className: "dtr-field", children: [_jsx("span", { children: t('customName') }), _jsx("input", { ref: node => registerField(entry.id, 'name', node), id: `${baseId}-name`, type: "text", maxLength: 40, disabled: disabled, placeholder: t('customNamePlaceholder'), value: entry.name, "aria-invalid": (issue?.section === entry.id && issue.field === 'name') || undefined, "aria-describedby": issue?.section === entry.id && issue.field === 'name' ? issueId : undefined, onChange: event => {
                                                        const nextName = event.currentTarget.value;
                                                        if (!entry.persisted && !manualIds.has(entry.id)) {
                                                            const otherIds = custom.filter(item => item.id !== entry.id).map(item => item.id);
                                                            const nextId = generateCustomCategoryId(nextName, otherIds);
                                                            setEditing(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                                                            onUpdate(entry.id, { name: nextName, id: nextId });
                                                        }
                                                        else {
                                                            onUpdate(entry.id, { name: nextName });
                                                        }
                                                    } })] }), _jsxs("label", { className: "dtr-field", children: [_jsxs("span", { children: [t('customId'), entry.persisted ? ` · ${t('customIdLocked')}` : ''] }), _jsx("input", { ref: node => registerField(entry.id, 'id', node), id: `${baseId}-id`, type: "text", maxLength: 40, disabled: disabled || entry.persisted, value: entry.id, "aria-invalid": (issue?.section === entry.id && issue.field === 'id') || undefined, "aria-describedby": issue?.section === entry.id && issue.field === 'id' ? issueId : undefined, onChange: event => {
                                                        const nextId = event.currentTarget.value;
                                                        setManualIds(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                                                        setEditing(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                                                        onUpdate(entry.id, { id: nextId });
                                                    } }), !entry.persisted && _jsx("span", { className: "dtr-muted", children: t('customIdHint') })] })] }), _jsxs("label", { className: "dtr-field", children: [_jsx("span", { children: t('customPurpose') }), _jsx("input", { ref: node => registerField(entry.id, 'purpose', node), id: `${baseId}-purpose`, type: "text", maxLength: 120, disabled: disabled, placeholder: t('customPurposePlaceholder'), value: entry.purpose, "aria-invalid": (issue?.section === entry.id && issue.field === 'purpose') || undefined, "aria-describedby": issue?.section === entry.id && issue.field === 'purpose' ? issueId : undefined, onChange: event => onUpdate(entry.id, { purpose: event.currentTarget.value }) })] }), _jsxs("label", { className: "dtr-field", children: [_jsx("span", { children: t('customAvoid') }), _jsx("input", { ref: node => registerField(entry.id, 'avoid', node), id: `${baseId}-avoid`, type: "text", maxLength: 80, disabled: disabled, placeholder: t('customAvoidPlaceholder'), value: entry.avoid, "aria-invalid": (issue?.section === entry.id && issue.field === 'avoid') || undefined, "aria-describedby": issue?.section === entry.id && issue.field === 'avoid' ? issueId : undefined, onChange: event => onUpdate(entry.id, { avoid: event.currentTarget.value }) })] }), _jsxs("div", { className: "dtr-toggle-row dtr-custom-proactive", children: [_jsxs("div", { children: [_jsx("strong", { id: `${baseId}-proactive`, children: t('customProactive') }), _jsx("p", { id: `${baseId}-proactive-hint`, className: "dtr-muted", children: t('customProactiveHint') })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": entry.proactive, "aria-labelledby": `${baseId}-proactive`, "aria-describedby": `${baseId}-proactive-hint`, className: "dtr-switch", disabled: disabled, onClick: () => onUpdate(entry.id, { proactive: !entry.proactive }) })] })] })] }, entry.id);
            })] });
});
//# sourceMappingURL=CustomCategoryEditor.js.map