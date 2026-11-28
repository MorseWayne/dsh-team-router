import { BUILTIN_LIST } from './categories.ts';
import type { BuiltinGroupId, BuiltinId } from './categories.ts';
import { resolveActiveRegistry } from './active-registry.ts';
import { routingConfigFingerprint } from './routing-policy.ts';
import type { Binding, RoutingConfig, Target } from './routing-policy.ts';

export interface CatalogModel {
  id: string;
  name: string;
  reasoning?: { efforts: Array<{ id: string; name: string }>; defaultEffort?: string };
}
export interface ModelCatalog {
  groups: Array<{ id: string; name: string; models: CatalogModel[] }>;
  failures: Array<{ id: string; name: string; message: string }>;
}
export interface RecommendationCandidate { readonly provider: string; readonly model: string; readonly preferredEffort?: string }

/** Curated exact IDs, not benchmark rankings or promises of availability or authorization. */
export const RECOMMENDATION_VERSION = '2026-11-28.1';
const candidate = (provider: string, model: string, preferredEffort?: string): RecommendationCandidate =>
  Object.freeze({ provider, model, ...(preferredEffort === undefined ? {} : { preferredEffort }) });
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

const fastLeaders = [subscriptionMini, agyFlash, chat] as const;
const fastAlternates = [mini, geminiFlash,
  candidate('antigravity-acp', 'gemini-4-hydrogen', 'low'), candidate('openai-codex', 'gpt-6.2-sol', 'low'),
  candidate('antigravity-acp', 'gemini-4-neon', 'low'), candidate('openai-codex', 'gpt-6.2-astra', 'low'),
  candidate(astra.provider, astra.model, 'low'), candidate(codex.provider, codex.model, 'low'),
] as const;

export const RECOMMENDATION_CANDIDATES: Readonly<Record<BuiltinId, readonly RecommendationCandidate[]>> = Object.freeze({
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
  scout: Object.freeze([...fastLeaders, candidate('antigravity-acp', 'gemini-3.8-flash', 'low'), ...fastAlternates]),
  quick: Object.freeze([...fastLeaders, ...fastAlternates]),
  unspecified: Object.freeze([agySonnet, subscriptionMini, chat, sonnet, geminiFlash]),
});

export interface RecommendationChange {
  category: BuiltinId;
  before: Binding;
  after: Extract<Target, { mode: 'explicit' }>;
}
export interface RecommendationPreview {
  manifestVersion: string;
  baselineFingerprint: string;
  config: RoutingConfig;
  changes: RecommendationChange[];
  preserved: BuiltinId[];
  unavailable: BuiltinId[];
  skippedDisabled: BuiltinId[];
  overwrite: boolean;
  group?: BuiltinGroupId;
}

function recommendedTarget(candidates: readonly RecommendationCandidate[], catalog: ModelCatalog): RecommendationChange['after'] | undefined {
  for (const { provider, model, preferredEffort } of candidates) {
    if (catalog.failures.some(failure => failure.id === provider)) continue;
    const match = catalog.groups.find(group => group.id === provider)?.models.find(entry => entry.id === model);
    if (!match) continue;
    return { mode: 'explicit', provider, model,
      ...(preferredEffort !== undefined && match.reasoning?.efforts.some(e => e.id === preferredEffort)
        ? { reasoningEffort: preferredEffort } : {}),
    };
  }
  return undefined;
}

export function previewRecommendations(
  input: unknown,
  catalog: ModelCatalog,
  options: { overwrite?: boolean; group?: BuiltinGroupId } = {},
): RecommendationPreview {
  const registry = resolveActiveRegistry(input);
  const baselineFingerprint = routingConfigFingerprint(registry.config);
  const config = structuredClone(registry.config);
  const changes: RecommendationChange[] = [];
  const preserved: BuiltinId[] = [];
  const unavailable: BuiltinId[] = [];
  const skippedDisabled: BuiltinId[] = [];
  const overwrite = options.overwrite === true;
  for (const { id, group } of BUILTIN_LIST) {
    if (options.group !== undefined && options.group !== group) continue;
    if (!registry.byId.has(id)) { skippedDisabled.push(id); continue; }
    const before = config.builtins[id]?.binding ?? { mode: 'default' };
    if (before.mode !== 'default' && !overwrite) { preserved.push(id); continue; }
    const after = recommendedTarget(RECOMMENDATION_CANDIDATES[id], catalog);
    if (!after) { unavailable.push(id); continue; }
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changes.push({ category: id, before: structuredClone(before), after: { ...after } });
    config.builtins[id] = { ...config.builtins[id], binding: after };
  }
  return {
    manifestVersion: RECOMMENDATION_VERSION, baselineFingerprint, config, changes, preserved, unavailable, skippedDisabled, overwrite,
    ...(options.group === undefined ? {} : { group: options.group }),
  };
}
