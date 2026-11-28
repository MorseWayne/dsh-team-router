import type { ActiveCategory, ActiveRegistry } from './active-registry.ts';
import type { RoutingConfig } from './routing-policy.ts';
export interface RoutePair {
    readonly provider: string;
    readonly model: string;
}
export interface ExplicitNativeRoute extends RoutePair {
    readonly reasoningEffort?: string;
}
export interface SessionRouteContext {
    /** undefined: no filter; null: parent pair only; list: exact Session grants. */
    readonly authorizedRoutes?: readonly RoutePair[] | null;
    /** The Session projection failed to read; neither grants nor fallback are verified. */
    readonly authorizationUnavailable?: boolean;
    readonly parentRoute?: {
        readonly provider?: string;
        readonly model?: string;
        readonly reasoningEffort?: string | undefined;
    };
    readonly isRoot?: boolean;
}
interface CategoryIdentity {
    readonly category: string;
    readonly entry: ActiveCategory;
}
export type ResolvedCategoryRoute = CategoryIdentity & ({
    readonly mode: 'inherit';
    readonly route?: never;
} | {
    readonly mode: 'explicit' | 'unauthorized';
    readonly route: ExplicitNativeRoute;
});
type AuthorizedCategoryRoute = CategoryIdentity & {
    readonly mode: 'explicit';
    readonly route: ExplicitNativeRoute;
};
export interface SessionRouteGroup {
    readonly route: ExplicitNativeRoute;
    readonly entries: readonly AuthorizedCategoryRoute[];
}
export interface SessionRoutingPlan {
    readonly entries: readonly ResolvedCategoryRoute[];
    readonly explicitRoutes: readonly ExplicitNativeRoute[];
    readonly explicitGroups: readonly SessionRouteGroup[];
    readonly inheritAllowed: boolean;
}
export type SubagentValidationResult = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly reason: string;
};
export declare function projectSessionPlan(registry: ActiveRegistry, session?: SessionRouteContext): SessionRoutingPlan;
export declare function buildNativeRoutingPlan(config: RoutingConfig, session?: SessionRouteContext): SessionRoutingPlan;
export declare function buildNativeSubagentGuidance(config: RoutingConfig, session?: SessionRouteContext): string;
export declare function buildNativeSubagentReminder(config: RoutingConfig, session: SessionRouteContext): string;
export declare function buildTeamFallbackGuidance(config: RoutingConfig, session?: SessionRouteContext): string;
export declare function validateNativeSubagentCall(config: RoutingConfig, args: unknown, session?: SessionRouteContext): SubagentValidationResult;
export {};
