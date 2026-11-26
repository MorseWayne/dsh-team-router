/** Stable application categories, inspired by OmO rather than its changing model presets. */
export declare const CATEGORY_IDS: readonly ["visual-engineering", "ultrabrain", "deep", "artistry", "quick", "unspecified", "writing"];
export type CategoryId = typeof CATEGORY_IDS[number];
export type CategoryLocale = 'en' | 'zh';
export interface CategoryText {
    readonly name: string;
    readonly purpose: string;
    readonly avoid: string;
    readonly example: string;
}
export interface CategoryDefinition {
    readonly id: CategoryId;
    readonly zh: CategoryText;
    readonly en: CategoryText;
}
/** A fixed registry: no provider, model recommendation, identity mapping, or permissions. */
export declare const CATEGORIES: Readonly<Record<CategoryId, CategoryDefinition>>;
export declare const CATEGORY_LIST: readonly CategoryDefinition[];
export declare function isCategoryId(value: unknown): value is CategoryId;
/** Exact identifiers only; retired design identifiers are errors, never silent aliases. */
export declare function getCategory(value: unknown): CategoryDefinition;
/** Lead-facing selection guidance, not a keyword classifier or a permissions instruction. */
export declare function categorySelectionGuidance(locale?: CategoryLocale): string;
