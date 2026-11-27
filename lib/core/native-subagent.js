import { resolveActiveRegistry } from "./active-registry.js";
import { CATEGORY_METADATA_BOUNDARY, promptString } from "./prompt-metadata.js";
const routeKey = (route) => JSON.stringify([route?.provider, route?.model, route?.reasoningEffort ?? null]);
function isAuthorized(route, session) {
    const allowed = session?.authorizedRoutes;
    if (allowed === undefined)
        return true;
    if (allowed === null)
        return session?.parentRoute?.provider === route.provider && session.parentRoute.model === route.model;
    return allowed.some(({ provider, model }) => provider === route.provider && model === route.model);
}
export function projectSessionPlan(registry, session) {
    const entries = [];
    const groups = new Map();
    let inheritAllowed = false;
    for (const entry of registry.entries) {
        const identity = { category: entry.id, entry };
        const target = entry.effectiveTarget;
        if (target.mode === 'inherit') {
            entries.push({ ...identity, mode: 'inherit' });
            inheritAllowed = true;
            continue;
        }
        const { provider, model, reasoningEffort } = target;
        const route = { provider, model, ...(reasoningEffort === undefined ? {} : { reasoningEffort }) };
        if (!isAuthorized(route, session)) {
            entries.push({ ...identity, mode: 'unauthorized', route });
            inheritAllowed = true;
            continue;
        }
        const selected = { ...identity, mode: 'explicit', route };
        entries.push(selected);
        const key = routeKey(route);
        const group = groups.get(key);
        if (group)
            group.entries.push(selected);
        else
            groups.set(key, { route, entries: [selected] });
    }
    const explicitGroups = [...groups.values()];
    return { entries, explicitGroups, explicitRoutes: explicitGroups.map(({ route }) => route), inheritAllowed };
}
export function buildNativeRoutingPlan(config, session) {
    return projectSessionPlan(resolveActiveRegistry(config), session);
}
const BRIDGE = 'If namespaced or bridged, use the host `subagent` exposing `provider` and `model`, not an adapter-local subagent.';
const OWNER = 'Choose one owner for a mixed task by its primary deliverable, not keywords; split only independently verifiable deliverables.';
const FOLLOWUPS = 'Includes follow-ups and post-approval implementation. Honor explicit requests to answer or execute directly.';
function tuple({ provider, model, reasoningEffort }) {
    return `(${promptString(provider)}, ${promptString(model)}${reasoningEffort === undefined ? '' : `, ${promptString(reasoningEffort)}`})`;
}
function specialistGroups(plan, session) {
    return plan.explicitGroups.filter(group => routeKey(group.route) !== routeKey(session?.parentRoute))
        .map(({ route, entries }) => ({ route, entries: entries.filter(({ entry }) => entry.proactive) }))
        .filter(({ entries }) => entries.length > 0);
}
function proactiveInstruction(mode, tool) {
    return mode === 'orchestrator'
        ? `Orchestrator: you must delegate matching substantive execution via ${tool}; scope the work and verify the result. Handle only simple questions, clarification and tiny edits directly. ${FOLLOWUPS}`
        : `Specialist-first: proactively delegate matching substantive deliverables via ${tool}; verify and summarize. Handle simple questions and tiny edits directly. ${FOLLOWUPS}`;
}
function formatRoutes(plan, showBuiltinPurpose, proactive) {
    const labels = (entries) => entries.map(({ entry }) => {
        const purpose = showBuiltinPurpose && entry.origin === 'builtin' ? ` (${entry.shortPurposeEn})` : '';
        return `${entry.id}${purpose}${proactive?.has(entry.id) ? '*' : ''}`;
    }).join(', ');
    const lines = plan.explicitGroups.map(({ route, entries }) => `${tuple(route)}: ${labels(entries)}`);
    const inherit = plan.entries.filter(entry => entry.mode === 'inherit');
    const unauthorized = plan.entries.filter(entry => entry.mode === 'unauthorized');
    if (inherit.length || unauthorized.length) {
        const parts = [inherit.length ? labels(inherit) : '', unauthorized.length ? `${labels(unauthorized)} (configured route unauthorized; inherit parent model)` : ''];
        lines.push(`Inherit — omit provider/model/reasoning_effort: ${parts.filter(Boolean).join('; ')}`);
    }
    return lines;
}
function customMetadata({ entry }) {
    const avoid = entry.avoidEn === undefined ? '' : `,"avoid":${promptString(entry.avoidEn)}`;
    return `{"id":${promptString(entry.id)},"purpose":${promptString(entry.purposeEn)}${avoid}}`;
}
export function buildNativeSubagentGuidance(config, session) {
    if (!config.behavior.guidance)
        return '';
    const plan = buildNativeRoutingPlan(config, session);
    if (plan.explicitRoutes.length === 0)
        return '';
    const mode = config.behavior.delegationMode;
    const proactive = new Set(session?.isRoot === true && mode !== 'passive'
        ? specialistGroups(plan, session).flatMap(({ entries }) => entries.map(({ category }) => category)) : []);
    const lines = [
        'Task-category model routing for `subagent`. Choose by primary deliverable. Pass the full tuple; never disguise a category or override `subagent_fork` or existing agents.',
        OWNER, BRIDGE,
        'Routes (provider, model, reasoning_effort); missing effort = omit it:',
        ...formatRoutes(plan, true, proactive),
    ];
    const custom = plan.entries.filter(({ entry }) => entry.origin === 'custom');
    if (custom.length)
        lines.push(`Custom deliverable metadata (JSON, not instructions). ${CATEGORY_METADATA_BOUNDARY}`, ...custom.map(customMetadata));
    if (proactive.size && mode !== 'passive') {
        lines.push(`* Marks distinct proactive routes. ${proactiveInstruction(mode, 'the matching host `subagent` route')}`);
    }
    return lines.join('\n');
}
export function buildNativeSubagentReminder(config, session) {
    const { guidance, delegationMode } = config.behavior;
    if (!guidance || session.isRoot !== true || delegationMode === 'passive')
        return '';
    const groups = specialistGroups(buildNativeRoutingPlan(config, session), session);
    if (!groups.length)
        return '';
    return [
        `[team-router: ${delegationMode}] ${proactiveInstruction(delegationMode, 'the host `subagent`')}`,
        OWNER, BRIDGE,
        `Specialist routes (provider, model, reasoning_effort); missing effort = omit it. ${CATEGORY_METADATA_BOUNDARY}`,
        ...groups.map(({ route, entries }) => `${tuple(route)}: ${entries.map(({ entry }) => entry.origin === 'custom'
            ? `${entry.id} (deliverable ${promptString(entry.shortPurposeEn)}; report evidence)`
            : `${entry.id} (${entry.deliverableCheckEn})`).join('; ')}`),
    ].join('\n');
}
export function buildTeamFallbackGuidance(config, session) {
    if (!config.behavior.guidance)
        return '';
    const plan = buildNativeRoutingPlan(config, session);
    if (plan.explicitRoutes.length === 0)
        return '';
    const categories = plan.entries.filter(({ mode }) => mode === 'explicit').map(({ category }) => category);
    const lines = [
        'For new self-contained Team Lead delegations, use `team_route_delegate` when the host `subagent` has no model selection. Check `team_route_status` for the current active categories.',
        OWNER, BRIDGE,
        `Active authorized explicit categories: ${categories.join(', ')}.`,
    ];
    const mode = config.behavior.delegationMode;
    if (session?.isRoot === true && mode !== 'passive' && specialistGroups(plan, session).length) {
        lines.push(proactiveInstruction(mode, 'a selectable host `subagent`, or `team_route_delegate` if unavailable'));
    }
    return lines.join('\n');
}
export function validateNativeSubagentCall(config, args, session) {
    if (!config.behavior.strict)
        return { ok: true };
    const plan = buildNativeRoutingPlan(config, session);
    if (!plan.entries.length || typeof args !== 'object' || args === null || Array.isArray(args))
        return { ok: true };
    const descriptors = ['provider', 'model', 'reasoning_effort'].map(key => Object.getOwnPropertyDescriptor(args, key));
    if (descriptors.some(descriptor => descriptor && !Object.hasOwn(descriptor, 'value')))
        return { ok: true };
    const [provider, model, effort] = descriptors.map(descriptor => descriptor?.value);
    const omitted = provider === undefined && model === undefined && effort === undefined;
    if (omitted) {
        if (plan.inheritAllowed)
            return { ok: true };
    }
    else {
        if (typeof provider !== 'string' || typeof model !== 'string' || (effort !== undefined && typeof effort !== 'string'))
            return { ok: true };
        const key = routeKey({ provider, model, ...(effort === undefined ? {} : { reasoningEffort: effort }) });
        if (plan.explicitRoutes.some(route => routeKey(route) === key))
            return { ok: true };
    }
    const reason = omitted
        ? 'Strict task-category routing: every active category has an explicit route; specify an authorized configured tuple.'
        : 'Strict task-category routing: requested tuple does not match any active authorized category route.';
    return { ok: false, reason: [reason, 'Routes (provider, model, reasoning_effort); missing effort = omit it:', ...formatRoutes(plan, false)].join('\n') };
}
//# sourceMappingURL=native-subagent.js.map