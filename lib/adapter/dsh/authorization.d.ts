import { z } from 'zod';
import type { AgentOptions } from '@deepseek-ai/dsh-agent';
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
declare const allowedRoutes: z.ZodArray<z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>>;
export type AuthorizedRoute = z.infer<typeof allowedRoutes>[number];
/** UPSTREAM-REPLACEABLE (touchpoint T6, docs/UPSTREAM_PROPOSAL.md §1): delete this
 * module once DSH exports a read-only model authorization query.
 * rc.3 has no exported authorization service. Fold the durable, first-write-only
 * native policy event under our own projection key; never read/write profile policy.
 * Keep semantics equivalent to dsh-tool-subagent's model-selection-state.ts.
 */
export declare const authorizationProjection: ProjectionDefinition<'teamRouter.modelAuthorization', AuthorizedRoute[] | null>;
/** Selection in the settings page is NOT a replacement for Session authorization. */
export declare function assertAuthorizedRoute(routes: readonly AuthorizedRoute[] | null, parent: AgentOptions, selected: AuthorizedRoute): void;
export {};
