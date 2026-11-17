import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type {} from '@deepseek-ai/dsh-agent-team';
import type { SessionId } from '@deepseek-ai/dsh-session';
import type {} from '@deepseek-ai/dsh-session-projection';
import type {} from '@deepseek-ai/dsh-subagent';

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
export class NativeTeams {
  private readonly ctx: Context;

  constructor(ctx: Context) { this.ctx = ctx; }

  tryMembership(agent: Agent): TeamMembership | undefined {
    if (this.ctx.agents.get(agent.id) !== agent) return undefined;
    try {
      const root = this.ctx.subagents.rootOf(agent);
      if (this.ctx.agents.get(root.id) !== root || !this.ctx.agentTeams.isEnabled(root)) return undefined;
      return {
        root, id: root.id, role: root === agent ? 'lead' : 'teammate',
        name: this.ctx.subagents.namesOf(agent).self,
      };
    } catch {
      // A freshly created child has no activation owner until subagent/start.
      // Disposed, detached, and stale Agent instances are not team members.
      return undefined;
    }
  }

  /** Synchronous live cut, including an activation before catalog publication. */
  liveMembers(agent: Agent): TeamMember[] {
    const membership = this.tryMembership(agent);
    if (membership === undefined) return [];
    const rows: TeamMember[] = [];
    for (const candidate of this.ctx.agents.list()) {
      const current = this.tryMembership(candidate);
      if (current?.root !== membership.root) continue;
      const identity = this.ctx.get('sessionProjections')?.snapshot(candidate.session, ['subagent']).values.subagent;
      rows.push({
        id: candidate.id, name: current.name, role: current.role,
        description: identity?.label ?? '', status: candidate.status,
      });
    }
    return rows;
  }

  /** Add cold continuable descendants without materializing any Agent. */
  async listMembers(agent: Agent, signal?: AbortSignal): Promise<TeamMember[]> {
    const membership = this.tryMembership(agent);
    if (membership === undefined) return [];
    const descendants = await this.ctx.subagents.listDescendants(membership.root.id, signal);
    if (this.tryMembership(agent)?.root !== membership.root) return [];
    const live = this.liveMembers(agent);
    const rows = new Map<SessionId, TeamMember>();
    const root = live.find((row) => row.id === membership.root.id);
    if (root !== undefined) rows.set(root.id, root);
    for (const child of descendants) {
      if (child.kind !== 'child' || child.mode !== 'continuable') continue;
      rows.set(child.id, {
        id: child.id, name: child.path ?? String(child.id), role: 'teammate',
        description: child.label, status: 'inactive',
      });
    }
    // Native runtime ownership/names win over a catalog cut, and newly published
    // local activations are visible even before their first catalog event.
    for (const row of live) rows.set(row.id, row);
    return [...rows.values()];
  }
}
