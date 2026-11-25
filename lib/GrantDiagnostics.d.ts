import * as React from 'react';
import { type GrantProblem } from './model-grants.ts';
import { type InventoryReader } from './grant-diagnostics.ts';
export declare function GrantDiagnostics({ problem, locale, inventory, recheck, openBundle, dirty }: {
    problem: GrantProblem;
    locale: string;
    inventory(): InventoryReader | undefined;
    recheck(): Promise<'available' | 'unchanged' | 'unknown'>;
    openBundle?: ((name: string) => void) | undefined;
    dirty: boolean;
}): React.JSX.Element;
