import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import { parseConfig } from './policy.ts';
import type { NormalizedConfig } from './policy.ts';
import { parseRoutingPolicy } from './routing-policy.ts';
import type { RoutingPolicyV2 } from './routing-policy.ts';
import { previewMigration } from './migration.ts';

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

/** Legacy fields remain readable for migration only; V2 is one atomic volatile value. */
export const Config = Schema.object({
  policyV2: Schema.any().volatile(),
  routes: Schema.dict(route, safeRouteName()).default({}).volatile(),
  rules: Schema.array(rule).max(64).default([]).volatile(),
  roles: Schema.dict(safeRouteName(), Schema.string().pattern(/^(?!(?:__proto__|prototype|constructor)$)[\s\S]*\S[\s\S]*$/)).default({}).volatile(),
  // Explicit null masks a default inherited from a lower configuration layer.
  defaultRoute: Schema.union([safeRouteName(), Schema.const(null)]).volatile(),
  historyLimit: Schema.number().min(1).max(1000).step(1).default(100).volatile(),
  stateDir: text(),
});
export type Config = ReturnType<typeof Config>;

/** Read each current reference once and return a fully detached, validated policy. */
export function readPolicy(config: Config): NormalizedConfig {
  return parseConfig({
    routes: config.routes.get(),
    rules: config.rules.get(),
    roles: config.roles.get(),
    defaultRoute: config.defaultRoute.get() ?? undefined,
    historyLimit: config.historyLimit.get(),
  });
}
export const resolvePolicy = readPolicy;

export function readRoutingState(config: Config): { policy: RoutingPolicyV2; migrationRequired: boolean } {
  const value: unknown = config.policyV2.get();
  if (value !== undefined) return { policy: parseRoutingPolicy(value), migrationRequired: false };
  const preview = previewMigration(readPolicy(config));
  return { policy: preview.policy, migrationRequired: preview.required };
}

export function requireRoutingPolicy(config: Config): RoutingPolicyV2 {
  const state = readRoutingState(config);
  if (state.migrationRequired) throw new Error('migration-required: confirm the legacy routing migration in Settings before delegating. Legacy keyword rules and role mappings are disabled.');
  return state.policy;
}

/**
 * Validate the complete candidate before native ConfigEditor persists it.
 * Keep Config an object schema so Settings can project its volatile fields.
 * Call readPolicy during activation as well: this hook protects later edits.
 */
export function installConfigValidation(ctx: Context, beforeMigration?: (legacy: NormalizedConfig) => void): void {
  ctx.on('internal/config', (fiber, next) => {
    const candidate: unknown = next();
    if (fiber === ctx.fiber) {
      const nextConfig = candidate as Config;
      readRoutingState(nextConfig);
      // Before native ConfigEditor can persist the V2 transition, preserve the
      // effective legacy routing configuration. A failed backup rejects the save.
      const previous = fiber.effectiveConfig as Config | undefined;
      if (beforeMigration && previous !== undefined && previous.policyV2?.get() === undefined && nextConfig.policyV2.get() !== undefined) {
        const legacy = readPolicy(previous);
        if (previewMigration(legacy).required) beforeMigration(legacy);
      }
    }
    return candidate;
  }, { prepend: true });
}
