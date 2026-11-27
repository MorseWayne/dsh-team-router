import { CATEGORY_METADATA_BOUNDARY, CUSTOM_EXPECTED_EVIDENCE, promptString } from "./prompt-metadata.js";
const DELEGATE_FIELDS = ['category', 'prompt', 'description', 'name', 'cwd'];
export const PROMPT_LIMIT = 200_000;
export const DESCRIPTION_LIMIT = 200;
/** Reject unknown, empty or oversized fields before any host side effect. */
export function validateDelegateArgs(args) {
    if (typeof args !== 'object' || args === null || Array.isArray(args))
        throw new Error('Expected delegation arguments');
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
export function buildCategoryPrompt(category, prompt) {
    const purpose = category.origin === 'custom'
        ? `Deliverable metadata (JSON): {"purpose":${promptString(category.purposeEn)}${category.avoidEn === undefined ? '' : `,"avoid":${promptString(category.avoidEn)}`}}`
        : `Deliverable: ${category.purposeEn}`;
    const evidence = category.origin === 'custom' ? CUSTOM_EXPECTED_EVIDENCE : category.deliverableCheckEn ?? CUSTOM_EXPECTED_EVIDENCE;
    return [
        `[Task category: ${category.id}]`, purpose,
        `Expected evidence: ${evidence}`,
        CATEGORY_METADATA_BOUNDARY,
        '', prompt,
    ].join('\n');
}
export function outcomeState(stopReason) {
    return stopReason === 'completed' ? 'completed' : stopReason === 'aborted' ? 'cancelled' : 'failed';
}
export const DIAGNOSTICS = Object.freeze({
    uncertainStartup: 'Startup did not return a confirmed activation. Admission, partial effects and cleanup may be uncertain. Inspect native children before retrying; no automatic replay was attempted.',
    unknownOutcome: 'Managed execution outcome is unknown. No automatic replay was attempted.',
});
//# sourceMappingURL=delegation.js.map