import { CATEGORIES, CATEGORY_IDS } from "./categories.js";
import { resolveRoutingSnapshot } from "./routing-policy.js";
export function isDelegationMode(value) {
    return value === 'passive' || value === 'specialist-first';
}
/**
 * Only genuine specialist deliverables participate in proactive delegation.
 * `quick` and `unspecified` stay passive so small requests and general Q&A
 * are never unnecessarily offloaded to a subagent.
 */
const PROACTIVE_SPECIALIST_CATEGORIES = new Set([
    'visual-engineering', 'ultrabrain', 'deep', 'artistry', 'writing',
]);
function isRouteAuthorized(route, session) {
    if (session === undefined || session.authorizedRoutes === undefined)
        return true;
    if (session.authorizedRoutes === null) {
        return session.parentRoute?.provider === route.provider && session.parentRoute?.model === route.model;
    }
    return session.authorizedRoutes.some(entry => entry.provider === route.provider && entry.model === route.model);
}
function isDistinctFromParent(route, parent) {
    if (parent?.provider === undefined || parent.model === undefined)
        return true;
    if (route.provider !== parent.provider || route.model !== parent.model)
        return true;
    if (route.reasoningEffort !== undefined && route.reasoningEffort !== parent.reasoningEffort)
        return true;
    return false;
}
function proactiveSpecialistCategories(plan, session) {
    if (session?.delegationMode !== 'specialist-first')
        return [];
    if (session.isRoot === false)
        return [];
    return plan.entries
        .filter((entry) => entry.mode === 'explicit'
        && entry.route !== undefined
        && PROACTIVE_SPECIALIST_CATEGORIES.has(entry.category)
        && isDistinctFromParent(entry.route, session.parentRoute))
        .map(entry => entry.category);
}
function routeKey(route) {
    return JSON.stringify([route.provider, route.model, route.reasoningEffort ?? null]);
}
function formatExplicitRoute(route) {
    const base = `provider=${JSON.stringify(route.provider)}, model=${JSON.stringify(route.model)}`;
    return route.reasoningEffort === undefined
        ? `${base} (omit reasoning_effort)`
        : `${base}, reasoning_effort=${JSON.stringify(route.reasoningEffort)}`;
}
/**
 * Resolve all seven categories against a V2 policy into an actionable native
 * `subagent` routing plan, taking optional Session authorization into account.
 */
export function buildNativeRoutingPlan(policy, session) {
    const entries = [];
    const seen = new Map();
    let inheritAllowed = false;
    for (const id of CATEGORY_IDS) {
        const target = resolveRoutingSnapshot(policy, id).target;
        if (target.executor !== 'native') {
            entries.push({ category: id, mode: 'external' });
            inheritAllowed = true;
            continue;
        }
        if (target.model.mode === 'inherit') {
            entries.push({ category: id, mode: 'inherit' });
            inheritAllowed = true;
            continue;
        }
        const route = {
            provider: target.model.provider,
            model: target.model.id,
            ...(target.model.reasoningEffort === undefined ? {} : { reasoningEffort: target.model.reasoningEffort }),
        };
        if (!isRouteAuthorized(route, session)) {
            entries.push({ category: id, mode: 'unauthorized', route });
            inheritAllowed = true;
            continue;
        }
        entries.push({ category: id, mode: 'explicit', route });
        seen.set(routeKey(route), route);
    }
    return { entries, explicitRoutes: [...seen.values()], inheritAllowed };
}
function formatCategoryTable(plan) {
    return plan.entries.map(entry => {
        const purpose = CATEGORIES[entry.category].en.purpose;
        if (entry.mode === 'explicit' && entry.route !== undefined) {
            return `- ${entry.category} (${purpose}): ${formatExplicitRoute(entry.route)}`;
        }
        if (entry.mode === 'unauthorized') {
            return `- ${entry.category} (${purpose}): inherit parent model (configured route is not authorized in this Session; omit provider, model, reasoning_effort)`;
        }
        return `- ${entry.category} (${purpose}): inherit parent model (omit provider, model, reasoning_effort)`;
    });
}
/**
 * System prompt section for agents whose native `subagent` tool exposes
 * `provider` / `model` selection. Returns an empty string when no category
 * resolves to an authorized explicit native model.
 */
