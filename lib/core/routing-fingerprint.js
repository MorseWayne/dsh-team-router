import { BUILTIN_IDS } from "./categories.js";
export function compareCategoryIds(a, b) {
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
/** Internal canonical representation of an already parsed configuration. */
export function fingerprintNormalized(config) {
    return JSON.stringify({
        version: config.version, defaultTarget: config.defaultTarget, behavior: config.behavior,
        builtins: BUILTIN_IDS.map(id => [id, config.builtins[id]?.enabled !== false, config.builtins[id]?.binding ?? { mode: 'default' }]),
        custom: [...config.custom].sort(compareCategoryIds), historyLimit: config.historyLimit,
    });
}
//# sourceMappingURL=routing-fingerprint.js.map