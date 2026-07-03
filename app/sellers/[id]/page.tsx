import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function SellerProfilePage({ params }: PageProps) {
    const { id } = await params;

    let seller: any = null;
    let listings: any[] = [];

    try {
        seller = await apiGet(`/sellers/${id}/`);
    } catch (error) {
        console.error("Seller profile API error:", error);
    }

    try {
        const listingsData = await apiGet(`/sellers/${id}/listings/`);
        listings = getArray(listingsData);
    } catch (error) {
        console.error("Seller listings API error:", error);
    }

    if (!seller) {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-16">
                    <div className="rounded-2xl border bg-white p-8">
                        <h1 className="text-2xl font-bold">Seller not found</h1>
                        <p className="mt-2 text-slate-600">
                            This seller profile may not be available.
                        </p>

                        <a
                            href="/listings"
                            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
                        >
                            Browse listings
                        </a>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <a
                        href="/listings"
                        className="mb-6 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        ← Back to listings
                    </a>

                    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Seller Profile
                            </p>

                            <h1 className="text-3xl font-bold md:text-5xl">
                                {seller.full_name || seller.name || seller.username || "QOT Seller"}
                            </h1>

                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                                <span className="rounded-full bg-slate-100 px-4 py-2">
                                    {seller.total_listings || listings.length || 0} listings
                                </span>

                                <span className="rounded-full bg-slate-100 px-4 py-2">
                                    Trust Score: {seller.trust_score || "New"}
                                </span>

                                <span className="rounded-full bg-slate-100 px-4 py-2">
                                    Rating: {seller.average_rating || "No rating yet"}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-slate-50 p-6 text-sm text-slate-700">
                            <p>
                                <span className="font-semibold">Phone:</span>{" "}
                                {seller.phone || "Hidden"}
                            </p>
                            <p className="mt-2">
                                <span className="font-semibold">Email:</span>{" "}
                                {seller.email || "Not provided"}
                            </p>
                            <p className="mt-2">
                                <span className="font-semibold">Status:</span>{" "}
                                {seller.is_verified ? "Verified Seller" : "Unverified Seller"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <h2 className="mb-6 text-2xl font-bold">Seller Listings</h2>

                {listings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing: any) => (
                            <ListingCard key={listing.id || listing.slug} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        This seller has no active listings yet.
                    </div>
                )}
            </section>
        </main>
    );
}