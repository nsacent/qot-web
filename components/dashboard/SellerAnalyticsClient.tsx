"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.top_listings)) return data.top_listings;
    if (Array.isArray(data?.analytics?.listings)) return data.analytics.listings;
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

function getTitle(item: any) {
    return (
        item?.title ||
        item?.listing?.title ||
        item?.listing_title ||
        "Untitled listing"
    );
}

function getListingId(item: any) {
    return item?.id || item?.listing?.id || item?.listing_id || "";
}

function getViews(item: any) {
    return getNumber(
        item?.views,
        item?.views_count,
        item?.view_count,
        item?.total_views,
        item?.listing?.views_count
    );
}

function getSaves(item: any) {
    return getNumber(
        item?.saves,
        item?.saved_count,
        item?.saves_count,
        item?.favorites_count,
        item?.favourites_count,
        item?.total_saves,
        item?.listing?.favorites_count
    );
}

function getMessages(item: any) {
    return getNumber(
        item?.messages,
        item?.messages_count,
        item?.chat_count,
        item?.inquiries_count,
        item?.total_messages
    );
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load seller analytics. Please make sure you are logged in and your seller account is verified.";
    }

    return message;
}

export default function SellerAnalyticsClient() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadAnalytics() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet("/seller/analytics/");

            console.log("Seller analytics response:", data);

            setAnalytics(data);
            setListings(getArray(data));
        } catch (error: any) {
            setAnalytics(null);
            setListings([]);
            setError(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAnalytics();
    }, []);

    const totalViews = getNumber(
        analytics?.total_views,
        analytics?.views_count,
        analytics?.summary?.total_views,
        analytics?.data?.total_views,
        listings.reduce((sum, item) => sum + getViews(item), 0)
    );

    const totalSaves = getNumber(
        analytics?.total_saves,
        analytics?.saved_count,
        analytics?.favorites_count,
        analytics?.summary?.total_saves,
        analytics?.data?.total_saves,
        listings.reduce((sum, item) => sum + getSaves(item), 0)
    );

    const totalMessages = getNumber(
        analytics?.total_messages,
        analytics?.messages_count,
        analytics?.inquiries_count,
        analytics?.summary?.total_messages,
        analytics?.data?.total_messages,
        listings.reduce((sum, item) => sum + getMessages(item), 0)
    );

    const totalListings = getNumber(
        analytics?.total_listings,
        analytics?.listings_count,
        analytics?.summary?.total_listings,
        analytics?.data?.total_listings,
        listings.length
    );

    const bestListing =
        analytics?.best_listing ||
        analytics?.top_listing ||
        analytics?.summary?.best_listing ||
        analytics?.data?.best_listing ||
        listings.sort((a, b) => getViews(b) - getViews(a))[0];

    const weakestListing =
        analytics?.weakest_listing ||
        analytics?.least_performing_listing ||
        analytics?.summary?.weakest_listing ||
        analytics?.data?.weakest_listing ||
        listings.sort((a, b) => getViews(a) - getViews(b))[0];

    const stats = [
        {
            label: "Total Views",
            value: totalViews,
            helper: "All advert visits",
        },
        {
            label: "Total Saves",
            value: totalSaves,
            helper: "Saved by buyers",
        },
        {
            label: "Messages",
            value: totalMessages,
            helper: "Buyer inquiries",
        },
        {
            label: "Tracked Listings",
            value: totalListings,
            helper: "Listings with analytics",
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Seller Analytics
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Performance Overview
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Track advert views, buyer interest, saves, and listing performance.
                    </p>
                </div>

                <a
                    href="/my-listings"
                    className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                >
                    Back to My Listings
                </a>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading seller analytics...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border bg-white p-5 shadow-sm"
                            >
                                <p className="text-sm font-semibold text-slate-500">
                                    {stat.label}
                                </p>

                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {Number(stat.value).toLocaleString()}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">{stat.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                                Best Performing Listing
                            </p>

                            {bestListing ? (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {getTitle(bestListing)}
                                    </h2>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Views</p>
                                            <p className="text-2xl font-black">
                                                {getViews(bestListing).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Saves</p>
                                            <p className="text-2xl font-black">
                                                {getSaves(bestListing).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Messages</p>
                                            <p className="text-2xl font-black">
                                                {getMessages(bestListing).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {getListingId(bestListing) && (
                                        <a
                                            href={`/listings/${getListingId(bestListing)}`}
                                            className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                                        >
                                            View Listing
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">
                                    No best listing data available yet.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                                Weakest Listing
                            </p>

                            {weakestListing ? (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {getTitle(weakestListing)}
                                    </h2>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Views</p>
                                            <p className="text-2xl font-black">
                                                {getViews(weakestListing).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Saves</p>
                                            <p className="text-2xl font-black">
                                                {getSaves(weakestListing).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Messages</p>
                                            <p className="text-2xl font-black">
                                                {getMessages(weakestListing).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {getListingId(weakestListing) && (
                                        <a
                                            href={`/my-listings/${getListingId(weakestListing)}/edit`}
                                            className="mt-5 inline-block rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                                        >
                                            Improve Listing
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">
                                    No weak listing data available yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                    Listing Performance
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Performance by advert
                                </h2>
                            </div>

                            <p className="text-sm font-semibold text-slate-500">
                                {listings.length} listing{listings.length === 1 ? "" : "s"}
                            </p>
                        </div>

                        {listings.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                No listing analytics available yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="py-3 pr-4 font-semibold">Listing</th>
                                            <th className="py-3 pr-4 font-semibold">Views</th>
                                            <th className="py-3 pr-4 font-semibold">Saves</th>
                                            <th className="py-3 pr-4 font-semibold">Messages</th>
                                            <th className="py-3 pr-4 font-semibold">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {listings.map((item) => {
                                            const listingId = getListingId(item);

                                            return (
                                                <tr
                                                    key={listingId || getTitle(item)}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-4 pr-4 font-semibold text-slate-900">
                                                        {getTitle(item)}
                                                    </td>

                                                    <td className="py-4 pr-4">
                                                        {getViews(item).toLocaleString()}
                                                    </td>

                                                    <td className="py-4 pr-4">
                                                        {getSaves(item).toLocaleString()}
                                                    </td>

                                                    <td className="py-4 pr-4">
                                                        {getMessages(item).toLocaleString()}
                                                    </td>

                                                    <td className="py-4 pr-4">
                                                        {listingId ? (
                                                            <a
                                                                href={`/seller/analytics/${listingId}`}
                                                                className="font-semibold text-orange-600 hover:text-orange-700"
                                                            >
                                                                Details →
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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