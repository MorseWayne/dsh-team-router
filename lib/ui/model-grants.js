import { requiredGrantPairs, resolveActiveRegistry } from "../core/active-registry.js";
// DSH Web's Host entry id (not the similarly named UI section).
export const MODEL_AUTHORIZATION_ENTRY = 'subagent-model-selection-settings';
const key = (route) => JSON.stringify([route.provider, route.model]);
/** Only active, explicit native routes participate; disabled categories and unused defaults never require grants. */
export function requiredModelRoutes(config) {
    return requiredGrantPairs(resolveActiveRegistry(config));
}
export function isAllowedModelArray(value) {
    if (!Array.isArray(value))
        return false;
    for (const row of value) {
        if (typeof row?.provider !== 'string' || !row.provider.length || typeof row?.model !== 'string' || !row.model.length)
            return false;
    }
    return true;
}
export function planModelGrant(required, snapshot) {
    if (!required.length)
        return { kind: 'complete' };
    const { value, revision } = snapshot;
    if (snapshot.status !== 'ready')
        return { kind: 'unavailable', reason: snapshot.status === 'loading' ? 'loading' : 'unserved' };
    if (!Number.isSafeInteger(revision) || revision === undefined || typeof value?.enabled !== 'boolean' || !isAllowedModelArray(value.allowedModels)) {
        return { kind: 'unavailable', reason: 'invalid' };
    }
    const existing = new Set(value.allowedModels.map(key));
    const missing = required.filter(route => !existing.has(key(route)));
    if (value.enabled && !missing.length)
        return { kind: 'complete' };
    if (!snapshot.writable)
        return { kind: 'readOnly' };
    return { kind: 'write', revision, routes: [...value.allowedModels, ...missing] };
}
//# sourceMappingURL=model-grants.js.map