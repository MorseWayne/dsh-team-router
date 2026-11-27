import * as React from 'react';
import type { CatalogIndex } from './catalog-index.ts';
import type { ModelChoice } from './ModelPicker.tsx';
import { type RegisterField } from './RouteRow.tsx';
import type { CustomCategoryDraft, CustomCategorySeed, RoutingSection, RoutingValidationIssue } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';
interface Props {
    t: Translate;
    locale: 'en' | 'zh';
    custom: readonly CustomCategoryDraft[];
    instance: string;
    catalog: CatalogIndex;
    catalogReady: boolean;
    catalogStatus: string | undefined;
    defaultSummary: string | undefined;
    disabled: boolean;
    issue: RoutingValidationIssue | undefined;
    registerField: RegisterField;
    onAdd(seed?: CustomCategorySeed): string | undefined;
    onUpdate(id: string, patch: Partial<Pick<CustomCategoryDraft, 'id' | 'name' | 'purpose' | 'avoid' | 'enabled' | 'proactive'>>): void;
    onRemove(id: string): void;
    onModel(section: RoutingSection, choice: ModelChoice): void;
    onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}
export declare const CustomCategoryEditor: React.NamedExoticComponent<Props>;
export {};
