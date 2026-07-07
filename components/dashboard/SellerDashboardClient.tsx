"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";

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
        if (Array.isArray(value?.listings)) return value.listings;
    }

    return [];
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
    const price = listing?.price || listing?.listing?.price;

    if (!price) return "Contact seller";

    return `UGX ${Number(price).toLocaleString()}`;
}

function getViews(listing: any) {
    return getNumber(
        listing?.views,
        listing?.views_count,
        listing?.view_count,
        listing?.total_views,
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
        listing?.listing?.favorites_count
    );
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
    showRenew = false,
    onChanged,
}: {
    listing: any;
    showRenew?: boolean;
    onChanged?: () => void;
}) {
    const [loading, setLoading] = useState("");
    const listingId = getListingId(listing);
    const image = getImage(listing);

    async function runAction(action: "renew" | "relist") {
        if (!listingId) return;

        const confirmed = window.confirm(`Are you sure you want to ${action} this advert?`);
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
        <article className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto] md:items-center">
            <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-200 text-slate-500">
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
                <h3 className="font-bold text-slate-900">{getTitle(listing)}</h3>

                <p className="mt-1 text-sm text-slate-500">
                    {listing?.status || listing?.listing?.status || "active"} · {getPrice(listing)}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                    Views: {getViews(listing).toLocaleString()} · Saves:{" "}
                    {getSaves(listing).toLocaleString()}
                </p>
            </div>

            <div className="grid gap-2">
                {listingId && (
                    <>
                        <a
                            href={`/seller/analytics/${listingId}`}
                            className="rounded-xl bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            Analytics
                        </a>

                        <a
                            href={`/my-listings/${listingId}/edit`}
                            className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
                        >
                            Edit
                        </a>
                    </>
                )}

                {showRenew && listingId && (
                    <>
                        <button
                            type="button"
                            onClick={() => runAction("renew")}
                            disabled={loading === "renew"}
                            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                        >
                            {loading === "renew" ? "Renewing..." : "Renew"}
                        </button>

                        <button
                            type="button"
                            onClick={() => runAction("relist")}
                            disabled={loading === "relist"}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {loading === "relist" ? "Relisting..." : "Relist"}
                        </button>
                    </>
                )}
            </div>
        </article>
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
                apiGet("/seller/listings/"),
            ]);

            if (dashboardResult.status === "rejected") {
                throw dashboardResult.reason;
            }

            const dashboardData = dashboardResult.value;
            setDashboard(dashboardData);

            if (listingsResult.status === "fulfilled") {
                setListings(getArray(listingsResult.value));
            } else {
                setListings([]);
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

    const featuredListings = getArray(
        dashboard?.active_featured_listings,
        dashboard?.featured_listings,
        dashboard?.data?.active_featured_listings,
        summary?.active_featured_listings
    );

    const renewalListings = getArray(
        dashboard?.listings_needing_renewal,
        dashboard?.needs_renewal,
        dashboard?.renewal_listings,
        dashboard?.data?.listings_needing_renewal,
        summary?.listings_needing_renewal
    );

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
            label: "Total Listings",
            value: getNumber(summary?.total_listings, summary?.listings_count, listings.length),
        },
        {
            label: "Active Listings",
            value: getNumber(summary?.active_listings, summary?.active_count),
        },
        {
            label: "Featured",
            value: getNumber(
                summary?.active_featured_listings,
                summary?.featured_listings,
                featuredListings.length
            ),
        },
        {
            label: "Need Renewal",
            value: getNumber(
                summary?.listings_needing_renewal,
                summary?.renewal_count,
                renewalListings.length
            ),
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Seller Dashboard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Seller Home
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Manage your seller performance, renew adverts, and track important listings.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                        href="/seller/analytics"
                        className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                    >
                        Analytics
                    </a>

                    <a
                        href="/post-ad"
                        className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                    >
                        Post New Advert
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading seller dashboard...
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

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                                Best Listing
                            </p>

                            {bestListing ? (
                                <div className="mt-4">
                                    <ListingMiniCard listing={bestListing} />
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">No best listing yet.</p>
                            )}
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                                Weakest Listing
                            </p>

                            {weakestListing ? (
                                <div className="mt-4">
                                    <ListingMiniCard listing={weakestListing} />
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">No weak listing yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Listings Needing Renewal
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                Renew or relist adverts
                            </h2>
                        </div>

                        {renewalListings.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                No listings need renewal right now.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {renewalListings.map((listing) => (
                                    <ListingMiniCard
                                        key={getListingId(listing) || getTitle(listing)}
                                        listing={listing}
                                        showRenew
                                        onChanged={loadDashboard}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                    Recent Listings
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Latest seller adverts
                                </h2>
                            </div>

                            {recentListings.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                    No recent listing data available.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {recentListings.slice(0, 5).map((listing) => (
                                        <ListingMiniCard
                                            key={getListingId(listing) || getTitle(listing)}
                                            listing={listing}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                    Active Featured Listings
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Promoted adverts
                                </h2>
                            </div>

                            {featuredListings.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                                    No active featured listings right now.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {featuredListings.slice(0, 5).map((listing) => (
                                        <ListingMiniCard
                                            key={getListingId(listing) || getTitle(listing)}
                                            listing={listing}
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