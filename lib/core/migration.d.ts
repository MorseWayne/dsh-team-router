import type { NormalizedConfig, RouterConfig } from './policy.ts';
import type { RoutingPolicyV2 } from './routing-policy.ts';
export interface MigrationPreview {
    required: boolean;
    policy: RoutingPolicyV2;
    legacy: NormalizedConfig;
    retired: {
        routes: string[];
        ruleCount: number;
        roleCount: number;
    };
}
/** Only the exact old default is mapped. A route named "quick" is NOT a category. */
export declare function previewMigration(input: RouterConfig): MigrationPreview;
