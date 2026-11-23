import * as React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { CATEGORY_LIST } from './categories.ts';
import type { CategoryLocale } from './categories.ts';
import { RoutingEditor, routingDraftToPolicy } from './routing-editor.ts';
import type { RoutingForm, RoutingSection, RoutingField, RoutingValidationIssue } from './routing-editor.ts';
import { previewRecommendations, RECOMMENDATION_VERSION } from './recommendations.ts';
import type { ModelCatalog, RecommendationPreview } from './recommendations.ts';
import type { CategoryBinding, Target } from './routing-policy.ts';

const NS = 'teamRouter';
const en = {
  language: 'en', title: 'Team task routing',
  description: 'Seven built-in task categories. Choose an executor and model for each; changes affect new delegations only, never a running task.',
  authorization: 'The model catalog is not authorization. Each delegation checks the current session policy and live capabilities again.',
  defaults: 'Default execution target', categories: 'Task presets', binding: 'Category target', useDefault: 'Use the default target', custom: 'Choose a target',
  switchingHint: 'Default/inherited modes deactivate explicit selections. Switching back restores them within this edit session; saving or reloading keeps only the selected mode.',
  executor: 'Executor', native: 'DSH native teammate', externalBlocked: 'P0 integration is not verified. External execution is unavailable; existing values are preserved, not proof of installation or authentication.',
  modelMode: 'Model selection', inherit: 'Inherit the session model', explicit: 'Choose a model', executorDefault: 'Use the external agent’s default',
  provider: 'Provider', model: 'Model', effort: 'Reasoning effort', modelDefault: 'Model default', chooseProvider: 'Choose a provider', chooseModel: 'Choose a model',
  unavailableOption: '{name} (not available in this catalog)', configured: 'Configured target: {target}',
  loading: 'Loading Host configuration…', unavailable: 'The team-router configuration is not served by this Host.', readOnly: 'This Host configuration is read-only.',
  catalogLoading: 'Loading the live model catalog…', catalogError: 'Could not load the catalog: {message}', catalogPartial: 'Some providers failed: {message}', retry: 'Retry catalog',
  recommendations: 'Preview recommendations', recommendationHint: 'Version {version}. Curated exact model IDs, not benchmark rankings. Missing candidates keep their current/default target. This does not grant session authorization.',
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
  save: 'Save policy', saving: 'Saving…', cancel: 'Cancel edits', reload: 'Discard draft and reload Host values',
  saved: 'Policy saved. New delegations will use these settings.', dirty: 'Unsaved changes', current: 'Up to date',
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
  authorization: '模型目录不等于授权。执行委派时仍会重新校验当前会话的模型权限与实际能力。',
  defaults: '默认执行目标', categories: '任务预设', binding: '类别目标', useDefault: '使用默认执行目标', custom: '单独选择目标',
  switchingHint: '切换到默认/继承会停用自选值；本次编辑中切回可恢复。保存或重新读取后仅保留所选模式。',
  executor: '执行器', native: 'DSH 原生队友', externalBlocked: 'P0 接入验证尚未通过，外部执行暂不可用。已保存的值会保留；此状态不代表 CLI 未安装或未认证。',
  modelMode: '模型选择', inherit: '继承会话模型', explicit: '指定模型', executorDefault: '使用外部 Agent 自身默认模型',
  provider: '供应商', model: '模型', effort: '推理强度', modelDefault: '模型默认', chooseProvider: '选择供应商', chooseModel: '选择模型',
  unavailableOption: '{name}（当前目录不可用）', configured: '配置目标：{target}',
  loading: '正在读取 Host 配置…', unavailable: '当前 Host 未提供 team-router 配置项。', readOnly: '当前 Host 配置为只读。',
  catalogLoading: '正在读取实时模型目录…', catalogError: '无法读取模型目录：{message}', catalogPartial: '部分供应商读取失败：{message}', retry: '重试读取目录',
  recommendations: '预览推荐配置', recommendationHint: '推荐版本 {version}。使用人工维护的精确模型标识，不代表基准最优；无匹配项保留当前/默认目标，不扩大会话授权。',
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
  save: '保存策略', saving: '保存中…', cancel: '取消修改', reload: '丢弃草稿并重新读取 Host 配置',
  saved: '策略已保存，将用于后续新委派。', dirty: '有未保存的修改', current: '已同步',
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
  configForms: { get(entry: string): RoutingForm; whileServed(namespaces: string[], register: () => () => void): () => void };
  slots: { inject(key: string, register: () => () => void): () => void; register(options: Record<string, unknown>, component: (props: { t: Translate }) => React.ReactNode): () => void };
  remote: { session: { modelCatalog(): Promise<{ ok: true; value: ModelCatalog } | { ok: false; error: { message: string } }> }; $on(event: string, listener: () => void): () => void };
  on(event: string, listener: () => void): () => void;
}
const CSS = `
.dtr-editor{color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;max-width:900px;min-width:0;margin:0 auto;padding:4px 0 24px}
.dtr-editor *{box-sizing:border-box}.dtr-editor h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}.dtr-editor h3{font-size:15px;margin:0;font-weight:600}
.dtr-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:4px 0 12px}.dtr-note{padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;margin:12px 0;background:var(--dsw-alias-bg-layer-1)}
.dtr-section{border-top:1px solid var(--dsw-alias-border-l3);padding-top:20px;margin-top:22px}.dtr-actions,.dtr-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dtr-actions{justify-content:space-between}
.dtr-card{border:1px solid var(--dsw-alias-border-l3);border-radius:12px;padding:14px;margin-top:12px;background:var(--dsw-alias-bg-layer-1)}.dtr-card code{font-size:12px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dtr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dtr-field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}.dtr-wide{grid-column:1/-1}
.dtr-editor input,.dtr-editor select{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;min-width:0;width:100%}.dtr-editor input[type=checkbox]{width:auto}
.dtr-editor button{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:7px 12px;cursor:pointer}.dtr-editor button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dtr-editor :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dtr-editor :disabled{opacity:.5;cursor:not-allowed}
.dtr-editor button.dtr-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.dtr-error{color:var(--dsw-alias-state-error-primary)}.dtr-warning{color:var(--dsw-alias-label-secondary);border-inline-start:3px solid var(--dsw-alias-state-warn-primary);padding-inline-start:10px}.dtr-success{border-inline-start:3px solid var(--dsw-alias-state-success-primary);padding-inline-start:10px}.dtr-message{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}
.dtr-editor [aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.dtr-footer{border-top:1px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:16px}.dtr-editor fieldset{border:0;margin:0;padding:0;min-width:0}.dtr-editor summary{cursor:pointer}.dtr-preview li{margin:8px 0;overflow-wrap:anywhere}
@media(max-width:620px){.dtr-grid{grid-template-columns:minmax(0,1fr)}.dtr-editor{padding-bottom:16px}.dtr-card{padding:12px}}
`;

