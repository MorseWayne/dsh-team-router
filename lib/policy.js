const CONFIG_FIELDS = new Set([
    'routes', 'rules', 'roles', 'defaultRoute', 'historyLimit',
]);
const ROUTE_FIELDS = new Set(['provider', 'model', 'reasoningEffort']);
const RULE_FIELDS = new Set(['id', 'keywords', 'route', 'priority']);
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
function fail(path, message) {
    throw new TypeError(`${path}: ${message}`);
}
/** Accept only plain data records; never read inherited fields or invoke getters. */
function record(value, path) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        fail(path, 'must be an object');
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype) {
        fail(path, 'must be a plain object');
    }
    for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string')
            fail(path, 'symbol fields are not allowed');
        if (UNSAFE_KEYS.has(key))
            fail(path, `unsafe key ${JSON.stringify(key)}`);
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!Object.hasOwn(descriptor, 'value')) {
            fail(`${path}.${key}`, 'must be a data property');
        }
    }
    return value;
}
function exactFields(value, allowed, path) {
    for (const key of Object.getOwnPropertyNames(value)) {
        if (!allowed.has(key))
            fail(`${path}.${key}`, 'unknown field');
    }
}
function own(value, key) {
    return Object.hasOwn(value, key) ? value[key] : undefined;
}
function text(value, path) {
    if (typeof value !== 'string')
        fail(path, 'must be a string');
    const normalized = value.trim();
    if (normalized.length === 0)
        fail(path, 'must not be empty');
    return normalized;
}
function routeName(value, path) {
    const name = text(value, path);
    if (UNSAFE_KEYS.has(name))
        fail(path, `unsafe route name ${JSON.stringify(name)}`);
    return name;
}
function integer(value, minimum, maximum, path) {
    if (typeof value !== 'number' || !Number.isInteger(value)
        || value < minimum || value > maximum) {
        fail(path, `must be a finite integer from ${minimum} to ${maximum}`);
    }
    return value;
}
function array(value, maximum, path) {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
        fail(path, 'must be an array');
    }
    if (value.length > maximum)
        fail(path, `must contain at most ${maximum} items`);
    for (const key of Reflect.ownKeys(value)) {
        if (key === 'length')
            continue;
        if (typeof key !== 'string' || !Number.isInteger(Number(key))
            || Number(key) < 0 || Number(key) >= value.length || String(Number(key)) !== key) {
            fail(path, 'unknown array field');
        }
        if (!Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) {
            fail(`${path}[${key}]`, 'must be a data property');
        }
    }
    // A sparse array is not a valid collection of rules or keywords.
    for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index))
            fail(`${path}[${index}]`, 'must not be missing');
    }
    return value;
}
function requireRoute(routes, name, path) {
    if (!Object.hasOwn(routes, name))
        fail(path, `unknown route ${JSON.stringify(name)}`);
}
/** Validate untrusted configuration and return a completely detached data graph. */
export function parseConfig(input) {
    const source = record(input, 'config');
    exactFields(source, CONFIG_FIELDS, 'config');
    const routeSource = record(own(source, 'routes'), 'config.routes');
    const routeKeys = Object.getOwnPropertyNames(routeSource);
    if (routeKeys.length > 64)
        fail('config.routes', 'must contain at most 64 routes');
    const routes = Object.create(null);
    for (const key of routeKeys) {
        const path = `config.routes[${JSON.stringify(key)}]`;
        const name = routeName(key, path);
        if (Object.hasOwn(routes, name))
            fail(path, 'duplicate normalized route name');
        const entry = record(routeSource[key], path);
        exactFields(entry, ROUTE_FIELDS, path);
        const route = {
            provider: text(own(entry, 'provider'), `${path}.provider`),
            model: text(own(entry, 'model'), `${path}.model`),
        };
        const effort = own(entry, 'reasoningEffort');
        if (effort !== undefined)
            route.reasoningEffort = text(effort, `${path}.reasoningEffort`);
        routes[name] = route;
    }
    const rules = [];
    const ruleIds = new Set();
    const rawRules = own(source, 'rules');
    if (rawRules !== undefined) {
        const entries = array(rawRules, 64, 'config.rules');
        for (let index = 0; index < entries.length; index += 1) {
            const path = `config.rules[${index}]`;
            const entry = record(entries[index], path);
            exactFields(entry, RULE_FIELDS, path);
            const id = text(own(entry, 'id'), `${path}.id`);
            if (ruleIds.has(id))
                fail(`${path}.id`, 'duplicate rule id');
            ruleIds.add(id);
            const keywords = array(own(entry, 'keywords'), 32, `${path}.keywords`).map((keyword, keywordIndex) => {
                const keywordPath = `${path}.keywords[${keywordIndex}]`;
                const normalized = text(keyword, keywordPath);
                if (normalized.length > 100)
                    fail(keywordPath, 'must contain at most 100 characters');
                return normalized;
            });
            const name = routeName(own(entry, 'route'), `${path}.route`);
            requireRoute(routes, name, `${path}.route`);
            const priority = own(entry, 'priority');
            rules.push({
                id,
                keywords,
                route: name,
                priority: priority === undefined ? 0 : integer(priority, -1000, 1000, `${path}.priority`),
            });
        }
    }
    const roles = Object.create(null);
    const rawRoles = own(source, 'roles');
    if (rawRoles !== undefined) {
        const entries = record(rawRoles, 'config.roles');
        for (const memberName of Object.getOwnPropertyNames(entries)) {
            // Member names are exact keys: unlike route references, never trim or case-fold them.
            const path = `config.roles[${JSON.stringify(memberName)}]`;
            if (memberName.trim().length === 0)
                fail(path, 'member name must not be empty');
            const name = routeName(entries[memberName], path);
            requireRoute(routes, name, path);
            roles[memberName] = name;
        }
    }
    const rawLimit = own(source, 'historyLimit');
    const config = {
        routes,
        rules,
        roles,
        historyLimit: rawLimit === undefined ? 100 : integer(rawLimit, 1, 1000, 'config.historyLimit'),
    };
    const rawDefault = own(source, 'defaultRoute');
    if (rawDefault !== undefined) {
        const name = routeName(rawDefault, 'config.defaultRoute');
        requireRoute(routes, name, 'config.defaultRoute');
        config.defaultRoute = name;
    }
    return config;
}
function asciiWordCharacter(character) {
    if (character === undefined)
        return false;
    const code = character.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
        || (code >= 48 && code <= 57) || code === 95;
}
function keywordMatches(task, keyword) {
    const needle = keyword.toLowerCase();
    // Empty keywords are rejected by parseConfig. Guard here as well for mutated configs.
    if (needle.length === 0)
        return false;
    const word = Array.from(keyword).every(asciiWordCharacter);
    let offset = task.indexOf(needle);
    while (offset !== -1) {
        if (!word || (!asciiWordCharacter(task[offset - 1])
            && !asciiWordCharacter(task[offset + needle.length]))) {
            return true;
        }
        offset = task.indexOf(needle, offset + 1);
    }
    return false;
}
function routed(config, source, name, ruleId) {
    requireRoute(config.routes, name, source);
    const result = { source, routeName: name, route: { ...config.routes[name] } };
    if (ruleId !== undefined)
        result.ruleId = ruleId;
    return result;
}
/** Resolve routing without mutating configuration, input, or prior decisions. */
export function decide(config, input) {
    if (input.manualRoute !== undefined) {
        const name = routeName(input.manualRoute, 'manualRoute');
        return routed(config, 'manual', name);
    }
    if (typeof input.memberName !== 'string')
        fail('memberName', 'must be a string');
    if (input.taskText !== undefined && typeof input.taskText !== 'string') {
        fail('taskText', 'must be a string');
    }
    const task = (input.taskText ?? '').toLowerCase();
    let winningRule;
    if (task.length > 0) {
        for (const rule of config.rules) {
            if ((winningRule === undefined || rule.priority > winningRule.priority)
                && rule.keywords.some((keyword) => keywordMatches(task, keyword))) {
                winningRule = rule;
            }
        }
    }
    if (winningRule !== undefined) {
        return routed(config, 'task', winningRule.route, winningRule.id);
    }
    if (Object.hasOwn(config.roles, input.memberName)) {
        return routed(config, 'role', config.roles[input.memberName]);
    }
    if (config.defaultRoute !== undefined)
        return routed(config, 'default', config.defaultRoute);
    return { source: 'inherit' };
}
//# sourceMappingURL=policy.js.map