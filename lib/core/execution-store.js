import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, openSync, writeFileSync, fsyncSync, closeSync, renameSync, unlinkSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { parseTarget } from "./routing-policy.js";
import { CATEGORY_IDS } from "./categories.js";
const LIMIT = 4 * 1024 * 1024;
// Stable across plugin hot reloads in one Node process, different after a restart
// even when the OS reuses a PID. This is an identity tag, not a liveness probe.
const PROCESS_EPOCH = `${process.pid}:${performance.timeOrigin}`;
const recordSchema = z.object({
    id: z.string().min(1), category: z.enum(CATEGORY_IDS), source: z.enum(['default', 'category']),
    policyDigest: z.string().regex(/^[a-f0-9]{64}$/), target: z.unknown().transform(parseTarget), ownerProcess: z.string().optional(),
    state: z.enum(['preparing', 'running', 'completed', 'failed', 'cancelling', 'cancelled', 'unknown']),
    createdAt: z.string(), updatedAt: z.string(), childId: z.string().optional(), name: z.string().optional(),
    stopReason: z.string().optional(), diagnostic: z.string().max(4096).optional(),
}).strict();
const fileSchema = z.object({ version: z.literal(2), teamId: z.string(), records: z.array(recordSchema) }).strict();
const terminal = new Set(['completed', 'failed', 'cancelled', 'unknown']);
export const policyDigest = (policy) => createHash('sha256').update(JSON.stringify(policy)).digest('hex');
/** Separate v2 files: old member baselines/overrides/history are never reinterpreted. */
export class ExecutionStore {
    directory;
    owned = new Set();
    constructor(directory) { this.directory = resolve(directory); }
    path(teamId) { return join(this.directory, 'v2', `${policyDigest(teamId)}.json`); }
    atomic(path, value, directory) {
        const content = `${JSON.stringify(value, null, 2)}\n`;
        if (Buffer.byteLength(content) > LIMIT)
            throw new Error('Routing state exceeds 4 MiB');
        mkdirSync(directory, { recursive: true, mode: 0o700 });
        const temporary = `${path}.${randomUUID()}.tmp`;
        let fd;
        try {
            fd = openSync(temporary, 'wx', 0o600);
            writeFileSync(fd, content, 'utf8');
            fsyncSync(fd);
            closeSync(fd);
            fd = undefined;
            renameSync(temporary, path);
        }
        finally {
            if (fd !== undefined)
                closeSync(fd);
            if (existsSync(temporary))
                unlinkSync(temporary);
        }
    }
    backupLegacy(legacy) {
        const directory = join(this.directory, 'migrations');
        const path = join(directory, `legacy-${policyDigest(legacy)}.json`);
        if (existsSync(path)) {
            if (statSync(path).size > LIMIT)
                throw new Error('Legacy backup exceeds 4 MiB');
            const saved = JSON.parse(readFileSync(path, 'utf8'));
            if (JSON.stringify(saved) !== JSON.stringify({ version: 1, legacy }))
                throw new Error('Legacy backup does not match; preserve it and investigate');
        }
        else
            this.atomic(path, { version: 1, legacy }, directory);
        return path;
    }
    records(teamId) {
        const path = this.path(teamId);
        let records = [];
        if (existsSync(path)) {
            if (statSync(path).size > LIMIT)
                throw new Error('Routing state exceeds 4 MiB');
            const saved = fileSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
            if (saved.teamId !== teamId)
                throw new Error('Routing state team identity mismatch');
            records = saved.records.map(record => terminal.has(record.state) || record.ownerProcess === PROCESS_EPOCH
                ? record : { ...record, state: 'unknown' });
        }
        return records;
    }
    list(teamId) {
        // After reload there is no trustworthy local activation handle. Keep the disk
        // record intact so the previous plugin's native completion callback can settle
        // it without erasing newly admitted runs. All mutations merge a fresh disk cut.
        return this.records(teamId).map(record => terminal.has(record.state) || this.owned.has(record.id)
            ? record : { ...record, state: 'unknown' });
    }
    commit(teamId, records, historyLimit) {
        if (!Number.isInteger(historyLimit) || historyLimit < 1 || historyLimit > 1000)
            throw new Error('Invalid history limit');
        let finished = records.filter(record => terminal.has(record.state)).length;
        const next = records.filter(record => !terminal.has(record.state) || finished-- <= historyLimit);
        const value = { version: 2, teamId, records: next };
        while (Buffer.byteLength(JSON.stringify(value, null, 2)) + 1 > LIMIT) {
            const index = next.findIndex(record => terminal.has(record.state));
            if (index < 0)
                throw new Error('Active routing state exceeds 4 MiB');
            next.splice(index, 1);
        }
        this.atomic(this.path(teamId), value, join(this.directory, 'v2'));
    }
    begin(teamId, input, limit) {
        const now = new Date().toISOString();
        const record = recordSchema.parse({ ...input, ownerProcess: PROCESS_EPOCH, id: randomUUID(), state: 'preparing', createdAt: now, updatedAt: now });
        this.commit(teamId, [...this.records(teamId), record], limit);
        this.owned.add(record.id);
        return structuredClone(record);
    }
    update(teamId, id, patch, limit) {
        try {
            const records = this.records(teamId);
            if (!records.some(record => record.id === id))
                throw new Error('Execution record not found');
            this.commit(teamId, records.map(record => record.id !== id ? record : recordSchema.parse({ ...record, ...patch, updatedAt: new Date().toISOString() })), limit);
        }
        finally {
            if (patch.state !== undefined && terminal.has(patch.state))
                this.owned.delete(id);
        }
    }
}
//# sourceMappingURL=execution-store.js.map