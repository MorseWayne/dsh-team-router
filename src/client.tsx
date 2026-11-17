import * as React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { PolicyEditor, draftToPolicy, draftValidationIssue, policyRequiresCatalog, moveRule, rowKey } from './editor.ts';
import type { DraftValidationIssue, ValidationField, EditorDraft, EditorForm, RouteRow, RuleRow, RoleRow } from './editor.ts';

const NS = 'teamRouter';
const en = {
  title: 'Team model routing', description: 'Route native teammates without replacing Agent Teams. Changes affect future turn/task boundaries, never an admitted model request.',
  precedence: 'Priority: lead override → matching task rule → exact teammate name → default route → inherited model. Higher rule priority wins; ties follow row order.',
  routes: 'Model routes', routesHint: 'Give each reusable provider/model selection a unique name. Models and reasoning efforts come from the live Host catalog.',
  addRoute: 'Add route', routeName: 'Route name', provider: 'Provider', model: 'Model', effort: 'Reasoning effort', providerDefault: 'Provider default', chooseProvider: 'Choose a provider', chooseModel: 'Choose a model',
  remove: 'Remove', removeRow: 'Remove {name}', notLoaded: '{name} (not currently available)',
  rules: 'Task rules', rulesHint: 'Any keyword can match task text. ASCII words use word boundaries; other keywords use substring matching. Put one keyword on each line.',
  addRule: 'Add rule', ruleId: 'Rule ID', ruleNumber: 'Rule {number}', priority: 'Priority (−1000 to 1000)', keywords: 'Keywords (one per line)', target: 'Target route', chooseRoute: 'Choose a route',
  moveUp: 'Move rule up', moveDown: 'Move rule down', roles: 'Teammate roles', rolesHint: 'Exact native teammate names, not job categories. Whitespace and case are significant.', addRole: 'Add teammate role', memberName: 'Exact teammate name',
  defaults: 'Fallback and history', defaultRoute: 'Default route', inherit: 'Inherit the teammate’s model', historyLimit: 'History limit (1–1000)',
  loading: 'Loading Host configuration…', unavailable: 'The team-router entry is not served by this Host.', readOnly: 'This Host configuration is read-only.',
  catalogLoading: 'Loading the live model catalog…', catalogError: 'Could not load the model catalog: {message}', catalogPartial: 'Some providers could not be loaded: {message}', retry: 'Retry catalog',
  catalogRequired: 'Load the live model catalog before saving. Your draft has been kept.', catalogInvalid: 'Route “{name}” is not available in the live catalog. Check its provider, model, and reasoning effort. Your draft has been kept.',
  save: 'Save policy', saving: 'Saving…', cancel: 'Cancel edits', reload: 'Discard draft and reload Host values', reset: 'Restore inherited policy', resetHint: 'Cancel edits first to restore the composition’s inherited policy. The state directory is never changed.',
  saved: 'Policy saved. Future routing boundaries will use these values.', resetDone: 'Inherited policy restored.', dirty: 'Unsaved changes', current: 'Up to date',
  stale: 'The Host changed while you were editing. Your draft is preserved; reload before applying a new edit.', refused: 'The Host refused this save (for example, a revision conflict or validation failure). Your draft is preserved. Reload explicitly or correct the configuration; no automatic overwrite was attempted.',
  validationError: 'Invalid policy: {message}', transportError: 'Save failed: {message}. Your draft is preserved.',
  noRoutes: 'No named routes. With no default, teammates inherit their model.', noRules: 'No task rules.', noRoles: 'No exact-name role mappings.', unknownRoute: '{name} (missing route)',
  resetConfirmTitle: 'Restore inherited policy?', resetConfirmBody: 'This removes the five user overrides: routes, rules, roles, default route, and history limit. Composition values will apply again. The state directory and routing history files are preserved.', resetConfirm: 'Confirm restore', resetCancel: 'Keep current policy', resetChanged: 'The Host changed after this confirmation opened. Cancel and review the new values before restoring.',
  ruleGroup: 'Task rule {number}: {name}', unnamed: 'unnamed', moveUpRule: 'Move rule {name} up', moveDownRule: 'Move rule {name} down', routeAdded: 'Route row {number} added. Enter its name.', ruleAdded: 'Rule row {number} added. Enter its ID.', roleAdded: 'Teammate role row {number} added. Enter the exact name.',
  validationSummary: '{field}: {reason}', validationRequired: 'This field is required.', validationDuplicateRoute: 'Route names must be unique after trimming whitespace.', validationUnsafeName: 'This reserved name is not allowed.', validationRouteLimit: 'Use at most 64 model routes.', validationDuplicateRule: 'Rule IDs must be unique after trimming whitespace.', validationRuleLimit: 'Use at most 64 rules.', validationPriority: 'Enter an integer from −1000 to 1000.', validationKeywordLimit: 'Use at most 32 keywords.', validationKeywordLength: 'Each keyword must be at most 100 characters.', validationDuplicateRole: 'Each exact teammate name may appear only once.', validationUnknownRoute: 'Choose an existing named route.', validationHistory: 'Enter an integer from 1 to 1000.', validationCatalog: 'This selection is not available in the live model catalog.',
};
type Key = keyof typeof en;
const zh: Record<Key, string> = {
  title: '团队模型路由', description: '为原生队友分配模型，不替换 Agent Teams。修改仅在后续轮次或任务边界生效，不改变已开始的模型请求。',
  precedence: '优先级：Lead 手动覆盖 → 匹配的任务规则 → 精确队友名 → 默认路由 → 继承模型。规则优先级数值越高越先匹配；同优先级按行顺序。',
  routes: '模型路由', routesHint: '为可复用的供应商和模型组合设置唯一名称。模型及推理强度来自当前 Host 的实时目录。',
  addRoute: '添加路由', routeName: '路由名称', provider: '供应商', model: '模型', effort: '推理强度', providerDefault: '供应商默认值', chooseProvider: '选择供应商', chooseModel: '选择模型',
  remove: '删除', removeRow: '删除 {name}', notLoaded: '{name}（当前不可用）',
  rules: '任务规则', rulesHint: '任一关键词可匹配任务文本。ASCII 单词按词边界匹配，其他关键词按子串匹配。每行填写一个关键词。',
  addRule: '添加规则', ruleId: '规则 ID', ruleNumber: '规则 {number}', priority: '优先级（−1000 至 1000）', keywords: '关键词（每行一个）', target: '目标路由', chooseRoute: '选择路由',
  moveUp: '上移规则', moveDown: '下移规则', roles: '队友角色', rolesHint: '填写精确的原生队友名称，而非岗位类别。名称区分大小写，空格也须一致。', addRole: '添加队友角色', memberName: '精确队友名称',
  defaults: '默认策略与历史记录', defaultRoute: '默认路由', inherit: '继承队友的模型', historyLimit: '历史记录上限（1–1000）',
  loading: '正在读取 Host 配置…', unavailable: '当前 Host 未提供 team-router 配置项。', readOnly: '当前 Host 配置为只读。',
  catalogLoading: '正在读取实时模型目录…', catalogError: '无法读取模型目录：{message}', catalogPartial: '部分供应商目录读取失败：{message}', retry: '重试读取目录',
  catalogRequired: '保存前请先读取实时模型目录。你的草稿已保留。', catalogInvalid: '路由“{name}”不在实时模型目录中。请检查供应商、模型及推理强度。你的草稿已保留。',
  save: '保存策略', saving: '保存中…', cancel: '取消修改', reload: '丢弃草稿并重新读取 Host 配置', reset: '恢复继承的策略', resetHint: '如需恢复组合层的继承策略，请先取消修改。此操作不会更改状态目录。',
  saved: '策略已保存，将用于后续路由边界。', resetDone: '已恢复继承的策略。', dirty: '有未保存的修改', current: '已同步',
  stale: '编辑期间 Host 配置已更新。你的草稿已保留；请先重新读取，再应用新的修改。', refused: 'Host 拒绝了本次保存（可能是版本冲突或配置校验未通过）。草稿已保留，请明确重新读取配置或修正输入；未自动覆盖其他修改。',
  validationError: '策略不合法：{message}', transportError: '保存失败：{message}。你的草稿已保留。',
  noRoutes: '尚无命名路由。未设置默认路由时，队友继承其模型。', noRules: '尚无任务规则。', noRoles: '尚无精确名称角色映射。', unknownRoute: '{name}（路由不存在）',
  resetConfirmTitle: '恢复继承的策略？', resetConfirmBody: '此操作将清除路由、规则、角色、默认路由及历史上限这五项用户覆盖，重新使用组合层的配置。状态目录及路由历史文件会完整保留。', resetConfirm: '确认恢复', resetCancel: '保留当前策略', resetChanged: '确认界面打开后 Host 配置发生了变化。请先取消，检查最新配置后再恢复。',
  ruleGroup: '任务规则 {number}：{name}', unnamed: '未命名', moveUpRule: '上移规则 {name}', moveDownRule: '下移规则 {name}', routeAdded: '已添加第 {number} 条路由，请填写名称。', ruleAdded: '已添加第 {number} 条规则，请填写 ID。', roleAdded: '已添加第 {number} 条队友角色，请填写精确名称。',
  validationSummary: '{field}：{reason}', validationRequired: '此项不能为空。', validationDuplicateRoute: '去除首尾空格后的路由名称必须唯一。', validationUnsafeName: '不能使用此保留名称。', validationRouteLimit: '最多可配置 64 条模型路由。', validationDuplicateRule: '去除首尾空格后的规则 ID 必须唯一。', validationRuleLimit: '最多可配置 64 条规则。', validationPriority: '请输入 −1000 至 1000 之间的整数。', validationKeywordLimit: '最多可填写 32 个关键词。', validationKeywordLength: '每个关键词最多 100 个字符。', validationDuplicateRole: '同一个精确队友名称只能配置一次。', validationUnknownRoute: '请选择已存在的命名路由。', validationHistory: '请输入 1 至 1000 之间的整数。', validationCatalog: '此选项不在当前实时模型目录中。',
};
type Translate = (key: Key, params?: Record<string, string | number>) => string;
interface CatalogModel { id: string; name: string; reasoning?: { efforts: Array<{ id: string; name: string }>; defaultEffort?: string } }
interface Catalog { groups: Array<{ id: string; name: string; models: CatalogModel[] }>; failures: Array<{ id: string; name: string; message: string }> }
interface ClientServices {
  locale: { register(ns: string, dictionaries: { en: typeof en; zh: typeof zh }): () => void; bind(ns: string): Translate };
  configForms: { get(entry: string): EditorForm; whileServed(namespaces: string[], register: () => () => void): () => void };
  slots: { inject(key: string, register: () => () => void): () => void; register(options: Record<string, unknown>, component: (props: { t: Translate }) => React.ReactNode): () => void };
  remote: { session: { modelCatalog(): Promise<{ ok: true; value: Catalog } | { ok: false; error: { message: string } }> }; $on(event: string, listener: () => void): () => void };
  on(event: string, listener: () => void): () => void;
}

