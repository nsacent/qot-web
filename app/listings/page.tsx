import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

type ListingsPageProps = {
    searchParams: Promise<{
        category?: string;
        search?: string;
    }>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
    const params = await searchParams;

    let listings: any[] = [];

    const query = new URLSearchParams();

    if (params.category) {
        query.set("category", params.category);
    }

    if (params.search) {
        query.set("search", params.search);
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
                    <h1 className="text-3xl font-bold md:text-5xl">Browse Listings</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        Discover trusted ads from sellers around Uganda.
                    </p>

                    <form
                        action="/listings"
                        className="mt-6 flex max-w-2xl overflow-hidden rounded-2xl border bg-white p-2"
                    >
                        {params.category && (
                            <input type="hidden" name="category" value={params.category} />
                        )}

                        <input
                            name="search"
                            defaultValue={params.search || ""}
                            placeholder="Search listings..."
                            className="flex-1 px-4 py-3 outline-none"
                        />

                        <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
                            Search
                        </button>
                    </form>

                    {(params.category || params.search) && (
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
                        No listings found yet.
                    </div>
                )}
            </section>
        </main>
    );
}