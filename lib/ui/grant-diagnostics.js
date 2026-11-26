import { MODEL_AUTHORIZATION_ENTRY } from "./model-grants.js";
// Only read these public inventory fields. Never relay raw inventory, exception messages, settings or logs.
const owner = '@deepseek-ai/dsh-tool-subagent';
export const CODEX_SUBAGENT = '@deepseek-ai/dsh-subagent-codex';
const version = (v) => typeof v === 'string' && /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.+-]+)?$/.test(v) && v.length <= 64;
export async function readGrantEvidence(reader) {
    if (!reader)
        return { component: 'unknown' };
    const read = async (fn) => {
        try {
            const res = await fn();
            return res.ok && Array.isArray(res.value) ? res.value : undefined;
        }
        catch {
            return undefined;
        }
    };
    const [plugins, bundles] = await Promise.all([read(() => reader.listPlugins()), read(() => reader.listBundles())]);
    const row = plugins?.find(p => p.entryId === `include:${MODEL_AUTHORIZATION_ENTRY}` && p.moduleName === `${owner}/model-selection-settings`);
    const component = !row ? plugins ? 'missing' : 'unknown' : !row.enabled ? 'disabled' : row.fiberPhase === 'active' ? 'active' : row.fiberPhase === 'failed' ? 'failed' : 'starting';
    const result = { component };
    if (component !== 'disabled' && component !== 'failed')
        return result;
    // A mismatch on a *bundle* is a confirmed separate finding, not proof that it disabled this row.
    const bundle = bundles?.find(b => b.name === CODEX_SUBAGENT && b.installed && b.error?.code === 'incompatible-version');
    const bad = bundle?.error?.incompatible?.find(i => i.name === bundle.name && i.version === bundle.version);
    if (bundle && bad && version(bad.version) && version(bad.runtimeVersion)) {
        const offered = bundle.installTarget?.version;
        result.conflict = { name: bundle.name, installed: bad.version, runtime: bad.runtimeVersion,
            ...(version(offered) && offered !== bad.version ? { offered } : {}) };
    }
    return result;
}
//# sourceMappingURL=grant-diagnostics.js.map