import { planModelGrant, requiredModelRoutes } from "./model-grants.js";
import { CATEGORY_IDS } from "./categories.js";
import { previewMigration } from "./migration.js";
import { parseRoutingPolicy } from "./routing-policy.js";
import { routingPolicyFingerprint } from "./recommendations.js";
export function routingPolicyToDraft(input) {
    const policy = parseRoutingPolicy(input);
    const categories = Object.create(null);
    for (const id of CATEGORY_IDS)
        categories[id] = policy.categories[id] ?? { mode: 'default' };
    return { defaultTarget: policy.defaultTarget, categories, historyLimit: String(policy.historyLimit) };
}
export function routingDraftToPolicy(draft) {
    return parseRoutingPolicy({
        version: 2, defaultTarget: draft.defaultTarget, categories: draft.categories,
        historyLimit: draft.historyLimit.trim() === '' ? NaN : Number(draft.historyLimit),
    });
}
/** Select legacy fields explicitly; stateDir and future Host fields are not policy inputs. */
export function routingFormPreview(value) {
    if (value.policyV2 !== undefined) {
        return { policy: parseRoutingPolicy(value.policyV2), required: false, retired: undefined };
    }
    const preview = previewMigration({
        routes: value.routes ?? {},
        ...(value.rules === undefined ? {} : { rules: value.rules }),
        ...(value.roles === undefined ? {} : { roles: value.roles }),
        ...(value.defaultRoute == null ? {} : { defaultRoute: value.defaultRoute }),
        ...(value.historyLimit === undefined ? {} : { historyLimit: value.historyLimit }),
    });
    return { policy: preview.policy, required: preview.required, retired: preview.retired };
}
/** No unset operation exists: clearing V2 would revive legacy composition fields. */
export function routingPolicyMutations(input) {
    return [{ op: 'set', path: ['policyV2'], value: parseRoutingPolicy(input) }];
}
export function routingDraftIssue(draft, catalog, catalogReady = catalog !== undefined) {
    const history = Number(draft.historyLimit);
    if (draft.historyLimit.trim() === '' || !Number.isInteger(history) || history < 1 || history > 1000) {
        return { section: 'default', field: 'historyLimit', reason: 'history' };
    }
    const targets = [{ section: 'default', target: draft.defaultTarget }];
    for (const id of CATEGORY_IDS) {
        const entry = draft.categories[id];
        if (entry?.mode === 'target')
            targets.push({ section: id, target: entry.target });
    }
    for (const { section, target } of targets) {
        if (target.executor !== 'native')
            return { section, field: 'executor', reason: 'externalUnavailable' };
        const selected = target.model;
        if (selected.mode === 'inherit')
            continue;
        if (!selected.provider.trim())
            return { section, field: 'provider', reason: 'required' };
        if (!selected.id.trim())
            return { section, field: 'model', reason: 'required' };
        if (!catalogReady || !catalog)
            return { section, field: 'model', reason: 'catalogRequired' };
        const group = catalog.groups.find((entry) => entry.id === selected.provider.trim());
        if (!group || catalog.failures.some((failure) => failure.id === group.id)) {
            return { section, field: 'provider', reason: 'catalog' };
        }
        const model = group.models.find((entry) => entry.id === selected.id.trim());
        if (!model)
            return { section, field: 'model', reason: 'catalog' };
        if (selected.reasoningEffort !== undefined && !model.reasoning?.efforts.some((effort) => effort.id === selected.reasoningEffort?.trim())) {
            return { section, field: 'effort', reason: 'catalog' };
        }
    }
    try {
        routingDraftToPolicy(draft);
    }
    catch (error) {
        return { section: 'default', field: 'executor', reason: 'structure', detail: error instanceof Error ? error.message : String(error) };
    }
    return undefined;
}
/** Staged, revision-bound V2 editor. Migration, preview application, and save are explicit actions. */
export class RoutingEditor {
    state = {
        draft: undefined, revision: undefined, dirty: false, saving: false, stale: false,
        migrationRequired: false, migrationConfirmed: false, retired: undefined,
        issue: undefined, error: undefined, notice: undefined,
    };
    listeners = new Set();
    customTargets = new Map();
    nativeModels = new Map();
    stop;
    disposed = false;
    form;
    grants;
    constructor(form, grants) {
        this.grants = grants;
        this.form = form;
        this.accept();
        this.stop = form.subscribe(() => {
            if (this.state.saving)
                return;
            if (!this.state.dirty)
                this.accept();
            else {
                const stale = form.getSnapshot().revision !== this.state.revision;
                this.publish({ ...this.state, stale, migrationConfirmed: stale ? false : this.state.migrationConfirmed });
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
            this.customTargets.clear();
            this.nativeModels.clear();
        }
        const targets = [['default', draft.defaultTarget]];
        for (const id of CATEGORY_IDS) {
            const binding = draft.categories[id];
            if (binding.mode === 'target') {
                this.customTargets.set(id, structuredClone(binding.target));
                targets.push([id, binding.target]);
            }
        }
        for (const [section, target] of targets) {
            if (target.executor === 'native' && target.model.mode === 'explicit')
                this.nativeModels.set(section, structuredClone(target));
        }
    }
    accept(notice) {
        const host = this.form.getSnapshot();
        try {
            const value = host.value === undefined ? undefined : routingFormPreview(host.value);
            const draft = value === undefined ? undefined : routingPolicyToDraft(value.policy);
            this.customTargets.clear();
            this.nativeModels.clear();
            if (draft)
                this.remember(draft, true);
            this.publish({
                draft, revision: host.revision,
                dirty: false, saving: false, stale: false, migrationRequired: value?.required ?? false,
                migrationConfirmed: false, retired: value?.retired, issue: undefined, error: undefined, notice,
            });
        }
        catch (error) {
            this.publish({ ...this.state, draft: undefined, revision: host.revision, dirty: false, saving: false,
                stale: false, migrationRequired: false, migrationConfirmed: false, retired: undefined,
                issue: undefined, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) }, notice: undefined });
        }
    }
    edit(draft, revision = this.state.revision) {
        const host = this.form.getSnapshot();
        if (this.disposed || this.state.saving || host.status !== 'ready' || !host.writable)
            return;
        const stale = host.revision !== revision;
        this.remember(draft);
        this.publish({ ...this.state, draft: structuredClone(draft), revision, dirty: true, stale,
            migrationConfirmed: stale ? false : this.state.migrationConfirmed, issue: undefined, error: undefined, notice: undefined });
    }
    /** Preserve dormant custom choices within this edit session, but never persist them in default bindings. */
    setCategoryMode(category, mode, revision = this.state.revision) {
        const draft = this.state.draft;
        if (!draft || !CATEGORY_IDS.some(id => id === category))
            return;
        const target = this.customTargets.get(category) ?? { executor: 'native', model: { mode: 'inherit' } };
        this.edit({ ...draft, categories: { ...draft.categories, [category]: mode === 'default' ? { mode } : { mode, target } } }, revision);
    }
    /** Returning from inheritance restores the last explicit native choice until save/reload. */
    setNativeModelMode(section, mode, revision = this.state.revision, choice) {
        const draft = this.state.draft;
        if (!draft)
            return;
        const previous = this.nativeModels.get(section);
        const matches = previous?.executor === 'native' && previous.model.mode === 'explicit'
            && previous.model.provider === choice?.provider && previous.model.id === choice?.id;
        const target = mode === 'inherit' ? { executor: 'native', model: { mode: 'inherit' } }
            : choice && !matches ? { executor: 'native', model: { mode: 'explicit', ...choice } }
                : previous ?? { executor: 'native', model: { mode: 'explicit', provider: '', id: '' } };
        this.edit(section === 'default' ? { ...draft, defaultTarget: target }
            : { ...draft, categories: { ...draft.categories, [section]: { mode: 'target', target } } }, revision);
    }
    discard() { if (!this.disposed && !this.state.saving)
        this.accept(); }
    confirmMigration(revision = this.state.revision) {
        const host = this.form.getSnapshot();
        if (this.disposed || this.state.saving || !this.state.migrationRequired || host.status !== 'ready' || !host.writable
            || revision === undefined || revision !== this.state.revision || revision !== host.revision)
            return false;
        this.publish({ ...this.state, migrationConfirmed: true, dirty: true, error: undefined, notice: undefined });
        return true;
    }
    applyRecommendations(preview, revision = this.state.revision) {
        const host = this.form.getSnapshot();
        if (this.disposed || this.state.saving || !this.state.draft || host.status !== 'ready' || !host.writable)
            return false;
        try {
            if (revision === undefined || revision !== host.revision || revision !== this.state.revision
                || preview.baselineFingerprint !== routingPolicyFingerprint(routingDraftToPolicy(this.state.draft))) {
                this.publish({ ...this.state, error: { kind: 'previewChanged', detail: '' } });
                return false;
            }
            this.edit(routingPolicyToDraft(preview.policy), revision);
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
            this.publish({ ...state, stale: true, migrationConfirmed: false, error: { kind: 'refused', detail: '' } });
            return false;
        }
        if (state.migrationRequired && !state.migrationConfirmed) {
            this.publish({ ...state, error: { kind: 'migration', detail: '' } });
            return false;
        }
        const issue = routingDraftIssue(state.draft, options.catalog, options.catalogReady ?? options.catalog !== undefined);
        if (issue) {
            this.publish({ ...state, issue, error: undefined, notice: undefined });
            return false;
        }
        let mutations;
        try {
            mutations = routingPolicyMutations(routingDraftToPolicy(state.draft));
        }
        catch (error) {
            this.publish({ ...state, error: { kind: 'validation', detail: error instanceof Error ? error.message : String(error) } });
            return false;
        }
        const required = requiredModelRoutes(mutations[0].value);
        const grant = planModelGrant(required, this.grants.getSnapshot());
        if (!state.dirty && grant.kind === 'complete')
            return false;
        if (grant.kind === 'unavailable' || grant.kind === 'readOnly') {
            this.publish({ ...state, error: { kind: grant.kind === 'readOnly' ? 'grantReadOnly' : 'grantUnavailable', detail: '' }, notice: undefined });
            return false;
        }
        this.publish({ ...state, saving: true, issue: undefined, error: undefined, notice: undefined });
        try {
            // Never grant on a failed/stale policy write. Re-saving an existing policy only repairs authorization.
            if (state.dirty && !await this.form.mutate(mutations, state.revision)) {
                this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision,
                    error: { kind: 'refused', detail: '' }, notice: undefined });
                return false;
            }
        }
        catch (error) {
            this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision,
                error: { kind: 'transport', detail: error instanceof Error ? error.message : String(error) }, notice: undefined });
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
            this.accept(); // Policy is already persisted. Retry from the current Host revisions without rewriting it.
            this.publish({ ...this.state, error: { kind: 'grantFailed', detail: '' }, notice: undefined });
            return false;
        }
        this.accept('saved');
        return true;
    }
}
//# sourceMappingURL=routing-editor.js.map