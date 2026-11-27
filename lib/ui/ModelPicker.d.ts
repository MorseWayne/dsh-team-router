import * as React from 'react';
import { type CatalogIndex } from './catalog-index.ts';
import type { Translate } from './settings-copy.ts';
declare const ICON_PATHS: {
    chevron: string;
    check: string;
    reset: string;
    passive: string;
    'specialist-first': string;
    orchestrator: string;
    info: string;
    arrow: string;
};
export declare function Icon({ name }: {
    name: keyof typeof ICON_PATHS;
}): React.JSX.Element;
export type ModelChoice = {
    mode: 'default';
} | {
    mode: 'inherit';
} | {
    mode: 'explicit';
    provider: string;
    id: string;
};
interface Props {
    t: Translate;
    catalog: CatalogIndex;
    status: string | undefined;
    mode: ModelChoice['mode'];
    provider: string | undefined;
    model: string | undefined;
    label: string;
    detail: string | undefined;
    defaultSummary: string | undefined;
    id: string;
    titleId: string;
    invalid: boolean;
    issueId: string;
    disabled: boolean;
    register(node: HTMLButtonElement | null): void;
    onSelect(choice: ModelChoice): void;
}
export declare const ModelPicker: React.NamedExoticComponent<Props>;
export {};
