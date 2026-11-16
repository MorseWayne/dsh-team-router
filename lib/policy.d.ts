export interface Route {
    provider: string;
    model: string;
    reasoningEffort?: string;
}
export interface RouterConfig {
    routes: Record<string, Route>;
    rules?: Array<{
        id: string;
        keywords: string[];
        route: string;
        priority?: number;
    }>;
    roles?: Record<string, string>;
    defaultRoute?: string;
    historyLimit?: number;
}
export interface NormalizedConfig {
    routes: Record<string, Route>;
    rules: Array<{
        id: string;
        keywords: string[];
        route: string;
        priority: number;
    }>;
    roles: Record<string, string>;
    defaultRoute?: string;
    historyLimit: number;
}
export interface Decision {
    source: 'manual' | 'task' | 'role' | 'default' | 'inherit';
    routeName?: string;
    route?: Route;
    ruleId?: string;
}
/** Validate untrusted configuration and return a completely detached data graph. */
export declare function parseConfig(input: unknown): NormalizedConfig;
/** Resolve routing without mutating configuration, input, or prior decisions. */
export declare function decide(config: NormalizedConfig, input: {
    memberName: string;
    taskText?: string;
    manualRoute?: string;
}): Decision;
