import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

function unwrapObject(data: any) {
    return data?.seller || data?.data || data?.profile || data || null;
}

function getSellerName(seller: any) {
    return (
        seller?.full_name ||
        seller?.name ||
        seller?.username ||
        seller?.business_name ||
        seller?.shop_name ||
        "Seller"
    );
}

function getSellerLocation(seller: any) {
    return (
        seller?.city?.name ||
        seller?.city_name ||
        seller?.region?.name ||
        seller?.region_name ||
        seller?.location ||
        "Uganda"
    );
}

export default async function SellerListingsPage({ params }: PageProps) {
    const { id } = await params;

    let seller: any = null;
    let listings: any[] = [];

    const [sellerResult, listingsResult] = await Promise.allSettled([
        apiGet(`/sellers/${id}/`),
        apiGet(`/sellers/${id}/listings/`),
    ]);

    if (sellerResult.status === "fulfilled") {
        seller = unwrapObject(sellerResult.value);
    }

    if (listingsResult.status === "fulfilled") {
        listings = getArray(listingsResult.value);
    }

    const sellerName = seller ? getSellerName(seller) : "Seller";
    const sellerLocation = seller ? getSellerLocation(seller) : "Uganda";

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <a
                        href={`/sellers/${id}`}
                        className="mb-6 inline-block text-sm font-semibold text-orange-300 hover:text-orange-200"
                    >
                        ← Back to seller profile
                    </a>

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                                Seller Adverts
                            </p>

                            <h1 className="mt-2 text-3xl font-black md:text-5xl">
                                Listings by {sellerName}
                            </h1>

                            <p className="mt-3 text-slate-300">{sellerLocation}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-5">
                            <p className="text-sm text-slate-300">Active adverts</p>
                            <p className="mt-1 text-4xl font-black">
                                {listings.length.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Available Listings
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Browse this seller’s adverts
                        </h2>
                    </div>

                    <a
                        href="/listings"
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        Browse all listings →
                    </a>
                </div>

                {listings.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        This seller has no active listings at the moment.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing: any) => (
                            <ListingCard key={listing.id || listing.slug} listing={listing} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}