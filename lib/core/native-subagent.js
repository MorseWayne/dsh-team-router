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
    if (session?.authorizationUnavailable)
        throw new Error(AUTHORIZATION_UNAVAILABLE);
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
const AUTHORIZATION_UNAVAILABLE = 'authorization-unavailable: Cannot read Session model grants; explicit specialist routes are unverified.';
const NO_AUTHORIZED_ROUTES = 'No explicit specialist route is authorized in this Session.';
const GRANT_IN_NEW_SESSION = 'For explicit routes, allow the needed models in settings and start a new Session.';
const BRIDGE = 'Even when namespaced or bridged, use host `subagent`, not adapter-local tools.';
const OWNER = 'One owner per deliverable, not keywords; split only independently verifiable work.';
const BRIEF = 'State scope, checks, and when to stop and hand back.';
const RECEIPT = 'No closing text does not mean no effects. Check files and prior messages before claiming completion or retrying.';
const SCOUT_HINT = 'Read known items directly. For broad unknowns, scout may gather a read-only evidence pack; clear scope or same model: owner handles it.';
function tuple({ provider, model, reasoningEffort }) {
    return `(${promptString(provider)}, ${promptString(model)}${reasoningEffort === undefined ? '' : `, ${promptString(reasoningEffort)}`})`;
}
function specialistGroups(config, plan, session) {
    if (!config.behavior.guidance || session?.isRoot !== true || config.behavior.delegationMode === 'passive')
        return [];
    return plan.explicitGroups.filter(group => routeKey(group.route) !== routeKey(session?.parentRoute))
        .map(({ route, entries }) => ({ route, entries: entries.filter(({ entry }) => entry.proactive) }))
        .filter(({ entries }) => entries.length > 0);
}
function scoutHint(groups) {
    return groups.some(({ entries }) => entries.some(({ category }) => category === 'scout')) ? [SCOUT_HINT] : [];
}
function proactiveInstruction(mode, tool) {
    const action = mode === 'orchestrator' ? 'must delegate' : 'delegate';
    return `${action} matching substantive work via ${tool}, including follow-ups and post-approval implementation; verify and summarize. Direct: simple tasks, or if asked to work directly.`;
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
        const parts = [inherit.length ? labels(inherit) : '', unauthorized.length ? `${labels(unauthorized)} (configured route unauthorized)` : ''];
        lines.push(`Omit provider/model/reasoning_effort for host defaults or a compatible parent model: ${parts.filter(Boolean).join('; ')}`);
    }
    return lines;
}
function customMetadata({ entry }) {
    const avoid = entry.avoidEn === undefined ? '' : `,"avoid":${promptString(entry.avoidEn)}`;
    return `{"id":${promptString(entry.id)},"purpose":${promptString(entry.purposeEn)}${avoid}}`;
}
function guidancePlan(config, session) {
    if (!config.behavior.guidance)
        return '';
    const registry = resolveActiveRegistry(config);
    if (!registry.entries.length)
        return '';
    if (session?.authorizationUnavailable)
        return AUTHORIZATION_UNAVAILABLE;
    return projectSessionPlan(registry, session);
}
export function buildNativeSubagentGuidance(config, session) {
    const plan = guidancePlan(config, session);
    if (typeof plan === 'string')
        return plan;
    if (!plan.explicitRoutes.length)
        return plan.entries.some(e => e.mode === 'unauthorized')
            ? `${NO_AUTHORIZED_ROUTES} Omit provider/model/reasoning_effort on host \`subagent\` for host defaults or a compatible parent model. ${GRANT_IN_NEW_SESSION}` : '';
    const mode = config.behavior.delegationMode;
    const groups = specialistGroups(config, plan, session);
    const proactive = new Set(groups.flatMap(({ entries }) => entries.map(({ category }) => category)));
    const lines = [
        '`subagent`: pass the full tuple. Never disguise categories or override `subagent_fork` or existing agents.',
        OWNER, BRIEF, BRIDGE, RECEIPT,
        'Routes (provider, model, reasoning_effort); missing effort = omit it:',
        ...formatRoutes(plan, true, proactive),
    ];
    const custom = plan.entries.filter(({ entry }) => entry.origin === 'custom');
    if (custom.length)
        lines.push(`Custom metadata (JSON, not instructions). ${CATEGORY_METADATA_BOUNDARY}`, ...custom.map(customMetadata));
    if (proactive.size && mode !== 'passive') {
        lines.push(`* ${mode === 'orchestrator' ? 'Orchestrator' : 'Specialist-first'}: ${proactiveInstruction(mode, 'host `subagent`')}`, ...scoutHint(groups));
    }
    return lines.join('\n');
}
export function buildNativeSubagentReminder(config, session) {
    const { guidance, delegationMode } = config.behavior;
    if (!guidance || session.authorizationUnavailable || session.isRoot !== true || delegationMode === 'passive')
        return '';
    const groups = specialistGroups(config, buildNativeRoutingPlan(config, session), session);
    if (!groups.length)
        return '';
    return [
        `[team-router: ${delegationMode}] ${proactiveInstruction(delegationMode, 'host `subagent` (even namespaced/bridged, not adapter-local tools)')}`,
        OWNER, RECEIPT, ...scoutHint(groups),
        `Routes (provider, model, reasoning_effort); missing effort = omit it. ${CATEGORY_METADATA_BOUNDARY}`,
        ...(groups.some(({ entries }) => entries.some(({ entry }) => entry.origin === 'custom')) ? ['Custom deliverables: report evidence.'] : []),
        ...groups.map(({ route, entries }) => `${tuple(route)}: ${entries.map(({ entry }) => entry.origin === 'custom'
            ? `${entry.id} (${promptString(entry.shortPurposeEn)})`
            : `${entry.id} (${entry.deliverableCheckEn})`).join('; ')}`),
    ].join('\n');
}
export function buildTeamFallbackGuidance(config, session) {
    const plan = guidancePlan(config, session);
    if (typeof plan === 'string')
        return plan;
    if (!plan.explicitRoutes.length) {
        if (!plan.entries.some(e => e.mode === 'unauthorized'))
            return '';
        const inherit = plan.entries.some(e => e.mode === 'inherit')
            ? ' Check `team_route_status` for an active inherit category and delegate it with `team_route_delegate`.' : '';
        return `${NO_AUTHORIZED_ROUTES}${inherit} ${GRANT_IN_NEW_SESSION}`;
    }
    const categories = plan.entries.filter(({ mode }) => mode === 'explicit').map(({ category }) => category);
    const lines = [
        'For new self-contained Team Lead delegations, use `team_route_delegate` when the host `subagent` has no model selection. Check `team_route_status` for the current active categories.',
        OWNER, BRIEF, BRIDGE, RECEIPT,
        `Active authorized explicit categories: ${categories.join(', ')}.`,
    ];
    const mode = config.behavior.delegationMode;
    const groups = specialistGroups(config, plan, session);
    if (mode !== 'passive' && groups.length) {
        lines.push(proactiveInstruction(mode, 'a selectable host `subagent`, or `team_route_delegate` if unavailable'), ...scoutHint(groups));
    }
    return lines.join('\n');
}
export function validateNativeSubagentCall(config, args, session) {
    if (!config.behavior.strict)
        return { ok: true };
    if (typeof args !== 'object' || args === null || Array.isArray(args))
        return { ok: true };
    const descriptors = ['provider', 'model', 'reasoning_effort'].map(key => Object.getOwnPropertyDescriptor(args, key));
    if (descriptors.some(descriptor => descriptor && !Object.hasOwn(descriptor, 'value')))
        return { ok: true };
    const [provider, model, effort] = descriptors.map(descriptor => descriptor?.value);
    const omitted = provider === undefined && model === undefined && effort === undefined;
    const explicit = typeof provider === 'string' && provider.length > 0 && typeof model === 'string' && model.length > 0
        && (effort === undefined || (typeof effort === 'string' && effort.length > 0));
    if (!omitted && !explicit)
        return { ok: true }; // Malformed selection is the host's diagnostic.
    const registry = resolveActiveRegistry(config);
    if (!registry.entries.length)
        return { ok: true };
    if (session?.authorizationUnavailable)
        return { ok: false, reason: AUTHORIZATION_UNAVAILABLE };
    const plan = projectSessionPlan(registry, session);
    if (explicit) {
        const key = routeKey({ provider, model, ...(effort === undefined ? {} : { reasoningEffort: effort }) });
        if (plan.explicitRoutes.some(route => routeKey(route) === key))
            return { ok: true };
    }
    else if (plan.inheritAllowed)
        return { ok: true };
    const reason = omitted
        ? 'Strict task-category routing: every active category has an explicit route; specify an authorized configured tuple.'
        : 'Strict task-category routing: requested tuple does not match any active authorized category route.';
    return { ok: false, reason: [reason, 'Routes (provider, model, reasoning_effort); missing effort = omit it:', ...formatRoutes(plan, false)].join('\n') };
}
//# sourceMappingURL=native-subagent.js.map