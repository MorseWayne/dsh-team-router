import type { CatalogModel, ModelCatalog } from '../core/recommendations.ts';
export interface IndexedModel {
    model: CatalogModel;
    searchText: string;
}
export interface IndexedProvider {
    id: string;
    name: string;
    failed: boolean;
    searchText: string;
    duplicateNames: ReadonlySet<string>;
    models: ReadonlyMap<string, IndexedModel>;
}
export type CatalogIndex = ReadonlyMap<string, IndexedProvider>;
export declare function indexCatalog(catalog?: ModelCatalog): CatalogIndex;
/** Return a bounded prefix so broad queries (including an empty query) don't mount the whole catalog. */
export declare function searchCatalog(index: CatalogIndex, normalizedQuery: string, limit: number): {
    groups: {
        provider: IndexedProvider;
        models: CatalogModel[];
    }[];
    hasMore: boolean;
};
