import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

type SellerPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function getSellerName(seller: any) {
    return (
        seller?.full_name ||
        seller?.name ||
        seller?.username ||
        seller?.phone ||
        "Seller"
    );
}

function getSellerInitial(seller: any) {
    return getSellerName(seller).charAt(0).toUpperCase();
}

export default async function SellerPage({ params }: SellerPageProps) {
    const resolvedParams = await params;
    const sellerId = resolvedParams.id;

    let listings: any[] = [];
    let seller: any = null;

    try {
        const data = await apiGet(`/listings/?seller=${sellerId}`);
        listings = getArray(data);

        seller =
            data?.seller ||
            listings?.[0]?.seller ||
            listings?.[0]?.seller_details ||
            null;
    } catch (error) {
        console.error("Seller listings API error:", error);
    }

    const activeListings = listings.filter((listing: any) =>
        ["active", "approved", "published"].includes(
            String(listing.status || "").toLowerCase()
        )
    );

    const totalViews = listings.reduce(
        (sum: number, listing: any) =>
            sum + Number(listing.views_count || listing.views || 0),
        0
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <a
                        href="/listings"
                        className="text-sm font-semibold text-orange-300 hover:text-orange-200"
                    >
                        ← Back to listings
                    </a>

                    <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 text-3xl font-bold text-white">
                                {getSellerInitial(seller)}
                            </div>

                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                                    Seller Profile
                                </p>

                                <h1 className="mt-2 text-3xl font-bold">
                                    {getSellerName(seller)}
                                </h1>

                                <p className="mt-2 text-slate-300">
                                    Browse adverts posted by this seller.
                                </p>
                            </div>
                        </div>

                        {seller?.is_verified || seller?.verified ? (
                            <span className="w-fit rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
                                Verified Seller
                            </span>
                        ) : (
                            <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                                Seller
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">
                            Total Adverts
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {listings.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">
                            Active Adverts
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {activeListings.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">
                            Total Views
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {totalViews.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="mt-10">
                    <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Seller Adverts
                            </p>
                            <h2 className="mt-2 text-2xl font-bold">
                                Listings from {getSellerName(seller)}
                            </h2>
                        </div>
                    </div>

                    {listings.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing.id || listing.slug} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border bg-white p-8 text-slate-600">
                            This seller has no visible adverts yet.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}