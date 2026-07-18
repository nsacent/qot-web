"use client";

import { useEffect, useState } from "react";

async function apiGet(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        credentials: "include",
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.message || "Failed to load listing analytics."
        );
    }

    return data;
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ListingAnalyticsClientProps = {
    listingId: string;
};

function getApiOrigin() {
    return API_BASE_URL.replace("/api/v1", "");
}

function normalizeImageUrl(image: string) {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `${getApiOrigin()}${image}`;
    return `${getApiOrigin()}/${image}`;
}

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;
    if (Array.isArray(data?.timeline)) return data.timeline;
    if (Array.isArray(data?.daily_stats)) return data.daily_stats;
    if (Array.isArray(data?.views_by_day)) return data.views_by_day;
    return [];
}

function getNumber(...values: any[]) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return Number(value) || 0;
        }
    }
    return 0;
}

function getListingId(listing: any) {
    return String(listing?.id || listing?.listing?.id || listing?.listing_id || "");
}

function getImage(listing: any) {
    const image =
        listing?.primary_image ||
        listing?.image ||
        listing?.cover_image ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        "";

    return normalizeImageUrl(image);
}

function getTitle(listing: any) {
    return listing?.title || "Untitled listing";
}

function getPrice(listing: any) {
    if (!listing?.price) return "Contact seller";
    return `UGX ${Number(listing.price).toLocaleString()}`;
}

function getLocation(listing: any) {
    return listing?.city?.name || listing?.city_name || listing?.location || "Uganda";
}

function getCategory(listing: any) {
    return listing?.category?.name || listing?.category_name || "Listing";
}

function getViews(analytics: any, listing: any) {
    return getNumber(
        analytics?.views,
        analytics?.views_count,
        analytics?.total_views,
        analytics?.summary?.total_views,
        listing?.views_count,
        listing?.views
    );
}

function getSaves(analytics: any, listing: any) {
    return getNumber(
        analytics?.saves,
        analytics?.saved_count,
        analytics?.favorites_count,
        analytics?.total_saves,
        analytics?.summary?.total_saves,
        listing?.favorites_count,
        listing?.saved_count
    );
}

function getMessages(analytics: any, listing: any) {
    return getNumber(
        analytics?.messages,
        analytics?.messages_count,
        analytics?.inquiries_count,
        analytics?.summary?.total_messages,
        listing?.messages_count
    );
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load listing analytics.";
    }

    return message;
}

