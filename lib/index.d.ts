import type { Context } from '@deepseek-ai/cordis';
import { NativeTeams } from './native-team.ts';
import { Config } from './config.ts';
import { ExecutionStore } from './execution-store.ts';
export { Config } from './config.ts';
export declare const name = "team-router";
export declare const inject: string[];
/** P0 gates are intentional: installed CLI/LLM adapters are not necessarily safe
 * out-of-process Agent backends. Do not silently downgrade to a raw shell command.
 */
export declare const EXTERNAL_GATES: Readonly<{
    codex: "Codex task execution is not enabled: the dedicated runtime, permission roots and recursive-agent limits have not passed integration verification.";
    agy: "Antigravity task execution is not enabled: explicit permissions, no-replay behavior, managed cancellation and recursive-agent limits have not been verified.";
    cursor: "Cursor task execution is not enabled: the Agent backend, permission boundary, cancellation and recursive-agent limits have not been verified.";
}>;
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
    start(): Promise<void>;
    stop(): void;
}
export declare function apply(ctx: Context, config: Config): Promise<void>;
