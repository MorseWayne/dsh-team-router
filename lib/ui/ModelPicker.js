import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { searchCatalog } from "./catalog-index.js";
const ICON_PATHS = {
    chevron: 'm6 9 6 6 6-6', check: 'm5 12 4 4L19 6', reset: 'M4 11a8 8 0 1 1 2 6m-2-6V5m0 6h6',
    passive: 'M6 5v14M11 8l5 4-5 4',
    'specialist-first': 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
    orchestrator: 'M9 4h6v5H9zM4 16h6v4H4zM14 16h6v4h-6zM12 9v4m-5 3v-3h10v3',
    info: 'M12 11v5m0-8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    arrow: 'M4 12h15m-6-6 6 6-6 6',
};
export function Icon({ name }) {
    return _jsx("svg", { "aria-hidden": "true", focusable: "false", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: ICON_PATHS[name] }) });
}
const PAGE_SIZE = 60;
const CatalogOptions = React.memo(function CatalogOptions({ matches, provider, model, choose }) {
    // The parent can update the input immediately without reconciling this subtree until matches change.
    return _jsx(_Fragment, { children: matches.groups.map(group => _jsxs("div", { role: "group", "aria-label": group.provider.name, children: [_jsx("div", { "aria-hidden": "true", className: "dtr-option-group-label", children: group.provider.name }), group.models.map(entry => {
                    const active = provider === group.provider.id && model === entry.id;
                    return _jsxs("button", { type: "button", className: "dtr-option", tabIndex: -1, "data-catalog-option": "", "aria-pressed": active, disabled: group.provider.failed, onClick: () => choose({ mode: 'explicit', provider: group.provider.id, id: entry.id }), children: [_jsxs("span", { children: [entry.name, group.provider.duplicateNames.has(entry.name) && _jsx("span", { className: "dtr-option-detail", children: entry.id })] }), active && _jsx(Icon, { name: "check" })] }, entry.id);
                })] }, group.provider.id)) });
});
export const ModelPicker = React.memo(function ModelPicker({ t, catalog, status, mode, provider, model, label, detail, defaultSummary, id, titleId, invalid, issueId, disabled, register, onSelect }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [page, setPage] = React.useState({ filter: '', limit: PAGE_SIZE });
    const filter = React.useDeferredValue(query).trim().toLowerCase();
    const limit = page.filter === filter ? page.limit : PAGE_SIZE;
    const root = React.useRef(null);
    const trigger = React.useRef(null);
    const popup = React.useRef(null);
    const input = React.useRef(null);
    const focusMore = React.useRef();
    const triggerRef = React.useCallback((node) => { trigger.current = node; register(node); }, [register]);
    const visible = open && !disabled;
    const close = React.useCallback(() => {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
    }, []);
    const choose = React.useCallback((choice) => {
        close();
        if (choice.mode !== mode || (choice.mode === 'explicit' && (choice.provider !== provider || choice.id !== model)))
            onSelect(choice);
    }, [close, mode, provider, model, onSelect]);
    React.useLayoutEffect(() => {
        if (disabled)
            setOpen(false);
    }, [disabled]);
    React.useLayoutEffect(() => {
        if (!visible)
            return;
        const panel = popup.current;
        const anchor = trigger.current;
        if (!panel || !anchor)
            return;
        const topLayer = typeof panel.showPopover === 'function';
        const rtl = getComputedStyle(anchor).direction === 'rtl';
        const visualViewport = window.visualViewport;
        const place = () => {
            const rect = anchor.getBoundingClientRect();
            const width = visualViewport?.width ?? document.documentElement.clientWidth;
            const height = visualViewport?.height ?? window.innerHeight;
            const viewportLeft = visualViewport?.offsetLeft ?? 0;
            const viewportTop = visualViewport?.offsetTop ?? 0;
            const gap = 4;
            const margin = 8;
            const below = viewportTop + height - rect.bottom - gap - margin;
            const above = rect.top - viewportTop - gap - margin;
            const up = below < Math.min(400, height * .57) && below < above;
            panel.dataset.up = String(up);
            panel.style.setProperty('--dtr-menu-available', `${Math.min(448, Math.max(0, up ? above : below))}px`);
            if (topLayer) {
                const menuWidth = Math.min(Math.max(0, width - 2 * margin), Math.max(rect.width, 280));
                const left = Math.max(viewportLeft + margin, Math.min(rtl ? rect.left : rect.right - menuWidth, viewportLeft + width - margin - menuWidth));
                panel.style.setProperty('--dtr-menu-width', `${menuWidth}px`);
                panel.style.setProperty('--dtr-menu-left', `${left}px`);
                panel.style.setProperty('--dtr-menu-edge', `${up ? window.innerHeight - rect.top + gap : rect.bottom + gap}px`);
            }
        };
        place();
        if (topLayer) {
            panel.popover = 'manual';
            panel.showPopover();
        }
        input.current?.focus({ preventScroll: true });
        let frame = 0;
        const schedulePlace = (event) => {
            if (frame || (event?.target instanceof Node && panel.contains(event.target)))
                return;
            frame = requestAnimationFrame(() => { frame = 0; place(); });
        };
        const onOutside = (event) => { if (event.target instanceof Node && !root.current?.contains(event.target))
            setOpen(false); };
        const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
            if (entries.some(entry => !entry.isIntersecting))
                setOpen(false);
        }) : undefined;
        observer?.observe(anchor);
        const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedulePlace()) : undefined;
        resizeObserver?.observe(anchor);
        const editor = anchor.closest('.dtr-editor');
        if (editor)
            resizeObserver?.observe(editor);
        visualViewport?.addEventListener('resize', schedulePlace);
        visualViewport?.addEventListener('scroll', schedulePlace, { passive: true });
        window.addEventListener('resize', schedulePlace);
        window.addEventListener('scroll', schedulePlace, { capture: true, passive: true });
        document.addEventListener('pointerdown', onOutside, true);
        document.addEventListener('focusin', onOutside);
        return () => {
            observer?.disconnect();
            resizeObserver?.disconnect();
            cancelAnimationFrame(frame);
            visualViewport?.removeEventListener('resize', schedulePlace);
            visualViewport?.removeEventListener('scroll', schedulePlace);
            window.removeEventListener('resize', schedulePlace);
            window.removeEventListener('scroll', schedulePlace, true);
            document.removeEventListener('pointerdown', onOutside, true);
            document.removeEventListener('focusin', onOutside);
            if (topLayer && panel.matches(':popover-open'))
                panel.hidePopover();
        };
    }, [visible]);
    const matches = React.useMemo(() => visible && !status ? searchCatalog(catalog, filter, limit) : undefined, [visible, status, catalog, filter, limit]);
    React.useLayoutEffect(() => {
        if (focusMore.current === undefined)
            return;
        const options = popup.current?.querySelectorAll('[data-catalog-option]:not(:disabled)');
        const next = options && (options[focusMore.current] ?? options[options.length - 1]);
        focusMore.current = undefined;
        (next ?? input.current)?.focus();
    }, [limit]);
    const start = () => { setQuery(''); setPage({ filter: '', limit: PAGE_SIZE }); setOpen(true); };
    const specialOption = (choice, text, description) => _jsxs("button", { type: "button", className: "dtr-option", tabIndex: choice.mode === 'default' || defaultSummary === undefined ? 0 : -1, "aria-pressed": mode === choice.mode, onClick: () => choose(choice), children: [_jsxs("span", { children: [text, description && _jsx("span", { className: "dtr-option-detail", children: description })] }), mode === choice.mode && _jsx(Icon, { name: "check" })] });
    const selectionText = detail ? `${label} · ${detail}` : label;
    const popupId = `${id}-popup`;
    return _jsxs("div", { className: "dtr-field dtr-picker", ref: root, onKeyDown: event => {
            if (disabled || event.nativeEvent.isComposing)
                return;
            if (!visible) {
                if (event.target === trigger.current && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                    event.preventDefault();
                    start();
                }
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close();
                return;
            }
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
                return;
            if (event.target === input.current && (event.key === 'Home' || event.key === 'End'))
                return;
            const options = Array.from(popup.current?.querySelectorAll('.dtr-option:not(:disabled)') ?? []);
            if (!options.length)
                return;
            const previous = options.indexOf(event.target);
            if (previous < 0 && event.target !== input.current)
                return;
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
                : event.key === 'ArrowDown' ? Math.min(previous + 1, options.length - 1) : previous < 0 ? options.length - 1 : previous - 1;
            if (next < 0)
                input.current?.focus();
            else
                options[next]?.focus();
        }, children: [_jsx("span", { id: `${id}-label`, children: t('model') }), _jsxs("button", { ref: triggerRef, id: id, type: "button", className: "dtr-trigger", title: selectionText, "aria-labelledby": `${titleId} ${id}-label ${id}-selection`, "aria-expanded": visible, "aria-invalid": invalid || undefined, "aria-describedby": invalid ? issueId : undefined, "aria-controls": visible ? popupId : undefined, "data-follows": mode === 'default', disabled: disabled, onClick: visible ? close : start, children: [_jsxs("span", { className: "dtr-trigger-copy", id: `${id}-selection`, children: [_jsx("span", { className: "dtr-trigger-name", children: label }), detail && _jsx("span", { className: "dtr-trigger-detail", children: mode === 'default' ? `· ${detail}` : detail })] }), _jsx(Icon, { name: "chevron" })] }), visible && _jsxs("div", { className: "dtr-menu", id: popupId, ref: popup, children: [_jsx("span", { className: "dtr-sr-only", id: `${id}-keys`, children: t('searchKeys') }), _jsx("input", { ref: input, type: "search", "aria-label": t('searchModels'), "aria-describedby": `${id}-keys`, placeholder: t('searchModels'), value: query, onChange: event => setQuery(event.target.value) }), _jsxs("div", { className: "dtr-options", children: [defaultSummary !== undefined && specialOption({ mode: 'default' }, t('useDefault'), defaultSummary), specialOption({ mode: 'inherit' }, t('inherit')), status ? _jsx("p", { className: "dtr-muted", role: "status", children: status }) : _jsxs(_Fragment, { children: [matches && _jsx(CatalogOptions, { matches: matches, provider: provider, model: model, choose: choose }), !matches?.groups.length && _jsx("p", { className: "dtr-muted", role: "status", children: t('noModels') }), matches?.hasMore && _jsx("button", { type: "button", className: "dtr-option dtr-more", tabIndex: -1, onClick: () => {
                                            focusMore.current = popup.current?.querySelectorAll('[data-catalog-option]:not(:disabled)').length;
                                            setPage({ filter, limit: limit + PAGE_SIZE });
                                        }, children: t('moreModels') })] })] })] })] });
});
//# sourceMappingURL=ModelPicker.js.map