const CSS = `
.dtr-editor{color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;max-width:900px;min-width:0;margin:0 auto;padding:4px 0 24px}
.dtr-editor *{box-sizing:border-box}.dtr-editor h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}.dtr-editor h3{font-size:15px;margin:0;font-weight:600}
.dtr-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:4px 0 12px}.dtr-note{padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;margin:12px 0;background:var(--dsw-alias-bg-layer-1)}
.dtr-section{border-top:1px solid var(--dsw-alias-border-l3);padding-top:20px;margin-top:22px}.dtr-section-head,.dtr-row-head,.dtr-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.dtr-card{border:1px solid var(--dsw-alias-border-l3);border-radius:12px;padding:14px;margin-top:12px;background:var(--dsw-alias-bg-layer-1)}.dtr-row-head{margin-bottom:12px}.dtr-row-head strong{font-size:13px;overflow-wrap:anywhere}
.dtr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dtr-field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}.dtr-wide{grid-column:1/-1}
.dtr-editor input,.dtr-editor select,.dtr-editor textarea{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;min-width:0;width:100%}.dtr-editor textarea{resize:vertical;min-height:86px}
.dtr-editor button{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:7px 12px;cursor:pointer}.dtr-editor button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dtr-editor :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dtr-editor :disabled{opacity:.5;cursor:not-allowed}
.dtr-editor button.dtr-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.dtr-editor button.dtr-danger,.dtr-error{color:var(--dsw-alias-state-error-primary)}.dtr-success{color:var(--dsw-alias-label-primary);border-inline-start:3px solid var(--dsw-alias-state-success-primary);padding-inline-start:10px}.dtr-warning{color:var(--dsw-alias-label-secondary);border-inline-start:3px solid var(--dsw-alias-state-warn-primary);padding-inline-start:10px}.dtr-message{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}
.dtr-field-error{font-size:12px;color:var(--dsw-alias-label-secondary)}.dtr-editor [aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.dtr-announcement{min-height:20px;font-size:13px;color:var(--dsw-alias-label-secondary)}.dtr-footer{border-top:1px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:16px}.dtr-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dtr-editor fieldset{border:0;margin:0;padding:0;min-width:0}.dtr-empty{font-size:13px;color:var(--dsw-alias-label-tertiary);margin:12px 0}
@media(max-width:620px){.dtr-grid{grid-template-columns:minmax(0,1fr)}.dtr-editor{padding-bottom:16px}.dtr-card{padding:12px}.dtr-section-head{align-items:flex-start}}
`;

