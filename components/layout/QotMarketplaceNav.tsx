import UserProfileTab from "@/components/layout/UserProfileTab";
type QotMarketplaceNavProps = {
    categories?: any[];
};

function getCategoryName(category: any) {
    if (typeof category === "string") return category;
    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();
    return category?.slug || category?.id || "";
}

export default function QotMarketplaceNav({
    categories = [],
}: QotMarketplaceNavProps) {
    return (
        <header className="sticky top-0 z-40 mb-4 rounded-[2rem] bg-white/90 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-4">
                <a href="/" className="shrink-0">
                    <div className="text-4xl font-black leading-8 tracking-tight text-orange-600">
                        QOT
                    </div>
                    <div className="text-[8px] font-black tracking-tight text-slate-900">
                        Quality • Opportunities • Trust
                    </div>
                </a>

                <a
                    href="/listings"
                    className="hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 md:flex"
                >
                    <span className="text-orange-600">📍</span>
                    Uganda
                    <span className="text-slate-400">⌄</span>
                </a>

                <form
                    action="/listings"
                    className="hidden h-12 flex-1 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex"
                >
                    <div className="flex flex-1 items-center gap-3 px-4">
                        <span className="text-slate-500">⌕</span>

                        <input
                            name="q"
                            placeholder="What are you looking for?"
                            className="h-full flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <select
                        name="category"
                        className="h-full border-l border-slate-100 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
                        defaultValue=""
                    >
                        <option value="">All Categories</option>

                        {categories.map((category) => {
                            const name = getCategoryName(category);
                            const slug = getCategorySlug(category);

                            return (
                                <option key={slug || name} value={slug}>
                                    {name}
                                </option>
                            );
                        })}
                    </select>

                    <button
                        type="submit"
                        className="flex h-full w-14 items-center justify-center bg-orange-500 text-xl font-black text-white hover:bg-orange-600"
                    >
                        ⌕
                    </button>
                </form>

                <nav className="ml-auto hidden items-center gap-5 text-sm font-black text-slate-900 md:flex">
                    <a href="/messages" className="hover:text-orange-600">
                        💬 Messages
                    </a>

                    <a href="/saved" className="hover:text-orange-600">
                        ♡ Favorites
                    </a>
                </nav>

                <a
                    href="/post-ad"
                    className="shrink-0 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600"
                >
                    + Post Ad
                </a>

                <UserProfileTab />
            </div>
        </header>
    );
}