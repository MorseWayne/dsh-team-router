import { getCategory } from "./categories.js";
const DELEGATE_FIELDS = ['category', 'prompt', 'description', 'name', 'cwd'];
export const PROMPT_LIMIT = 200_000;
export const DESCRIPTION_LIMIT = 200;
/** P0 gates are intentional: installed CLI/LLM adapters are not necessarily safe
 * out-of-process Agent backends. Do not silently downgrade to a raw shell command.
 * External executors are out of scope for this plugin; see docs/ARCHITECTURE.md.
 */
export const EXTERNAL_GATES = Object.freeze({
    codex: 'Codex task execution is not enabled: the dedicated runtime, permission roots and recursive-agent limits have not passed integration verification.',
    agy: 'Antigravity task execution is not enabled: explicit permissions, no-replay behavior, managed cancellation and recursive-agent limits have not been verified.',
    cursor: 'Cursor task execution is not enabled: the Agent backend, permission boundary, cancellation and recursive-agent limits have not been verified.',
});
/** Reject unknown, empty or oversized fields before any host side effect. */
export function validateDelegateArgs(args) {
    for (const [key, value] of Object.entries(args)) {
        if (!DELEGATE_FIELDS.includes(key))
            throw new Error(`Unknown delegation field: ${key}`);
        if (value !== undefined && (typeof value !== 'string' || value.trim() === ''))
            throw new Error(`Delegation ${key} must be a non-empty string`);
    }
    if (!args.prompt?.trim() || !args.description?.trim())
        throw new Error('Delegation requires a task prompt and description');
    if (args.prompt.length > PROMPT_LIMIT || args.description.length > DESCRIPTION_LIMIT)
        throw new Error('Task prompt or description exceeds the routing limit');
}
/** The first user message a routed child receives. */
export function buildCategoryPrompt(category, prompt) {
    return `[Task category: ${category}]\n${getCategory(category).en.purpose}\nThis category does not grant additional permissions. Deliver evidence for the requested outcome; report blockers and partial side effects.\n\n${prompt}`;
}
/** Map a host stop reason onto the audit state machine. */
export function outcomeState(stopReason) {
    return stopReason === 'completed' ? 'completed' : stopReason === 'aborted' ? 'cancelled' : 'failed';
}
export const DIAGNOSTICS = Object.freeze({
    uncertainStartup: 'Startup did not return a confirmed activation. Admission, partial effects and cleanup may be uncertain. Inspect native children before retrying; no automatic replay was attempted.',
    unknownOutcome: 'Managed execution outcome is unknown. No automatic replay was attempted.',
});
//# sourceMappingURL=delegation.js.map