import { BUILTINS, BUILTIN_IDS, CUSTOM_ID_PATTERN, MAX_CUSTOM_CATEGORIES, isBuiltinId } from "./categories.js";
import { fingerprintNormalized } from "./routing-fingerprint.js";
export const DELEGATION_MODES = Object.freeze(['passive', 'specialist-first', 'orchestrator']);
export function isDelegationMode(value) {
    return DELEGATION_MODES.some(mode => mode === value);
}
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const UNSAFE_TEXT = /[\p{Cc}\u2028\u2029\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
function fail(path, message) { throw new TypeError(`${path}: ${message}`); }
function ownValue(value, key, path) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value'))
        fail(path, 'must be an own data property');
    return descriptor.value;
}
function record(value, path, fields) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        fail(path, 'must be a plain object');
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype)
        fail(path, 'must be a plain object');
    const result = Object.create(null);
    for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string')
            fail(path, 'symbol fields are not allowed');
        if (UNSAFE_KEYS.has(key))
            fail(path, `unsafe key ${JSON.stringify(key)}`);
        const field = `${path}[${JSON.stringify(key)}]`;
        if (fields && !fields.includes(key))
            fail(field, 'unknown field');
        result[key] = ownValue(value, key, field);
    }
    return result;
}
function onlyFields(value, fields, path) {
    for (const key of Object.keys(value))
        if (!fields.includes(key))
            fail(`${path}.${key}`, 'unknown field');
}
function list(value, path) {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype)
        fail(path, 'must be a plain array');
    const length = ownValue(value, 'length', `${path}.length`);
    if (typeof length !== 'number' || length > MAX_CUSTOM_CATEGORIES)
        fail(path, `must contain at most ${MAX_CUSTOM_CATEGORIES} categories`);
    if (Reflect.ownKeys(value).length !== length + 1)
        fail(path, 'sparse arrays and extra array fields are not allowed');
    return Array.from({ length }, (_, index) => ownValue(value, String(index), `${path}[${index}]`));
}
function text(value, limit, path) {
    if (typeof value !== 'string' || UNSAFE_TEXT.test(value))
        fail(path, 'must be single-line text with no control characters');
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > limit * 2 || [...trimmed].length > limit) {
        fail(path, `must have 1–${limit} Unicode code points`);
    }
    return trimmed;
}
function boolean(value, path) {
    if (typeof value !== 'boolean')
        fail(path, 'must be a boolean');
    return value;
}
function route(input, path, allowDefault) {
    const entry = record(input, path);
    if (entry.mode === 'default' && allowDefault) {
        onlyFields(entry, ['mode'], path);
        return { mode: 'default' };
    }
    if (entry.mode === 'inherit') {
        onlyFields(entry, ['mode'], path);
        return { mode: 'inherit' };
    }
    if (entry.mode !== 'explicit')
        fail(`${path}.mode`, allowDefault ? 'expected default, inherit, or explicit' : 'expected inherit or explicit');
    onlyFields(entry, ['mode', 'provider', 'model', 'reasoningEffort'], path);
    return {
        mode: 'explicit', provider: text(entry.provider, 128, `${path}.provider`), model: text(entry.model, 128, `${path}.model`),
        ...(entry.reasoningEffort === undefined ? {} : { reasoningEffort: text(entry.reasoningEffort, 48, `${path}.reasoningEffort`) }),
    };
}
function target(input, path) {
    return route(input, path, false);
}
export function parseTarget(input) { return target(input, 'target'); }
export function parseBinding(input) { return route(input, 'binding', true); }
function baseConfig(builtins) {
    return {
        version: 3, defaultTarget: { mode: 'inherit' },
        behavior: { guidance: true, delegationMode: 'passive', strict: false },
        builtins, custom: [], historyLimit: 100,
    };
}
export function createDefaultRoutingConfig() {
    return baseConfig({ scout: { enabled: true } });
}
/** Defaults fill omitted top-level values only; present invalid data is never reset. */
export function parseRoutingConfig(input) {
    const source = record(input, 'routing', ['version', 'defaultTarget', 'behavior', 'builtins', 'custom', 'historyLimit']);
    if (source.version !== 3)
        fail('routing.version', 'must be 3');
    const result = baseConfig({});
    if (Object.hasOwn(source, 'defaultTarget'))
        result.defaultTarget = target(source.defaultTarget, 'routing.defaultTarget');
    if (Object.hasOwn(source, 'behavior')) {
        const path = 'routing.behavior';
        const entry = record(source.behavior, path, ['guidance', 'delegationMode', 'strict']);
        if (!isDelegationMode(entry.delegationMode))
            fail(`${path}.delegationMode`, `expected ${DELEGATION_MODES.join(', ')}`);
        result.behavior = { guidance: boolean(entry.guidance, `${path}.guidance`), delegationMode: entry.delegationMode, strict: boolean(entry.strict, `${path}.strict`) };
    }
    if (Object.hasOwn(source, 'builtins')) {
        const map = record(source.builtins, 'routing.builtins');
        for (const key of Object.keys(map))
            if (!isBuiltinId(key))
                fail(`routing.builtins[${JSON.stringify(key)}]`, 'unknown builtin ID');
        for (const id of BUILTIN_IDS) {
            if (!Object.hasOwn(map, id))
                continue;
            const path = `routing.builtins[${JSON.stringify(id)}]`;
            const entry = record(map[id], path, ['enabled', 'binding']);
            const override = {};
            if (Object.hasOwn(entry, 'enabled')) {
                const enabled = boolean(entry.enabled, `${path}.enabled`);
                if (enabled !== BUILTINS[id].defaultEnabled)
                    override.enabled = enabled;
            }
            if (Object.hasOwn(entry, 'binding')) {
                const binding = route(entry.binding, `${path}.binding`, true);
                if (binding.mode !== 'default')
                    override.binding = binding;
            }
            if (Object.keys(override).length !== 0)
                result.builtins[id] = override;
        }
    }
    if (Object.hasOwn(source, 'custom')) {
        const ids = new Set();
        result.custom = list(source.custom, 'routing.custom').map((input, index) => {
            const path = `routing.custom[${index}]`;
            const entry = record(input, path, ['id', 'name', 'purpose', 'avoid', 'enabled', 'proactive', 'binding']);
            if (typeof entry.id !== 'string' || entry.id.length < 8 || entry.id.length > 40
                || !CUSTOM_ID_PATTERN.test(entry.id) || /[^a-z0-9-]/.test(entry.id))
                fail(`${path}.id`, 'invalid custom category ID');
            if (ids.has(entry.id))
                fail(`${path}.id`, 'duplicate custom category ID');
            ids.add(entry.id);
            return {
                id: entry.id,
                name: text(entry.name, 40, `${path}.name`), purpose: text(entry.purpose, 120, `${path}.purpose`),
                ...(Object.hasOwn(entry, 'avoid') ? { avoid: text(entry.avoid, 80, `${path}.avoid`) } : {}),
                enabled: boolean(entry.enabled, `${path}.enabled`), proactive: boolean(entry.proactive, `${path}.proactive`),
                binding: route(entry.binding, `${path}.binding`, true),
            };
        });
    }
    if (Object.hasOwn(source, 'historyLimit')) {
        const limit = source.historyLimit;
        if (typeof limit !== 'number' || !Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
            fail('routing.historyLimit', 'must be a safe integer from 1 to 1000');
        }
        result.historyLimit = limit;
    }
    return result;
}
export function routingConfigFingerprint(input) {
    return fingerprintNormalized(parseRoutingConfig(input));
}
//# sourceMappingURL=routing-policy.js.map