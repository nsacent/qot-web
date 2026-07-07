import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";
import ListingFilters from "@/components/listings/ListingFilters";
import Pagination from "@/components/listings/Pagination";
import SaveSearchButton from "@/components/listings/SaveSearchButton";

type ListingsPageProps = {
    searchParams: Promise<{
        q?: string;
        search?: string;
        category?: string;
        city?: string;
        region?: string;
        min_price?: string;
        max_price?: string;
        condition?: string;
        sort?: string;
        brand?: string;
        ram?: string;
        bedrooms?: string;
        page?: string;
    }>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
    const params = await searchParams;

    let listings: any[] = [];
    let totalCount: number | undefined = undefined;
    let hasNext = false;
    let hasPrevious = false;

    let categories: any[] = [];
    let regions: any[] = [];
    let cities: any[] = [];

    const query = new URLSearchParams();

    const searchTerm = params.q || params.search || "";

    if (searchTerm) query.set("q", searchTerm);
    if (params.category) query.set("category", params.category);
    if (params.city) query.set("city", params.city);
    if (params.region) query.set("region", params.region);
    if (params.min_price) query.set("min_price", params.min_price);
    if (params.max_price) query.set("max_price", params.max_price);
    if (params.condition) query.set("condition", params.condition);
    if (params.sort) query.set("sort", params.sort);
    if (params.brand) query.set("brand", params.brand);
    if (params.ram) query.set("ram", params.ram);
    if (params.bedrooms) query.set("bedrooms", params.bedrooms);

    if (params.page && params.page !== "1") {
        query.set("page", params.page);
    }

    const endpoint = query.toString()
        ? `/listings/?${query.toString()}`
        : "/listings/";

    try {
        const [categoriesData, regionsData, citiesData] = await Promise.allSettled([
            apiGet("/categories/"),
            apiGet("/locations/regions/"),
            apiGet("/locations/cities/"),
        ]);

        if (categoriesData.status === "fulfilled") {
            categories = getArray(categoriesData.value);
        }

        if (regionsData.status === "fulfilled") {
            regions = getArray(regionsData.value);
        }

        if (citiesData.status === "fulfilled") {
            cities = getArray(citiesData.value);
        }
    } catch (error) {
        console.error("Filters API error:", error);
    }

    try {
        const data = await apiGet(endpoint);

        listings = getArray(data);

        totalCount = typeof data?.count === "number" ? data.count : undefined;
        hasNext = Boolean(data?.next);
        hasPrevious = Boolean(data?.previous);
    } catch (error: any) {
        console.error("Listings API error:", error?.message || error);

        listings = [];
        totalCount = 0;
        hasNext = false;
        hasPrevious = Number(params.page || 1) > 1;
    }

    const hasFilters =
        searchTerm ||
        params.category ||
        params.city ||
        params.region ||
        params.min_price ||
        params.max_price ||
        params.condition ||
        params.sort ||
        params.brand ||
        params.ram ||
        params.bedrooms;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Browse Listings
                            </p>

                            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                                {searchTerm
                                    ? `Search results for "${searchTerm}"`
                                    : "Browse Listings"}
                            </h1>

                            <p className="mt-3 max-w-2xl text-slate-600">
                                {searchTerm
                                    ? "Showing adverts that match your search."
                                    : "Discover trusted ads from sellers around Uganda."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <SaveSearchButton />

                            <a
                                href="/saved-searches"
                                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                            >
                                Saved Searches
                            </a>
                        </div>
                    </div>

                    <div className="mt-8">
                        <ListingFilters
                            categories={categories}
                            regions={regions}
                            cities={cities}
                        />
                    </div>

                    {hasFilters && (
                        <a
                            href="/listings"
                            className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                            Clear all filters
                        </a>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <p className="text-sm font-semibold text-slate-600">
                        {typeof totalCount === "number"
                            ? `${totalCount.toLocaleString()} listing${totalCount === 1 ? "" : "s"
                            } found`
                            : `${listings.length.toLocaleString()} listing${listings.length === 1 ? "" : "s"
                            } found`}
                    </p>

                    {hasFilters && (
                        <p className="text-sm text-slate-500">Filters applied</p>
                    )}
                </div>

                {listings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing: any) => (
                            <ListingCard key={listing.id || listing.slug} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        No listings found. Try changing your filters.
                    </div>
                )}

                <Pagination
                    currentPage={Number(params.page || 1)}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    totalCount={totalCount}
                    searchParams={{
                        q: searchTerm,
                        category: params.category,
                        city: params.city,
                        region: params.region,
                        min_price: params.min_price,
                        max_price: params.max_price,
                        condition: params.condition,
                        sort: params.sort,
                        brand: params.brand,
                        ram: params.ram,
                        bedrooms: params.bedrooms,
                    }}
                />
            </section>
        </main>
    );
}