export default function ListingAnalyticsClient({
    listingId,
}: ListingAnalyticsClientProps) {
    const [listing, setListing] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [listingsResult, analyticsResult] = await Promise.allSettled([
                apiGet("/seller/listings/"),
                apiGet(`/seller/listings/${listingId}/analytics/`),
            ]);

            if (listingsResult.status === "rejected") {
                throw listingsResult.reason;
            }

            const sellerListings = getArray(listingsResult.value);
            const foundListing = sellerListings.find(
                (item) => getListingId(item) === String(listingId)
            );

            if (!foundListing) {
                throw new Error("This advert was not found among your seller listings.");
            }

            let analyticsData: any = null;

            if (analyticsResult.status === "fulfilled") {
                analyticsData = analyticsResult.value;
                console.log("Listing analytics response:", analyticsData);
            } else {
                console.warn("Listing analytics failed:", analyticsResult.reason);
            }

            console.log("Found seller listing:", foundListing);

            setListing(foundListing);
            setAnalytics(analyticsData);
            setTimeline(getArray(analyticsData));
        } catch (error: any) {
            setListing(null);
            setAnalytics(null);
            setTimeline([]);
            setError(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [listingId]);

    const image = getImage(listing);

    return (
        <section className="py-6">
            <div className="relative mb-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex rounded-full bg-violet-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-200 ring-1 ring-violet-300/20">
                            Advert Analytics
                        </span>
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                            See how this advert performs
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                            Follow buyer interest, engagement, and activity for one listing in detail.
                        </p>
                    </div>

                    <a
                        href="/account/analytics"
                        className="rounded-[16px] bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
                    >
                        All Analytics
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
                    <p className="mt-4 text-sm font-black text-slate-600">Loading advert analytics...</p>
                </div>
            ) : error ? (
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-7 text-red-700 shadow-sm">
                    <p className="font-black">Advert analytics unavailable</p>
                    <p className="mt-2 text-sm font-semibold">{error}</p>
                    <button type="button" onClick={loadData} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white hover:bg-red-700">Try Again</button>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                        <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.09)] ring-1 ring-black/5">
                            <div className="relative flex h-72 items-center justify-center bg-slate-200 text-slate-500">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={getTitle(listing)}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-black">No image found</span>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700 ring-1 ring-slate-200">
                                        {listing?.status || "active"}
                                    </span>

                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700 ring-1 ring-orange-100">
                                        {getCategory(listing)}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-xl font-black text-slate-950">
                                    {getTitle(listing)}
                                </h2>

                                <p className="mt-3 text-2xl font-black text-orange-600">
                                    {getPrice(listing)}
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    {getLocation(listing)}
                                </p>

                                <div className="mt-5 grid gap-3">
                                    <a
                                        href={`/listings/${listingId}`}
                                        className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                                    >
                                        View Public Advert
                                    </a>

                                    <a
                                        href={`/my-ads/${listingId}/edit`}
                                        className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.20)] hover:bg-orange-600"
                                    >
                                        Edit Advert
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                {
                                    label: "Views",
                                    value: getViews(analytics, listing),
                                    helper: "People who opened this advert",
                                    note: "Shows buyer interest",
                                    tone: "from-blue-50 to-cyan-100 text-blue-800",
                                },
                                {
                                    label: "Saves",
                                    value: getSaves(analytics, listing),
                                    helper: "Buyers who saved this advert",
                                    note: "Good sign of serious interest",
                                    tone: "from-rose-50 to-pink-100 text-rose-800",
                                },
                                {
                                    label: "Messages",
                                    value: getMessages(analytics, listing),
                                    helper: "Buyer inquiries from this advert",
                                    note: "Shows direct buyer action",
                                    tone: "from-violet-50 to-purple-100 text-violet-800",
                                },
                                {
                                    label: "Reports",
                                    value: getNumber(
                                        analytics?.reports_count,
                                        analytics?.reports,
                                        analytics?.total_reports,
                                        analytics?.summary?.reports,
                                        analytics?.summary?.total_reports
                                    ),
                                    helper: "Reports made against this advert",
                                    note: "Should ideally remain at zero",
                                    tone: "from-amber-50 to-orange-100 text-amber-800",
                                },
                                {
                                    label: "Status",
                                    value: listing?.status || "active",
                                    helper: "Current visibility state",
                                    note: "Active adverts are visible to buyers",
                                    isText: true,
                                    tone: "from-emerald-50 to-green-100 text-emerald-800",
                                },
                                {
                                    label: "Price",
                                    value: getPrice(listing),
                                    helper: "Advert asking price",
                                    note: listing?.is_negotiable ? "Negotiable price" : "Fixed or not specified",
                                    isText: true,
                                    tone: "from-orange-500 to-orange-600 text-white",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`rounded-[26px] bg-gradient-to-br p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5 ${stat.tone}`}
                                >
                                    <p className="text-xs font-black uppercase tracking-wide opacity-75">
                                        {stat.label}
                                    </p>

                                    <p className={`mt-3 font-black ${stat.isText ? "text-2xl capitalize" : "text-4xl"}`}>
                                        {stat.isText
                                            ? stat.value
                                            : Number(stat.value).toLocaleString()}
                                    </p>

                                    <p className="mt-3 text-sm font-black opacity-80">
                                        {stat.helper}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold opacity-65">
                                        {stat.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-7">
                        <h2 className="text-2xl font-black text-slate-950">
                            Daily Performance
                        </h2>

                        {timeline.length === 0 ? (
                            <div className="mt-5 rounded-[22px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                No daily activity data available yet.
                            </div>
                        ) : (
                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full min-w-[620px] overflow-hidden text-left text-sm">
                                    <thead>
                                        <tr className="border-b bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                                            <th className="py-3 pr-4">Date</th>
                                            <th className="py-3 pr-4">Views</th>
                                            <th className="py-3 pr-4">Saves</th>
                                            <th className="py-3 pr-4">Messages</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {timeline.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-100 transition hover:bg-orange-50/40 last:border-0">
                                                <td className="py-4 pr-4">
                                                    {item.date || item.day || "Unknown date"}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    {getNumber(item.views, item.views_count)}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    {getNumber(item.saves, item.saved_count)}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    {getNumber(item.messages, item.messages_count)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