/** Cordis service injection and package activation dependencies are distinct contracts. */
export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session'];
export function apply(ctx: Context): void {
  const client = ctx as unknown as ClientServices;
  ctx.effect(() => client.locale.register(NS, { en, zh }), 'team-router: editor dictionaries');
  const form = client.configForms.get('team-router');
  const editor = new PolicyEditor(form);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener: () => void) => form.subscribe(listener);
  ctx.effect(() => () => editor.dispose(), 'team-router: staged editor');

  function Editor(props: { t: Translate }): React.ReactNode {
    const t = props.t;
    const host = React.useSyncExternalStore(subscribeForm, readForm);
    const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React.useState<Catalog>();
    const [catalogBusy, setCatalogBusy] = React.useState(true);
    const [catalogError, setCatalogError] = React.useState<string>();
    const [catalogProblem, setCatalogProblem] = React.useState<{ key: 'catalogRequired' | 'catalogInvalid'; name?: string }>();
    const [retry, setRetry] = React.useState(0);
    const [resetConfirmation, setResetConfirmation] = React.useState<{ revision: number | undefined }>();
    const [validationAttempted, setValidationAttempted] = React.useState(false);
    const [externalIssue, setExternalIssue] = React.useState<DraftValidationIssue>();
    const [pendingFocus, setPendingFocus] = React.useState<string>();
    const [announcement, setAnnouncement] = React.useState<{ key: 'routeAdded' | 'ruleAdded' | 'roleAdded'; number: number; serial: string }>();
    const fields = React.useRef(new Map<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>());
    const instanceId = React.useId();
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
      const listeners = [
        ...['llm/adapters-updated', 'settings/document-updated', 'credentials/record-updated', 'credentials/reference-updated'].map(event => client.remote.$on(event, () => { void refresh(); })),
        client.on('connection/reset', () => { void refresh(); }),
      ];
      void refresh();
      return () => { active = false; generation++; for (const stop of listeners) stop(); };
    }, [retry]);
    const draft = state.draft;
    const hostDisabled = state.saving || host.status !== 'ready' || !host.writable;
    const disabled = hostDisabled || resetConfirmation !== undefined;
    const issue = externalIssue ?? (validationAttempted && draft ? draftValidationIssue(draft) : undefined);
    const fieldKey = (row: string, field: ValidationField): string => `${row}:${field}`;
    const fieldId = (row: string, field: ValidationField): string => `dtr-${instanceId}-${row}-${field}`;
    const focusIssue = (next: DraftValidationIssue): void => { setPendingFocus(fieldKey(next.rowKey, next.field)); };
    React.useLayoutEffect(() => {
      if (pendingFocus === undefined) return;
      const input = fields.current.get(pendingFocus);
      if (input) { input.focus(); setPendingFocus(undefined); }
    }, [pendingFocus, draft]);
    const fieldProps = (row: string, field: ValidationField) => {
      const invalid = issue?.rowKey === row && issue.field === field;
      return {
        id: fieldId(row, field),
        ref: (node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null): void => {
          if (node) fields.current.set(fieldKey(row, field), node); else fields.current.delete(fieldKey(row, field));
        },
        'aria-invalid': invalid || undefined,
        'aria-describedby': invalid ? `${fieldId(row, field)}-error` : undefined,
      };
    };
    const fieldError = (row: string, field: ValidationField): React.ReactNode => issue?.rowKey === row && issue.field === field
      ? <span className="dtr-field-error" id={`${fieldId(row, field)}-error`}>{t(issue.reasonKey)}</span> : null;
    const edit = (next: EditorDraft): void => { setCatalogProblem(undefined); setExternalIssue(undefined); editor.edit(next, state.revision); };
    const addRoute = (): void => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, routes: [...draft.routes, { key, name: '', provider: '', model: '', reasoningEffort: '' }] });
      setPendingFocus(fieldKey(key, 'routeName')); setAnnouncement({ key: 'routeAdded', number: draft.routes.length + 1, serial: key });
    };
    const addRule = (): void => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, rules: [...draft.rules, { key, id: '', keywords: '', route: '', priority: '0' }] });
      setPendingFocus(fieldKey(key, 'ruleId')); setAnnouncement({ key: 'ruleAdded', number: draft.rules.length + 1, serial: key });
    };
    const addRole = (): void => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, roles: [...draft.roles, { key, name: '', route: '' }] });
      setPendingFocus(fieldKey(key, 'memberName')); setAnnouncement({ key: 'roleAdded', number: draft.roles.length + 1, serial: key });
    };
    const resetChanged = resetConfirmation !== undefined && (resetConfirmation.revision === undefined || host.revision !== resetConfirmation.revision || state.revision !== resetConfirmation.revision);
    const routeNames = draft?.routes.map(route => route.name.trim()).filter(Boolean) ?? [];
    const targetOptions = (current: string, optional = false): React.ReactNode => <>
      <option value="">{t(optional ? 'inherit' : 'chooseRoute')}</option>
      {current !== '' && !routeNames.includes(current) && <option value={current}>{t('unknownRoute', { name: current })}</option>}
      {[...new Set(routeNames)].map(name => <option key={name} value={name}>{name}</option>)}
    </>;
    const updateRoute = (index: number, change: Partial<RouteRow>): void => {
      if (draft) edit({ ...draft, routes: draft.routes.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const updateRule = (index: number, change: Partial<RuleRow>): void => {
      if (draft) edit({ ...draft, rules: draft.rules.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const updateRole = (index: number, change: Partial<RoleRow>): void => {
      if (draft) edit({ ...draft, roles: draft.roles.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const save = (): void => {
      if (!draft) return;
      setValidationAttempted(true); setExternalIssue(undefined);
      const invalid = draftValidationIssue(draft);
      if (invalid) { focusIssue(invalid); void editor.save(); return; }
      // Structural validation still runs through the shared Host parser before any mutation.
      let policy;
      try { policy = draftToPolicy(draft); } catch { void editor.save(); return; }
      if (policyRequiresCatalog(policy) && (!catalog || catalogError || catalogBusy)) { setCatalogProblem({ key: 'catalogRequired' }); return; }
      for (const [name, route] of Object.entries(policy.routes)) {
        const group = catalog?.groups.find(group => group.id === route.provider);
        const model = group?.models.find(model => model.id === route.model);
        if (!model || (route.reasoningEffort !== undefined && !model.reasoning?.efforts.some(effort => effort.id === route.reasoningEffort))) {
          const row = draft.routes.find(row => row.name.trim() === name)!;
          const problem: DraftValidationIssue = { rowKey: row.key, field: !group ? 'provider' : !model ? 'model' : 'effort', reasonKey: 'validationCatalog' };
          setExternalIssue(problem); focusIssue(problem); setCatalogProblem({ key: 'catalogInvalid', name }); return;
        }
      }
      setCatalogProblem(undefined);
      void editor.save();
    };
    return <div className="dtr-editor" aria-busy={state.saving}>
      <style>{CSS}</style>
      <h2>{t('title')}</h2><p className="dtr-muted">{t('description')}</p><div className="dtr-note dtr-muted">{t('precedence')}</div>
      <div className="dtr-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement && <span key={announcement.serial}>{t(announcement.key, { number: announcement.number })}</span>}</div>
      {host.status === 'loading' && <p role="status">{t('loading')}</p>}
      {host.status === 'unavailable' && <p role="status">{t('unavailable')}</p>}
      {host.status === 'ready' && !host.writable && <p className="dtr-warning" role="status">{t('readOnly')}</p>}
      <div className="dtr-inline">
        {catalogBusy && <span className="dtr-muted" role="status">{t('catalogLoading')}</span>}
        <button type="button" onClick={() => { setRetry(value => value + 1); }} disabled={catalogBusy}>{t('retry')}</button>
      </div>
      {catalogError && <p className="dtr-error dtr-message" role="alert">{t('catalogError', { message: catalogError })}</p>}
      {catalog && catalog.failures.length > 0 && <p className="dtr-warning dtr-message" role="status">{t('catalogPartial', { message: catalog.failures.map(row => `${row.name}: ${row.message}`).join('; ') })}</p>}
      {draft && <>
        <fieldset disabled={disabled}>
          <section className="dtr-section"><div className="dtr-section-head"><h3>{t('routes')}</h3><button type="button" onClick={addRoute}>{t('addRoute')}</button></div>
            <p className="dtr-muted">{t('routesHint')}</p>{draft.routes.length === 0 && <p className="dtr-empty">{t('noRoutes')}</p>}
            {draft.routes.map((row, index) => {
              const group = catalog?.groups.find(group => group.id === row.provider);
              const model = group?.models.find(model => model.id === row.model);
              const efforts = model?.reasoning?.efforts ?? [];
              return <div className="dtr-card" key={row.key}><div className="dtr-row-head"><strong>{row.name || t('routeName')}</strong><button type="button" className="dtr-danger" aria-label={t('removeRow', { name: row.name || t('routeName') })} onClick={() => edit({ ...draft, routes: draft.routes.filter((_, i) => i !== index) })}>{t('remove')}</button></div><div className="dtr-grid">
                <label className="dtr-field dtr-wide">{t('routeName')}<input {...fieldProps(row.key, 'routeName')} value={row.name} onChange={event => updateRoute(index, { name: event.target.value })} autoComplete="off" />{fieldError(row.key, 'routeName')}</label>
                <label className="dtr-field">{t('provider')}<select {...fieldProps(row.key, 'provider')} value={row.provider} onChange={event => updateRoute(index, { provider: event.target.value, model: '', reasoningEffort: '' })}><option value="">{t('chooseProvider')}</option>{row.provider && !group && <option value={row.provider}>{t('notLoaded', { name: row.provider })}</option>}{catalog?.groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select>{fieldError(row.key, 'provider')}</label>
                <label className="dtr-field">{t('model')}<select {...fieldProps(row.key, 'model')} value={row.model} onChange={event => updateRoute(index, { model: event.target.value, reasoningEffort: '' })}><option value="">{t('chooseModel')}</option>{row.model && !model && <option value={row.model}>{t('notLoaded', { name: row.model })}</option>}{group?.models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select>{fieldError(row.key, 'model')}</label>
                <label className="dtr-field dtr-wide">{t('effort')}<select {...fieldProps(row.key, 'effort')} value={row.reasoningEffort} onChange={event => updateRoute(index, { reasoningEffort: event.target.value })}><option value="">{t('providerDefault')}</option>{row.reasoningEffort && !efforts.some(effort => effort.id === row.reasoningEffort) && <option value={row.reasoningEffort}>{t('notLoaded', { name: row.reasoningEffort })}</option>}{efforts.map(effort => <option key={effort.id} value={effort.id}>{effort.name}</option>)}</select>{fieldError(row.key, 'effort')}</label>
              </div></div>;
            })}
          </section>
          <section className="dtr-section"><div className="dtr-section-head"><h3>{t('rules')}</h3><button type="button" onClick={addRule}>{t('addRule')}</button></div><p className="dtr-muted">{t('rulesHint')}</p>{draft.rules.length === 0 && <p className="dtr-empty">{t('noRules')}</p>}
            {draft.rules.map((row, index) => <div className="dtr-card" key={row.key} role="group" aria-label={t('ruleGroup', { number: index + 1, name: row.id || t('unnamed') })}><div className="dtr-row-head"><strong>{row.id || t('ruleNumber', { number: index + 1 })}</strong><div className="dtr-inline"><button type="button" aria-label={t('moveUpRule', { name: row.id || t('ruleNumber', { number: index + 1 }) })} disabled={index === 0} onClick={() => edit({ ...draft, rules: moveRule(draft.rules, index, -1) })}>{t('moveUp')}</button><button type="button" aria-label={t('moveDownRule', { name: row.id || t('ruleNumber', { number: index + 1 }) })} disabled={index === draft.rules.length - 1} onClick={() => edit({ ...draft, rules: moveRule(draft.rules, index, 1) })}>{t('moveDown')}</button><button type="button" className="dtr-danger" aria-label={t('removeRow', { name: row.id || t('ruleNumber', { number: index + 1 }) })} onClick={() => edit({ ...draft, rules: draft.rules.filter((_, i) => i !== index) })}>{t('remove')}</button></div></div><div className="dtr-grid">
              <label className="dtr-field">{t('ruleId')}<input {...fieldProps(row.key, 'ruleId')} value={row.id} onChange={event => updateRule(index, { id: event.target.value })} />{fieldError(row.key, 'ruleId')}</label><label className="dtr-field">{t('priority')}<input {...fieldProps(row.key, 'priority')} type="number" min={-1000} max={1000} step={1} value={row.priority} onChange={event => updateRule(index, { priority: event.target.value })} />{fieldError(row.key, 'priority')}</label>
              <label className="dtr-field dtr-wide">{t('keywords')}<textarea {...fieldProps(row.key, 'keywords')} value={row.keywords} onChange={event => updateRule(index, { keywords: event.target.value })} />{fieldError(row.key, 'keywords')}</label><label className="dtr-field dtr-wide">{t('target')}<select {...fieldProps(row.key, 'target')} value={row.route} onChange={event => updateRule(index, { route: event.target.value })}>{targetOptions(row.route)}</select>{fieldError(row.key, 'target')}</label>
            </div></div>)}
          </section>
          <section className="dtr-section"><div className="dtr-section-head"><h3>{t('roles')}</h3><button type="button" onClick={addRole}>{t('addRole')}</button></div><p className="dtr-muted">{t('rolesHint')}</p>{draft.roles.length === 0 && <p className="dtr-empty">{t('noRoles')}</p>}
            {draft.roles.map((row, index) => <div className="dtr-card" key={row.key}><div className="dtr-row-head"><strong>{row.name || t('memberName')}</strong><button type="button" className="dtr-danger" aria-label={t('removeRow', { name: row.name || t('memberName') })} onClick={() => edit({ ...draft, roles: draft.roles.filter((_, i) => i !== index) })}>{t('remove')}</button></div><div className="dtr-grid"><label className="dtr-field">{t('memberName')}<input {...fieldProps(row.key, 'memberName')} value={row.name} onChange={event => updateRole(index, { name: event.target.value })} />{fieldError(row.key, 'memberName')}</label><label className="dtr-field">{t('target')}<select {...fieldProps(row.key, 'target')} value={row.route} onChange={event => updateRole(index, { route: event.target.value })}>{targetOptions(row.route)}</select>{fieldError(row.key, 'target')}</label></div></div>)}
          </section>
          <section className="dtr-section"><h3>{t('defaults')}</h3><div className="dtr-grid" style={{ marginTop: 12 }}><label className="dtr-field">{t('defaultRoute')}<select {...fieldProps('defaults', 'defaultRoute')} value={draft.defaultRoute} onChange={event => edit({ ...draft, defaultRoute: event.target.value })}>{targetOptions(draft.defaultRoute, true)}</select>{fieldError('defaults', 'defaultRoute')}</label><label className="dtr-field">{t('historyLimit')}<input {...fieldProps('defaults', 'historyLimit')} type="number" min={1} max={1000} step={1} value={draft.historyLimit} onChange={event => edit({ ...draft, historyLimit: event.target.value })} />{fieldError('defaults', 'historyLimit')}</label></div></section>
        </fieldset>
        <div className="dtr-footer">
          <div aria-live="polite">
            {state.stale && <p className="dtr-warning dtr-message">{t('stale')}</p>}
            {issue && <p role="alert" className="dtr-error dtr-message">{t('validationSummary', { field: t(issue.field), reason: t(issue.reasonKey) })}</p>}
            {state.error && <p role="alert" className="dtr-error dtr-message">{state.error.kind === 'refused' ? t('refused') : t(state.error.kind === 'validation' ? 'validationError' : 'transportError', { message: state.error.detail })}</p>}
            {catalogProblem && <p role="alert" className="dtr-error dtr-message">{t(catalogProblem.key, { name: catalogProblem.name ?? '' })}</p>}
            {state.notice && <p className="dtr-success dtr-message">{t(state.notice === 'saved' ? 'saved' : 'resetDone')}</p>}
          </div>
          <div className="dtr-actions"><span className="dtr-muted">{t(state.dirty ? 'dirty' : 'current')}</span><div className="dtr-inline"><button type="button" disabled={state.saving || resetConfirmation !== undefined || (!state.dirty && !state.stale)} onClick={() => { setCatalogProblem(undefined); setExternalIssue(undefined); setValidationAttempted(false); editor.discard(); }}>{t(state.stale ? 'reload' : 'cancel')}</button><button type="button" className="dtr-primary" disabled={disabled || !state.dirty || state.stale || (catalogBusy && draft.routes.length > 0)} onClick={save}>{t(state.saving ? 'saving' : 'save')}</button></div></div>
          <button type="button" style={{ marginTop: 14 }} disabled={disabled || state.dirty || state.stale} onClick={() => { setCatalogProblem(undefined); setResetConfirmation({ revision: state.revision }); }}>{t('reset')}</button><p className="dtr-muted">{t('resetHint')}</p>
          {resetConfirmation && <div className="dtr-note" role="group" aria-labelledby={`dtr-${instanceId}-reset-title`} aria-describedby={`dtr-${instanceId}-reset-body`}>
            <h3 id={`dtr-${instanceId}-reset-title`}>{t('resetConfirmTitle')}</h3><p className="dtr-muted" id={`dtr-${instanceId}-reset-body`}>{t('resetConfirmBody')}</p>
            {resetChanged && <p className="dtr-warning dtr-message" role="status">{t('resetChanged')}</p>}
            <div className="dtr-inline"><button type="button" autoFocus disabled={state.saving} onClick={() => { setResetConfirmation(undefined); }}>{t('resetCancel')}</button><button type="button" disabled={hostDisabled || state.dirty || resetChanged} onClick={() => { void editor.reset(resetConfirmation.revision).then(accepted => { if (accepted) { setResetConfirmation(undefined); setExternalIssue(undefined); setValidationAttempted(false); } }); }}>{t(state.saving ? 'saving' : 'resetConfirm')}</button></div>
          </div>}
        </div>
      </>}
    </div>;
  }
  const t = client.locale.bind(NS);
  ctx.effect(() => client.configForms.whileServed(['team-router'], () => client.slots.inject('settings.section', () => client.slots.register({
    name: 'settings.section', id: 'team-router', order: 35, label: () => t('title'), locale: NS,
  }, Editor))), 'team-router: settings section');
}
