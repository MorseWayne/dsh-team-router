import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import type { NormalizedConfig } from '../../core/policy.ts';
import type { RoutingPolicyV2 } from '../../core/routing-policy.ts';
/** Legacy fields remain readable for migration only; V2 is one atomic volatile value. */
export declare const Config: Schema<Schemastery.ObjectS<NoInfer<{
    policyV2: Schema<any, any, "volatile">;
    routes: Schema<NoInfer<import("@deepseek-ai/cosmokit").Dict<{
        provider?: string | null;
        model?: string | null;
        reasoningEffort?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>>, NoInfer<import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "defined">;
        reasoningEffort: Schema<string, string, "plain">;
    }>>, string>>, "volatile-defined">;
    rules: Schema<NoInfer<({
        id?: string | null;
        keywords?: string[] | null;
        route?: string | null;
        priority?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: Schema<string, string, "defined">;
        keywords: Schema<string[], string[], "defined">;
        route: Schema<string, string, "defined">;
        priority: Schema<number, number, "defined">;
    }>>[]>, "volatile-defined">;
    roles: Schema<NoInfer<import("@deepseek-ai/cosmokit").Dict<string, string>>, NoInfer<import("@deepseek-ai/cosmokit").Dict<string, string>>, "volatile-defined">;
    defaultRoute: Schema<string | null, string | null, "volatile">;
    historyLimit: Schema<number, number, "volatile-defined">;
    /** Inject task-category routing guidance into the system prompt (default on). */
    nativeSubagentGuidance: Schema<boolean, boolean, "volatile-defined">;
    /** Whether the root agent passively routes delegations or proactively delegates distinct specialist tasks. */
    delegationMode: Schema<"passive" | "specialist-first", "passive" | "specialist-first", "volatile-defined">;
    /** Deny native `subagent` calls that do not match a configured category route (default off). */
    enforceNativeSubagentRouting: Schema<boolean, boolean, "volatile-defined">;
    stateDir: Schema<string, string, "plain">;
}>>, Schemastery.ObjectT<NoInfer<{
    policyV2: Schema<any, any, "volatile">;
    routes: Schema<NoInfer<import("@deepseek-ai/cosmokit").Dict<{
        provider?: string | null;
        model?: string | null;
        reasoningEffort?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>>, NoInfer<import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "defined">;
        reasoningEffort: Schema<string, string, "plain">;
    }>>, string>>, "volatile-defined">;
    rules: Schema<NoInfer<({
        id?: string | null;
        keywords?: string[] | null;
        route?: string | null;
        priority?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: Schema<string, string, "defined">;
        keywords: Schema<string[], string[], "defined">;
        route: Schema<string, string, "defined">;
        priority: Schema<number, number, "defined">;
    }>>[]>, "volatile-defined">;
    roles: Schema<NoInfer<import("@deepseek-ai/cosmokit").Dict<string, string>>, NoInfer<import("@deepseek-ai/cosmokit").Dict<string, string>>, "volatile-defined">;
    defaultRoute: Schema<string | null, string | null, "volatile">;
    historyLimit: Schema<number, number, "volatile-defined">;
    /** Inject task-category routing guidance into the system prompt (default on). */
    nativeSubagentGuidance: Schema<boolean, boolean, "volatile-defined">;
    /** Whether the root agent passively routes delegations or proactively delegates distinct specialist tasks. */
    delegationMode: Schema<"passive" | "specialist-first", "passive" | "specialist-first", "volatile-defined">;
    /** Deny native `subagent` calls that do not match a configured category route (default off). */
    enforceNativeSubagentRouting: Schema<boolean, boolean, "volatile-defined">;
    stateDir: Schema<string, string, "plain">;
}>>, "plain">;
export type Config = ReturnType<typeof Config>;
/** Read each current reference once and return a fully detached, validated policy. */
export declare function readPolicy(config: Config): NormalizedConfig;
export declare const resolvePolicy: typeof readPolicy;
export declare function readRoutingState(config: Config): {
    policy: RoutingPolicyV2;
    migrationRequired: boolean;
};
export declare function requireRoutingPolicy(config: Config): RoutingPolicyV2;
/**
 * Validate the complete candidate before native ConfigEditor persists it.
 * Keep Config an object schema so Settings can project its volatile fields.
 * Call readPolicy during activation as well: this hook protects later edits.
 */
export declare function installConfigValidation(ctx: Context, beforeMigration?: (legacy: NormalizedConfig) => void): void;
