import { z } from 'zod';
import type { AgentOptions } from '@deepseek-ai/dsh-agent';
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';

const allowedRoutes = z.array(z.object({ provider: z.string().min(1), model: z.string().min(1) }).strict()).min(1);
export type AuthorizedRoute = z.infer<typeof allowedRoutes>[number];

/** rc.3 has no exported authorization service. Fold the durable, first-write-only
 * native policy event under our own projection key; never read/write profile policy.
 * Keep semantics equivalent to dsh-tool-subagent's model-selection-state.ts.
 */
export const authorizationProjection: ProjectionDefinition<'teamRouter.modelAuthorization', AuthorizedRoute[] | null> = {
  key: 'teamRouter.modelAuthorization', stateVersion: 1,
  stateSchema: allowedRoutes.nullable(), init: () => null,
  apply(state, event) {
    const type: string = event.type;
    if (state !== null || type !== 'subagent/model-selection-policy') return state;
    const data = event.data as unknown as { allowedModels?: unknown };
    const routes = allowedRoutes.parse(data.allowedModels);
    const keys = new Set(routes.map(route => JSON.stringify([route.provider, route.model])));
    if (keys.size !== routes.length) throw new Error('Invalid native model authorization: duplicate routes');
    return routes;
  },
};

/** Selection in the settings page is NOT a replacement for Session authorization. */
export function assertAuthorizedRoute(routes: readonly AuthorizedRoute[] | null, parent: AgentOptions, selected: AuthorizedRoute): void {
  const allowed = routes === null
    ? selected.provider === parent.provider && selected.model === parent.model
    : routes.some(route => route.provider === selected.provider && route.model === selected.model);
  if (!allowed) throw new Error(`Model route "${selected.provider}/${selected.model}" is not authorized for this Session. Authorize it in DSH or use the inherited model; category settings do not expand Session permissions.`);
}
