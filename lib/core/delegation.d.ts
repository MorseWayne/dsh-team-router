import type { CategoryId } from './categories.ts';
import type { ExecutionRecord } from './execution-store.ts';
/** Host-agnostic delegation contract. Nothing here may import a host package. */
export interface DelegateArgs {
    category: string;
    prompt: string;
    description: string;
    name?: string;
    cwd?: string;
}
export declare const PROMPT_LIMIT = 200000;
export declare const DESCRIPTION_LIMIT = 200;
/** P0 gates are intentional: installed CLI/LLM adapters are not necessarily safe
 * out-of-process Agent backends. Do not silently downgrade to a raw shell command.
 * External executors are out of scope for this plugin; see docs/ARCHITECTURE.md.
 */
export declare const EXTERNAL_GATES: Readonly<{
    codex: "Codex task execution is not enabled: the dedicated runtime, permission roots and recursive-agent limits have not passed integration verification.";
    agy: "Antigravity task execution is not enabled: explicit permissions, no-replay behavior, managed cancellation and recursive-agent limits have not been verified.";
    cursor: "Cursor task execution is not enabled: the Agent backend, permission boundary, cancellation and recursive-agent limits have not been verified.";
}>;
/** Reject unknown, empty or oversized fields before any host side effect. */
export declare function validateDelegateArgs(args: DelegateArgs): void;
/** The first user message a routed child receives. */
export declare function buildCategoryPrompt(category: CategoryId, prompt: string): string;
/** Map a host stop reason onto the audit state machine. */
export declare function outcomeState(stopReason: string): ExecutionRecord['state'];
export declare const DIAGNOSTICS: Readonly<{
    uncertainStartup: "Startup did not return a confirmed activation. Admission, partial effects and cleanup may be uncertain. Inspect native children before retrying; no automatic replay was attempted.";
    unknownOutcome: "Managed execution outcome is unknown. No automatic replay was attempted.";
}>;
