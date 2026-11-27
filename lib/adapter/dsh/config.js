import Schema from '@deepseek-ai/schemastery';
import { createDefaultRoutingConfig, parseRoutingConfig } from "../../core/routing-policy.js";
const text = () => Schema.string().pattern(/\S/);
export const Config = Schema.object({ routing: Schema.any().volatile(), stateDir: text() });
export function readRoutingConfig(config) {
    const raw = config.routing.get();
    return raw === undefined ? createDefaultRoutingConfig() : parseRoutingConfig(raw);
}
// T8: replace this Cordis-internal hook when the Host offers public pre-save validation.
export function installConfigValidation(ctx) {
    ctx.on('internal/config', (fiber, next) => {
        const candidate = next();
        if (fiber === ctx.fiber)
            readRoutingConfig(candidate);
        return candidate;
    }, { prepend: true });
}
//# sourceMappingURL=config.js.map