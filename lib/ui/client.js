import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CATEGORIES, CATEGORY_LIST } from "../core/categories.js";
import { MODEL_AUTHORIZATION_ENTRY, requiredModelRoutes, planModelGrant } from "./model-grants.js";
import { GrantDiagnostics } from "./GrantDiagnostics.js";
import { RoutingEditor, routingDraftToPolicy } from "./routing-editor.js";
import { previewRecommendations, RECOMMENDATION_VERSION } from "../core/recommendations.js";
const NS = 'teamRouter';
const en = {
    language: 'en', title: 'Team task routing',
    description: 'Seven built-in task categories. Choose an executor and model for each; changes affect new delegations only, never a running task.',
    grantUnavailable: 'Cannot read DSH model authorization settings. No changes were made; check the Host and retry.',
    grantReadOnly: 'DSH model authorization is read-only. No changes were made.',
    grantFailed: 'Routing policy is saved, but model authorization could not be confirmed. Retry Save.',
    categoryColumn: 'Task category', targetColumn: 'Routing configuration', defaultPurpose: 'Used by all categories without a custom target.',
    draftTarget: 'Draft target: {target}',
    defaults: 'Default execution target', categories: 'Task presets', binding: 'Category target', useDefault: 'Use the default target', custom: 'Choose a target',
    switchingHint: 'Default/inherited modes deactivate explicit selections. Switching back restores them within this edit session; saving or reloading keeps only the selected mode.',
    executor: 'Executor', native: 'DSH native teammate', externalBlocked: 'P0 integration is not verified. External execution is unavailable; existing values are preserved, not proof of installation or authentication.',
    modelMode: 'Model selection', inherit: 'Inherit the session model', explicit: 'Choose a model', executorDefault: 'Use the external agent’s default',
    searchModels: 'Search models', noModels: 'No matching models',
    provider: 'Provider', model: 'Model', effort: 'Reasoning effort', modelDefault: 'Model default', chooseProvider: 'Choose a provider', chooseModel: 'Choose a model',
    unavailableOption: '{name} (not available in this catalog)', configured: 'Configured target: {target}',
    loading: 'Loading Host configuration…', unavailable: 'The team-router configuration is not served by this Host.', readOnly: 'This Host configuration is read-only.',
    catalogLoading: 'Loading the live model catalog…', catalogError: 'Could not load the catalog: {message}', catalogPartial: 'Some providers failed: {message}', retry: 'Retry catalog',
    recommendations: 'Preview recommendations', recommendationHint: 'Version {version}. Curated exact model IDs, not benchmark rankings. Missing candidates keep their current/default target.',
    overwrite: 'Also replace my explicitly selected category targets', previewTitle: 'Review recommendation changes',
    previewHint: 'Confirming only changes the draft. Save separately to apply it. The default target is not changed.',
    applyPreview: 'Confirm changes to draft', cancelPreview: 'Keep current draft', noChanges: 'No matching changes to apply.',
    preserved: 'Explicit selections preserved: {count}', unmatched: 'Categories without a matching candidate: {count}',
    previewChanged: 'The draft or Host revision changed since the preview opened. Generate a new preview.',
    migrationTitle: 'Confirm legacy policy migration',
    migrationHint: 'Saving V2 retires legacy named routes, keyword rules, exact-name roles, and old member overrides. The Host must back up the legacy policy before committing. Only the old default model is mapped automatically.',
    migrationCounts: '{routes} named routes, {rules} task rules, {roles} role mappings will stop participating in routing.',
    confirmMigration: 'I confirm migration and retirement of the old routing rules', migrationConfirmed: 'Migration confirmed for this revision. Save to commit.',
    migrationRequired: 'Confirm migration before saving. Your draft is preserved.',
    advanced: 'Advanced settings and executor status', historyLimit: 'History limit (1–1000)',
    save: 'Save', saving: 'Saving…', cancel: 'Cancel edits', reload: 'Discard draft and reload Host values',
    saved: 'Saved.', dirty: 'Unsaved changes', current: 'Up to date',
    stale: 'The Host changed while you were editing. Your draft is preserved; reload before saving.',
    refused: 'The Host refused this save. Your draft is preserved; no automatic overwrite was attempted.',
    validationError: 'Invalid policy: {message}', transportError: 'Save failed: {message}. Your draft is preserved.',
    required: 'This field is required.', history: 'Enter an integer from 1 to 1000.', catalog: 'This provider, model or effort is not available in the live catalog.',
    catalogRequired: 'A current model catalog is required for explicit native models. Inherited targets do not require it.',
    externalUnavailable: 'This external executor has not passed integration verification. Select a native target before saving.',
    structure: 'The policy structure is invalid.',
};
const zh = {
    language: 'zh', title: '团队任务路由',
    description: '内置七个任务类别，按类别选择执行器与模型。修改只影响后续新委派，不改变正在执行的任务。',
    grantUnavailable: '无法读取 DSH 的模型授权设置，本次未更改配置。请检查 Host 后重试。',
    grantReadOnly: 'DSH 模型授权设置为只读，本次未更改配置。',
    grantFailed: '路由已保存，但未能确认模型授权。请再点一次「保存」重试。',
    categoryColumn: '任务类别', targetColumn: '路由配置', defaultPurpose: '所有未单独配置的类别都使用此目标。',
    draftTarget: '草稿目标：{target}',
    defaults: '默认执行目标', categories: '任务预设', binding: '类别目标', useDefault: '使用默认执行目标', custom: '单独选择目标',
    switchingHint: '切换到默认/继承会停用自选值；本次编辑中切回可恢复。保存或重新读取后仅保留所选模式。',
    executor: '执行器', native: 'DSH 原生队友', externalBlocked: 'P0 接入验证尚未通过，外部执行暂不可用。已保存的值会保留；此状态不代表 CLI 未安装或未认证。',
    modelMode: '模型选择', inherit: '继承会话模型', explicit: '指定模型', executorDefault: '使用外部 Agent 自身默认模型',
    searchModels: '搜索模型', noModels: '没有匹配的模型',
    provider: '供应商', model: '模型', effort: '推理强度', modelDefault: '模型默认', chooseProvider: '选择供应商', chooseModel: '选择模型',
    unavailableOption: '{name}（当前目录不可用）', configured: '配置目标：{target}',
    loading: '正在读取 Host 配置…', unavailable: '当前 Host 未提供 team-router 配置项。', readOnly: '当前 Host 配置为只读。',
    catalogLoading: '正在读取实时模型目录…', catalogError: '无法读取模型目录：{message}', catalogPartial: '部分供应商读取失败：{message}', retry: '重试读取目录',
    recommendations: '预览推荐配置', recommendationHint: '推荐版本 {version}。使用人工维护的精确模型标识，不代表基准最优；无匹配项保留当前/默认目标。',
    overwrite: '同时替换我已单独选择的类别目标', previewTitle: '确认推荐配置差异',
    previewHint: '确认后只更新草稿，仍需点击保存才会生效；不修改默认执行目标。',
    applyPreview: '确认应用到草稿', cancelPreview: '保留当前草稿', noChanges: '当前没有可应用的匹配变更。',
    preserved: '已保留自选类别：{count}', unmatched: '没有匹配候选的类别：{count}',
    previewChanged: '预览打开后草稿或 Host 版本发生变化，请重新生成预览。',
    migrationTitle: '确认迁移旧路由策略',
    migrationHint: '保存 V2 后，旧命名路由、关键词规则、精确队友角色和成员覆盖不再参与路由。Host 必须先备份旧配置再提交；仅旧默认模型会自动映射。',
    migrationCounts: '将停用 {routes} 条命名路由、{rules} 条任务规则、{roles} 条角色映射。',
    confirmMigration: '确认迁移并停用旧路由规则', migrationConfirmed: '已确认此版本的迁移，点击保存后提交。',
    migrationRequired: '保存前请明确确认迁移，草稿已保留。',
    advanced: '高级设置与执行器状态', historyLimit: '历史记录上限（1–1000）',
    save: '保存', saving: '保存中…', cancel: '取消修改', reload: '丢弃草稿并重新读取 Host 配置',
    saved: '已保存。', dirty: '有未保存的修改', current: '已同步',
    stale: '编辑期间 Host 配置已更新。草稿已保留，请重新读取后再保存。',
    refused: 'Host 拒绝了本次保存，草稿已保留；没有尝试自动覆盖其他修改。',
    validationError: '策略不合法：{message}', transportError: '保存失败：{message}。草稿已保留。',
    required: '此项不能为空。', history: '请输入 1 至 1000 之间的整数。', catalog: '供应商、模型或推理强度不在当前实时目录中。',
    catalogRequired: '指定原生模型需要当前有效目录；继承模型不依赖目录读取成功。',
    externalUnavailable: '此外部执行器尚未通过接入验证，请切换为原生目标后保存。', structure: '策略结构不合法。',
};
const CSS = `
.dtr-editor{container:dtr-editor / inline-size;color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;width:100%;max-width:1140px;min-width:0;margin:0 auto;padding:4px 0 24px}
.dtr-editor *{box-sizing:border-box}.dtr-editor h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}.dtr-editor h3{font-size:15px;margin:0;font-weight:600}
.dtr-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:4px 0 12px}.dtr-note{padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;margin:12px 0;background:var(--dsw-alias-bg-layer-1)}
.dtr-section{border-top:1px solid var(--dsw-alias-border-l3);padding-top:20px;margin-top:22px}.dtr-actions,.dtr-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dtr-actions{justify-content:space-between}
.dtr-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;margin-top:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;color:inherit}.dtr-category-col{width:26%}
.dtr-table th,.dtr-table td{text-align:start;vertical-align:top;padding:12px 14px;overflow-wrap:anywhere}.dtr-table thead th{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}.dtr-table thead th:first-child{border-start-start-radius:9px}.dtr-table thead th:last-child{border-start-end-radius:9px}
.dtr-table tbody th,.dtr-table td{border-block-start:1px solid var(--dsw-alias-border-l3)}.dtr-table td,.dtr-table thead th+th{border-inline-start:1px solid var(--dsw-alias-border-l3)}.dtr-table th[scope=row]{font-weight:400}.dtr-table th strong,.dtr-table th code,.dtr-purpose{display:block}.dtr-table th code{font-size:11px;color:var(--dsw-alias-label-secondary)}.dtr-purpose,.dtr-target-summary{color:var(--dsw-alias-label-secondary);font-size:12px;margin:4px 0 0}.dtr-table tr:focus-within th[scope=row]{box-shadow:inset 3px 0 var(--dsw-alias-brand-primary)}
.dtr-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10.5rem),1fr));gap:8px 12px;align-items:end}.dtr-controls>.dtr-target-summary{align-self:center}.dtr-table td>.dtr-target-summary{margin-top:8px}.dtr-field{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dtr-editor input,.dtr-editor select{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;min-width:0;width:100%}.dtr-editor input[type=checkbox]{width:auto}
.dtr-editor button{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:7px 12px;cursor:pointer}.dtr-editor button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dtr-editor :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dtr-editor :disabled{opacity:.5;cursor:not-allowed}
.dtr-editor button.dtr-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.dtr-error{color:var(--dsw-alias-state-error-primary)}.dtr-warning{color:var(--dsw-alias-label-secondary);border-inline-start:3px solid var(--dsw-alias-state-warn-primary);padding-inline-start:10px}.dtr-success{border-inline-start:3px solid var(--dsw-alias-state-success-primary);padding-inline-start:10px}.dtr-message{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}
.dtr-editor [aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.dtr-footer{border-top:1px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:16px}.dtr-editor fieldset{border:0;margin:0;padding:0;min-width:0}.dtr-editor summary{cursor:pointer}.dtr-preview li{margin:8px 0;overflow-wrap:anywhere}
.dtr-picker{position:relative}.dtr-editor .dtr-trigger{display:flex;align-items:center;justify-content:space-between;text-align:start;gap:8px;background:var(--dsw-alias-bg-base)}.dtr-trigger span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dtr-menu{position:absolute;z-index:3;inset-inline-end:0;top:calc(100% + 4px);width:max(100%,min(20rem,56cqw));padding:8px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}.dtr-menu-up{top:auto;bottom:calc(100% + 4px)}.dtr-options{overflow:auto;max-height:min(44vh,26rem);overscroll-behavior:contain;margin-top:6px}.dtr-group-name{display:flex;align-items:center;gap:8px;margin:10px 5px 3px;color:var(--dsw-alias-label-secondary)}.dtr-group-name::after{content:'';flex:1;border-top:1px solid var(--dsw-alias-border-l3)}.dtr-editor .dtr-option{display:flex;justify-content:space-between;width:100%;gap:6px;text-align:start;border:0;background:transparent;padding:6px 8px}.dtr-editor .dtr-option[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}.dtr-options :focus-visible{outline-offset:-2px}
@container dtr-editor (max-width:600px){.dtr-category-col{width:30%}.dtr-table th,.dtr-table td{padding:9px 8px}.dtr-controls{gap:6px 8px}.dtr-table select{padding:7px 5px}}
`;
function ModelPicker({ t, catalog, status, selected, label, field, onSelect }) {
    const [open, setOpen] = React.useState(false);
    const [up, setUp] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const root = React.useRef(null);
    const trigger = React.useRef(null);
    React.useEffect(() => {
        if (!open)
            return;
        const outside = (e) => { if (!root.current?.contains(e.target))
            setOpen(false); };
        document.addEventListener('pointerdown', outside);
        return () => document.removeEventListener('pointerdown', outside);
    }, [open]);
    const close = () => { setOpen(false); trigger.current?.focus(); };
    const choose = (choice) => {
        if (choice?.provider !== selected?.provider || choice?.id !== selected?.id)
            onSelect(choice);
        close();
    };
    const filter = query.trim().toLowerCase();
    const groups = (open && !status ? catalog?.groups : [])?.map(group => ({ ...group, models: group.models.filter(model => [group.name, group.id, model.name, model.id].some(text => text.toLowerCase().includes(filter))) })).filter(group => group.models.length) ?? [];
    const option = (name, active, pick, key, disabled = false) => _jsxs("button", { type: "button", className: "dtr-option", "aria-pressed": active, disabled: disabled, onClick: pick, children: [name, active && _jsx("span", { "aria-hidden": "true", children: "\u2713" })] }, key);
    return _jsxs("div", { className: "dtr-field dtr-picker", ref: root, onBlur: e => { if (!e.currentTarget.contains(e.relatedTarget))
            setOpen(false); }, onKeyDown: e => {
            if (!open || e.nativeEvent.isComposing)
                return;
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                close();
            }
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
                return;
            const buttons = Array.from(e.currentTarget.querySelectorAll('.dtr-option:not(:disabled)'));
            if (!buttons.length)
                return;
            e.preventDefault();
            const index = buttons.indexOf(e.target);
            buttons[e.key === 'ArrowDown' ? Math.min(index + 1, buttons.length - 1) : index < 0 ? buttons.length - 1 : Math.max(index - 1, 0)]?.focus();
        }, children: [_jsx("label", { htmlFor: field.id, children: t('model') }), _jsxs("button", { ...field, ref: node => { trigger.current = node; field.ref(node); }, type: "button", className: "dtr-trigger", title: label, "aria-label": `${t('model')}: ${label}`, "aria-expanded": open, "aria-controls": open ? `${field.id}-menu` : undefined, onClick: e => { const rect = e.currentTarget.getBoundingClientRect(); setUp(rect.top > window.innerHeight - rect.bottom && window.innerHeight - rect.bottom < Math.min(480, window.innerHeight * .52)); setQuery(''); setOpen(!open); }, children: [_jsx("span", { children: label }), _jsx("span", { "aria-hidden": "true", children: "\u25BE" })] }), open && _jsxs("div", { className: `dtr-menu${up ? ' dtr-menu-up' : ''}`, id: `${field.id}-menu`, children: [_jsx("input", { autoFocus: true, type: "search", "aria-label": t('searchModels'), placeholder: t('searchModels'), value: query, onChange: e => setQuery(e.target.value) }), _jsxs("div", { className: "dtr-options", children: [!filter && option(t('inherit'), !selected, () => choose(), 'inherit'), groups.map(group => _jsxs("div", { role: "group", "aria-label": group.name, children: [_jsx("div", { className: "dtr-group-name", children: group.name }), group.models.map(model => option(model.name, selected?.provider === group.id && selected.id === model.id, () => choose({ provider: group.id, id: model.id }), model.id, catalog?.failures.some(f => f.id === group.id)))] }, group.id)), !groups.length && _jsx("p", { className: "dtr-muted", role: "status", children: status ?? t('noModels') })] })] })] });
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
        return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && Array.isArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
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
        const [retry, setRetry] = React.useState(0);
        const [overwrite, setOverwrite] = React.useState(false);
        const [preview, setPreview] = React.useState();
        const [previewError, setPreviewError] = React.useState();
        const [focus, setFocus] = React.useState();
        const fields = React.useRef(new Map());
        const issueSummary = React.useRef(null);
        const instance = React.useId();
        const locale = t('language') === 'zh' ? 'zh' : 'en';
        const draft = state.draft;
        const grantPlan = draft && planModelGrant(requiredModelRoutes(draft), grantSnapshot);
        const needsGrant = grantPlan && grantPlan.kind !== 'complete';
        const grantProblem = grantPlan?.kind === 'unavailable' ? grantPlan.reason : grantPlan?.kind === 'readOnly' ? 'readOnly' : undefined;
        const navigation = grantProblem ? client.get('pluginNavigation') : undefined;
        const hostDisabled = state.saving || host.status !== 'ready' || !host.writable;
        const disabled = hostDisabled || preview !== undefined;
        const catalogReady = catalog !== undefined && !catalogBusy && catalogError === undefined;
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
                ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated'].map(event => client.remote.$on(event, () => { void refresh(); })),
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
            if (field && !field.matches(':disabled')) {
                const details = field.closest('details');
                if (details)
                    details.open = true;
                field.focus();
            }
            else {
                issueSummary.current?.focus();
            }
            setFocus(undefined);
        }, [focus, state.issue, draft]);
        const fieldKey = (section, field) => `${section}:${field}`;
        const fieldProps = (section, field) => {
            const key = fieldKey(section, field);
            const invalid = state.issue?.section === section && state.issue.field === field;
            return {
                id: `dtr-${instance}-${section}-${field}`,
                ref: (node) => {
                    if (node)
                        fields.current.set(key, node);
                    else
                        fields.current.delete(key);
                },
                'aria-invalid': invalid || undefined,
                'aria-describedby': invalid ? `dtr-${instance}-issue` : undefined,
            };
        };
        const targetLabel = (target) => {
            const executor = target.executor === 'native' ? t('native') : target.executor;
            if (target.model.mode === 'inherit')
                return `${executor} · ${t('inherit')}`;
            if (target.model.mode === 'executor-default')
                return `${executor} · ${t('executorDefault')}`;
            const model = target.model;
            return `${executor} · ${'provider' in model ? `${model.provider} / ` : ''}${model.id}${model.reasoningEffort ? ` · ${model.reasoningEffort}` : ''}`;
        };
        const bindingLabel = (binding) => binding.mode === 'default' ? t('useDefault') : targetLabel(binding.target);
        const updateTarget = (section, target) => {
            if (!draft)
                return;
            editor.edit(section === 'default' ? { ...draft, defaultTarget: target }
                : { ...draft, categories: { ...draft.categories, [section]: { mode: 'target', target } } }, state.revision);
        };
        const targetFields = (section, target) => {
            const explicit = target.executor === 'native' && target.model.mode === 'explicit' ? target.model : undefined;
            const group = explicit ? catalog?.groups.find(group => group.id === explicit.provider) : undefined;
            const model = explicit ? group?.models.find(model => model.id === explicit.id) : undefined;
            const efforts = model?.reasoning?.efforts ?? [];
            return _jsxs(_Fragment, { children: [_jsxs("label", { className: "dtr-field", children: [t('executor'), _jsxs("select", { ...fieldProps(section, 'executor'), value: target.executor, onChange: () => updateTarget(section, { executor: 'native', model: { mode: 'inherit' } }), children: [_jsx("option", { value: "native", children: t('native') }), _jsx("option", { value: "codex", disabled: true, children: "Codex \u00B7 P0" }), _jsx("option", { value: "agy", disabled: true, children: "Antigravity (agy) \u00B7 P0" }), _jsx("option", { value: "cursor", disabled: true, children: "Cursor \u00B7 P0" })] })] }), target.executor === 'native' && _jsx(ModelPicker, { t: t, catalog: catalog, status: catalogBusy ? t('catalogLoading') : catalogError === undefined ? undefined : t('catalogError', { message: catalogError }), selected: explicit, field: fieldProps(section, state.issue?.section === section && state.issue.field === 'provider' ? 'provider' : 'model'), label: !explicit ? t('inherit') : !explicit.id ? t('chooseModel') : model && !catalog?.failures.some(f => f.id === explicit.provider)
                            ? `${group.name} / ${model.name}` : catalogReady ? t('unavailableOption', { name: `${explicit.provider} / ${explicit.id}` }) : `${explicit.provider} / ${explicit.id}`, onSelect: choice => editor.setNativeModelMode(section, choice ? 'explicit' : 'inherit', state.revision, choice) }), explicit && _jsx(_Fragment, { children: (efforts.length > 0 || explicit.reasoningEffort !== undefined) && _jsxs("label", { className: "dtr-field", children: [t('effort'), _jsxs("select", { ...fieldProps(section, 'effort'), value: explicit.reasoningEffort ?? '', disabled: !catalogReady || !model, onChange: event => updateTarget(section, { executor: 'native', model: { mode: 'explicit', provider: explicit.provider, id: explicit.id, ...(event.target.value ? { reasoningEffort: event.target.value } : {}) } }), children: [_jsx("option", { value: "", children: t('modelDefault') }), explicit.reasoningEffort && !efforts.some(effort => effort.id === explicit.reasoningEffort) && _jsx("option", { value: explicit.reasoningEffort, children: t('unavailableOption', { name: explicit.reasoningEffort }) }), efforts.map(effort => _jsx("option", { value: effort.id, children: effort.name }, effort.id))] })] }) })] });
        };
        const routeRow = (section, name, purpose) => {
            if (!draft)
                return null;
            const binding = section === 'default' ? undefined : draft.categories[section];
            const inherited = binding?.mode === 'default';
            const target = binding?.mode === 'target' ? binding.target : draft.defaultTarget;
            const titleId = `dtr-${instance}-${section}-title`;
            const summary = _jsx("p", { className: "dtr-target-summary", children: t(state.dirty ? 'draftTarget' : 'configured', { target: targetLabel(target) }) });
            return _jsxs("tr", { children: [_jsxs("th", { scope: "row", children: [_jsx("strong", { id: titleId, children: name }), section !== 'default' && _jsx("code", { children: section }), _jsx("span", { className: "dtr-purpose", children: purpose })] }), _jsx("td", { children: _jsxs("div", { role: "group", "aria-labelledby": titleId, children: [_jsxs("div", { className: "dtr-controls", children: [section !== 'default' && binding && _jsxs("label", { className: "dtr-field", children: [t('binding'), _jsxs("select", { value: binding.mode, onChange: event => editor.setCategoryMode(section, event.target.value, state.revision), children: [_jsx("option", { value: "default", children: t('useDefault') }), _jsx("option", { value: "target", children: t('custom') })] })] }), inherited ? summary : targetFields(section, target)] }), !inherited && summary, !inherited && target.executor !== 'native' && _jsx("p", { className: "dtr-warning dtr-message", children: t('externalBlocked') })] }) })] }, section);
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
                setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision: state.revision });
                setPreviewError(undefined);
            }
            catch (error) {
                setPreviewError(error instanceof Error ? error.message : String(error));
            }
        };
        const issueMessage = (issue) => issue.detail ?? t(issue.reason);
        return _jsxs("div", { className: "dtr-editor", "aria-busy": state.saving, children: [_jsx("style", { children: CSS }), _jsx("h2", { children: t('title') }), _jsx("p", { className: "dtr-muted", children: t('description') }), _jsx("p", { className: "dtr-muted", children: t('switchingHint') }), host.status === 'loading' && _jsx("p", { role: "status", children: t('loading') }), host.status === 'unavailable' && _jsx("p", { role: "status", children: t('unavailable') }), host.status === 'ready' && !host.writable && _jsx("p", { className: "dtr-warning", role: "status", children: t('readOnly') }), _jsxs("div", { className: "dtr-inline", children: [catalogBusy && _jsx("span", { className: "dtr-muted", role: "status", children: t('catalogLoading') }), _jsx("button", { type: "button", onClick: () => setRetry(value => value + 1), disabled: catalogBusy, children: t('retry') })] }), catalogError && _jsx("p", { className: "dtr-error dtr-message", role: "alert", children: t('catalogError', { message: catalogError }) }), catalog && catalog.failures.length > 0 && _jsx("p", { className: "dtr-warning dtr-message", role: "status", children: t('catalogPartial', { message: catalog.failures.map(entry => `${entry.name}: ${entry.message}`).join('; ') }) }), draft && _jsxs(_Fragment, { children: [state.migrationRequired && _jsxs("section", { className: "dtr-note", "aria-labelledby": `dtr-${instance}-migration`, children: [_jsx("h3", { id: `dtr-${instance}-migration`, children: t('migrationTitle') }), _jsx("p", { className: "dtr-muted", children: t('migrationHint') }), _jsx("p", { children: t('migrationCounts', { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 }) }), state.migrationConfirmed ? _jsx("p", { role: "status", children: t('migrationConfirmed') }) : _jsx("button", { type: "button", disabled: disabled || state.stale, onClick: () => editor.confirmMigration(state.revision), children: t('confirmMigration') })] }), _jsxs("fieldset", { disabled: disabled, children: [_jsxs("section", { className: "dtr-section", children: [_jsx("h3", { id: `dtr-${instance}-presets`, children: t('categories') }), _jsx("p", { className: "dtr-muted", children: t('recommendationHint', { version: RECOMMENDATION_VERSION }) }), _jsxs("label", { className: "dtr-inline dtr-muted", children: [_jsx("input", { type: "checkbox", checked: overwrite, onChange: event => setOverwrite(event.target.checked) }), t('overwrite')] }), _jsx("button", { type: "button", disabled: !catalogReady || state.stale, onClick: makePreview, children: t('recommendations') }), _jsxs("table", { className: "dtr-table", "aria-labelledby": `dtr-${instance}-presets`, children: [_jsxs("colgroup", { children: [_jsx("col", { className: "dtr-category-col" }), _jsx("col", {})] }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: t('categoryColumn') }), _jsx("th", { scope: "col", children: t('targetColumn') })] }) }), _jsxs("tbody", { children: [routeRow('default', t('defaults'), t('defaultPurpose')), CATEGORY_LIST.map(entry => routeRow(entry.id, entry[locale].name, entry[locale].purpose))] })] })] }), _jsxs("details", { className: "dtr-section", children: [_jsx("summary", { children: t('advanced') }), _jsxs("p", { className: "dtr-warning dtr-message", children: ["Codex / Antigravity (agy) / Cursor: ", t('externalBlocked')] }), _jsxs("label", { className: "dtr-field", children: [t('historyLimit'), _jsx("input", { ...fieldProps('default', 'historyLimit'), type: "number", min: 1, max: 1000, step: 1, value: draft.historyLimit, onChange: event => editor.edit({ ...draft, historyLimit: event.target.value }, state.revision) })] })] })] }), preview && _jsxs("section", { className: "dtr-note dtr-preview", role: "group", "aria-labelledby": `dtr-${instance}-preview-title`, children: [_jsx("h3", { id: `dtr-${instance}-preview-title`, children: t('previewTitle') }), _jsx("p", { className: "dtr-muted", children: t('previewHint') }), _jsx("ul", { children: preview.value.changes.map(change => _jsxs("li", { children: [_jsxs("strong", { children: [CATEGORY_LIST.find(entry => entry.id === change.category)?.[locale].name, " \u00B7 ", change.category] }), _jsx("br", {}), bindingLabel(change.before), " \u2192 ", targetLabel(change.after.target)] }, change.category)) }), preview.value.changes.length === 0 && _jsx("p", { children: t('noChanges') }), (preview.revision !== host.revision || preview.revision !== state.revision) && _jsx("p", { className: "dtr-warning dtr-message", role: "status", children: t('previewChanged') }), _jsxs("p", { className: "dtr-muted", children: [t('preserved', { count: preview.value.preserved.length }), " \u00B7 ", t('unmatched', { count: preview.value.unavailable.length })] }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", autoFocus: true, onClick: () => setPreview(undefined), children: t('cancelPreview') }), _jsx("button", { type: "button", disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || preview.revision !== state.revision || host.revision !== preview.revision, onClick: () => { if (editor.applyRecommendations(preview.value, preview.revision))
                                                setPreview(undefined); }, children: t('applyPreview') })] })] })] }), _jsxs("div", { className: "dtr-footer", "aria-live": "polite", children: [state.stale && _jsx("p", { className: "dtr-warning dtr-message", children: t('stale') }), state.issue && _jsxs("p", { ref: issueSummary, tabIndex: -1, id: `dtr-${instance}-issue`, role: "alert", className: "dtr-error dtr-message", children: [state.issue.section === 'default' ? t('defaults') : CATEGORIES[state.issue.section][locale].name, " \u00B7 ", t(state.issue.field), ": ", issueMessage(state.issue)] }), previewError && _jsx("p", { role: "alert", className: "dtr-error dtr-message", children: t('validationError', { message: previewError }) }), grantProblem && _jsx(GrantDiagnostics, { problem: grantProblem, locale: locale, inventory: inventory, recheck: recheck, dirty: state.dirty, openBundle: navigation && (name => navigation.openBundle(name)) }, grantProblem), state.error && state.error.kind !== 'grantUnavailable' && state.error.kind !== 'grantReadOnly' && _jsx("p", { role: "alert", className: "dtr-error dtr-message", children: state.error.kind === 'grantFailed' ? t('grantFailed') : state.error.kind === 'refused' ? t('refused') : state.error.kind === 'migration' ? t('migrationRequired') : state.error.kind === 'previewChanged' ? t('previewChanged') : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail }) }), state.notice === 'saved' && !needsGrant && _jsx("p", { className: "dtr-success dtr-message", children: t('saved') }), _jsxs("div", { className: "dtr-actions", children: [_jsx("span", { className: "dtr-muted", children: state.dirty ? t('dirty') : needsGrant ? '' : t('current') }), _jsxs("div", { className: "dtr-inline", children: [_jsx("button", { type: "button", disabled: state.saving || preview !== undefined || (!state.dirty && !state.stale), onClick: () => { setPreviewError(undefined); editor.discard(); }, children: t(state.stale ? 'reload' : 'cancel') }), _jsx("button", { type: "button", className: "dtr-primary", disabled: disabled || !!grantProblem || (!state.dirty && !needsGrant) || state.stale, onClick: save, children: t(state.saving ? 'saving' : 'save') })] })] })] })] });
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
//# sourceMappingURL=client.js.map