"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

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
    return listing?.id || listing?.listing?.id || listing?.listing_id || "";
}

function getTitle(listing: any) {
    return listing?.title || listing?.listing?.title || "Untitled listing";
}

function getImage(listing: any) {
    const image =
        listing?.primary_image ||
        listing?.image ||
        listing?.cover_image ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        listing?.listing?.primary_image ||
        listing?.listing?.image ||
        "";

    return normalizeImageUrl(image);
}

function getPrice(listing: any) {
    if (!listing?.price) return "Contact seller";
    return `UGX ${Number(listing.price).toLocaleString()}`;
}

function getViews(listing: any) {
    return getNumber(
        listing?.views_count,
        listing?.views,
        listing?.view_count,
        listing?.total_views
    );
}

function getSaves(listing: any) {
    return getNumber(
        listing?.favorites_count,
        listing?.favourites_count,
        listing?.saved_count,
        listing?.saves_count,
        listing?.total_saves
    );
}

function getMessages(listing: any) {
    return getNumber(
        listing?.messages_count,
        listing?.messages,
        listing?.chat_count,
        listing?.inquiries_count
    );
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load seller analytics. Please make sure you are logged in and verified.";
    }

    return message;
}

export default function SellerAnalyticsClient() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [dashboardResult, listingsResult] = await Promise.allSettled([
                apiGet("/seller/analytics/"),
                apiGet("/my-ads/"),
            ]);

            if (dashboardResult.status === "fulfilled") {
                setDashboard(dashboardResult.value);
                console.log("Seller analytics response:", dashboardResult.value);
            } else {
                setDashboard(null);
                console.warn("Seller analytics failed:", dashboardResult.reason);
            }

            if (listingsResult.status === "rejected") {
                throw listingsResult.reason;
            }

            console.log("Seller listings response:", listingsResult.value);

            setListings(getArray(listingsResult.value));
        } catch (error: any) {
            setDashboard(null);
            setListings([]);
            setError(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const totalViews = getNumber(
        dashboard?.total_views,
        dashboard?.summary?.total_views,
        listings.reduce((sum, item) => sum + getViews(item), 0)
    );

    const totalSaves = getNumber(
        dashboard?.total_saves,
        dashboard?.favorites_count,
        dashboard?.summary?.total_saves,
        listings.reduce((sum, item) => sum + getSaves(item), 0)
    );

    const totalMessages = getNumber(
        dashboard?.total_messages,
        dashboard?.messages_count,
        dashboard?.summary?.total_messages,
        listings.reduce((sum, item) => sum + getMessages(item), 0)
    );

    const stats = [
        { label: "Total Listings", value: listings.length },
        { label: "Total Views", value: totalViews },
        { label: "Total Saves", value: totalSaves },
        { label: "Messages", value: totalMessages },
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
                        View performance for your seller adverts.
                    </p>
                </div>

                <a
                    href="/my-ads"
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
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Listing Performance
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                Performance by advert
                            </h2>
                        </div>

                        {listings.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                No seller listings found.
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {listings.map((listing) => {
                                    const listingId = getListingId(listing);
                                    const image = getImage(listing);

                                    return (
                                        <article
                                            key={listingId || getTitle(listing)}
                                            className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[140px_1fr_auto] md:items-center"
                                        >
                                            <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-slate-200 text-slate-500">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={getTitle(listing)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm">No image</span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {getTitle(listing)}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {listing?.status || "active"} · {getPrice(listing)}
                                                </p>

                                                <p className="mt-3 text-sm text-slate-600">
                                                    Views: {getViews(listing).toLocaleString()} · Saves:{" "}
                                                    {getSaves(listing).toLocaleString()} · Messages:{" "}
                                                    {getMessages(listing).toLocaleString()}
                                                </p>
                                            </div>

                                            {listingId && (
                                                <a
                                                    href={`/seller/analytics/${listingId}`}
                                                    className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                                                >
                                                    Details
                                                </a>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}