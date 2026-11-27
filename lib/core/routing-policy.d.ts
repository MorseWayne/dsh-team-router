import type { BuiltinId } from './categories.ts';
export declare const DELEGATION_MODES: readonly ["passive", "specialist-first", "orchestrator"];
export type DelegationMode = typeof DELEGATION_MODES[number];
export declare function isDelegationMode(value: unknown): value is DelegationMode;
export type Target = {
    mode: 'inherit';
} | {
    mode: 'explicit';
    provider: string;
    model: string;
    reasoningEffort?: string;
};
export type FrozenTarget = Readonly<Target>;
export type Binding = {
    mode: 'default';
} | Target;
export interface BuiltinOverride {
    enabled?: boolean;
    binding?: Binding;
}
export interface CustomCategory {
    id: string;
    name: string;
    purpose: string;
    avoid?: string;
    enabled: boolean;
    proactive: boolean;
    binding: Binding;
}
export interface RoutingBehavior {
    guidance: boolean;
    delegationMode: DelegationMode;
    strict: boolean;
}
export interface RoutingConfig {
    version: 3;
    defaultTarget: Target;
    behavior: RoutingBehavior;
    builtins: Partial<Record<BuiltinId, BuiltinOverride>>;
    custom: CustomCategory[];
    historyLimit: number;
}
export declare function parseTarget(input: unknown): Target;
export declare function parseBinding(input: unknown): Binding;
export declare function createDefaultRoutingConfig(): RoutingConfig;
/** Defaults fill omitted top-level values only; present invalid data is never reset. */
export declare function parseRoutingConfig(input: unknown): RoutingConfig;
export declare function routingConfigFingerprint(input: unknown): string;
