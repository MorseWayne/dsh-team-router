import { CATEGORY_IDS } from './categories.ts';
import type { CategoryId } from './categories.ts';
import { parseRoutingPolicy } from './routing-policy.ts';
import type { CategoryBinding, RoutingPolicyV2, Target } from './routing-policy.ts';

export interface CatalogModel {
  id: string;
  name: string;
  reasoning?: { efforts: Array<{ id: string; name: string }>; defaultEffort?: string };
}
export interface ModelCatalog {
  groups: Array<{ id: string; name: string; models: CatalogModel[] }>;
  failures: Array<{ id: string; name: string; message: string }>;
}
export interface RecommendationCandidate { readonly provider: string; readonly model: string }

/**
 * Curated, exact IDs, not benchmark rankings or a promise of account availability.
 * These public model names are examples of suitable capabilities. Provider IDs must
 * match the actual Host exactly; no aliases, fuzzy matching, price or authorization claims.
 */
export const RECOMMENDATION_VERSION = '2026-11-24.1';
const candidate = (provider: string, model: string): RecommendationCandidate => Object.freeze({ provider, model });
const sonnet = candidate('anthropic', 'claude-sonnet-4-5');
const opus = candidate('anthropic', 'claude-opus-4-1');
const geminiPro = candidate('google', 'gemini-2.5-pro');
const geminiFlash = candidate('google', 'gemini-2.5-flash');
const codex = candidate('openai', 'gpt-5-codex');
const mini = candidate('openai', 'gpt-5-mini');
const chat = candidate('deepseek', 'deepseek-chat');
const reasoner = candidate('deepseek', 'deepseek-reasoner');
// Exact IDs verified in installed dsh-codex-subscription 3.2.25 and
// dsh-agy-link 0.6.38 source catalogs. They still require live catalog matches.
// These select native LLM adapters, NOT the gated external Agent executors.
const astra = candidate('openai-codex', 'gpt-6-astra');
const subscriptionMini = candidate('openai-codex', 'gpt-5.4-mini');
const argon = candidate('antigravity', 'gemini-4-argon');
const agyOpus = candidate('antigravity', 'claude-opus-5-5');
const agySonnet = candidate('antigravity', 'claude-sonnet-5-5');
const agyFlash = candidate('antigravity', 'gemini-3.8-flash');

export const RECOMMENDATION_CANDIDATES: Readonly<Record<CategoryId, readonly RecommendationCandidate[]>> = Object.freeze({
  'visual-engineering': Object.freeze([argon, agyOpus, astra, geminiPro, sonnet, codex]),
  ultrabrain: Object.freeze([astra, agyOpus, reasoner, opus, geminiPro]),
  deep: Object.freeze([agySonnet, astra, geminiPro, agyOpus, codex, sonnet, chat]),
  artistry: Object.freeze([agyOpus, argon, astra, opus, geminiPro, sonnet]),
  quick: Object.freeze([subscriptionMini, agyFlash, chat, mini, geminiFlash]),
  unspecified: Object.freeze([agySonnet, subscriptionMini, chat, sonnet, geminiFlash]),
  writing: Object.freeze([agySonnet, astra, chat, sonnet, argon, geminiPro]),
});

export interface RecommendationChange {
  category: CategoryId;
  before: CategoryBinding;
  after: { mode: 'target'; target: Target };
}
export interface RecommendationPreview {
  manifestVersion: string;
  baselineFingerprint: string;
  policy: RoutingPolicyV2;
  changes: RecommendationChange[];
  preserved: CategoryId[];
  unavailable: CategoryId[];
  overwrite: boolean;
}

/** Stable across category insertion order and absent versus explicit default bindings. */
export function routingPolicyFingerprint(input: unknown): string {
  const policy = parseRoutingPolicy(input);
  return JSON.stringify({
    version: 2, defaultTarget: policy.defaultTarget, historyLimit: policy.historyLimit,
    categories: CATEGORY_IDS.map((id) => [id, policy.categories[id] ?? { mode: 'default' }]),
  });
}

/** Read-only preview. Applying it to a draft and persisting it are separate user actions. */
export function previewRecommendations(
  input: unknown,
  catalog: ModelCatalog,
  options: { overwrite?: boolean } = {},
): RecommendationPreview {
  const policy = parseRoutingPolicy(input);
  const baselineFingerprint = routingPolicyFingerprint(policy);
  const changes: RecommendationChange[] = [];
  const preserved: CategoryId[] = [];
  const unavailable: CategoryId[] = [];
  const overwrite = options.overwrite === true;
  for (const id of CATEGORY_IDS) {
    const before = policy.categories[id] ?? { mode: 'default' as const };
    if (before.mode === 'target' && !overwrite) { preserved.push(id); continue; }
    const match = RECOMMENDATION_CANDIDATES[id].find((entry) =>
      !catalog.failures.some((failure) => failure.id === entry.provider)
      && catalog.groups.some((group) => group.id === entry.provider
        && group.models.some((model) => model.id === entry.model)));
    if (!match) { unavailable.push(id); continue; }
    const after: RecommendationChange['after'] = {
      mode: 'target', target: {
        executor: 'native', model: { mode: 'explicit', provider: match.provider, id: match.model },
      },
    };
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changes.push({ category: id, before: structuredClone(before), after: structuredClone(after) });
    policy.categories[id] = after;
  }
  return { manifestVersion: RECOMMENDATION_VERSION, baselineFingerprint, policy, changes, preserved, unavailable, overwrite };
}
