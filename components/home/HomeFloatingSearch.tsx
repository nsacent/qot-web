type HomeFloatingSearchProps = {
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

export default function HomeFloatingSearch({
    categories = [],
}: HomeFloatingSearchProps) {
    return (
        <section className="relative z-10 mx-auto -mt-8 max-w-[1180px] px-4">
            <form
                action="/listings"
                className="grid gap-3 rounded-3xl bg-white p-4 shadow-[0_15px_45px_rgba(15,23,42,0.12)] md:grid-cols-[1fr_220px_220px_220px]"
            >
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4">
                    <span className="text-lg font-black text-slate-500">⌕</span>

                    <input
                        name="q"
                        placeholder="What are you looking for?"
                        className="w-full border-0 bg-transparent text-sm font-extrabold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                </div>

                <select
                    name="city"
                    className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-950 outline-none"
                    defaultValue=""
                >
                    <option value="">All Cities</option>
                    <option value="kampala">Kampala</option>
                    <option value="wakiso">Wakiso</option>
                    <option value="mukono">Mukono</option>
                    <option value="mbarara">Mbarara</option>
                </select>

                <select
                    name="category"
                    className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-950 outline-none"
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
                    className="h-14 rounded-2xl bg-orange-500 px-6 text-sm font-black text-white shadow-sm hover:bg-orange-600"
                >
                    Search Ads
                </button>
            </form>
        </section>
    );
}