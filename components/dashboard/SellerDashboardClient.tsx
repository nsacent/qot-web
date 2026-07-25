"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faChartLine,
    faCircleCheck,
    faClockRotateLeft,
    faPlus,
    faRectangleList,
} from "@fortawesome/free-solid-svg-icons";
import ListingExpiryCountdown from "@/components/listings/ListingExpiryCountdown";
import {
    getListingExpiryValue,
    getListingFeaturedUntil,
    listingCanBeRenewed,
    listingIsCurrentlyFeatured,
} from "@/lib/listingExpiry";

async function dashboardApi<T = any>(
    path: string,
    method: "GET" | "POST" = "GET"
): Promise<T> {
    const response = await fetch(`/api/proxy${path}`, {
        method,
        credentials: "include",
        cache: "no-store",
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify({}) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.message || `Dashboard request failed: ${response.status}`
        );
    }

    return data as T;
}

function apiGet<T = any>(path: string) {
    return dashboardApi<T>(path);
}

function apiPost<T = any>(path: string) {
    return dashboardApi<T>(path, "POST");
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getApiOrigin() {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

function normalizeImageUrl(image: string) {
    if (!image) return "";

    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:") ||
        image.startsWith("blob:")
    ) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${getApiOrigin()}${image}`;
    }

    if (image.startsWith("media/")) {
        return `${getApiOrigin()}/${image}`;
    }

    return `${getApiOrigin()}/media/${image}`;
}

function getNumber(...values: any[]) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return Number(value) || 0;
        }
    }

    return 0;
}

function getArray(...values: any[]): any[] {
    for (const value of values) {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.results)) return value.results;
        if (Array.isArray(value?.data)) return value.data;
        if (Array.isArray(value?.data?.results)) return value.data.results;
        if (Array.isArray(value?.listings)) return value.listings;
        if (Array.isArray(value?.data?.listings)) return value.data.listings;
    }

    return [];
}

function getListingId(listing: any) {
    const item = listing?.listing || listing;

    return (
        item?.id ||
        listing?.listing_id ||
        item?.listing_id ||
        listing?.advert_id ||
        item?.advert_id ||
        listing?.id ||
        ""
    );
}

function getTitle(listing: any) {
    const item = listing?.listing || listing;

    return item?.title || listing?.title || "Untitled ad";
}

function getImage(listing: any) {
    const item = listing?.listing || {};
    const top = listing || {};

    const image =
        item?.primary_image ||
        top?.primary_image ||
        item?.image ||
        top?.image ||
        item?.image_url ||
        top?.image_url ||
        item?.cover_image ||
        top?.cover_image ||
        item?.cover_image_url ||
        top?.cover_image_url ||
        item?.thumbnail ||
        top?.thumbnail ||
        item?.thumbnail_url ||
        top?.thumbnail_url ||
        item?.main_image ||
        top?.main_image ||
        item?.main_image_url ||
        top?.main_image_url ||
        item?.images?.[0]?.image ||
        top?.images?.[0]?.image ||
        item?.images?.[0]?.url ||
        top?.images?.[0]?.url ||
        item?.images?.[0]?.image_url ||
        top?.images?.[0]?.image_url ||
        item?.images?.[0]?.file ||
        top?.images?.[0]?.file ||
        item?.photos?.[0]?.image ||
        top?.photos?.[0]?.image ||
        item?.photos?.[0]?.url ||
        top?.photos?.[0]?.url ||
        item?.media?.[0]?.image ||
        top?.media?.[0]?.image ||
        item?.media?.[0]?.url ||
        top?.media?.[0]?.url ||
        "";

    return normalizeImageUrl(String(image || ""));
}

function getPrice(listing: any) {
    const item = listing?.listing || listing;
    const price = item?.price || listing?.price;

    if (!price) return "Contact seller";

    return `UGX ${Number(price).toLocaleString()}`;
}

function getStatus(listing: any) {
    const item = listing?.listing || listing;

    return item?.status || listing?.status || "active";
}

function getViews(listing: any) {
    return getNumber(
        listing?.views,
        listing?.views_count,
        listing?.view_count,
        listing?.total_views,
        listing?.listing?.views,
        listing?.listing?.views_count
    );
}

function getSaves(listing: any) {
    return getNumber(
        listing?.saves,
        listing?.saved_count,
        listing?.favorites_count,
        listing?.favourites_count,
        listing?.total_saves,
        listing?.listing?.saves,
        listing?.listing?.favorites_count
    );
}

function findFullListing(listing: any, allListings: any[]) {
    const listingId = String(getListingId(listing));

    if (!listingId) return null;

    return (
        allListings.find((item) => String(getListingId(item)) === listingId) || null
    );
}

function enrichListing(listing: any, allListings: any[]) {
    const fullListing = findFullListing(listing, allListings);

    if (!fullListing) return listing;

    const fullNested = fullListing?.listing || fullListing;
    const dashboardNested = listing?.listing || {};

    return {
        ...fullListing,
        ...listing,
        listing: {
            ...fullNested,
            ...dashboardNested,
        },
    };
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load seller dashboard. Please make sure you are logged in and verified.";
    }

    return message;
}

function ListingMiniCard({
    listing,
    allListings = [],
    showRenew = false,
    onChanged,
}: {
    listing: any;
    allListings?: any[];
    showRenew?: boolean;
    onChanged?: () => void;
}) {
    const [loading, setLoading] = useState("");

    const enrichedListing = enrichListing(listing, allListings);
    const listingId = getListingId(enrichedListing);
    const image = getImage(enrichedListing);
    const expiryValue = getListingExpiryValue(enrichedListing);
    const featuredUntil = getListingFeaturedUntil(enrichedListing);
    const isFeatured = listingIsCurrentlyFeatured(enrichedListing);
    const canRenew = listingCanBeRenewed(enrichedListing);
    const canRelist = ["expired", "unavailable", "sold"].includes(
        String(getStatus(enrichedListing)).toLowerCase()
    );

    async function runAction(action: "renew" | "relist") {
        if (!listingId) return;
        if (action === "renew" && !canRenew) return;
        if (action === "relist" && !canRelist) return;

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this advert?`
        );

        if (!confirmed) return;

        setLoading(action);

        try {
            await apiPost(`/listings/${listingId}/${action}/`);
            if (onChanged) onChanged();
        } catch (error: any) {
            alert(error.message || `Failed to ${action} advert.`);
        } finally {
            setLoading("");
        }
    }

    return (
        <article className="grid grid-cols-[82px_minmax(0,1fr)] items-start gap-3 rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] md:grid-cols-[112px_1fr_auto] md:items-center md:gap-4 md:rounded-[24px]">
            <div className="flex h-20 items-center justify-center overflow-hidden rounded-[16px] bg-slate-200 text-slate-500 md:h-28 md:rounded-[18px]">
                {image ? (
                    <img
                        src={image}
                        alt={getTitle(enrichedListing)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-xs font-bold">No image</span>
                )}
            </div>

            <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950 md:text-base">
                    {getTitle(enrichedListing)}
                </h3>

                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 md:mt-2 md:gap-2 md:text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 capitalize ring-1 ring-slate-200">
                        {getStatus(enrichedListing)}
                    </span>
                    <span className="text-orange-600">{getPrice(enrichedListing)}</span>
                </p>

                <p className="mt-2 text-[10px] font-semibold text-slate-500 md:mt-3 md:text-xs">
                    Views: {getViews(enrichedListing).toLocaleString()} · Saves:{" "}
                    {getSaves(enrichedListing).toLocaleString()}
                </p>

                {expiryValue && (
                    <ListingExpiryCountdown
                        expiresAt={expiryValue}
                        label="Ad:"
                        className="mt-1.5"
                    />
                )}

                {isFeatured && featuredUntil && (
                    <ListingExpiryCountdown
                        expiresAt={featuredUntil}
                        label="Featured:"
                        expiredLabel="Featured period ended"
                        className="mt-1 text-violet-700"
                    />
                )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-2 md:col-span-1 md:min-w-[132px] md:grid-cols-1">
                {listingId && (
                    <>
                        <a
                            href={`/account/analytics/${listingId}`}
                            className="rounded-xl bg-orange-500 px-4 py-2.5 text-center text-xs font-black text-white hover:bg-orange-600"
                        >
                            Analytics
                        </a>

                        <a
                            href={`/account/my-ads/${listingId}/edit`}
                            className="rounded-xl bg-white px-4 py-2.5 text-center text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                            Edit
                        </a>
                    </>
                )}

                {showRenew && listingId && (
                    <>
                        <a
                            href="/account/renewals"
                            className="rounded-xl bg-white px-4 py-2.5 text-center text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Renewal Center
                        </a>
                        <button
                            type="button"
                            onClick={() => runAction("renew")}
                            disabled={Boolean(loading) || !canRenew}
                            className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100"
                        >
                            {loading === "renew"
                                ? "Renewing..."
                                : canRenew
                                    ? "Renew"
                                    : "Available after expiry"}
                        </button>

                        {canRelist && (
                            <button
                                type="button"
                                onClick={() => runAction("relist")}
                                disabled={Boolean(loading)}
                                className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {loading === "relist" ? "Relisting..." : "Relist"}
                            </button>
                        )}
                    </>
                )}
            </div>
        </article>
    );
}

function MobilePerformanceTile({
    label,
    listing,
    allListings,
    tone,
}: {
    label: string;
    listing: any;
    allListings: any[];
    tone: string;
}) {
    if (!listing) {
        return (
            <div className="min-h-32 rounded-[20px] bg-white p-4 ring-1 ring-slate-200">
                <p className={`text-[9px] font-black uppercase tracking-wider ${tone}`}>{label}</p>
                <p className="mt-4 text-xs font-bold leading-5 text-slate-400">No ad data yet</p>
            </div>
        );
    }

    const enrichedListing = enrichListing(listing, allListings);
    const listingId = getListingId(enrichedListing);
    const image = getImage(enrichedListing);

    return (
        <a
            href={listingId ? `/account/my-ads/${listingId}` : "/account/my-ads"}
            className="min-w-0 rounded-[20px] bg-white p-3.5 shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98]"
        >
            <p className={`text-[9px] font-black uppercase tracking-wider ${tone}`}>{label}</p>
            <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-slate-100 text-[9px] font-black text-slate-300">
                    {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                        "QOT"
                    )}
                </div>
                <div className="min-w-0">
                    <p className="line-clamp-2 text-[11px] font-black leading-4 text-slate-900">
                        {getTitle(enrichedListing)}
                    </p>
                    <p className="mt-1 text-[9px] font-bold text-slate-400">
                        {getViews(enrichedListing).toLocaleString()} views
                    </p>
                </div>
            </div>
        </a>
    );
}

