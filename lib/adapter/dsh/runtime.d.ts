import type { Context } from '@deepseek-ai/cordis';
import type { ContextFormed } from '@deepseek-ai/dsh-llm';
import { NativeTeams } from './native-team.ts';
import { Config } from './config.ts';
import { ExecutionStore } from '../../core/execution-store.ts';
export { Config } from './config.ts';
export declare const name = "team-router";
export declare const inject: string[];
declare const REMINDER_SOURCE = "team-router:reminder";
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        [REMINDER_SOURCE]: {
            kind: typeof REMINDER_SOURCE;
        } & ContextFormed;
    }
}
export declare class TeamRouter {
    readonly teams: NativeTeams;
    readonly store: ExecutionStore;
    private readonly registrations;
    private readonly active;
    private authorization;
    private stopped;
    private readonly ctx;
    private readonly configuration;
    constructor(ctx: Context, configuration: Config);
    private caller;
    private preflight;
    private delegate;
    private install;
    private release;
    private isLiveRoot;
    private sessionAuthorization;
    private guidanceState;
    private renderPromptGuidance;
    start(): Promise<void>;
    stop(): void;
}
export declare function apply(ctx: Context, config: Config): Promise<void>;
