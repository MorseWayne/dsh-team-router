import * as React from 'react';
import type { Target } from '../core/routing-policy.ts';
import type { CatalogIndex } from './catalog-index.ts';
import { type ModelChoice } from './ModelPicker.tsx';
import type { RoutingField, RoutingSection } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';
export type FieldNode = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
export declare const fieldKey: (section: RoutingSection, field: RoutingField) => string;
export type RegisterField = (section: RoutingSection, field: RoutingField, node: FieldNode | null) => void;
export declare function externalModelSummary(target: Exclude<Target, {
    executor: 'native';
}>, t: Translate): string;
export declare function defaultTargetSummary(t: Translate, target: Target, catalog: CatalogIndex, catalogReady: boolean): string;
interface Props {
    t: Translate;
    section: RoutingSection;
    name: string;
    purpose: string;
    instance: string;
    catalog: CatalogIndex;
    catalogReady: boolean;
    catalogStatus: string | undefined;
    executor: Target['executor'];
    legacyModel: string | undefined;
    provider: string | undefined;
    model: string | undefined;
    effort: string | undefined;
    followsDefault: boolean;
    defaultSummary: string | undefined;
    disabled: boolean;
    issueField: RoutingField | undefined;
    registerField: RegisterField;
    onModel(section: RoutingSection, choice: ModelChoice): void;
    onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}
export declare const RouteRow: React.NamedExoticComponent<Props>;
export {};
