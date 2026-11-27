import type { CategoryId } from './categories.ts';
import type { RoutingPolicyV2 } from './routing-policy.ts';
export declare const DELEGATION_MODES: readonly ["passive", "specialist-first", "orchestrator"];
export type DelegationMode = typeof DELEGATION_MODES[number];
export declare function isDelegationMode(value: unknown): value is DelegationMode;
export interface RoutePair {
    readonly provider: string;
    readonly model: string;
}
export interface ExplicitNativeRoute extends RoutePair {
    readonly reasoningEffort?: string;
}
export interface SessionRouteContext {
    /**
     * Session authorization snapshot:
     * - `undefined`: do not filter by session authorization (caller did not supply one).
     * - `null`: session has no policy event; only the parent route is authorized.
     * - `readonly RoutePair[]`: exact authorized provider/model pairs.
     */
    readonly authorizedRoutes?: readonly RoutePair[] | null;
    readonly parentRoute?: {
        readonly provider?: string;
        readonly model?: string;
        readonly reasoningEffort?: string | undefined;
    };
    /**
     * Controls whether the prompt proactively encourages delegating matching
     * specialist deliverables. Defaults to `'passive'`.
     */
    readonly delegationMode?: DelegationMode;
    /**
     * Only confirmed root (top-level) agents receive proactive delegation guidance;
     * child subagents stay passive to prevent recursive delegation loops.
     */
    readonly isRoot?: boolean;
}
export interface ResolvedCategoryRoute {
    readonly category: CategoryId;
    readonly mode: 'explicit' | 'inherit' | 'unauthorized' | 'external';
    readonly route?: ExplicitNativeRoute;
}
export interface NativeRoutingPlan {
    readonly entries: readonly ResolvedCategoryRoute[];
    readonly explicitRoutes: readonly ExplicitNativeRoute[];
    readonly inheritAllowed: boolean;
}
export type SubagentValidationResult = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly reason: string;
};
/**
 * Only genuine specialist deliverables participate in proactive delegation.
 * `quick` and `unspecified` stay passive so small requests and general Q&A
 * are never unnecessarily offloaded to a subagent.
 */
export declare const PROACTIVE_SPECIALIST_CATEGORIES: ReadonlySet<CategoryId>;
/**
 * Resolve all seven categories against a V2 policy into an actionable native
 * `subagent` routing plan, taking optional Session authorization into account.
 */
export declare function buildNativeRoutingPlan(policy: RoutingPolicyV2, session?: SessionRouteContext): NativeRoutingPlan;
/** Compact, turn-local policy. The host decides when and how to attach it. */
export declare function buildNativeSubagentReminder(policy: RoutingPolicyV2, session: SessionRouteContext): string;
/**
 * System prompt section for agents whose native `subagent` tool exposes
 * `provider` / `model` selection. Returns an empty string when no category
 * resolves to an authorized explicit native model.
 */
export declare function buildNativeSubagentGuidance(policy: RoutingPolicyV2, session?: SessionRouteContext): string;
/**
 * Fallback system prompt section for Team Leads on hosts where the native
 * `subagent` tool does not expose `modelSelection`, steering them toward
 * `team_route_delegate` only when explicit authorized categories exist.
 */
export declare function buildTeamFallbackGuidance(policy: RoutingPolicyV2, session?: SessionRouteContext): string;
/**
 * Strict pre-execute check for native `subagent` calls.
 * - Never blocks when no explicit authorized routes exist.
 * - Lets native `subagent` validate non-object or malformed/partial arguments.
 * - Denies omitted model arguments only when EVERY category resolves to an
 *   explicit authorized route (so `inherit` is not a configured outcome).
 * - Denies explicit model arguments whose `(provider, model, reasoning_effort)`
 *   tuple does not match any configured, authorized category route.
 */
export declare function validateNativeSubagentCall(policy: RoutingPolicyV2, args: unknown, session?: SessionRouteContext): SubagentValidationResult;
