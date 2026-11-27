import { BUILTIN_IDS, CLASSIC7_IDS, CUSTOM_ID_PATTERN, MAX_CUSTOM_CATEGORIES, generateCustomCategoryId, isBuiltinId, } from "../core/categories.js";
import { createDefaultRoutingConfig, parseRoutingConfig, routingConfigFingerprint, } from "../core/routing-policy.js";
import { planModelGrant, requiredModelRoutes } from "./model-grants.js";
const UNSAFE_TEXT = /[\p{Cc}\u2028\u2029\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
const CLASSIC7_SET = new Set(CLASSIC7_IDS);
function validSingleLine(value, limit) {
    if (UNSAFE_TEXT.test(value))
        return false;
    const trimmed = value.trim();
    return trimmed.length > 0 && [...trimmed].length <= limit;
}
export function routingFormConfig(value) {
    return value.routing === undefined ? createDefaultRoutingConfig() : parseRoutingConfig(value.routing);
}
export function routingConfigToDraft(input, persistedCustomIds) {
    const config = parseRoutingConfig(input);
    const builtins = Object.create(null);
    for (const id of BUILTIN_IDS) {
        const override = config.builtins[id];
        builtins[id] = {
            enabled: override?.enabled !== false,
            binding: override?.binding ? structuredClone(override.binding) : { mode: 'default' },
        };
    }
    const custom = config.custom.map(entry => ({
        id: entry.id,
        persisted: persistedCustomIds ? persistedCustomIds.has(entry.id) : true,
        name: entry.name,
        purpose: entry.purpose,
        avoid: entry.avoid ?? '',
        enabled: entry.enabled,
        proactive: entry.proactive,
        binding: structuredClone(entry.binding),
    }));
    return {
        defaultTarget: structuredClone(config.defaultTarget),
        behavior: { ...config.behavior },
        builtins,
        custom,
        historyLimit: String(config.historyLimit),
    };
}
export function routingDraftToConfig(draft) {
    const builtins = {};
    for (const id of BUILTIN_IDS) {
        const entry = draft.builtins[id];
        if (!entry)
            continue;
        const override = {};
        if (!entry.enabled)
            override.enabled = false;
        if (entry.binding.mode !== 'default')
            override.binding = entry.binding;
        if (Object.keys(override).length > 0)
            builtins[id] = override;
    }
    const custom = draft.custom.map(entry => ({
        id: entry.id,
        name: entry.name,
        purpose: entry.purpose,
        ...(entry.avoid.trim() === '' ? {} : { avoid: entry.avoid }),
        enabled: entry.enabled,
        proactive: entry.proactive,
        binding: entry.binding,
    }));
    return parseRoutingConfig({
        version: 3,
        defaultTarget: draft.defaultTarget,
        behavior: draft.behavior,
        builtins,
        custom,
        historyLimit: draft.historyLimit.trim() === '' ? NaN : Number(draft.historyLimit),
    });
}
export function routingConfigMutations(input) {
    return [{ op: 'set', path: ['routing'], value: parseRoutingConfig(input) }];
}
function validateExplicitTarget(section, target, checkCatalog, catalog, catalogReady = catalog !== undefined) {
    if (!target.provider.trim())
        return { section, field: 'provider', reason: 'required' };
    if (!target.model.trim())
        return { section, field: 'model', reason: 'required' };
    if (!checkCatalog)
        return undefined;
    if (!catalogReady || !catalog)
        return { section, field: 'model', reason: 'catalogRequired' };
    const group = catalog.groups.find(entry => entry.id === target.provider.trim());
    if (!group || catalog.failures.some(failure => failure.id === group.id)) {
        return { section, field: 'provider', reason: 'catalog' };
    }
    const model = group.models.find(entry => entry.id === target.model.trim());
    if (!model)
        return { section, field: 'model', reason: 'catalog' };
    if (target.reasoningEffort !== undefined && !model.reasoning?.efforts.some(effort => effort.id === target.reasoningEffort?.trim())) {
        return { section, field: 'effort', reason: 'catalog' };
    }
    return undefined;
}
export function routingDraftIssue(draft, catalog, catalogReady = catalog !== undefined) {
    const history = Number(draft.historyLimit);
    if (draft.historyLimit.trim() === '' || !Number.isInteger(history) || history < 1 || history > 1000) {
        return { section: 'default', field: 'historyLimit', reason: 'history' };
    }
    if (draft.custom.length > MAX_CUSTOM_CATEGORIES) {
        return { section: 'default', field: 'id', reason: 'customLimit' };
    }
    let anyEnabledFollowsDefault = false;
    for (const id of BUILTIN_IDS) {
        const entry = draft.builtins[id];
        if (entry?.enabled && entry.binding.mode === 'default')
            anyEnabledFollowsDefault = true;
    }
    for (const entry of draft.custom) {
        if (entry.enabled && entry.binding.mode === 'default')
            anyEnabledFollowsDefault = true;
    }
    if (draft.defaultTarget.mode === 'explicit') {
        const issue = validateExplicitTarget('default', draft.defaultTarget, anyEnabledFollowsDefault, catalog, catalogReady);
        if (issue)
            return issue;
    }
    for (const id of BUILTIN_IDS) {
        const entry = draft.builtins[id];
        if (!entry || entry.binding.mode !== 'explicit')
            continue;
        // Dormant bindings on disabled categories still need valid structure, but stale catalog entries never block saving or disabling.
        const issue = validateExplicitTarget(id, entry.binding, entry.enabled, catalog, catalogReady);
        if (issue)
            return issue;
    }
    const seenCustomIds = new Set();
    for (const entry of draft.custom) {
        const section = entry.id || 'custom';
        if (entry.id.length < 8 || entry.id.length > 40 || !CUSTOM_ID_PATTERN.test(entry.id) || /[^a-z0-9-]/.test(entry.id)) {
            return { section, field: 'id', reason: 'customId' };
        }
        if (seenCustomIds.has(entry.id)) {
            return { section, field: 'id', reason: 'customDuplicate' };
        }
        seenCustomIds.add(entry.id);
        if (!validSingleLine(entry.name, 40))
            return { section, field: 'name', reason: 'text' };
        if (!validSingleLine(entry.purpose, 120))
            return { section, field: 'purpose', reason: 'text' };
        if (entry.avoid !== '' && (UNSAFE_TEXT.test(entry.avoid) || (entry.avoid.trim() !== '' && !validSingleLine(entry.avoid, 80)))) {
            return { section, field: 'avoid', reason: 'text' };
        }
        if (entry.binding.mode === 'explicit') {
            const issue = validateExplicitTarget(section, entry.binding, entry.enabled, catalog, catalogReady);
            if (issue)
                return issue;
        }
    }
    try {
        routingDraftToConfig(draft);
    }
    catch (error) {
        return { section: 'default', field: 'model', reason: 'structure', detail: error instanceof Error ? error.message : String(error) };
    }
    return undefined;
}
function sameEffectiveActiveTargets(a, b) {
    const stripBehavior = (config) => routingConfigFingerprint({
        ...config,
        behavior: { guidance: true, delegationMode: 'passive', strict: false },
    });
    return stripBehavior(a) === stripBehavior(b);
}
/** Staged, revision-bound V3 editor. Preset toggles, custom categories, previews, and saves are explicit actions. */
export class RoutingEditor {
    state = {
        draft: undefined, revision: undefined, dirty: false, saving: false, stale: false,
        issue: undefined, error: undefined, notice: undefined,
    };
    listeners = new Set();
    customBindings = new Map();
    explicitTargets = new Map();
    savedConfig;
    savedFingerprint;
    persistedCustomIds = new Set();
    stop;
    disposed = false;
    form;
    grants;
    constructor(form, grants) {
        this.form = form;
        this.grants = grants;
        this.accept();
        this.stop = form.subscribe(() => {
            if (this.state.saving)
                return;
            if (!this.state.dirty)
                this.accept();
            else {
                const stale = form.getSnapshot().revision !== this.state.revision;
                this.publish({ ...this.state, stale });
            }
        });
    }
    getSnapshot = () => this.state;
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    dispose() { this.disposed = true; this.stop(); this.listeners.clear(); }
    publish(state) {
        if (this.disposed)
            return;
        this.state = state;
        for (const listener of this.listeners)
            listener();
    }
    remember(draft, reset = false) {
        if (reset) {
            this.customBindings.clear();
            this.explicitTargets.clear();
        }
        if (draft.defaultTarget.mode === 'explicit')
            this.explicitTargets.set('default', structuredClone(draft.defaultTarget));
        for (const id of BUILTIN_IDS) {
            const binding = draft.builtins[id].binding;
            if (binding.mode !== 'default') {
                this.customBindings.set(id, structuredClone(binding));
                if (binding.mode === 'explicit')
                    this.explicitTargets.set(id, structuredClone(binding));
            }
        }
        for (const entry of draft.custom) {
            if (entry.binding.mode !== 'default') {
                this.customBindings.set(entry.id, structuredClone(entry.binding));
                if (entry.binding.mode === 'explicit')
                    this.explicitTargets.set(entry.id, structuredClone(entry.binding));
            }
        }
    }
    computeDirty(draft) {
        if (this.savedFingerprint === undefined)
            return true;
        try {
            return routingConfigFingerprint(routingDraftToConfig(draft)) !== this.savedFingerprint;
        }
        catch {
            return true;
        }
    }
    accept(notice) {
        const host = this.form.getSnapshot();
        try {
            const config = host.value === undefined ? undefined : routingFormConfig(host.value);
            this.savedConfig = config;
            this.savedFingerprint = config === undefined ? undefined : routingConfigFingerprint(config);
            this.persistedCustomIds = new Set(config?.custom.map(entry => entry.id) ?? []);
            const draft = config === undefined ? undefined : routingConfigToDraft(config, this.persistedCustomIds);
            this.customBindings.clear();
            this.explicitTargets.clear();
            if (draft)
                this.remember(draft, true);
            this.publish({
                draft, revision: host.revision, dirty: false, saving: false, stale: false,
                issue: undefined, error: undefined, notice,
            });
        }
        catch (error) {
            this.savedConfig = undefined;
            this.savedFingerprint = undefined;
            this.persistedCustomIds.clear();
            this.publish({
                ...this.state, draft: undefined, revision: host.revision, dirty: false, saving: false, stale: false,
                issue: undefined, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) }, notice: undefined,
            });
        }
    }
    edit(draft, revision = this.state.revision) {
        const host = this.form.getSnapshot();
        if (this.disposed || this.state.saving || host.status !== 'ready' || !host.writable)
            return;
        const stale = host.revision !== revision;
        const cloned = structuredClone(draft);
        this.remember(cloned);
        this.publish({
            ...this.state, draft: cloned, revision, dirty: this.computeDirty(cloned), stale,
            issue: undefined, error: undefined, notice: undefined,
        });
    }
    editBehavior(patch, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft)
            return;
        this.edit({ ...draft, behavior: { ...draft.behavior, ...patch } }, revision);
    }
    setBuiltinEnabled(id, enabled, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft || !isBuiltinId(id))
            return;
        this.edit({
            ...draft,
            builtins: { ...draft.builtins, [id]: { ...draft.builtins[id], enabled } },
        }, revision);
    }
    /** Bulk-toggle builtin enabled switches only; preserves bindings, custom categories, and requires explicit Save. */
    applyBuiltinPreset(preset, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft)
            return;
        const builtins = { ...draft.builtins };
        for (const id of BUILTIN_IDS) {
            const enabled = preset === 'all12' ? true : CLASSIC7_SET.has(id);
            builtins[id] = { ...builtins[id], enabled };
        }
        this.edit({ ...draft, builtins }, revision);
    }
    setSectionBinding(section, binding, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft)
            return;
        if (section === 'default') {
            if (binding.mode === 'default')
                return;
            this.edit({ ...draft, defaultTarget: binding }, revision);
            return;
        }
        if (isBuiltinId(section)) {
            this.edit({
                ...draft,
                builtins: { ...draft.builtins, [section]: { ...draft.builtins[section], binding } },
            }, revision);
            return;
        }
        const index = draft.custom.findIndex(entry => entry.id === section);
        if (index < 0)
            return;
        const nextCustom = [...draft.custom];
        nextCustom[index] = { ...nextCustom[index], binding };
        this.edit({ ...draft, custom: nextCustom }, revision);
    }
    setCategoryMode(section, mode, revision = this.state.revision) {
        const target = this.customBindings.get(section) ?? { mode: 'inherit' };
        this.setSectionBinding(section, mode === 'default' ? { mode: 'default' } : target, revision);
    }
    setNativeModelMode(section, mode, revision = this.state.revision, choice) {
        const previous = this.explicitTargets.get(section);
        const matches = previous?.provider === choice?.provider && previous?.model === choice?.model;
        const target = mode === 'inherit'
            ? { mode: 'inherit' }
            : choice && !matches
                ? { mode: 'explicit', provider: choice.provider, model: choice.model }
                : previous ?? { mode: 'explicit', provider: '', model: '' };
        this.setSectionBinding(section, target, revision);
    }
    setSectionEffort(section, provider, model, effort, revision = this.state.revision) {
        const target = { mode: 'explicit', provider, model, ...(effort ? { reasoningEffort: effort } : {}) };
        this.setSectionBinding(section, target, revision);
    }
    addCustomCategory(seed, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft || draft.custom.length >= MAX_CUSTOM_CATEGORIES)
            return undefined;
        const taken = new Set(draft.custom.map(entry => entry.id));
        let id;
        if (seed?.id && CUSTOM_ID_PATTERN.test(seed.id) && seed.id.length >= 8 && seed.id.length <= 40 && !taken.has(seed.id)) {
            id = seed.id;
        }
        else {
            id = generateCustomCategoryId(seed?.name ?? seed?.id ?? '', taken);
        }
        const entry = {
            id,
            persisted: false,
            name: seed?.name ?? '',
            purpose: seed?.purpose ?? '',
            avoid: seed?.avoid ?? '',
            enabled: true,
            proactive: seed?.proactive ?? false,
            binding: { mode: 'default' },
        };
        this.edit({ ...draft, custom: [...draft.custom, entry] }, revision);
        return id;
    }
    updateCustomCategory(id, patch, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft)
            return;
        const index = draft.custom.findIndex(entry => entry.id === id);
        if (index < 0)
            return;
        const current = draft.custom[index];
        const nextId = current.persisted ? current.id : (patch.id ?? current.id);
        const nextEntry = { ...current, ...patch, id: nextId, persisted: current.persisted };
        const nextCustom = [...draft.custom];
        nextCustom[index] = nextEntry;
        this.edit({ ...draft, custom: nextCustom }, revision);
    }
    removeCustomCategory(id, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft)
            return;
        const nextCustom = draft.custom.filter(entry => entry.id !== id);
        if (nextCustom.length === draft.custom.length)
            return;
        this.customBindings.delete(id);
        this.explicitTargets.delete(id);
        this.edit({ ...draft, custom: nextCustom }, revision);
    }
    discard() { if (!this.disposed && !this.state.saving)
        this.accept(); }
    applyRecommendations(preview, revision = this.state.revision) {
        const host = this.form.getSnapshot();
        if (this.disposed || this.state.saving || !this.state.draft || host.status !== 'ready' || !host.writable)
            return false;
        try {
            if (revision === undefined || revision !== host.revision || revision !== this.state.revision
                || preview.baselineFingerprint !== routingConfigFingerprint(routingDraftToConfig(this.state.draft))) {
                this.publish({ ...this.state, error: { kind: 'previewChanged', detail: '' } });
                return false;
            }
            this.edit(routingConfigToDraft(preview.config, this.persistedCustomIds), revision);
            return true;
        }
        catch (error) {
            this.publish({ ...this.state, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) } });
            return false;
        }
    }
    async save(options = {}) {
        const state = this.state;
        const host = this.form.getSnapshot();
        if (this.disposed || state.saving || !state.draft || state.revision === undefined
            || host.status !== 'ready' || !host.writable)
            return false;
        if (state.stale || host.revision !== state.revision) {
            this.publish({ ...state, stale: true, error: { kind: 'refused', detail: '' } });
            return false;
        }
        const behaviorOnlyCandidate = (() => {
            if (!this.savedConfig)
                return false;
            try {
                const candidate = routingDraftToConfig(state.draft);
                return sameEffectiveActiveTargets(candidate, this.savedConfig);
            }
            catch {
                return false;
            }
        })();
        const catalogReady = options.catalogReady ?? options.catalog !== undefined;
        if (!behaviorOnlyCandidate || catalogReady) {
            const issue = routingDraftIssue(state.draft, options.catalog, catalogReady);
            if (issue) {
                this.publish({ ...state, issue, error: undefined, notice: undefined });
                return false;
            }
        }
        let parsedConfig;
        try {
            parsedConfig = routingDraftToConfig(state.draft);
        }
        catch (error) {
            this.publish({ ...state, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) } });
            return false;
        }
        const required = requiredModelRoutes(parsedConfig);
        const grant = planModelGrant(required, this.grants.getSnapshot());
        const configDirty = this.savedFingerprint === undefined || routingConfigFingerprint(parsedConfig) !== this.savedFingerprint;
        if (!configDirty && grant.kind === 'complete')
            return false;
        if (grant.kind === 'unavailable' || grant.kind === 'readOnly') {
            this.publish({ ...state, error: { kind: grant.kind === 'readOnly' ? 'grantReadOnly' : 'grantUnavailable', detail: '' }, notice: undefined });
            return false;
        }
        this.publish({ ...state, saving: true, issue: undefined, error: undefined, notice: undefined });
        try {
            // Never grant on a failed/stale routing write. Re-saving an unchanged config only repairs authorization.
            if (configDirty && !await this.form.mutate(routingConfigMutations(parsedConfig), state.revision)) {
                this.publish({
                    ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision,
                    error: { kind: 'refused', detail: '' }, notice: undefined,
                });
                return false;
            }
        }
        catch (error) {
            this.publish({
                ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision,
                error: { kind: 'transport', detail: error instanceof Error ? error.message : String(error) }, notice: undefined,
            });
            return false;
        }
        try {
            if (grant.kind === 'write') {
                const accepted = await this.grants.mutate([
                    { op: 'set', path: ['enabled'], value: true },
                    { op: 'set', path: ['allowedModels'], value: grant.routes },
                ], grant.revision);
                if (!accepted)
                    throw new Error('Authorization write refused');
            }
            if (planModelGrant(required, this.grants.getSnapshot()).kind !== 'complete')
                throw new Error('Authorization not confirmed');
        }
        catch {
            this.accept(); // Config is already persisted. Retry from current Host revisions without rewriting it.
            this.publish({ ...this.state, error: { kind: 'grantFailed', detail: '' }, notice: undefined });
            return false;
        }
        this.accept('saved');
        return true;
    }
}
//# sourceMappingURL=routing-editor.js.map