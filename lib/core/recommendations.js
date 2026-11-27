import { BUILTIN_LIST } from "./categories.js";
import { resolveActiveRegistry } from "./active-registry.js";
import { routingConfigFingerprint } from "./routing-policy.js";
/** Curated exact IDs, not benchmark rankings or promises of availability or authorization. */
export const RECOMMENDATION_VERSION = '2026-11-27.1';
const candidate = (provider, model) => Object.freeze({ provider, model });
const sonnet = candidate('anthropic', 'claude-sonnet-4-5');
const opus = candidate('anthropic', 'claude-opus-4-1');
const geminiPro = candidate('google', 'gemini-2.5-pro');
const geminiFlash = candidate('google', 'gemini-2.5-flash');
const codex = candidate('openai', 'gpt-5-codex');
const mini = candidate('openai', 'gpt-5-mini');
const chat = candidate('deepseek', 'deepseek-chat');
const reasoner = candidate('deepseek', 'deepseek-reasoner');
const astra = candidate('openai-codex', 'gpt-6-astra');
const subscriptionMini = candidate('openai-codex', 'gpt-5.4-mini');
const argon = candidate('antigravity', 'gemini-4-argon');
const agyOpus = candidate('antigravity', 'claude-opus-5-5');
const agySonnet = candidate('antigravity', 'claude-sonnet-5-5');
const agyFlash = candidate('antigravity', 'gemini-3.8-flash');
export const RECOMMENDATION_CANDIDATES = Object.freeze({
    'visual-engineering': Object.freeze([argon, agyOpus, astra, geminiPro, sonnet, codex]),
    'frontend-engineering': Object.freeze([agySonnet, astra, geminiPro, codex, sonnet]),
    'backend-data': Object.freeze([astra, agySonnet, reasoner, codex, sonnet, geminiPro]),
    deep: Object.freeze([agySonnet, astra, geminiPro, agyOpus, codex, sonnet, chat]),
    debugging: Object.freeze([astra, agyOpus, reasoner, codex, opus, geminiPro]),
    'code-review': Object.freeze([agyOpus, astra, reasoner, agySonnet, codex, opus]),
    'verification-automation': Object.freeze([codex, agySonnet, geminiPro, astra, sonnet, subscriptionMini, mini]),
    ultrabrain: Object.freeze([astra, agyOpus, reasoner, opus, geminiPro]),
    artistry: Object.freeze([agyOpus, argon, astra, opus, geminiPro, sonnet]),
    writing: Object.freeze([agySonnet, astra, chat, sonnet, argon, geminiPro]),
    quick: Object.freeze([subscriptionMini, agyFlash, chat, mini, geminiFlash]),
    unspecified: Object.freeze([agySonnet, subscriptionMini, chat, sonnet, geminiFlash]),
});
export function previewRecommendations(input, catalog, options = {}) {
    const registry = resolveActiveRegistry(input);
    const baselineFingerprint = routingConfigFingerprint(registry.config);
    const config = structuredClone(registry.config);
    const changes = [];
    const preserved = [];
    const unavailable = [];
    const skippedDisabled = [];
    const overwrite = options.overwrite === true;
    for (const { id, group } of BUILTIN_LIST) {
        if (options.group !== undefined && options.group !== group)
            continue;
        if (!registry.byId.has(id)) {
            skippedDisabled.push(id);
            continue;
        }
        const before = config.builtins[id]?.binding ?? { mode: 'default' };
        if (before.mode !== 'default' && !overwrite) {
            preserved.push(id);
            continue;
        }
        const match = RECOMMENDATION_CANDIDATES[id].find(entry => !catalog.failures.some(failure => failure.id === entry.provider)
            && catalog.groups.some(group => group.id === entry.provider && group.models.some(model => model.id === entry.model)));
        if (!match) {
            unavailable.push(id);
            continue;
        }
        const after = { mode: 'explicit', provider: match.provider, model: match.model };
        if (JSON.stringify(before) === JSON.stringify(after))
            continue;
        changes.push({ category: id, before: structuredClone(before), after: { ...after } });
        config.builtins[id] = { ...config.builtins[id], binding: after };
    }
    return {
        manifestVersion: RECOMMENDATION_VERSION, baselineFingerprint, config, changes, preserved, unavailable, skippedDisabled, overwrite,
        ...(options.group === undefined ? {} : { group: options.group }),
    };
}
//# sourceMappingURL=recommendations.js.map