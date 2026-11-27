import { z } from 'zod';
declare const recordSchema: z.ZodObject<{
    id: z.ZodString;
    categoryId: z.ZodString;
    categoryNameAtStart: z.ZodString;
    categoryOrigin: z.ZodEnum<{
        custom: "custom";
        builtin: "builtin";
    }>;
    source: z.ZodEnum<{
        default: "default";
        category: "category";
    }>;
    policyDigest: z.ZodString;
    target: z.ZodPipe<z.ZodUnknown, z.ZodTransform<{
        mode: "inherit";
    } | {
        mode: "explicit";
        provider: string;
        model: string;
        reasoningEffort?: string;
    }, unknown>>;
    ownerProcess: z.ZodOptional<z.ZodString>;
    state: z.ZodEnum<{
        running: "running";
        preparing: "preparing";
        completed: "completed";
        failed: "failed";
        cancelling: "cancelling";
        cancelled: "cancelled";
        unknown: "unknown";
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    childId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    stopReason: z.ZodOptional<z.ZodString>;
    diagnostic: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ExecutionRecord = z.infer<typeof recordSchema>;
export type ExecutionState = ExecutionRecord['state'];
export declare const policyDigest: (policy: unknown) => string;
/** Separate execution files; older state formats are not reinterpreted. */
export declare class ExecutionStore {
    readonly directory: string;
    private readonly owned;
    constructor(directory: string);
    private path;
    private atomic;
    private records;
    list(teamId: string): ExecutionRecord[];
    private commit;
    begin(teamId: string, input: Pick<ExecutionRecord, 'categoryId' | 'categoryNameAtStart' | 'categoryOrigin' | 'source' | 'target' | 'policyDigest'>, limit: number): ExecutionRecord;
    update(teamId: string, id: string, patch: Partial<Pick<ExecutionRecord, 'state' | 'childId' | 'name' | 'stopReason' | 'diagnostic'>>, limit: number): void;
}
export {};
