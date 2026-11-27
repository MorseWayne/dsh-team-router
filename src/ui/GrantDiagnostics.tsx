import * as React from 'react';
import { MODEL_AUTHORIZATION_ENTRY, type GrantProblem } from './model-grants.ts';
import { readGrantEvidence, type GrantEvidence, type InventoryReader } from './grant-diagnostics.ts';

const zh = {
  loading: '正在读取子智能体模型授权设置…', checking: '正在检查授权组件…',
  unserved: '暂时不能保存：DSH 没有提供模型授权设置。', invalid: '暂时不能保存：DSH 返回的模型授权设置不完整。请重新检测；如果仍然失败，请复制诊断信息。',
  readOnly: '暂时不能保存：模型授权设置为只读。请让管理此 DSH 实例的人保存授权后再试。',
  unknown: '未能确认组件状态。请重新检测；如果仍然失败，可复制诊断信息给维护者。',
  missing: '插件清单中没有找到模型授权组件。请让维护者检查 DSH Web 是否安装了匹配版本的子智能体组件。',
  disabled: '子智能体模型授权组件未启用。请让维护者启用下方诊断信息中的组件，再重新检测。',
  failed: '模型授权组件启动失败。请把诊断信息发给维护者，修复后重新检测。',
  starting: '模型授权组件已启用，但还未运行。请稍后重新检测。', active: '组件已运行，但设置仍不可用。请稍后重新检测；如果持续失败，请复制诊断信息。',
  conflict: (v: string, runtime: string) => `检测到 Codex 子智能体 ${v} 与 DSH ${runtime} 不兼容。`,
  update: (v: string) => `请在插件页更新到 ${v}，然后返回重试。Codex 子智能体本身不需要开启。`,
  noTarget: '请在插件页检查是否有兼容更新。', retry: '重新检测', open: '查看插件', copy: '复制诊断信息', copied: '已复制', manual: '请手动复制下方文字。', details: '诊断信息', leave: '离开页面会丢弃未保存的编辑。',
};
const en: typeof zh = {
  loading: 'Reading subagent model authorization settings…', checking: 'Checking the authorization component…',
  unserved: 'Cannot save yet: DSH is not serving model authorization settings.', invalid: 'Cannot save yet: DSH returned incomplete authorization settings. Check again; if this persists, copy the diagnostics.',
  readOnly: 'Cannot save yet: authorization settings are read-only. Ask your DSH administrator to save the authorization, then retry.',
  unknown: 'Component status is unknown. Check again or copy the diagnostics for support.', missing: 'The model authorization component was not found in the plugin inventory. Ask your administrator to check that the matching DSH Web subagent component is installed.',
  disabled: 'Subagent model authorization is disabled. Ask your administrator to enable the component named in the diagnostics, then check again.',
  failed: 'The authorization component failed to start. Share the diagnostics with your administrator, then check again after repair.', starting: 'The authorization component is enabled but not running. Check again shortly.', active: 'The component is running but its settings are unavailable. Check again shortly or copy the diagnostics if this persists.',
  conflict: (v, runtime) => `Codex subagent ${v} is incompatible with DSH ${runtime}.`, update: v => `Update it to ${v} in Plugins, then return and retry. The Codex subagent itself may remain disabled.`, noTarget: 'Check Plugins for a compatible update.',
  retry: 'Check again', open: 'View plugin', copy: 'Copy diagnostics', copied: 'Copied', manual: 'Copy the text below manually.', details: 'Diagnostics', leave: 'Leaving this page discards unsaved edits.',
};
export const GrantDiagnostics = React.memo(function GrantDiagnostics({ id, problem, locale, inventory, recheck, openBundle, dirty }: {
  id: string; problem: GrantProblem; locale: string; inventory(): InventoryReader | undefined; recheck(): Promise<'available' | 'unchanged' | 'unknown'>;
  openBundle?: ((name: string) => void) | undefined; dirty: boolean;
}) {
  const t = locale === 'zh' ? zh : en;
  const [attempt, retry] = React.useReducer((v: number) => v + 1, 0);
  const [evidence, setEvidence] = React.useState<GrantEvidence>();
  const [probe, setProbe] = React.useState<'available' | 'unchanged' | 'unknown'>();
  const [copy, setCopy] = React.useState<'copied' | 'manual'>();
  React.useEffect(() => {
    let live = true;
    setEvidence(undefined); setCopy(undefined);
    setProbe(undefined);
    if (attempt) void recheck().then(outcome => { if (live) setProbe(outcome); }, () => { if (live) setProbe('unknown'); });
    if (problem === 'unserved') void readGrantEvidence(inventory()).then(value => { if (live) setEvidence(value); });
    return () => { live = false; };
  }, [attempt, problem, inventory, recheck]);
  const conflict = evidence?.conflict;
  const report = JSON.stringify({ component: MODEL_AUTHORIZATION_ENTRY, settings: problem, ...evidence && {status: evidence.component}, ...conflict && {conflict} }, null, 2);
  return <section id={id} tabIndex={-1} className="dtr-card dtr-note dtr-diagnostics" aria-labelledby={`${id}-summary`}>
    <p id={`${id}-summary`} role="status"><strong>{t[problem]}</strong></p>
    {problem === 'unserved' && <p>{!evidence ? t.checking : conflict && evidence.component === 'disabled' ? (locale === 'zh' ? '子智能体模型授权组件未启用。' : 'Subagent model authorization is disabled.') : t[evidence.component]}</p>}
    {conflict && <p>{t.conflict(conflict.installed, conflict.runtime)} {conflict.offered ? t.update(conflict.offered) : t.noTarget}</p>}
    {probe && <p role="status">{locale === 'zh' ? ({available: 'DSH 已能提供授权设置。若保存仍不可用，请记下未保存的修改，再刷新页面。', unchanged: '已重新检测，授权设置仍未就绪或不可写。', unknown: '无法从 DSH 获取最新状态。请确认连接后重试。'})[probe] : ({available: 'DSH now serves authorization settings. If Save remains unavailable, note your unsaved edits before refreshing the page.', unchanged: 'Checked again: the settings are still unavailable or read-only.', unknown: 'Could not reach DSH for a fresh status. Check the connection and retry.'})[probe]}</p>}
    <div className="dtr-inline">
      <button type="button" onClick={retry}>{t.retry}</button>
      {conflict && openBundle && <button type="button" onClick={() => openBundle(conflict.name)}>{t.open}</button>}
      {problem !== 'loading' && <button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(report); setCopy('copied'); } catch { setCopy('manual'); }
      }}>{t.copy}</button>}
    </div>
    {dirty && conflict && openBundle && <p className="dtr-muted">{t.leave}</p>}
    {copy && <p role="status">{t[copy]}</p>}
    {problem !== 'loading' && <details key={copy === 'manual' ? 'manual' : 'details'} open={copy === 'manual' || undefined}><summary>{t.details}</summary><pre>{report}</pre></details>}
  </section>;
});