export default function SellerDashboardClient() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
            const [dashboardResult, listingsResult] = await Promise.allSettled([
                apiGet("/seller/dashboard/"),
                apiGet("/seller/listings/?page_size=1000"),
            ]);

            if (dashboardResult.status === "rejected") {
                throw dashboardResult.reason;
            }

            const dashboardData = dashboardResult.value;
            setDashboard(dashboardData);

            if (listingsResult.status === "fulfilled") {
                const sellerListings = getArray(listingsResult.value);
                setListings(sellerListings);
                console.log("Seller listings response:", sellerListings);
            } else {
                setListings([]);
                console.warn("Seller listings failed:", listingsResult.reason);
            }

            console.log("Seller dashboard response:", dashboardData);
        } catch (error: any) {
            setDashboard(null);
            setListings([]);
            setError(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    const summary = dashboard?.summary || dashboard?.data?.summary || dashboard || {};

    const recentListings = getArray(
        dashboard?.recent_listings,
        dashboard?.data?.recent_listings,
        summary?.recent_listings
    );

    const dashboardFeaturedListings = getArray(
        dashboard?.active_featured_listings,
        dashboard?.featured_listings,
        dashboard?.data?.active_featured_listings,
        summary?.active_featured_listings
    );
    const featuredListings = dashboardFeaturedListings.length > 0
        ? dashboardFeaturedListings
        : listings.filter((listing) => listingIsCurrentlyFeatured(listing));

    const dashboardRenewalListings = getArray(
        dashboard?.listings_needing_renewal,
        dashboard?.needs_renewal,
        dashboard?.renewal_listings,
        dashboard?.data?.listings_needing_renewal,
        summary?.listings_needing_renewal
    );
    const renewalListings = dashboardRenewalListings.length > 0
        ? dashboardRenewalListings
        : listings.filter((listing) => listingCanBeRenewed(listing));

    const bestListing =
        dashboard?.best_listing ||
        dashboard?.data?.best_listing ||
        summary?.best_listing ||
        [...listings].sort((a, b) => getViews(b) - getViews(a))[0];

    const weakestListing =
        dashboard?.weakest_listing ||
        dashboard?.data?.weakest_listing ||
        summary?.weakest_listing ||
        [...listings].sort((a, b) => getViews(a) - getViews(b))[0];

    const stats = [
        {
            label: "Total Ads",
            value: getNumber(
                summary?.total_listings,
                summary?.listings_count,
                listings.length
            ),
            helper: "All your adverts",
            tone: "from-orange-500 to-orange-600 text-white",
            icon: faRectangleList,
        },
        {
            label: "Active Ads",
            value: getNumber(summary?.active_listings, summary?.active_count),
            helper: "Visible to buyers",
            tone: "from-emerald-50 to-green-100 text-emerald-800",
            icon: faCircleCheck,
        },
        {
            label: "Featured",
            value: getNumber(
                summary?.active_featured_listings,
                summary?.featured_listings,
                featuredListings.length
            ),
            helper: "Currently promoted",
            tone: "from-violet-50 to-purple-100 text-violet-800",
            icon: faBolt,
        },
        {
            label: "Need Renewal",
            value: getNumber(
                summary?.listings_needing_renewal,
                summary?.renewal_count,
                renewalListings.length
            ),
            helper: "Needs your attention",
            tone: "from-amber-50 to-orange-100 text-amber-800",
            icon: faClockRotateLeft,
        },
    ];

    return (
        <section className="py-0 text-slate-950 md:py-6">
            <div className="relative mb-7 hidden overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-8 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] md:block">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-orange-300/20">
                            Account Dashboard
                        </span>

                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                            Grow your marketplace presence
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                            Track advert performance, manage renewals, and see what buyers respond to—all in one place.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <a
                            href="/account/analytics"
                            className="rounded-[16px] bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
                        >
                            View Analytics
                        </a>

                        <a
                            href="/post-ad"
                            className="rounded-[16px] bg-orange-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] hover:bg-orange-400"
                        >
                            Post New Advert
                        </a>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                    <p className="mt-4 text-sm font-black text-slate-600">Loading your dashboard...</p>
                </div>
            ) : error ? (
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-7 text-red-700 shadow-sm">
                    <p className="font-black">Dashboard unavailable</p>
                    <p className="mt-2 text-sm font-semibold">{error}</p>
                    <button type="button" onClick={loadDashboard} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white hover:bg-red-700">
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-[20px] bg-gradient-to-br p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5 md:rounded-[26px] md:p-6 ${stat.tone}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[9px] font-black uppercase tracking-wide opacity-75 md:text-xs">
                                        {stat.label}
                                    </p>
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/45 md:h-9 md:w-9">
                                        <FontAwesomeIcon icon={stat.icon} className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                    </span>
                                </div>

                                <p className="mt-2 text-2xl font-black md:mt-3 md:text-4xl">
                                    {Number(stat.value).toLocaleString()}
                                </p>
                                <p className="mt-1 text-[9px] font-bold opacity-70 md:mt-2 md:text-xs">{stat.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 md:hidden">
                        <a href="/post-ad" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-3 text-xs font-black text-white shadow-lg shadow-orange-100">
                            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                            Post an ad
                        </a>
                        <a href="/account/my-ads" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                            <FontAwesomeIcon icon={faRectangleList} className="h-3.5 w-3.5 text-orange-500" />
                            My ads
                        </a>
                        <a href="/account/analytics" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                            <FontAwesomeIcon icon={faChartLine} className="h-3.5 w-3.5 text-blue-500" />
                            Analytics
                        </a>
                        <a href="/account/renewals" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="h-3.5 w-3.5 text-violet-500" />
                            Renewals
                        </a>
                    </div>

                    <div className="mt-5 md:hidden">
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">Performance</p>
                                <h2 className="mt-1 text-lg font-black text-slate-950">Your ad highlights</h2>
                            </div>
                            <a href="/account/analytics" className="text-[10px] font-black text-orange-600">See all</a>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <MobilePerformanceTile label="Top performer" listing={bestListing} allListings={listings} tone="text-emerald-600" />
                            <MobilePerformanceTile label="Needs attention" listing={weakestListing} allListings={listings} tone="text-amber-600" />
                        </div>
                    </div>

                    <div className="mt-8 hidden gap-6 md:grid lg:grid-cols-2">
                        <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                                Top performer
                            </p>

                            {bestListing ? (
                                <div className="mt-4">
                                    <ListingMiniCard
                                        listing={bestListing}
                                        allListings={listings}
                                    />
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">No best ad yet.</p>
                            )}
                        </div>

                        <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                                Opportunity to improve
                            </p>

                            {weakestListing ? (
                                <div className="mt-4">
                                    <ListingMiniCard
                                        listing={weakestListing}
                                        allListings={listings}
                                    />
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">No weak ad yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 rounded-[24px] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:mt-8 md:rounded-[30px] md:p-6">
                        <div className="mb-4 md:mb-5">
                            <p className="text-[10px] font-black uppercase tracking-wide text-orange-600 md:text-sm md:font-semibold">
                                Ads Needing Renewal
                            </p>

                            <h2 className="mt-1 text-lg font-black text-slate-900 md:mt-2 md:text-2xl md:font-bold">
                                Renew or relist adverts
                            </h2>
                        </div>

                        {renewalListings.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 md:p-6">
                                No ads need renewal right now.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {renewalListings.map((listing) => (
                                    <ListingMiniCard
                                        key={getListingId(listing) || getTitle(listing)}
                                        listing={listing}
                                        allListings={listings}
                                        showRenew
                                        onChanged={loadDashboard}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-5 md:mt-8 md:gap-6 lg:grid-cols-2">
                        <div className="rounded-[24px] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:rounded-[30px] md:p-6">
                            <div className="mb-4 md:mb-5">
                                <p className="text-[10px] font-black uppercase tracking-wide text-orange-600 md:text-sm md:font-semibold">
                                    Recent Ads
                                </p>

                                <h2 className="mt-1 text-lg font-black text-slate-900 md:mt-2 md:text-2xl md:font-bold">
                                    Latest seller adverts
                                </h2>
                            </div>

                            {recentListings.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                    No recent ad data available.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {recentListings.slice(0, 5).map((listing) => (
                                        <ListingMiniCard
                                            key={getListingId(listing) || getTitle(listing)}
                                            listing={listing}
                                            allListings={listings}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[24px] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:rounded-[30px] md:p-6">
                            <div className="mb-4 md:mb-5">
                                <p className="text-[10px] font-black uppercase tracking-wide text-orange-600 md:text-sm md:font-semibold">
                                    Active Featured Ads
                                </p>

                                <h2 className="mt-1 text-lg font-black text-slate-900 md:mt-2 md:text-2xl md:font-bold">
                                    Promoted adverts
                                </h2>
                            </div>

                            {featuredListings.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                    No active featured ads right now.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {featuredListings.slice(0, 5).map((listing) => (
                                        <ListingMiniCard
                                            key={getListingId(listing) || getTitle(listing)}
                                            listing={listing}
                                            allListings={listings}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