export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session'];
export function apply(ctx: Context): void {
  const client = ctx as unknown as ClientServices;
  ctx.effect(() => client.locale.register(NS, { en, zh }), 'team-router: editor dictionaries');
  const form = client.configForms.get('team-router');
  const editor = new RoutingEditor(form);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener: () => void) => form.subscribe(listener);
  ctx.effect(() => () => editor.dispose(), 'team-router: staged routing editor');

  function Editor({ t }: { t: Translate }): React.ReactNode {
    const host = React.useSyncExternalStore(subscribeForm, readForm);
    const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React.useState<ModelCatalog>();
    const [catalogBusy, setCatalogBusy] = React.useState(true);
    const [catalogError, setCatalogError] = React.useState<string>();
    const [retry, setRetry] = React.useState(0);
    const [overwrite, setOverwrite] = React.useState(false);
    const [preview, setPreview] = React.useState<{ value: RecommendationPreview; revision: number | undefined }>();
    const [previewError, setPreviewError] = React.useState<string>();
    const [focus, setFocus] = React.useState<string>();
    const fields = React.useRef(new Map<string, HTMLInputElement | HTMLSelectElement>());
    const instance = React.useId();
    const locale: CategoryLocale = t('language') === 'zh' ? 'zh' : 'en';
    const draft = state.draft;
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
      if (field) {
        const details = field.closest('details');
        if (details) details.open = true;
        field.focus(); setFocus(undefined);
      }
    }, [focus, state.issue, draft]);
    const fieldKey = (section: RoutingSection, field: RoutingField): string => `${section}:${field}`;
    const fieldProps = (section: RoutingSection, field: RoutingField) => {
      const key = fieldKey(section, field);
      const invalid = state.issue?.section === section && state.issue.field === field;
      return {
        id: `dtr-${instance}-${section}-${field}`,
        ref: (node: HTMLInputElement | HTMLSelectElement | null): void => {
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
        <div className="dtr-grid">
          <label className="dtr-field">{t('executor')}<select {...fieldProps(section, 'executor')} value={target.executor} onChange={() => updateTarget(section, { executor: 'native', model: { mode: 'inherit' } })}>
            <option value="native">{t('native')}</option><option value="codex" disabled>Codex · P0</option><option value="agy" disabled>Antigravity (agy) · P0</option><option value="cursor" disabled>Cursor · P0</option>
          </select></label>
          {target.executor === 'native' && <label className="dtr-field">{t('modelMode')}<select value={target.model.mode} onChange={event => editor.setNativeModelMode(section, event.target.value as 'inherit' | 'explicit', state.revision)}>
            <option value="inherit">{t('inherit')}</option><option value="explicit">{t('explicit')}</option>
          </select></label>}
          {explicit && <>
            <label className="dtr-field">{t('provider')}<select {...fieldProps(section, 'provider')} value={explicit.provider} disabled={!catalogReady} onChange={event => updateTarget(section, { executor: 'native', model: { mode: 'explicit', provider: event.target.value, id: '' } })}>
              <option value="">{t('chooseProvider')}</option>{explicit.provider && !group && <option value={explicit.provider}>{t('unavailableOption', { name: explicit.provider })}</option>}
              {catalog?.groups.map(group => <option value={group.id} key={group.id} disabled={catalog.failures.some(failure => failure.id === group.id)}>{group.name}</option>)}
            </select></label>
            <label className="dtr-field">{t('model')}<select {...fieldProps(section, 'model')} value={explicit.id} disabled={!catalogReady || !group || catalog?.failures.some(failure => failure.id === group.id)} onChange={event => updateTarget(section, { executor: 'native', model: { mode: 'explicit', provider: explicit.provider, id: event.target.value } })}>
              <option value="">{t('chooseModel')}</option>{explicit.id && !model && <option value={explicit.id}>{t('unavailableOption', { name: explicit.id })}</option>}
              {group?.models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select></label>
            {(efforts.length > 0 || explicit.reasoningEffort !== undefined) && <label className="dtr-field dtr-wide">{t('effort')}<select {...fieldProps(section, 'effort')} value={explicit.reasoningEffort ?? ''} disabled={!catalogReady || !model} onChange={event => updateTarget(section, { executor: 'native', model: { mode: 'explicit', provider: explicit.provider, id: explicit.id, ...(event.target.value ? { reasoningEffort: event.target.value } : {}) } })}>
              <option value="">{t('modelDefault')}</option>{explicit.reasoningEffort && !efforts.some(effort => effort.id === explicit.reasoningEffort) && <option value={explicit.reasoningEffort}>{t('unavailableOption', { name: explicit.reasoningEffort })}</option>}
              {efforts.map(effort => <option value={effort.id} key={effort.id}>{effort.name}</option>)}
            </select></label>}
          </>}
        </div>
        {target.executor !== 'native' && <p className="dtr-warning dtr-message">{t('externalBlocked')}</p>}
        <p className="dtr-muted">{t('configured', { target: targetLabel(target) })}</p>
      </>;
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
      <style>{CSS}</style><h2>{t('title')}</h2><p className="dtr-muted">{t('description')}</p><p className="dtr-note dtr-muted">{t('authorization')}</p><p className="dtr-muted">{t('switchingHint')}</p>
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
          <section className="dtr-section"><h3>{t('defaults')}</h3><div className="dtr-card">{targetFields('default', draft.defaultTarget)}</div></section>
          <section className="dtr-section"><h3>{t('categories')}</h3><p className="dtr-muted">{t('recommendationHint', { version: RECOMMENDATION_VERSION })}</p>
            <label className="dtr-inline dtr-muted"><input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.target.checked)} />{t('overwrite')}</label>
            <button type="button" disabled={!catalogReady || state.stale} onClick={makePreview}>{t('recommendations')}</button>
            {CATEGORY_LIST.map(entry => {
              const binding = draft.categories[entry.id];
              return <section className="dtr-card" key={entry.id} aria-labelledby={`dtr-${instance}-${entry.id}-title`}>
                <h3 id={`dtr-${instance}-${entry.id}-title`}>{entry[locale].name}</h3><code>{entry.id}</code><p className="dtr-muted">{entry[locale].purpose}</p>
                <label className="dtr-field">{t('binding')}<select value={binding.mode} onChange={event => editor.setCategoryMode(entry.id, event.target.value as 'default' | 'target', state.revision)}>
                  <option value="default">{t('useDefault')}</option><option value="target">{t('custom')}</option>
                </select></label>
                {binding.mode === 'target' ? targetFields(entry.id, binding.target) : <p className="dtr-muted">{t('configured', { target: targetLabel(draft.defaultTarget) })}</p>}
              </section>;
            })}
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
        {state.issue && <p id={`dtr-${instance}-issue`} role="alert" className="dtr-error dtr-message">{issueMessage(state.issue)}</p>}
        {previewError && <p role="alert" className="dtr-error dtr-message">{t('validationError', { message: previewError })}</p>}
        {state.error && <p role="alert" className="dtr-error dtr-message">{state.error.kind === 'refused' ? t('refused') : state.error.kind === 'migration' ? t('migrationRequired') : state.error.kind === 'previewChanged' ? t('previewChanged') : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail })}</p>}
        {state.notice === 'saved' && <p className="dtr-success dtr-message">{t('saved')}</p>}
        <div className="dtr-actions"><span className="dtr-muted">{t(state.dirty ? 'dirty' : 'current')}</span><div className="dtr-inline">
          <button type="button" disabled={state.saving || preview !== undefined || (!state.dirty && !state.stale)} onClick={() => { setPreviewError(undefined); editor.discard(); }}>{t(state.stale ? 'reload' : 'cancel')}</button>
          <button type="button" className="dtr-primary" disabled={disabled || !state.dirty || state.stale} onClick={save}>{t(state.saving ? 'saving' : 'save')}</button>
        </div></div>
      </div>
    </div>;
  }
  const t = client.locale.bind(NS);
  ctx.effect(() => client.configForms.whileServed(['team-router'], () => client.slots.inject('settings.section', () => client.slots.register({
    name: 'settings.section', id: 'team-router', order: 35, label: () => t('title'), locale: NS,
  }, Editor))), 'team-router: settings section');
}
