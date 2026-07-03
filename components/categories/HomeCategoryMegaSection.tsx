type HomeCategoryMegaSectionProps = {
    categories: any[];
};

function getCategoryId(category: any) {
    return category.id || category.slug;
}

function getCategorySlug(category: any) {
    return category.slug || category.id;
}

function getParentId(category: any) {
    return (
        category.parent?.id ||
        category.parent_id ||
        category.parent ||
        null
    );
}

function getChildren(category: any, allCategories: any[]) {
    if (Array.isArray(category.children) && category.children.length > 0) {
        return category.children;
    }

    const parentId = getCategoryId(category);

    return allCategories.filter((item: any) => {
        const itemParentId = getParentId(item);
        return String(itemParentId) === String(parentId);
    });
}

function getParentCategories(categories: any[]) {
    const categoriesWithChildren = categories.filter((category: any) => {
        const parentId = getParentId(category);
        const children = getChildren(category, categories);

        return !parentId || children.length > 0;
    });

    const uniqueParents = categoriesWithChildren.filter((category: any) => {
        const parentId = getParentId(category);
        return !parentId;
    });

    return uniqueParents.length > 0 ? uniqueParents : categoriesWithChildren;
}

export default function HomeCategoryMegaSection({
    categories,
}: HomeCategoryMegaSectionProps) {
    const parentCategories = getParentCategories(categories);

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Browse by Category
                    </p>
                    <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                        Find what you need faster
                    </h2>
                </div>

                <a
                    href="/categories"
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    View all categories →
                </a>
            </div>

            {parentCategories.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {parentCategories.slice(0, 9).map((parent: any) => {
                        const children = getChildren(parent, categories);

                        return (
                            <div
                                key={parent.id || parent.slug}
                                className="rounded-2xl border bg-white p-6 shadow-sm"
                            >
                                <a
                                    href={`/listings?category=${getCategorySlug(parent)}`}
                                    className="group block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl font-bold text-orange-600">
                                            {(parent.name || parent.title || "C").charAt(0)}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600">
                                                {parent.name || parent.title || "Category"}
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                {parent.listings_count || parent.count || 0} listings
                                            </p>
                                        </div>
                                    </div>
                                </a>

                                {children.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {children.slice(0, 8).map((child: any) => (
                                            <a
                                                key={child.id || child.slug}
                                                href={`/listings?category=${getCategorySlug(child)}`}
                                                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                {child.name || child.title}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {children.length === 0 && (
                                    <p className="mt-5 text-sm text-slate-500">
                                        Browse available adverts in this category.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Categories will appear here after they are added.
                </div>
            )}
        </section>
    );
}