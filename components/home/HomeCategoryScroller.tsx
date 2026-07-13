type HomeCategoryScrollerProps = {
    categories?: any[];
};

const fallbackIcons = [
    "🖥️",
    "🚗",
    "🏠",
    "🛍️",
    "🪑",
    "💼",
    "🛠️",
    "📱",
    "🐾",
    "📦",
];

function getCategoryName(category: any) {
    if (typeof category === "string") return category;

    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();

    return category?.slug || category?.id || "";
}

function getCategoryIcon(category: any, index: number) {
    return category?.icon || category?.emoji || fallbackIcons[index] || "📦";
}

export default function HomeCategoryScroller({
    categories = [],
}: HomeCategoryScrollerProps) {
    return (
        <section className="mx-auto max-w-[1390px] px-2 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-slate-950">
                        Browse Categories
                    </h2>

                    <p className="text-xs font-semibold text-slate-500">
                        Swipe or scroll to explore ads.
                    </p>
                </div>

                <a
                    href="/categories"
                    className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm hover:bg-orange-50"
                >
                    View all →
                </a>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4">
                {categories.map((category, index) => {
                    const name = getCategoryName(category);
                    const slug = getCategorySlug(category);
                    const icon = getCategoryIcon(category, index);

                    return (
                        <a
                            key={slug || name}
                            href={slug ? `/listings?category=${slug}` : "/categories"}
                            className="flex min-w-[110px] shrink-0 flex-col items-center rounded-2xl bg-white px-4 py-4 text-center shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                                {icon}
                            </div>

                            <p className="mt-3 line-clamp-1 text-xs font-black text-slate-950">
                                {name}
                            </p>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}