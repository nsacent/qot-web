import Navbar from "@/components/layout/QotMarketplaceNav";
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
        seller?.business_name ||
        seller?.shop_name ||
        seller?.full_name ||
        seller?.name ||
        seller?.username ||
        seller?.phone ||
        "Seller"
    );
}

function getSellerInitial(seller: any) {
    const name = getSellerName(seller);
    return name.charAt(0).toUpperCase();
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

function getSellerPhone(seller: any) {
    return (
        seller?.phone ||
        seller?.phone_number ||
        seller?.mobile ||
        seller?.contact_phone ||
        seller?.whatsapp ||
        ""
    );
}

function getSellerEmail(seller: any) {
    return seller?.email || "";
}

function getSellerBio(seller: any) {
    return (
        seller?.bio ||
        seller?.about ||
        seller?.description ||
        seller?.business_description ||
        "This seller is active on QOT. Check available adverts, ratings, and contact options before making a purchase."
    );
}

function getRating(summary: any, seller: any) {
    return Number(
        summary?.average_rating ||
        summary?.avg_rating ||
        seller?.average_rating ||
        seller?.rating ||
        0
    );
}

function getTotalReviews(summary: any, seller: any) {
    return Number(
        summary?.total_reviews ||
        summary?.reviews_count ||
        seller?.total_reviews ||
        seller?.reviews_count ||
        0
    );
}

function getTrustScore(seller: any) {
    return Number(
        seller?.trust_score ||
        seller?.seller_score ||
        seller?.score ||
        seller?.profile?.trust_score ||
        0
    );
}

function isVerifiedSeller(seller: any) {
    return (
        seller?.is_verified === true ||
        seller?.verified === true ||
        seller?.account_verified === true ||
        seller?.phone_verified === true ||
        seller?.profile?.is_verified === true
    );
}

function formatPhoneForWhatsApp(phone: string) {
    const cleaned = String(phone || "").replace(/\D/g, "");

    if (!cleaned) return "";

    if (cleaned.startsWith("256")) return cleaned;

    if (cleaned.startsWith("0")) {
        return `256${cleaned.slice(1)}`;
    }

    return cleaned;
}

function formatRating(value: number) {
    if (!value) return "0.0";
    return value.toFixed(1);
}

export default async function SellerProfilePage({ params }: PageProps) {
    const { id } = await params;

    let seller: any = null;
    let listings: any[] = [];
    let reviews: any[] = [];
    let reviewSummary: any = null;

    const [sellerResult, listingsResult, reviewsResult, summaryResult] =
        await Promise.allSettled([
            apiGet(`/sellers/${id}/`),
            apiGet(`/sellers/${id}/listings/`),
            apiGet(`/reviews/sellers/${id}/`),
            apiGet(`/reviews/sellers/${id}/summary/`),
        ]);

    if (sellerResult.status === "fulfilled") {
        seller = unwrapObject(sellerResult.value);
    }

    if (listingsResult.status === "fulfilled") {
        listings = getArray(listingsResult.value);
    }

    if (reviewsResult.status === "fulfilled") {
        reviews = getArray(reviewsResult.value);
    }

    if (summaryResult.status === "fulfilled") {
        reviewSummary = unwrapObject(summaryResult.value);
    }

    const sellerName = seller ? getSellerName(seller) : "Seller";
    const sellerLocation = seller ? getSellerLocation(seller) : "Uganda";
    const sellerPhone = seller ? getSellerPhone(seller) : "";
    const sellerEmail = seller ? getSellerEmail(seller) : "";
    const sellerBio = seller ? getSellerBio(seller) : "";
    const rating = getRating(reviewSummary, seller);
    const totalReviews = getTotalReviews(reviewSummary, seller);
    const trustScore = getTrustScore(seller);
    const verified = seller ? isVerifiedSeller(seller) : false;
    const whatsappPhone = formatPhoneForWhatsApp(sellerPhone);

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <a
                        href="/listings"
                        className="mb-8 inline-block text-sm font-semibold text-orange-300 hover:text-orange-200"
                    >
                        ← Back to listings
                    </a>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-orange-500 text-5xl font-black text-white shadow-lg">
                                    {seller ? getSellerInitial(seller) : "S"}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-3xl font-black md:text-5xl">
                                            {sellerName}
                                        </h1>

                                        {verified && (
                                            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-slate-300">{sellerLocation}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                                            {listings.length.toLocaleString()} active adverts
                                        </span>

                                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                                            ⭐ {formatRating(rating)} rating
                                        </span>

                                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                                            {totalReviews.toLocaleString()} reviews
                                        </span>

                                        {trustScore > 0 && (
                                            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                                                Trust score: {trustScore}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:min-w-56">
                                {sellerPhone && (
                                    <a
                                        href={`tel:${sellerPhone}`}
                                        className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                                    >
                                        Call Seller
                                    </a>
                                )}

                                {whatsappPhone && (
                                    <a
                                        href={`https://wa.me/${whatsappPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700"
                                    >
                                        WhatsApp Seller
                                    </a>
                                )}

                                {sellerEmail && (
                                    <a
                                        href={`mailto:${sellerEmail}`}
                                        className="rounded-xl border border-white/20 px-5 py-3 text-center font-semibold text-white hover:bg-white/10"
                                    >
                                        Email Seller
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 rounded-2xl bg-white/10 p-5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                                About Seller
                            </p>

                            <p className="mt-2 leading-7 text-slate-200">{sellerBio}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div>
                        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                    Seller Listings
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Active adverts by {sellerName}
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
                            <div className="grid gap-6 sm:grid-cols-2">
                                {listings.slice(0, 6).map((listing: any) => (
                                    <ListingCard
                                        key={listing.id || listing.slug}
                                        listing={listing}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Seller Trust
                            </p>

                            <div className="mt-5 grid gap-3">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Verification
                                    </p>

                                    <p
                                        className={
                                            verified
                                                ? "mt-1 font-bold text-green-600"
                                                : "mt-1 font-bold text-orange-600"
                                        }
                                    >
                                        {verified ? "Verified seller" : "Not verified"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Rating
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        ⭐ {formatRating(rating)} / 5
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Reviews
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        {totalReviews.toLocaleString()}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Active adverts
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        {listings.length.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Buyer Safety
                            </p>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Meet in a safe public place.</li>
                                <li>• Inspect the item before payment.</li>
                                <li>• Avoid sending money before seeing the item.</li>
                                <li>• Report suspicious listings or sellers.</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                    Reviews
                                </p>

                                <span className="text-sm font-semibold text-slate-500">
                                    {totalReviews.toLocaleString()}
                                </span>
                            </div>

                            {reviews.length === 0 ? (
                                <p className="text-sm text-slate-600">
                                    No reviews yet for this seller.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.slice(0, 3).map((review: any, index: number) => (
                                        <div
                                            key={review.id || index}
                                            className="rounded-xl bg-slate-50 p-4"
                                        >
                                            <p className="font-bold text-slate-900">
                                                ⭐ {review.rating || review.score || "5"}
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {review.comment ||
                                                    review.review ||
                                                    review.message ||
                                                    "Good seller."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}