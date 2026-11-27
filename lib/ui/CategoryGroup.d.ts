import * as React from 'react';
import type { BuiltinCategory, BuiltinGroupId, BuiltinId } from '../core/categories.ts';
import type { CatalogIndex } from './catalog-index.ts';
import type { ModelChoice } from './ModelPicker.tsx';
import { type RegisterField } from './RouteRow.tsx';
import type { BuiltinDraftEntry, RoutingSection, RoutingValidationIssue } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';
interface Props {
    t: Translate;
    locale: 'en' | 'zh';
    groupId: BuiltinGroupId;
    entries: readonly BuiltinCategory[];
    draftBuiltins: Record<BuiltinId, BuiltinDraftEntry>;
    instance: string;
    catalog: CatalogIndex;
    catalogReady: boolean;
    catalogStatus: string | undefined;
    defaultSummary: string | undefined;
    disabled: boolean;
    issue: RoutingValidationIssue | undefined;
    registerField: RegisterField;
    onToggleEnabled(id: BuiltinId, enabled: boolean): void;
    onModel(section: RoutingSection, choice: ModelChoice): void;
    onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}
export declare const CategoryGroup: React.NamedExoticComponent<Props>;
export {};
