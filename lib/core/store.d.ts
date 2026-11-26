import type { Decision, Route } from './policy.ts';
export interface MemberState {
    baseline: Route;
    key: string;
    selected: Route;
    decision: Decision;
}
export interface AuditRecord {
    at: string;
    memberId: string;
    memberName: string;
    boundary: string;
    source: Decision['source'];
    route: Route;
    routeName?: string;
    ruleId?: string;
}
export interface TeamState {
    version: 1;
    teamId: string;
    overrides: Record<string, string>;
    members: Record<string, MemberState>;
    history: AuditRecord[];
}
/** A single Host is the writer. Team identity is hashed only for safe filenames. */
export declare class StateStore {
    readonly directory: string;
    private historyLimit;
    constructor(directory: string, historyLimit: number);
    setHistoryLimit(value: number): void;
    path(teamId: string): string;
    load(teamId: string): TeamState;
    save(state: TeamState): void;
}
