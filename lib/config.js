import Schema from '@deepseek-ai/schemastery';
import { parseConfig } from "./policy.js";
const text = () => Schema.string().pattern(/\S/);
const safeRouteName = () => Schema.string().pattern(/^(?!\s*(?:__proto__|prototype|constructor)\s*$)[\s\S]*\S[\s\S]*$/);
const route = Schema.object({
    provider: text().required(),
    model: text().required(),
    reasoningEffort: text(),
});
const rule = Schema.object({
    id: text().required(),
    keywords: Schema.array(text().max(100)).max(32).required(),
    route: safeRouteName().required(),
    priority: Schema.number().min(-1000).max(1000).step(1).default(0),
});
/** Flat v0.1 configuration stays compatible; stateDir remains restart-only. */
export const Config = Schema.object({
    routes: Schema.dict(route, safeRouteName()).default({}).volatile(),
    rules: Schema.array(rule).max(64).default([]).volatile(),
    roles: Schema.dict(safeRouteName(), Schema.string().pattern(/^(?!(?:__proto__|prototype|constructor)$)[\s\S]*\S[\s\S]*$/)).default({}).volatile(),
    // Explicit null masks a default inherited from a lower configuration layer.
    defaultRoute: Schema.union([safeRouteName(), Schema.const(null)]).volatile(),
    historyLimit: Schema.number().min(1).max(1000).step(1).default(100).volatile(),
    stateDir: text(),
});
/** Read each current reference once and return a fully detached, validated policy. */
export function readPolicy(config) {
    return parseConfig({
        routes: config.routes.get(),
        rules: config.rules.get(),
        roles: config.roles.get(),
        defaultRoute: config.defaultRoute.get() ?? undefined,
        historyLimit: config.historyLimit.get(),
    });
}
export const resolvePolicy = readPolicy;
/**
 * Validate the complete candidate before native ConfigEditor persists it.
 * Keep Config an object schema so Settings can project its volatile fields.
 * Call readPolicy during activation as well: this hook protects later edits.
 */
export function installConfigValidation(ctx) {
    ctx.on('internal/config', (fiber, next) => {
        const candidate = next();
        if (fiber === ctx.fiber)
            readPolicy(candidate);
        return candidate;
    }, { prepend: true });
}
//# sourceMappingURL=config.js.map