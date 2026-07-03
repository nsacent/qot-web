import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";
import ListingFilters from "@/components/listings/ListingFilters";
import Pagination from "@/components/listings/Pagination";

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

    if (searchTerm) {
        query.set("q", searchTerm);
    }

    if (params.page) {
        query.set("page", params.page);
    }

    if (params.category) {
        query.set("category", params.category);
    }

    if (params.city) {
        query.set("city", params.city);
    }

    if (params.region) {
        query.set("region", params.region);
    }

    if (params.min_price) {
        query.set("min_price", params.min_price);
    }

    if (params.max_price) {
        query.set("max_price", params.max_price);
    }

    if (params.condition) {
        query.set("condition", params.condition);
    }

    if (params.sort) {
        query.set("sort", params.sort);
    }

    const endpoint = query.toString()
        ? `/listings/?${query.toString()}`
        : "/listings/";

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

    try {
        const regionsData = await apiGet("/locations/regions/");
        regions = getArray(regionsData);
    } catch (error) {
        console.error("Regions API error:", error);
    }

    try {
        const citiesData = await apiGet("/locations/cities/");
        cities = getArray(citiesData);
    } catch (error) {
        console.error("Cities API error:", error);
    }

    try {
        const categoriesData = await apiGet("/categories/");
        categories = getArray(categoriesData);
    } catch (error) {
        console.error("Categories API error:", error);
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">
                        {searchTerm ? `Search results for "${searchTerm}"` : "Browse Listings"}
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        {searchTerm
                            ? "Showing adverts that match your search."
                            : "Discover trusted ads from sellers around Uganda."}
                    </p>

                    <ListingFilters
                        params={{
                            q: searchTerm,
                            category: params.category,
                            city: params.city,
                            region: params.region,
                            min_price: params.min_price,
                            max_price: params.max_price,
                            condition: params.condition,
                            sort: params.sort,
                        }}
                        categories={categories}
                        regions={regions}
                        cities={cities}
                    />

                    {(params.category || searchTerm) && (
                        <a
                            href="/listings"
                            className="mt-4 inline-block text-sm font-semibold text-orange-600"
                        >
                            Clear filters
                        </a>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                {listings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing: any) => (
                            <ListingCard key={listing.id || listing.slug} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        No listings found.
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
                    }}
                />

            </section>
        </main>
    );
}