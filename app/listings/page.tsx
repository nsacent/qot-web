import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

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
    }>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
    const params = await searchParams;

    let listings: any[] = [];

    const query = new URLSearchParams();

    const searchTerm = params.q || params.search || "";

    if (searchTerm) {
        query.set("q", searchTerm);
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
    } catch (error) {
        console.error("Listings API error:", error);
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

                    <form
                        action="/listings"
                        className="mt-6 flex max-w-2xl overflow-hidden rounded-2xl border bg-white p-2"
                    >
                        {params.category && (
                            <input type="hidden" name="category" value={params.category} />
                        )}

                        <input
                            name="q"
                            defaultValue={searchTerm}
                            placeholder="Search listings..."
                            className="flex-1 px-4 py-3 outline-none"
                        />

                        <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
                            Search
                        </button>
                    </form>

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
            </section>
        </main>
    );
}