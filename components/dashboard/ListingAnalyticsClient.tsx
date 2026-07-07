"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

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
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Listing Analytics
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Advert Performance
                    </h1>
                </div>

                <a
                    href="/seller/analytics"
                    className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                >
                    Back to Analytics
                </a>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading listing analytics...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex h-72 items-center justify-center bg-slate-200 text-slate-500">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={getTitle(listing)}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>No image found</span>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                                        {listing?.status || "active"}
                                    </span>

                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                        {getCategory(listing)}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-slate-900">
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
                                        className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                                    >
                                        View Public Advert
                                    </a>

                                    <a
                                        href={`/my-listings/${listingId}/edit`}
                                        className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
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
                                },
                                {
                                    label: "Saves",
                                    value: getSaves(analytics, listing),
                                    helper: "Buyers who saved this advert",
                                    note: "Good sign of serious interest",
                                },
                                {
                                    label: "Messages",
                                    value: getMessages(analytics, listing),
                                    helper: "Buyer inquiries from this advert",
                                    note: "Shows direct buyer action",
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
                                },
                                {
                                    label: "Status",
                                    value: listing?.status || "active",
                                    helper: "Current visibility state",
                                    note: "Active adverts are visible to buyers",
                                    isText: true,
                                },
                                {
                                    label: "Price",
                                    value: getPrice(listing),
                                    helper: "Advert asking price",
                                    note: listing?.is_negotiable ? "Negotiable price" : "Fixed or not specified",
                                    isText: true,
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border bg-white p-6 shadow-sm"
                                >
                                    <p className="text-sm font-semibold text-slate-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-slate-900">
                                        {stat.isText
                                            ? stat.value
                                            : Number(stat.value).toLocaleString()}
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-slate-600">
                                        {stat.helper}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {stat.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Daily Performance
                        </h2>

                        {timeline.length === 0 ? (
                            <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-slate-600">
                                No daily activity data available yet.
                            </div>
                        ) : (
                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full min-w-[620px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="py-3 pr-4">Date</th>
                                            <th className="py-3 pr-4">Views</th>
                                            <th className="py-3 pr-4">Saves</th>
                                            <th className="py-3 pr-4">Messages</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {timeline.map((item, index) => (
                                            <tr key={index} className="border-b last:border-0">
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