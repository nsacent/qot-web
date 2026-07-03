type ListingFiltersProps = {
    params: {
        q?: string;
        category?: string;
        city?: string;
        region?: string;
        min_price?: string;
        max_price?: string;
        condition?: string;
        sort?: string;
    };
};

export default function ListingFilters({ params }: ListingFiltersProps) {
    return (
        <form
            action="/listings"
            className="mt-6 grid gap-4 rounded-2xl border bg-white p-4 md:grid-cols-5"
        >
            {params.category && (
                <input type="hidden" name="category" value={params.category} />
            )}

            {params.city && <input type="hidden" name="city" value={params.city} />}

            {params.region && (
                <input type="hidden" name="region" value={params.region} />
            )}

            <input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search listings..."
                className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500 md:col-span-2"
            />

            <input
                name="min_price"
                type="number"
                defaultValue={params.min_price || ""}
                placeholder="Min price"
                className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
            />

            <input
                name="max_price"
                type="number"
                defaultValue={params.max_price || ""}
                placeholder="Max price"
                className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
            />

            <select
                name="condition"
                defaultValue={params.condition || ""}
                className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
            >
                <option value="">Any condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
            </select>

            <select
                name="sort"
                defaultValue={params.sort || "newest"}
                className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
            >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="popular">Most popular</option>
                <option value="featured">Featured first</option>
            </select>

            <button
                type="submit"
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 md:col-span-2"
            >
                Apply Filters
            </button>

            <a
                href="/listings"
                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
            >
                Clear
            </a>
        </form>
    );
}