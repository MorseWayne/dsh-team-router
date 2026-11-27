export declare const BUILTIN_GROUPS: Readonly<{
    readonly implementation: Readonly<{
        id: "implementation";
        zh: "产品与工程实现";
        en: "Product & engineering";
    }>;
    readonly quality: Readonly<{
        id: "quality";
        zh: "质量与交付";
        en: "Quality & delivery";
    }>;
    readonly analysis: Readonly<{
        id: "analysis";
        zh: "分析与表达";
        en: "Analysis & expression";
    }>;
    readonly general: Readonly<{
        id: "general";
        zh: "通用与兜底";
        en: "General & fallback";
    }>;
}>;
export type BuiltinGroupId = keyof typeof BUILTIN_GROUPS;
export declare const BUILTIN_IDS: readonly ["visual-engineering", "frontend-engineering", "backend-data", "deep", "debugging", "code-review", "verification-automation", "ultrabrain", "artistry", "writing", "scout", "quick", "unspecified"];
export type BuiltinId = typeof BUILTIN_IDS[number];
export interface BuiltinCategoryText {
    readonly name: string;
    readonly purpose: string;
    readonly shortPurpose: string;
    readonly avoid: string;
    readonly example: string;
    readonly deliverableCheck: string;
}
export interface BuiltinCategory {
    readonly id: BuiltinId;
    readonly group: BuiltinGroupId;
    readonly proactive: boolean;
    readonly classic7: boolean;
    /** Enabled when omitted from an existing V3 config (not the new-install preset). */
    readonly defaultEnabled: boolean;
    readonly zh: BuiltinCategoryText;
    readonly en: BuiltinCategoryText;
}
export declare const BUILTINS: Readonly<Record<BuiltinId, BuiltinCategory>>;
export declare const BUILTIN_LIST: readonly BuiltinCategory[];
export declare const CLASSIC7_IDS: readonly BuiltinId[];
export interface CustomCategoryTemplateText {
    readonly name: string;
    readonly purpose: string;
    readonly avoid: string;
    readonly example: string;
    readonly nearBuiltin: string;
}
export interface CustomCategoryTemplate {
    readonly templateId: 'evidence-check' | 'security-audit' | 'data-eval' | 'safe-migration';
    readonly suggestedId: string;
    readonly zh: CustomCategoryTemplateText;
    readonly en: CustomCategoryTemplateText;
}
export declare const CUSTOM_CATEGORY_TEMPLATES: readonly CustomCategoryTemplate[];
export declare const MAX_CUSTOM_CATEGORIES = 8;
export declare const CUSTOM_ID_PATTERN: RegExp;
export declare function isBuiltinId(value: unknown): value is BuiltinId;
export declare function getBuiltinCategory(value: unknown): BuiltinCategory;
export declare function generateCustomCategoryId(name: string, existingIds?: Iterable<string>): string;
