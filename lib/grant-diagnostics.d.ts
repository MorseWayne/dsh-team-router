export declare const CODEX_SUBAGENT = "@deepseek-ai/dsh-subagent-codex";
type Plugin = {
    entryId: string;
    moduleName: string;
    enabled: boolean;
    fiberPhase: string | null;
};
type Incompatible = {
    name: string;
    version: string;
    runtimeVersion: string;
};
type Bundle = {
    name: string;
    installed: boolean;
    version?: string;
    installTarget?: {
        version: string;
    };
    error?: {
        code: string;
        incompatible?: Incompatible[];
    };
};
type Answer<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
};
export interface InventoryReader {
    listPlugins(): Promise<Answer<Plugin[]>>;
    listBundles(): Promise<Answer<Bundle[]>>;
}
export interface GrantEvidence {
    component: 'unknown' | 'missing' | 'disabled' | 'active' | 'failed' | 'starting';
    conflict?: {
        name: string;
        installed: string;
        runtime: string;
        offered?: string;
    };
}
export declare function readGrantEvidence(reader?: InventoryReader): Promise<GrantEvidence>;
export {};
