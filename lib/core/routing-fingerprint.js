import { BUILTINS, BUILTIN_IDS } from "./categories.js";
export function compareCategoryIds(a, b) {
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
/** Internal canonical representation of an already parsed configuration. */
export function fingerprintNormalized(config) {
    return JSON.stringify({
        version: config.version, defaultTarget: config.defaultTarget, behavior: config.behavior,
        // A new opt-in category with no override must not change a saved V3 policy's digest.
        // Keep disabled categories with a dormant binding: editing it is still a real change.
        builtins: BUILTIN_IDS.filter(id => BUILTINS[id].defaultEnabled || config.builtins[id] !== undefined)
            .map(id => [id, config.builtins[id]?.enabled ?? BUILTINS[id].defaultEnabled, config.builtins[id]?.binding ?? { mode: 'default' }]),
        custom: [...config.custom].sort(compareCategoryIds), historyLimit: config.historyLimit,
    });
}
//# sourceMappingURL=routing-fingerprint.js.map