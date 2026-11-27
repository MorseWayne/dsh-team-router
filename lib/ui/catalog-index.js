export function indexCatalog(catalog) {
    const failed = new Set(catalog?.failures.map(failure => failure.id));
    const providers = new Map();
    for (const group of catalog?.groups ?? []) {
        if (providers.has(group.id))
            continue;
        const models = new Map();
        const names = new Set();
        const duplicateNames = new Set();
        for (const model of group.models) {
            if (models.has(model.id))
                continue;
            models.set(model.id, { model, searchText: `${model.name}\n${model.id}`.toLowerCase() });
            if (names.has(model.name))
                duplicateNames.add(model.name);
            else
                names.add(model.name);
        }
        providers.set(group.id, { id: group.id, name: group.name, failed: failed.has(group.id), searchText: `${group.name}\n${group.id}`.toLowerCase(), duplicateNames, models });
    }
    return providers;
}
/** Return a bounded prefix so broad queries (including an empty query) don't mount the whole catalog. */
export function searchCatalog(index, normalizedQuery, limit) {
    const groups = [];
    let count = 0;
    for (const provider of index.values()) {
        const matchesProvider = provider.searchText.includes(normalizedQuery);
        let matches;
        for (const { model, searchText } of provider.models.values()) {
            if (!matchesProvider && !searchText.includes(normalizedQuery))
                continue;
            if (count === limit)
                return { groups, hasMore: true };
            if (matches === undefined)
                groups.push({ provider, models: matches = [] });
            matches.push(model);
            count++;
        }
    }
    return { groups, hasMore: false };
}
//# sourceMappingURL=catalog-index.js.map