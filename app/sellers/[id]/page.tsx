import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import HomeAdCard from "@/components/home/HomeAdCard";
import SellerFollowCard from "@/components/sellers/SellerFollowCard";
import { apiGet, getArray } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCalendarDays,
    faCircleCheck,
    faCommentDots,
    faEnvelope,
    faLocationDot,
    faPhone,
    faShieldHalved,
    faStar,
    faStore,
} from "@fortawesome/free-solid-svg-icons";
import { notFound } from "next/navigation";

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
        seller?.profile?.business_name ||
        seller?.shop_name ||
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

function getSellerLocation(seller: any) {
    return (
        seller?.city?.name ||
        seller?.city_name ||
        seller?.profile?.default_city_name ||
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
    return seller?.email || seller?.contact_email || "";
}

function getSellerAvatar(seller: any) {
    return (
        seller?.avatar ||
        seller?.profile?.avatar ||
        seller?.profile_picture ||
        seller?.photo ||
        ""
    );
}

function getSellerCover(seller: any) {
    return (
        seller?.cover_photo ||
        seller?.profile?.cover_photo ||
        seller?.cover_image ||
        ""
    );
}

function getSellerBio(seller: any) {
    return (
        seller?.bio ||
        seller?.profile?.bio ||
        seller?.about ||
        seller?.description ||
        seller?.business_description ||
        "This seller is active on QOT Uganda. Browse their available ads and contact them directly when you find something you like."
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
    if (cleaned.startsWith("0")) return `256${cleaned.slice(1)}`;

    return cleaned;
}

function formatRating(value: number) {
    return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function formatMemberSince(seller: any) {
    const value = seller?.date_joined || seller?.created_at || seller?.joined_at;
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-UG", {
        month: "short",
        year: "numeric",
    }).format(date);
}

export default async function SellerProfilePage({ params }: PageProps) {
    const { id } = await params;

    let seller: any = null;
    let ads: any[] = [];
    let reviews: any[] = [];
    let reviewSummary: any = null;

    const [sellerResult, adsResult, reviewsResult, summaryResult] =
        await Promise.allSettled([
            apiGet(`/sellers/${id}/`),
            apiGet(`/sellers/${id}/listings/`),
            apiGet(`/reviews/sellers/${id}/`),
            apiGet(`/reviews/sellers/${id}/summary/`),
        ]);

    if (sellerResult.status === "fulfilled") {
        seller = unwrapObject(sellerResult.value);
    }

    if (adsResult.status === "fulfilled") {
        ads = getArray(adsResult.value);
    }

    if (reviewsResult.status === "fulfilled") {
        reviews = getArray(reviewsResult.value);
    }

    if (summaryResult.status === "fulfilled") {
        reviewSummary = unwrapObject(summaryResult.value);
    }

    if (!seller) notFound();

    const sellerName = getSellerName(seller);
    const sellerLocation = getSellerLocation(seller);
    const sellerPhone = getSellerPhone(seller);
    const sellerEmail = getSellerEmail(seller);
    const sellerAvatar = getSellerAvatar(seller);
    const sellerCover = getSellerCover(seller);
    const sellerBio = getSellerBio(seller);
    const rating = getRating(reviewSummary, seller);
    const totalReviews = getTotalReviews(reviewSummary, seller);
    const trustScore = getTrustScore(seller);
    const verified = isVerifiedSeller(seller);
    const whatsappPhone = formatPhoneForWhatsApp(sellerPhone);
    const memberSince = formatMemberSince(seller);

    return (
        <main className="min-h-screen bg-[#f6f7f9] text-slate-950">
            <div className="mx-auto max-w-[1500px] px-4 pt-4 sm:px-6">
                <Navbar />
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-14 pt-1 sm:px-6 sm:pt-3">
                <a
                    href="/ads"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-orange-600"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                    Back to ads
                </a>

                <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:rounded-[34px]">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 sm:h-52">
                        {sellerCover ? (
                            <img
                                src={sellerCover}
                                alt={`${sellerName} cover`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/20" />
                                <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-slate-950/10" />
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.16)_50%,transparent_80%)]" />
                            </>
                        )}
                    </div>

                    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="-mt-14 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white bg-slate-950 text-4xl font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] sm:-mt-16 sm:h-32 sm:w-32 sm:rounded-[30px] sm:text-5xl">
                                    {sellerAvatar ? (
                                        <img
                                            src={sellerAvatar}
                                            alt={sellerName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getSellerInitial(seller)
                                    )}
                                </div>

                                <div className="min-w-0 pb-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="truncate text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                                            {sellerName}
                                        </h1>

                                        {verified && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                                                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500 sm:text-sm">
                                        <span className="inline-flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-orange-500" />
                                            {sellerLocation}
                                        </span>

                                        {memberSince && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faCalendarDays} className="h-3.5 w-3.5 text-slate-400" />
                                                Member since {memberSince}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-[310px]">
                                <SellerFollowCard
                                    sellerId={id}
                                    initialFollowers={Number(seller?.followers_count || 0)}
                                    initialFollowing={Number(seller?.following_count || 0)}
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <div className="max-w-3xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                    About seller
                                </p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 sm:text-[15px]">
                                    {sellerBio}
                                </p>
                            </div>

                            {(sellerPhone || whatsappPhone || sellerEmail) && (
                                <div className="flex flex-wrap gap-2.5">
                                    {sellerPhone && (
                                        <a
                                            href={`tel:${sellerPhone}`}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-800 sm:flex-none"
                                        >
                                            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
                                            Call
                                        </a>
                                    )}

                                    {whatsappPhone && (
                                        <a
                                            href={`https://wa.me/${whatsappPhone}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black text-white transition hover:bg-emerald-600 sm:flex-none"
                                        >
                                            <FontAwesomeIcon icon={faCommentDots} className="h-4 w-4" />
                                            WhatsApp
                                        </a>
                                    )}

                                    {sellerEmail && (
                                        <a
                                            href={`mailto:${sellerEmail}`}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-200 sm:flex-none"
                                        >
                                            <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
                                            Email
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="min-w-0">
                        <div className="mb-4 flex items-end justify-between gap-4 rounded-[24px] bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 sm:px-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                    Seller ads
                                </p>
                                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                    Ads from {sellerName}
                                </h2>
                            </div>

                            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-600 ring-1 ring-orange-100 sm:px-4">
                                {ads.length.toLocaleString()} ad{ads.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        {ads.length === 0 ? (
                            <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/5">
                                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <FontAwesomeIcon icon={faStore} className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 text-lg font-black text-slate-950">No active ads yet</h3>
                                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
                                    This seller does not have any active ads at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                                {ads.map((ad: any) => (
                                    <HomeAdCard key={ad.id || ad.slug} ad={ad} />
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="space-y-5">
                        <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                    <FontAwesomeIcon icon={faStore} className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                                        Seller overview
                                    </p>
                                    <h2 className="mt-0.5 text-lg font-black text-slate-950">At a glance</h2>
                                </div>
                            </div>

                            <div className="mt-5 divide-y divide-slate-100">
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm font-bold text-slate-500">Verification</span>
                                    <span className={`text-sm font-black ${verified ? "text-emerald-600" : "text-slate-700"}`}>
                                        {verified ? "Verified" : "Not verified"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm font-bold text-slate-500">Rating</span>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-950">
                                        <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 text-amber-400" />
                                        {formatRating(rating)}
                                        <span className="font-bold text-slate-400">({totalReviews})</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm font-bold text-slate-500">Active ads</span>
                                    <span className="text-sm font-black text-slate-950">{ads.length.toLocaleString()}</span>
                                </div>
                                {trustScore > 0 && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm font-bold text-slate-500">Trust score</span>
                                        <span className="text-sm font-black text-orange-600">{trustScore}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-[0_14px_35px_rgba(249,115,22,0.22)]">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
                            </span>
                            <h2 className="mt-4 text-lg font-black">Buy safely on QOT</h2>
                            <ul className="mt-3 space-y-2.5 text-xs font-semibold leading-5 text-orange-50">
                                <li>Meet in a safe public place.</li>
                                <li>Inspect the item before paying.</li>
                                <li>Never send money before seeing the item.</li>
                                <li>Report suspicious ads or sellers.</li>
                            </ul>
                            <a href="/safety/report" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-xs font-black text-orange-600 transition hover:bg-orange-50">
                                Safety centre
                            </a>
                        </section>

                        <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">Reviews</p>
                                    <h2 className="mt-1 text-lg font-black text-slate-950">Buyer feedback</h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                                    {totalReviews.toLocaleString()}
                                </span>
                            </div>

                            {reviews.length === 0 ? (
                                <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                                    No reviews yet for this seller.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {reviews.slice(0, 3).map((review: any, index: number) => (
                                        <article key={review.id || index} className="rounded-2xl bg-slate-50 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate text-sm font-black text-slate-900">
                                                    {review.reviewer_name || review.buyer_name || "QOT buyer"}
                                                </p>
                                                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500">
                                                    <FontAwesomeIcon icon={faStar} className="h-3 w-3" />
                                                    {review.rating || review.score || "5"}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                                                {review.comment || review.review || review.message || "Good seller."}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
