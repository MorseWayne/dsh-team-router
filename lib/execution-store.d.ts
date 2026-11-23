import { z } from 'zod';
import type { Target } from './routing-policy.ts';
import type { CategoryId } from './categories.ts';
import type { NormalizedConfig } from './policy.ts';
declare const recordSchema: z.ZodObject<{
    id: z.ZodString;
    category: z.ZodEnum<{
        "visual-engineering": "visual-engineering";
        ultrabrain: "ultrabrain";
        deep: "deep";
        artistry: "artistry";
        quick: "quick";
        unspecified: "unspecified";
        writing: "writing";
    }>;
    source: z.ZodEnum<{
        default: "default";
        category: "category";
    }>;
    policyDigest: z.ZodString;
    target: z.ZodPipe<z.ZodUnknown, z.ZodTransform<{
        executor: "native";
        model: {
            mode: "inherit";
        };
    } | {
        executor: "native";
        model: {
            mode: "explicit";
            provider: string;
            id: string;
            reasoningEffort?: string;
        };
    } | {
        executor: import("./routing-policy.ts").ExternalExecutor;
        model: {
            mode: "executor-default";
        };
    } | {
        executor: import("./routing-policy.ts").ExternalExecutor;
        model: {
            mode: "explicit";
            id: string;
            reasoningEffort?: string;
        };
    }, unknown>>;
    ownerProcess: z.ZodOptional<z.ZodString>;
    state: z.ZodEnum<{
        unknown: "unknown";
        preparing: "preparing";
        running: "running";
        completed: "completed";
        failed: "failed";
        cancelling: "cancelling";
        cancelled: "cancelled";
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
/** Separate v2 files: old member baselines/overrides/history are never reinterpreted. */
export declare class ExecutionStore {
    readonly directory: string;
    private readonly owned;
    constructor(directory: string);
    private path;
    private atomic;
    backupLegacy(legacy: NormalizedConfig): string;
    private records;
    list(teamId: string): ExecutionRecord[];
    private commit;
    begin(teamId: string, input: {
        category: CategoryId;
        source: 'category' | 'default';
        target: Target;
        policyDigest: string;
    }, limit: number): ExecutionRecord;
    update(teamId: string, id: string, patch: Partial<Pick<ExecutionRecord, 'state' | 'childId' | 'name' | 'stopReason' | 'diagnostic'>>, limit: number): void;
}
export {};
