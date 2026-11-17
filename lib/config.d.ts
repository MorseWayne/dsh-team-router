import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import type { NormalizedConfig } from './policy.ts';
/** Flat v0.1 configuration stays compatible; stateDir remains restart-only. */
export declare const Config: Schema<Schemastery.ObjectS<NoInfer<{
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
    stateDir: Schema<string, string, "plain">;
}>>, Schemastery.ObjectT<NoInfer<{
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
    stateDir: Schema<string, string, "plain">;
}>>, "plain">;
export type Config = ReturnType<typeof Config>;
/** Read each current reference once and return a fully detached, validated policy. */
export declare function readPolicy(config: Config): NormalizedConfig;
export declare const resolvePolicy: typeof readPolicy;
/**
 * Validate the complete candidate before native ConfigEditor persists it.
 * Keep Config an object schema so Settings can project its volatile fields.
 * Call readPolicy during activation as well: this hook protects later edits.
 */
export declare function installConfigValidation(ctx: Context): void;
