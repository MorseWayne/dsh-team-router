import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import type { RoutingConfig } from '../../core/routing-policy.ts';
export declare const Config: Schema<Schemastery.ObjectS<NoInfer<{
    routing: Schema<any, any, "volatile">;
    stateDir: Schema<string, string, "plain">;
}>>, Schemastery.ObjectT<NoInfer<{
    routing: Schema<any, any, "volatile">;
    stateDir: Schema<string, string, "plain">;
}>>, "plain">;
export type Config = ReturnType<typeof Config>;
export declare function readRoutingConfig(config: Config): RoutingConfig;
export declare function installConfigValidation(ctx: Context): void;
