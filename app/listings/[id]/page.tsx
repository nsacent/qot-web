import Navbar from "@/components/layout/Navbar";
import { apiGet } from "@/lib/api";
import FavoriteButton from "@/components/listings/FavoriteButton";
import ContactSellerButton from "@/components/chats/ContactSellerButton";
import ReportListingButton from "@/components/listings/ReportListingButton";
import RecentlyViewedTracker from "@/components/listings/RecentlyViewedTracker";
import ShareListingButton from "@/components/listings/ShareListingButton";
import SimilarListings from "@/components/listings/SimilarListings";
import SellerContactActions from "@/components/listings/SellerContactActions";
import ReviewSellerForm from "@/components/reviews/ReviewSellerForm";
import ListingImageGallery from "@/components/listings/ListingImageGallery";
import BuyerListingActions from "@/components/listings/BuyerListingActions";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ListingDetailsPage({ params }: PageProps) {
    const { id } = await params;

    let listing: any = null;

    try {
        const data = await apiGet(`/listings/${id}/`);
        listing = data?.listing || data?.data || data;
    } catch (error) {
        console.error("Listing detail API error:", error);
    }

    if (!listing) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8">
                    Listing not found.
                </div>
            </main>
        );
    }

    const sellerId =
        listing?.seller?.id ||
        listing?.seller_id ||
        listing?.user?.id ||
        listing?.user_id;

    const sellerName =
        listing?.seller?.full_name ||
        listing?.seller?.name ||
        listing?.seller?.username ||
        listing?.seller_name ||
        "Seller";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <RecentlyViewedTracker listing={listing} />

            <Navbar />

            <section className="mx-auto max-w-7xl px-6 py-10">
                <a
                    href="/listings"
                    className="mb-6 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    ← Back to listings
                </a>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ListingImageGallery listing={listing} />

                        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                {listing.category?.name || listing.category_name || "Listing"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {(listing.is_featured ||
                                    listing.featured ||
                                    listing.featured_until) && (
                                        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                                            Featured
                                        </span>
                                    )}

                                {(listing.seller?.is_verified || listing.seller?.verified) && (
                                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                        Verified Seller
                                    </span>
                                )}

                                {listing.status && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                                        {listing.status}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                                {listing.title || "Untitled listing"}
                            </h1>

                            <p className="mt-3 text-slate-500">
                                {listing.city?.name || listing.location || "Uganda"}
                            </p>

                            <p className="mt-6 text-3xl font-bold text-orange-600">
                                {listing.price
                                    ? `UGX ${Number(listing.price).toLocaleString()}`
                                    : "Contact seller"}
                            </p>

                            <div className="mt-8 border-t pt-6">
                                <h2 className="text-xl font-bold">Description</h2>

                                <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                                    {listing.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold">Seller Information</h2>

                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <p>
                                    <span className="font-semibold">Seller:</span>{" "}
                                    {sellerId ? (
                                        <a
                                            href={`/sellers/${sellerId}`}
                                            className="font-semibold text-orange-600 hover:text-orange-700"
                                        >
                                            {sellerName}
                                        </a>
                                    ) : (
                                        sellerName
                                    )}
                                </p>

                                {sellerId && (
                                    <a
                                        href={`/sellers/${sellerId}`}
                                        className="inline-block rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                                    >
                                        View seller profile →
                                    </a>
                                )}

                                <p>
                                    <span className="font-semibold">Location:</span>{" "}
                                    {listing.city?.name || listing.location || "Uganda"}
                                </p>

                                <p>
                                    <span className="font-semibold">Status:</span>{" "}
                                    {listing.status || "Available"}
                                </p>
                            </div>

                            <div className="mt-6">
                                <BuyerListingActions listing={listing} listingId={listing.id} />
                            </div>
                        </div>

                        <ShareListingButton listing={listing} />

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold">Safety Tips</h2>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Meet the seller in a safe public place.</li>
                                <li>• Check the item properly before paying.</li>
                                <li>• Avoid sending money before seeing the item.</li>
                                <li>• Report suspicious adverts to QOT support.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>

            <SimilarListings listing={listing} />
        </main>
    );
}