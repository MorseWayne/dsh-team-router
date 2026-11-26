import * as React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { CATEGORIES, CATEGORY_LIST } from '../core/categories.ts';
import type { CategoryLocale } from '../core/categories.ts';
import { MODEL_AUTHORIZATION_ENTRY, requiredModelRoutes, planModelGrant } from './model-grants.ts';
import { GrantDiagnostics } from './GrantDiagnostics.tsx';
import type { InventoryReader } from './grant-diagnostics.ts';
import type { ModelAuthorizationForm } from './model-grants.ts';
import { RoutingEditor, routingDraftToPolicy } from './routing-editor.ts';
import type { RoutingForm, RoutingSection, RoutingField, RoutingValidationIssue } from './routing-editor.ts';
import { previewRecommendations, RECOMMENDATION_VERSION } from '../core/recommendations.ts';
import type { ModelCatalog, RecommendationPreview } from '../core/recommendations.ts';
import type { CategoryBinding, Target } from '../core/routing-policy.ts';

const NS = 'teamRouter';
const en = {
  language: 'en', title: 'Team task routing',
  description: 'Seven built-in task categories. Choose an executor and model for each; changes affect new delegations only, never a running task.',
  grantUnavailable: 'Cannot read DSH model authorization settings. No changes were made; check the Host and retry.',
  grantReadOnly: 'DSH model authorization is read-only. No changes were made.',
  grantFailed: 'Routing policy is saved, but model authorization could not be confirmed. Retry Save.' ,
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
type Key = keyof typeof en;
const zh: Record<Key, string> = {
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
type Translate = (key: Key, params?: Record<string, string | number>) => string;
interface ClientServices {
  locale: { register(ns: string, dictionaries: { en: typeof en; zh: typeof zh }): () => void; bind(ns: string): Translate };
  configForms: { get(entry: typeof MODEL_AUTHORIZATION_ENTRY): ModelAuthorizationForm; get(entry: 'team-router'): RoutingForm; whileServed(namespaces: string[], register: () => () => void): () => void };
  slots: { inject(key: string, register: () => () => void): () => void; register(options: Record<string, unknown>, component: (props: { t: Translate }) => React.ReactNode): () => void };
  get(key: 'pluginNavigation'): {openBundle(name: string): void} | undefined;
  remote: { pluginManager?: InventoryReader; settings?: {describe(): Promise<{ok: true; value: {writable: boolean; namespaces: {ns: string; revision: number; value: unknown}[]}} | {ok: false}>}; session: { modelCatalog(): Promise<{ ok: true; value: ModelCatalog } | { ok: false; error: { message: string } }> }; $on(event: string, listener: () => void): () => void };
  on(event: string, listener: () => void): () => void;
}
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

type ModelChoice = { provider: string; id: string };
type FieldNode = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
function ModelPicker({ t, catalog, status, selected, label, field, onSelect }: {
  t: Translate; catalog: ModelCatalog | undefined; status: string | undefined; selected: ModelChoice | undefined; label: string;
  field: { id: string; ref(node: FieldNode | null): void; 'aria-invalid': boolean | undefined; 'aria-describedby': string | undefined };
  onSelect(choice?: ModelChoice): void;
}): React.ReactNode {
  const [open, setOpen] = React.useState(false);
  const [up, setUp] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const choose = (choice?: ModelChoice) => {
    if (choice?.provider !== selected?.provider || choice?.id !== selected?.id) onSelect(choice);
    close();
  };
  const filter = query.trim().toLowerCase();
  const groups = (open && !status ? catalog?.groups : [])?.map(group => ({ ...group, models: group.models.filter(model =>
    [group.name, group.id, model.name, model.id].some(text => text.toLowerCase().includes(filter))) })).filter(group => group.models.length) ?? [];
  const option = (name: string, active: boolean, pick: () => void, key: string, disabled = false) =>
    <button type="button" key={key} className="dtr-option" aria-pressed={active} disabled={disabled} onClick={pick}>{name}{active && <span aria-hidden="true">✓</span>}</button>;
  return <div className="dtr-field dtr-picker" ref={root} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
    onKeyDown={e => {
      if (!open || e.nativeEvent.isComposing) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.dtr-option:not(:disabled)'));
      if (!buttons.length) return;
      e.preventDefault();
      const index = buttons.indexOf(e.target as HTMLButtonElement);
      buttons[e.key === 'ArrowDown' ? Math.min(index + 1, buttons.length - 1) : index < 0 ? buttons.length - 1 : Math.max(index - 1, 0)]?.focus();
    }}>
    <label htmlFor={field.id}>{t('model')}</label>
    <button {...field} ref={node => { trigger.current = node; field.ref(node); }} type="button" className="dtr-trigger" title={label} aria-label={`${t('model')}: ${label}`} aria-expanded={open} aria-controls={open ? `${field.id}-menu` : undefined}
      onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setUp(rect.top > window.innerHeight - rect.bottom && window.innerHeight - rect.bottom < Math.min(480, window.innerHeight * .52)); setQuery(''); setOpen(!open); }}>
      <span>{label}</span><span aria-hidden="true">▾</span>
    </button>
    {open && <div className={`dtr-menu${up ? ' dtr-menu-up' : ''}`} id={`${field.id}-menu`}>
      <input autoFocus type="search" aria-label={t('searchModels')} placeholder={t('searchModels')} value={query} onChange={e => setQuery(e.target.value)} />
      <div className="dtr-options">
        {!filter && option(t('inherit'), !selected, () => choose(), 'inherit')}
        {groups.map(group => <div key={group.id} role="group" aria-label={group.name}>
          <div className="dtr-group-name">{group.name}</div>
          {group.models.map(model => option(model.name, selected?.provider === group.id && selected.id === model.id,
            () => choose({ provider: group.id, id: model.id }), model.id, catalog?.failures.some(f => f.id === group.id)))}
        </div>)}
        {!groups.length && <p className="dtr-muted" role="status">{status ?? t('noModels')}</p>}
      </div>
    </div>}
  </div>;
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
    const v = row?.value as Partial<NonNullable<ReturnType<typeof grants.getSnapshot>['value']>> | undefined;
    return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === 'boolean' && Array.isArray(v.allowedModels) && reply.value.writable ? 'available' : 'unchanged';
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
    const [retry, setRetry] = React.useState(0);
    const [overwrite, setOverwrite] = React.useState(false);
    const [preview, setPreview] = React.useState<{ value: RecommendationPreview; revision: number | undefined }>();
    const [previewError, setPreviewError] = React.useState<string>();
    const [focus, setFocus] = React.useState<string>();
    const fields = React.useRef(new Map<string, FieldNode>());
    const issueSummary = React.useRef<HTMLParagraphElement>(null);
    const instance = React.useId();
    const locale: CategoryLocale = t('language') === 'zh' ? 'zh' : 'en';
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
        ...['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated'].map(event => client.remote.$on(event, () => { void refresh(); })),
        client.on('connection/reset', () => { void refresh(); }),
      ];
      void refresh();
      return () => { active = false; generation++; for (const stop of stops) stop(); };
    }, [retry]);
    React.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      if (field && !field.matches(':disabled')) {
        const details = field.closest('details');
        if (details) details.open = true;
        field.focus();
      } else {
        issueSummary.current?.focus();
      }
      setFocus(undefined);
    }, [focus, state.issue, draft]);
    const fieldKey = (section: RoutingSection, field: RoutingField): string => `${section}:${field}`;
    const fieldProps = (section: RoutingSection, field: RoutingField) => {
      const key = fieldKey(section, field);
      const invalid = state.issue?.section === section && state.issue.field === field;
      return {
        id: `dtr-${instance}-${section}-${field}`,
        ref: (node: FieldNode | null): void => {
          if (node) fields.current.set(key, node); else fields.current.delete(key);
        },
        'aria-invalid': invalid || undefined,
        'aria-describedby': invalid ? `dtr-${instance}-issue` : undefined,
      };
    };
    const targetLabel = (target: Target): string => {
      const executor = target.executor === 'native' ? t('native') : target.executor;
      if (target.model.mode === 'inherit') return `${executor} · ${t('inherit')}`;
      if (target.model.mode === 'executor-default') return `${executor} · ${t('executorDefault')}`;
      const model = target.model;
      return `${executor} · ${'provider' in model ? `${model.provider} / ` : ''}${model.id}${model.reasoningEffort ? ` · ${model.reasoningEffort}` : ''}`;
    };
    const bindingLabel = (binding: CategoryBinding): string => binding.mode === 'default' ? t('useDefault') : targetLabel(binding.target);
    const updateTarget = (section: RoutingSection, target: Target): void => {
      if (!draft) return;
      editor.edit(section === 'default' ? { ...draft, defaultTarget: target }
        : { ...draft, categories: { ...draft.categories, [section]: { mode: 'target', target } } }, state.revision);
    };
    const targetFields = (section: RoutingSection, target: Target): React.ReactNode => {
      const explicit = target.executor === 'native' && target.model.mode === 'explicit' ? target.model : undefined;
      const group = explicit ? catalog?.groups.find(group => group.id === explicit.provider) : undefined;
      const model = explicit ? group?.models.find(model => model.id === explicit.id) : undefined;
      const efforts = model?.reasoning?.efforts ?? [];
      return <>
          <label className="dtr-field">{t('executor')}<select {...fieldProps(section, 'executor')} value={target.executor} onChange={() => updateTarget(section, { executor: 'native', model: { mode: 'inherit' } })}>
            <option value="native">{t('native')}</option><option value="codex" disabled>Codex · P0</option><option value="agy" disabled>Antigravity (agy) · P0</option><option value="cursor" disabled>Cursor · P0</option>
          </select></label>
          {target.executor === 'native' && <ModelPicker t={t} catalog={catalog} status={catalogBusy ? t('catalogLoading') : catalogError === undefined ? undefined : t('catalogError', { message: catalogError })} selected={explicit}
            field={fieldProps(section, state.issue?.section === section && state.issue.field === 'provider' ? 'provider' : 'model')}
            label={!explicit ? t('inherit') : !explicit.id ? t('chooseModel') : model && !catalog?.failures.some(f => f.id === explicit.provider)
              ? `${group!.name} / ${model.name}` : catalogReady ? t('unavailableOption', { name: `${explicit.provider} / ${explicit.id}` }) : `${explicit.provider} / ${explicit.id}`}
            onSelect={choice => editor.setNativeModelMode(section, choice ? 'explicit' : 'inherit', state.revision, choice)} />}
          {explicit && <>
            {(efforts.length > 0 || explicit.reasoningEffort !== undefined) && <label className="dtr-field">{t('effort')}<select {...fieldProps(section, 'effort')} value={explicit.reasoningEffort ?? ''} disabled={!catalogReady || !model} onChange={event => updateTarget(section, { executor: 'native', model: { mode: 'explicit', provider: explicit.provider, id: explicit.id, ...(event.target.value ? { reasoningEffort: event.target.value } : {}) } })}>
              <option value="">{t('modelDefault')}</option>{explicit.reasoningEffort && !efforts.some(effort => effort.id === explicit.reasoningEffort) && <option value={explicit.reasoningEffort}>{t('unavailableOption', { name: explicit.reasoningEffort })}</option>}
              {efforts.map(effort => <option value={effort.id} key={effort.id}>{effort.name}</option>)}
            </select></label>}
          </>}
      </>;
    };
    const routeRow = (section: RoutingSection, name: string, purpose: string): React.ReactNode => {
      if (!draft) return null;
      const binding = section === 'default' ? undefined : draft.categories[section];
      const inherited = binding?.mode === 'default';
      const target = binding?.mode === 'target' ? binding.target : draft.defaultTarget;
      const titleId = `dtr-${instance}-${section}-title`;
      const summary = <p className="dtr-target-summary">{t(state.dirty ? 'draftTarget' : 'configured', { target: targetLabel(target) })}</p>;
      return <tr key={section}>
        <th scope="row"><strong id={titleId}>{name}</strong>{section !== 'default' && <code>{section}</code>}<span className="dtr-purpose">{purpose}</span></th>
        <td><div role="group" aria-labelledby={titleId}>
          <div className="dtr-controls">
            {section !== 'default' && binding && <label className="dtr-field">{t('binding')}<select value={binding.mode} onChange={event => editor.setCategoryMode(section, event.target.value as 'default' | 'target', state.revision)}>
              <option value="default">{t('useDefault')}</option><option value="target">{t('custom')}</option>
            </select></label>}
            {inherited ? summary : targetFields(section, target)}
          </div>
          {!inherited && summary}
          {!inherited && target.executor !== 'native' && <p className="dtr-warning dtr-message">{t('externalBlocked')}</p>}
        </div></td>
      </tr>;
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
        setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision: state.revision });
        setPreviewError(undefined);
      } catch (error) { setPreviewError(error instanceof Error ? error.message : String(error)); }
    };
    const issueMessage = (issue: RoutingValidationIssue): string => issue.detail ?? t(issue.reason);
    return <div className="dtr-editor" aria-busy={state.saving}>
      <style>{CSS}</style><h2>{t('title')}</h2><p className="dtr-muted">{t('description')}</p><p className="dtr-muted">{t('switchingHint')}</p>
      {host.status === 'loading' && <p role="status">{t('loading')}</p>}
      {host.status === 'unavailable' && <p role="status">{t('unavailable')}</p>}
      {host.status === 'ready' && !host.writable && <p className="dtr-warning" role="status">{t('readOnly')}</p>}
      <div className="dtr-inline">{catalogBusy && <span className="dtr-muted" role="status">{t('catalogLoading')}</span>}<button type="button" onClick={() => setRetry(value => value + 1)} disabled={catalogBusy}>{t('retry')}</button></div>
      {catalogError && <p className="dtr-error dtr-message" role="alert">{t('catalogError', { message: catalogError })}</p>}
      {catalog && catalog.failures.length > 0 && <p className="dtr-warning dtr-message" role="status">{t('catalogPartial', { message: catalog.failures.map(entry => `${entry.name}: ${entry.message}`).join('; ') })}</p>}
      {draft && <>
        {state.migrationRequired && <section className="dtr-note" aria-labelledby={`dtr-${instance}-migration`}>
          <h3 id={`dtr-${instance}-migration`}>{t('migrationTitle')}</h3><p className="dtr-muted">{t('migrationHint')}</p>
          <p>{t('migrationCounts', { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 })}</p>
          {state.migrationConfirmed ? <p role="status">{t('migrationConfirmed')}</p> : <button type="button" disabled={disabled || state.stale} onClick={() => editor.confirmMigration(state.revision)}>{t('confirmMigration')}</button>}
        </section>}
        <fieldset disabled={disabled}>
          <section className="dtr-section"><h3 id={`dtr-${instance}-presets`}>{t('categories')}</h3><p className="dtr-muted">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</p>
            <label className="dtr-inline dtr-muted"><input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.target.checked)} />{t('overwrite')}</label>
            <button type="button" disabled={!catalogReady || state.stale} onClick={makePreview}>{t('recommendations')}</button>
            <table className="dtr-table" aria-labelledby={`dtr-${instance}-presets`}>
              <colgroup><col className="dtr-category-col" /><col /></colgroup>
              <thead><tr><th scope="col">{t('categoryColumn')}</th><th scope="col">{t('targetColumn')}</th></tr></thead>
              <tbody>
                {routeRow('default', t('defaults'), t('defaultPurpose'))}
                {CATEGORY_LIST.map(entry => routeRow(entry.id, entry[locale].name, entry[locale].purpose))}
              </tbody>
            </table>
          </section>
          <details className="dtr-section"><summary>{t('advanced')}</summary><p className="dtr-warning dtr-message">Codex / Antigravity (agy) / Cursor: {t('externalBlocked')}</p>
            <label className="dtr-field">{t('historyLimit')}<input {...fieldProps('default', 'historyLimit')} type="number" min={1} max={1000} step={1} value={draft.historyLimit} onChange={event => editor.edit({ ...draft, historyLimit: event.target.value }, state.revision)} /></label>
          </details>
        </fieldset>
        {preview && <section className="dtr-note dtr-preview" role="group" aria-labelledby={`dtr-${instance}-preview-title`}>
          <h3 id={`dtr-${instance}-preview-title`}>{t('previewTitle')}</h3><p className="dtr-muted">{t('previewHint')}</p>
          <ul>{preview.value.changes.map(change => <li key={change.category}><strong>{CATEGORY_LIST.find(entry => entry.id === change.category)?.[locale].name} · {change.category}</strong><br />{bindingLabel(change.before)} → {targetLabel(change.after.target)}</li>)}</ul>
          {preview.value.changes.length === 0 && <p>{t('noChanges')}</p>}
          {(preview.revision !== host.revision || preview.revision !== state.revision) && <p className="dtr-warning dtr-message" role="status">{t('previewChanged')}</p>}
          <p className="dtr-muted">{t('preserved', { count: preview.value.preserved.length })} · {t('unmatched', { count: preview.value.unavailable.length })}</p>
          <div className="dtr-inline"><button type="button" autoFocus onClick={() => setPreview(undefined)}>{t('cancelPreview')}</button><button type="button" disabled={hostDisabled || state.stale || preview.value.changes.length === 0 || preview.revision !== state.revision || host.revision !== preview.revision} onClick={() => { if (editor.applyRecommendations(preview.value, preview.revision)) setPreview(undefined); }}>{t('applyPreview')}</button></div>
        </section>}
      </>}
      <div className="dtr-footer" aria-live="polite">
        {state.stale && <p className="dtr-warning dtr-message">{t('stale')}</p>}
        {state.issue && <p ref={issueSummary} tabIndex={-1} id={`dtr-${instance}-issue`} role="alert" className="dtr-error dtr-message">{state.issue.section === 'default' ? t('defaults') : CATEGORIES[state.issue.section][locale].name} · {t(state.issue.field)}: {issueMessage(state.issue)}</p>}
        {previewError && <p role="alert" className="dtr-error dtr-message">{t('validationError', { message: previewError })}</p>}
        {grantProblem && <GrantDiagnostics key={grantProblem} problem={grantProblem} locale={locale} inventory={inventory} recheck={recheck} dirty={state.dirty}
          openBundle={navigation && (name => navigation.openBundle(name))} />}
        {state.error && state.error.kind !== 'grantUnavailable' && state.error.kind !== 'grantReadOnly' && <p role="alert" className="dtr-error dtr-message">{state.error.kind === 'grantFailed' ? t('grantFailed') : state.error.kind === 'refused' ? t('refused') : state.error.kind === 'migration' ? t('migrationRequired') : state.error.kind === 'previewChanged' ? t('previewChanged') : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail })}</p>}
        {state.notice === 'saved' && !needsGrant && <p className="dtr-success dtr-message">{t('saved')}</p>}
        <div className="dtr-actions"><span className="dtr-muted">{state.dirty ? t('dirty') : needsGrant ? '' : t('current')}</span><div className="dtr-inline">
          <button type="button" disabled={state.saving || preview !== undefined || (!state.dirty && !state.stale)} onClick={() => { setPreviewError(undefined); editor.discard(); }}>{t(state.stale ? 'reload' : 'cancel')}</button>
          <button type="button" className="dtr-primary" disabled={disabled || !!grantProblem || (!state.dirty && !needsGrant) || state.stale} onClick={save}>{t(state.saving ? 'saving' : 'save')}</button>
        </div></div>
      </div>
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
