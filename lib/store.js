import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseConfig } from "./policy.js";
function object(value, label) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`Invalid ${label}`);
    return value;
}
function text(value, label) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 4096)
        throw new Error(`Invalid ${label}`);
    return value;
}
function route(value) {
    return parseConfig({ routes: { value } }).routes.value;
}
function decision(value) {
    const d = object(value, 'decision');
    if (!['manual', 'task', 'role', 'default', 'inherit'].includes(String(d.source)))
        throw new Error('Invalid decision source');
    return {
        source: d.source,
        ...(d.routeName === undefined ? {} : { routeName: text(d.routeName, 'routeName') }),
        ...(d.ruleId === undefined ? {} : { ruleId: text(d.ruleId, 'ruleId') }),
        ...(d.route === undefined ? {} : { route: route(d.route) }),
    };
}
/** A single Host is the writer. Team identity is hashed only for safe filenames. */
export class StateStore {
    directory;
    historyLimit;
    constructor(directory, historyLimit) {
        this.directory = resolve(directory);
        this.historyLimit = historyLimit;
    }
    setHistoryLimit(value) {
        if (!Number.isInteger(value) || value < 1 || value > 1000)
            throw new Error('Invalid history limit');
        this.historyLimit = value;
    }
    path(teamId) {
        return join(this.directory, `${createHash('sha256').update(teamId).digest('hex')}.json`);
    }
    load(teamId) {
        const file = this.path(teamId);
        if (!existsSync(file))
            return {
                version: 1, teamId, overrides: Object.create(null),
                members: Object.create(null), history: [],
            };
        if (statSync(file).size > 4 * 1024 * 1024)
            throw new Error(`Team router state exceeds 4 MiB: ${file}`);
        const raw = object(JSON.parse(readFileSync(file, 'utf8')), 'state');
        if (raw.version !== 1 || raw.teamId !== teamId)
            throw new Error(`Team router state identity/version mismatch: ${file}`);
        const overrides = Object.create(null);
        for (const [id, name] of Object.entries(object(raw.overrides, 'overrides')))
            overrides[text(id, 'memberId')] = text(name, 'override');
        const members = Object.create(null);
        for (const [id, value] of Object.entries(object(raw.members, 'members'))) {
            const row = object(value, 'member');
            const saved = {
                baseline: route(row.baseline), key: text(row.key, 'boundary'), selected: route(row.selected), decision: decision(row.decision),
            };
            const d = saved.decision;
            if (d.source === 'inherit') {
                if (d.route !== undefined || d.routeName !== undefined || d.ruleId !== undefined
                    || JSON.stringify(saved.selected) !== JSON.stringify(saved.baseline))
                    throw new Error('Inconsistent inherited route state');
            }
            else if (d.route === undefined || d.routeName === undefined
                || JSON.stringify(saved.selected) !== JSON.stringify(d.route)
                || (d.source === 'task' ? d.ruleId === undefined : d.ruleId !== undefined)) {
                throw new Error('Inconsistent named route state');
            }
            members[text(id, 'memberId')] = saved;
        }
        if (!Array.isArray(raw.history))
            throw new Error('Invalid team router history');
        const history = raw.history.slice(-this.historyLimit).map((value) => {
            const row = object(value, 'history row');
            const d = decision(row);
            return {
                at: text(row.at, 'timestamp'), memberId: text(row.memberId, 'memberId'), memberName: text(row.memberName, 'memberName'),
                boundary: text(row.boundary, 'boundary'), source: d.source, route: route(row.route),
                ...(d.routeName === undefined ? {} : { routeName: d.routeName }), ...(d.ruleId === undefined ? {} : { ruleId: d.ruleId }),
            };
        });
        return { version: 1, teamId, overrides, members, history };
    }
    save(state) {
        mkdirSync(this.directory, { recursive: true, mode: 0o700 });
        const target = this.path(state.teamId);
        const temporary = `${target}.${randomUUID()}.tmp`;
        let fd;
        try {
            fd = openSync(temporary, 'wx', 0o600);
            writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
            fsyncSync(fd);
            closeSync(fd);
            fd = undefined;
            renameSync(temporary, target);
        }
        finally {
            if (fd !== undefined)
                closeSync(fd);
            if (existsSync(temporary))
                unlinkSync(temporary);
        }
    }
}
//# sourceMappingURL=store.js.map