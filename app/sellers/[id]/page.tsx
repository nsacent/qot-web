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

function getRating(summary: any, seller: any) {
    return (
        summary?.average_rating ||
        summary?.avg_rating ||
        seller?.average_rating ||
        seller?.avg_rating ||
        0
    );
}

function getTotalReviews(summary: any, seller: any) {
    return (
        summary?.total_reviews ||
        summary?.reviews_count ||
        seller?.total_reviews ||
        seller?.reviews_count ||
        0
    );
}

function getTrustScore(summary: any, seller: any) {
    return summary?.trust_score || seller?.trust_score || 0;
}

function formatDate(value: any) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function SellerProfilePage({ params }: PageProps) {
    const { id } = await params;

    let seller: any = null;
    let listings: any[] = [];
    let reviewSummary: any = null;
    let reviews: any[] = [];

    const [sellerResult, listingsResult, summaryResult, reviewsResult] =
        await Promise.allSettled([
            apiGet(`/sellers/${id}/`),
            apiGet(`/sellers/${id}/listings/`),
            apiGet(`/reviews/sellers/${id}/summary/`),
            apiGet(`/reviews/sellers/${id}/`),
        ]);

    if (sellerResult.status === "fulfilled") {
        seller = unwrapObject(sellerResult.value);
    }

    if (listingsResult.status === "fulfilled") {
        listings = getArray(listingsResult.value);
    }

    if (summaryResult.status === "fulfilled") {
        reviewSummary = unwrapObject(summaryResult.value);
    }

    if (reviewsResult.status === "fulfilled") {
        reviews = getArray(reviewsResult.value).slice(0, 5);
    }

    if (!seller) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />

                <section className="mx-auto max-w-4xl px-6 py-16">
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        Seller profile not found.
                    </div>
                </section>
            </main>
        );
    }

    const sellerName = getSellerName(seller);
    const sellerLocation = getSellerLocation(seller);
    const rating = getRating(reviewSummary, seller);
    const totalReviews = getTotalReviews(reviewSummary, seller);
    const trustScore = getTrustScore(reviewSummary, seller);

    const activeListingCount =
        seller?.active_listing_count ||
        seller?.active_listings_count ||
        seller?.listings_count ||
        listings.length;

    const joinedDate =
        seller?.date_joined ||
        seller?.created_at ||
        seller?.joined_at ||
        seller?.created;

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <a
                        href="/listings"
                        className="mb-6 inline-block text-sm font-semibold text-orange-300 hover:text-orange-200"
                    >
                        ← Back to listings
                    </a>

                    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
                        <div>
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500 text-4xl font-black text-white">
                                    {sellerName.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-black md:text-5xl">
                                            {sellerName}
                                        </h1>

                                        {(seller?.is_verified ||
                                            seller?.verified ||
                                            seller?.account_verified) && (
                                                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                                    Verified Seller
                                                </span>
                                            )}
                                    </div>

                                    <p className="mt-3 text-slate-300">{sellerLocation}</p>

                                    {joinedDate && (
                                        <p className="mt-1 text-sm text-slate-400">
                                            Joined {formatDate(joinedDate)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {seller?.bio || seller?.description || seller?.about ? (
                                <p className="mt-8 max-w-3xl leading-7 text-slate-300">
                                    {seller.bio || seller.description || seller.about}
                                </p>
                            ) : (
                                <p className="mt-8 max-w-3xl leading-7 text-slate-300">
                                    View this seller’s active adverts, reviews, and trust details
                                    on QOT.
                                </p>
                            )}
                        </div>

                        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
                            <h2 className="text-xl font-bold">Seller Trust Summary</h2>

                            <div className="mt-5 grid gap-4">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Average Rating
                                    </p>
                                    <p className="mt-1 text-3xl font-black">
                                        {Number(rating).toFixed(1)} / 5
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Total Reviews
                                    </p>
                                    <p className="mt-1 text-3xl font-black">
                                        {Number(totalReviews).toLocaleString()}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Trust Score
                                    </p>
                                    <p className="mt-1 text-3xl font-black">
                                        {Number(trustScore).toLocaleString()}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Active Listings
                                    </p>
                                    <p className="mt-1 text-3xl font-black">
                                        {Number(activeListingCount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Seller Adverts
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Active listings by {sellerName}
                        </h2>
                    </div>

                    <a
                        href={`/sellers/${id}/listings`}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        View all →
                    </a>
                </div>

                {listings.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        This seller has no active listings at the moment.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.slice(0, 9).map((listing: any) => (
                            <ListingCard key={listing.id || listing.slug} listing={listing} />
                        ))}
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-12">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Reviews
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                What buyers say
                            </h2>
                        </div>

                        <p className="text-sm font-semibold text-slate-500">
                            {Number(totalReviews).toLocaleString()} review
                            {Number(totalReviews) === 1 ? "" : "s"}
                        </p>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                            No reviews yet.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reviews.map((review: any) => (
                                <div
                                    key={review.id || review.created_at}
                                    className="rounded-2xl border p-5"
                                >
                                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                                        <p className="font-bold text-slate-900">
                                            {review.reviewer?.full_name ||
                                                review.reviewer?.name ||
                                                review.reviewer_name ||
                                                "Buyer"}
                                        </p>

                                        <p className="text-sm font-semibold text-orange-600">
                                            {Number(review.rating || 0).toFixed(1)} / 5
                                        </p>
                                    </div>

                                    {review.comment || review.description ? (
                                        <p className="mt-3 leading-6 text-slate-600">
                                            {review.comment || review.description}
                                        </p>
                                    ) : null}

                                    {review.created_at && (
                                        <p className="mt-3 text-xs text-slate-500">
                                            {formatDate(review.created_at)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}