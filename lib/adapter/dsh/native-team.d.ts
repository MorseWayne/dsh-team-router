import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
/** Team identity is the enabled native subagent tree, not the historical roster. */
export interface TeamMembership {
    root: Agent;
    id: SessionId;
    role: 'lead' | 'teammate';
    name: string;
}
export interface TeamMember {
    id: SessionId;
    name: string;
    role: 'lead' | 'teammate';
    description: string;
    status: string;
}
/** Read-only rc.3 adapter; never creates, resumes, or selects Team mode. */
export declare class NativeTeams {
    private readonly ctx;
    constructor(ctx: Context);
    tryMembership(agent: Agent): TeamMembership | undefined;
    /** Synchronous live cut, including an activation before catalog publication. */
    liveMembers(agent: Agent): TeamMember[];
    /** Add cold continuable descendants without materializing any Agent. */
    listMembers(agent: Agent, signal?: AbortSignal): Promise<TeamMember[]>;
}