export function buildNativeSubagentGuidance(policy, session) {
    const plan = buildNativeRoutingPlan(policy, session);
    if (plan.explicitRoutes.length === 0)
        return '';
    const specialists = proactiveSpecialistCategories(plan, session);
    const lines = [
        'Task-category model routing is configured for the `subagent` tool.',
        'When delegating a self-contained task with `subagent`, classify the task by its primary deliverable (not keywords) and pass the matching `provider`, `model`, and `reasoning_effort` from the table below. Omit `reasoning_effort` when not listed, and omit all three fields for categories that inherit the parent model. Do not override models on `subagent_fork` or existing agents, and do not disguise a category to pick another model. Categories grant no extra permissions.',
    ];
    if (specialists.length > 0) {
        lines.push(`Specialist-first delegation is enabled for this session: when a substantive user request clearly fits one of these specialist categories whose configured model differs from your current session model (${specialists.join(', ')}), proactively delegate that self-contained work via \`subagent\` using the matching route below, then verify and synthesize the result. Answer simple Q&A, quick clarifications, small one-off edits, or tightly conversational follow-ups directly yourself without spawning a subagent, and never delegate when the user asks you to answer directly.`);
    }
    lines.push('', 'Category routes:', ...formatCategoryTable(plan));
    return lines.join('\n');
}
/**
 * Fallback system prompt section for Team Leads on hosts where the native
 * `subagent` tool does not expose `modelSelection`, steering them toward
 * `team_route_delegate` only when explicit authorized categories exist.
 */
export function buildTeamFallbackGuidance(policy, session) {
    const plan = buildNativeRoutingPlan(policy, session);
    if (plan.explicitRoutes.length === 0)
        return '';
    const configured = plan.entries
        .filter(entry => entry.mode === 'explicit')
        .map(entry => entry.category);
    const specialists = proactiveSpecialistCategories(plan, session);
    const lines = [
        'Category routing is configured for this team. When starting a NEW teammate for a self-contained task in a configured category, prefer `team_route_delegate` over `subagent` so the configured model is used. Use `subagent` or `subagent_fork` when continuing with parent history or when the user explicitly requests native delegation.',
        `Configured categories: ${configured.join(', ')} (other categories inherit the Lead model).`,
    ];
    if (specialists.length > 0) {
        lines.push(`Specialist-first delegation is enabled: for substantive self-contained tasks clearly matching a specialist category with a distinct configured model (${specialists.join(', ')}), proactively delegate via \`team_route_delegate\` and verify the result; handle simple Q&A and small edits directly.`);
    }
    return lines.join('\n');
}
/**
 * Strict pre-execute check for native `subagent` calls.
 * - Never blocks when no explicit authorized routes exist.
 * - Lets native `subagent` validate non-object or malformed/partial arguments.
 * - Denies omitted model arguments only when EVERY category resolves to an
 *   explicit authorized route (so `inherit` is not a configured outcome).
 * - Denies explicit model arguments whose `(provider, model, reasoning_effort)`
 *   tuple does not match any configured, authorized category route.
 */
export function validateNativeSubagentCall(policy, args, session) {
    const plan = buildNativeRoutingPlan(policy, session);
    if (plan.explicitRoutes.length === 0)
        return { ok: true };
    if (typeof args !== 'object' || args === null || Array.isArray(args))
        return { ok: true };
    const record = args;
    const provider = record.provider;
    const model = record.model;
    const effort = record.reasoning_effort;
    // No explicit route supplied.
    if (provider === undefined && model === undefined && effort === undefined) {
        if (plan.inheritAllowed)
            return { ok: true };
        return {
            ok: false,
            reason: [
                'Strict task-category routing is enabled: every category maps to an explicit configured model, so `subagent` calls must specify `provider` and `model` (and `reasoning_effort` when configured). Classify the task by its primary deliverable and retry with one of:',
                ...formatCategoryTable(plan),
            ].join('\n'),
        };
    }
    // Let native `subagent` reject malformed or partial model fields with its own errors.
    if (typeof provider !== 'string' || typeof model !== 'string' || (effort !== undefined && typeof effort !== 'string')) {
        return { ok: true };
    }
    const normalizedEffort = effort === undefined ? undefined : effort;
    const requestedKey = routeKey({
        provider,
        model,
        ...(normalizedEffort === undefined ? {} : { reasoningEffort: normalizedEffort }),
    });
    if (plan.explicitRoutes.some(route => routeKey(route) === requestedKey)) {
        return { ok: true };
    }
    const label = normalizedEffort === undefined
        ? `${provider}/${model}`
        : `${provider}/${model} (reasoning_effort=${normalizedEffort})`;
    const suffix = plan.inheritAllowed
        ? 'Or omit `provider`, `model`, and `reasoning_effort` for categories that inherit the parent model.'
        : 'Every category has an explicit route; do not omit `provider` and `model`.';
    return {
        ok: false,
        reason: [
            `Model route "${label}" does not match any configured category route in team-router. Re-classify the task by its primary deliverable and retry \`subagent\` with one of:`,
            ...formatCategoryTable(plan),
            suffix,
        ].join('\n'),
    };
}
//# sourceMappingURL=native-subagent.js.map