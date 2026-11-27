import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import { createDefaultRoutingConfig, parseRoutingConfig } from '../../core/routing-policy.ts';
import type { RoutingConfig } from '../../core/routing-policy.ts';

const text = () => Schema.string().pattern(/\S/);
// Keep routing volatile and without a schema default: absence selects the new-install
// preset; any present V3 object uses its own per-category compatibility defaults.
export const Config = Schema.object({ routing: Schema.any().volatile(), stateDir: text() });
export type Config = ReturnType<typeof Config>;

export function readRoutingConfig(config: Config): RoutingConfig {
  const raw: unknown = config.routing.get();
  return raw === undefined ? createDefaultRoutingConfig() : parseRoutingConfig(raw);
}

// T8: replace this Cordis-internal hook when the Host offers public pre-save validation.
export function installConfigValidation(ctx: Context): void {
  ctx.on('internal/config', (fiber, next) => {
    const candidate: unknown = next();
    if (fiber === ctx.fiber) readRoutingConfig(candidate as Config);
    return candidate;
  }, { prepend: true });
}
