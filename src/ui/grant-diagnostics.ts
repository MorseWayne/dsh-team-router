import { MODEL_AUTHORIZATION_ENTRY } from './model-grants.ts';

// Only read these public inventory fields. Never relay raw inventory, exception messages, settings or logs.
const owner = '@deepseek-ai/dsh-tool-subagent';
export const CODEX_SUBAGENT = '@deepseek-ai/dsh-subagent-codex';
type Plugin = { entryId: string; moduleName: string; enabled: boolean; fiberPhase: string | null };
type Incompatible = { name: string; version: string; runtimeVersion: string };
type Bundle = { name: string; installed: boolean; version?: string; installTarget?: {version: string}; error?: {code: string; incompatible?: Incompatible[]} };
type Answer<T> = {ok: true; value: T} | {ok: false};
export interface InventoryReader {
  listPlugins(): Promise<Answer<Plugin[]>>;
  listBundles(): Promise<Answer<Bundle[]>>;
}
export interface GrantEvidence {
  component: 'unknown' | 'missing' | 'disabled' | 'active' | 'failed' | 'starting';
  conflict?: { name: string; installed: string; runtime: string; offered?: string };
}
const version = (v: unknown): v is string => typeof v === 'string' && /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.+-]+)?$/.test(v) && v.length <= 64;
export async function readGrantEvidence(reader?: InventoryReader): Promise<GrantEvidence> {
  if (!reader) return {component: 'unknown'};
  const read = async <T,>(fn: () => Promise<Answer<T[]>>) => {
    try { const res = await fn(); return res.ok && Array.isArray(res.value) ? res.value : undefined; } catch { return undefined; }
  };
  const [plugins, bundles] = await Promise.all([read(() => reader.listPlugins()), read(() => reader.listBundles())]);
  const row = plugins?.find(p => p.entryId === `include:${MODEL_AUTHORIZATION_ENTRY}` && p.moduleName === `${owner}/model-selection-settings`);
  const component = !row ? plugins ? 'missing' : 'unknown' : !row.enabled ? 'disabled' : row.fiberPhase === 'active' ? 'active' : row.fiberPhase === 'failed' ? 'failed' : 'starting';
  const result: GrantEvidence = {component};
  if (component !== 'disabled' && component !== 'failed') return result;
  // A mismatch on a *bundle* is a confirmed separate finding, not proof that it disabled this row.
  const bundle = bundles?.find(b => b.name === CODEX_SUBAGENT && b.installed && b.error?.code === 'incompatible-version');
  const bad = bundle?.error?.incompatible?.find(i => i.name === bundle.name && i.version === bundle.version);
  if (bundle && bad && version(bad.version) && version(bad.runtimeVersion)) {
    const offered = bundle.installTarget?.version;
    result.conflict = {name: bundle.name, installed: bad.version, runtime: bad.runtimeVersion,
      ...(version(offered) && offered !== bad.version ? {offered} : {})};
  }
  return result;
}
