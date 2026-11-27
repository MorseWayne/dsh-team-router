import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { BUILTIN_GROUPS } from "../core/categories.js";
import { RouteRow } from "./RouteRow.js";
export const CategoryGroup = React.memo(function CategoryGroup({ t, locale, groupId, entries, draftBuiltins, instance, catalog, catalogReady, catalogStatus, defaultSummary, disabled, issue, registerField, onToggleEnabled, onModel, onEffort, }) {
    const headingId = `dtr-${instance}-group-${groupId}`;
    const groupTitle = BUILTIN_GROUPS[groupId][locale];
    let enabledCount = 0;
    let customizedCount = 0;
    const primary = [];
    const followingDefault = [];
    for (const entry of entries) {
        const state = draftBuiltins[entry.id];
        if (state.enabled)
            enabledCount++;
        if (state.binding.mode !== 'default')
            customizedCount++;
        const hasIssue = issue?.section === entry.id;
        if (!state.enabled || state.binding.mode !== 'default' || hasIssue)
            primary.push(entry);
        else
            followingDefault.push(entry);
    }
    const handleToggle = React.useCallback((section, next) => {
        onToggleEnabled(section, next);
    }, [onToggleEnabled]);
    const renderRow = (entry) => {
        const state = draftBuiltins[entry.id];
        const binding = state.binding;
        const followsDefault = binding.mode === 'default';
        const explicit = binding.mode === 'explicit' ? binding : undefined;
        return _jsx(RouteRow, { t: t, section: entry.id, name: entry[locale].name, purpose: entry[locale].purpose, instance: instance, catalog: catalog, catalogReady: catalogReady, catalogStatus: catalogStatus, provider: explicit?.provider, model: explicit?.model, effort: explicit?.reasoningEffort, followsDefault: followsDefault, defaultSummary: defaultSummary, enabled: state.enabled, proactive: entry.proactive, disabled: disabled, issueField: issue?.section === entry.id ? issue.field : undefined, registerField: registerField, onToggleEnabled: handleToggle, onModel: onModel, onEffort: onEffort }, entry.id);
    };
    return _jsxs("section", { className: "dtr-group", "aria-labelledby": headingId, children: [_jsxs("div", { className: "dtr-inline dtr-group-heading", children: [_jsx("h4", { id: headingId, children: groupTitle }), _jsx("span", { className: "dtr-count", children: t('groupCount', { enabled: enabledCount, total: entries.length }) }), customizedCount > 0 && _jsx("span", { className: "dtr-pill dtr-pill-brand", children: t('groupCustomized', { count: customizedCount }) })] }), primary.map(renderRow), followingDefault.length > 0 && (_jsxs("details", { className: "dtr-default-collapse", children: [_jsx("summary", { children: t('showDefaultRows', { count: followingDefault.length }) }), _jsx("div", { className: "dtr-group dtr-collapse-body", children: followingDefault.map(renderRow) })] }))] });
});
//# sourceMappingURL=CategoryGroup.js.map