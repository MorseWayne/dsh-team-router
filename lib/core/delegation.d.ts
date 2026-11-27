import type { ActiveCategory } from './active-registry.ts';
import type { ExecutionRecord } from './execution-store.ts';
export interface DelegateArgs {
    category: string;
    prompt: string;
    description: string;
    name?: string;
    cwd?: string;
}
export declare const PROMPT_LIMIT = 200000;
export declare const DESCRIPTION_LIMIT = 200;
/** Reject unknown, empty or oversized fields before any host side effect. */
export declare function validateDelegateArgs(args: DelegateArgs): void;
export declare function buildCategoryPrompt(category: ActiveCategory, prompt: string): string;
export declare function outcomeState(stopReason: string): ExecutionRecord['state'];
export declare const DIAGNOSTICS: Readonly<{
    uncertainStartup: "Startup did not return a confirmed activation. Admission, partial effects and cleanup may be uncertain. Inspect native children before retrying; no automatic replay was attempted.";
    unknownOutcome: "Managed execution outcome is unknown. No automatic replay was attempted.";
}>;
