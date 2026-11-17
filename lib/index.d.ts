import type { Context } from '@deepseek-ai/cordis';
import { NativeTeams } from './native-team.ts';
import { Config } from './config.ts';
export { Config } from './config.ts';
import type { NormalizedConfig } from './policy.ts';
import { StateStore } from './store.ts';
export declare const name = "team-router";
export declare const inject: string[];
/** Exposed for offline verification; mount through apply() in a real Host. */
export declare class TeamRouter {
    readonly store: StateStore;
    readonly teams: NativeTeams;
    private readonly configuration;
    get policy(): NormalizedConfig;
    private readonly states;
    private readonly runtimes;
    private readonly validated;
    private stopped;
    private readonly ctx;
    constructor(ctx: Context, config: Config);
    private state;
    private commit;
    private caller;
    /** A bounded metadata check, not a provider health, quota, or billing probe. */
    private validate;
    /** Select future steps at creation, first turn claim, task edges, or idle overrides; never rewrite an admitted step. */
    private refresh;
    private safeRefresh;
    private status;
    private tools;
    private install;
    start(): Promise<void>;
    private release;
    stop(): void;
}
export declare function apply(ctx: Context, config: Config): Promise<void>;
