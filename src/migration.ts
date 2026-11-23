import { parseConfig } from './policy.ts';
import type { NormalizedConfig, RouterConfig } from './policy.ts';
import { createDefaultRoutingPolicy, parseRoutingPolicy } from './routing-policy.ts';
import type { RoutingPolicyV2 } from './routing-policy.ts';

export interface MigrationPreview {
  required: boolean;
  policy: RoutingPolicyV2;
  legacy: NormalizedConfig;
  retired: { routes: string[]; ruleCount: number; roleCount: number };
}

/** Only the exact old default is mapped. A route named "quick" is NOT a category. */
export function previewMigration(input: RouterConfig): MigrationPreview {
  const legacy = parseConfig(input);
  const policy = createDefaultRoutingPolicy();
  policy.historyLimit = legacy.historyLimit;
  const route = legacy.defaultRoute === undefined ? undefined : legacy.routes[legacy.defaultRoute];
  if (route !== undefined) policy.defaultTarget = {
    executor: 'native', model: { mode: 'explicit', provider: route.provider, id: route.model,
      ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort }) },
  };
  const retired = { routes: Object.keys(legacy.routes), ruleCount: legacy.rules.length, roleCount: Object.keys(legacy.roles).length };
  return {
    required: retired.routes.length > 0 || retired.ruleCount > 0 || retired.roleCount > 0 || legacy.defaultRoute !== undefined,
    policy: parseRoutingPolicy(policy), legacy, retired,
  };
}
