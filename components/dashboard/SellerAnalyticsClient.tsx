"use client";

import { useEffect, useState } from "react";

async function apiGet(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        credentials: "include",
        cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.detail || "Failed to load analytics.");
    return data;
}

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
    return listing?.title || listing?.listing?.title || "Untitled ad";
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
                apiGet("/seller/listings/?page_size=1000"),
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
        { label: "Total Ads", value: listings.length, helper: "All your adverts", tone: "from-orange-500 to-orange-600 text-white" },
        { label: "Total Views", value: totalViews, helper: "Buyer visits", tone: "from-blue-50 to-cyan-100 text-blue-800" },
        { label: "Total Saves", value: totalSaves, helper: "Buyer interest", tone: "from-rose-50 to-pink-100 text-rose-800" },
        { label: "Messages", value: totalMessages, helper: "Buyer enquiries", tone: "from-violet-50 to-purple-100 text-violet-800" },
    ];

    return (
        <section className="py-6">
            <div className="relative mb-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-2xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex rounded-full bg-violet-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-200 ring-1 ring-violet-300/20">Seller Analytics</span>
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Understand what buyers love</h1>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">Compare advert performance and turn buyer activity into better selling decisions.</p>
                    </div>

                    <a href="/my-ads" className="rounded-[16px] bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15">My Ads</a>
                </div>
            </div>

            {loading ? (
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
                    <p className="mt-4 text-sm font-black text-slate-600">Loading seller analytics...</p>
                </div>
            ) : error ? (
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-7 text-red-700"><p className="font-black">Analytics unavailable</p><p className="mt-2 text-sm font-semibold">{error}</p><button type="button" onClick={loadData} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">Try Again</button>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-[26px] bg-gradient-to-br p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5 ${stat.tone}`}
                            >
                                <p className="text-xs font-black uppercase tracking-wide opacity-75">
                                    {stat.label}
                                </p>
                                <p className="mt-3 text-4xl font-black">
                                    {Number(stat.value).toLocaleString()}
                                </p>
                                <p className="mt-2 text-xs font-bold opacity-70">{stat.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-7">
                        <div className="mb-5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Ad Performance
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                Performance by advert
                            </h2>
                        </div>

                        {listings.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                No seller ads found.
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {listings.map((listing) => {
                                    const listingId = getListingId(listing);
                                    const image = getImage(listing);

                                    return (
                                        <article
                                            key={listingId || getTitle(listing)}
                                            className="grid gap-4 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] md:grid-cols-[128px_1fr_auto] md:items-center"
                                        >
                                            <div className="flex h-28 items-center justify-center overflow-hidden rounded-[18px] bg-slate-200 text-slate-500">
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
                                                    href={`/account/analytics/${listingId}`}
                                                    className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-orange-600"
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
