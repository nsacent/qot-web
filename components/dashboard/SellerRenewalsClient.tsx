"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getStoredUser } from "@/lib/auth";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function getListingId(listing: any) {
    return listing?.id || listing?.listing_id || listing?.uuid;
}

function formatDate(value: any) {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not provided";

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function daysUntil(value: any) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    const today = new Date();
    const diff = date.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiryDate(listing: any) {
    return (
        listing?.expires_at ||
        listing?.expiry_date ||
        listing?.expires_on ||
        listing?.valid_until ||
        ""
    );
}

function getStatus(listing: any) {
    return String(
        listing?.status ||
        listing?.listing_status ||
        listing?.approval_status ||
        ""
    ).toLowerCase();
}

function getRenewalStatus(listing: any) {
    const status = getStatus(listing);
    const expiryDate = getExpiryDate(listing);
    const days = daysUntil(expiryDate);

    if (
        status.includes("expired") ||
        status.includes("inactive") ||
        status.includes("unavailable") ||
        (days !== null && days < 0)
    ) {
        return {
            label: "Expired",
            tone: "red",
            description: "This advert is no longer active. Relist or renew it.",
        };
    }

    if (days !== null && days <= 7) {
        return {
            label: "Expiring Soon",
            tone: "orange",
            description: `This advert expires in ${days} day${days === 1 ? "" : "s"}.`,
        };
    }

    return {
        label: "Active",
        tone: "green",
        description: "This advert is still active.",
    };
}

function statusClass(tone: string) {
    if (tone === "red") {
        return "bg-red-50 text-red-700 border-red-200";
    }

    if (tone === "orange") {
        return "bg-orange-50 text-orange-700 border-orange-200";
    }

    return "bg-green-50 text-green-700 border-green-200";
}

export default function SellerRenewalsClient() {
    const [mounted, setMounted] = useState(false);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(
        null
    );
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const user = getStoredUser();

        if (!user) {
            window.location.href = "/login?next=/seller/renewals";
            return;
        }

        setMounted(true);
        loadListings();
    }, []);

    async function loadListings() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet("/seller/listings/");
            setListings(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load your adverts.");
        } finally {
            setLoading(false);
        }
    }

    const renewalListings = useMemo(() => {
        return listings
            .map((listing) => ({
                listing,
                renewal: getRenewalStatus(listing),
            }))
            .filter(({ renewal }) => renewal.label !== "Active")
            .sort((a, b) => {
                const aDays = daysUntil(getExpiryDate(a.listing)) ?? 999;
                const bDays = daysUntil(getExpiryDate(b.listing)) ?? 999;
                return aDays - bDays;
            });
    }, [listings]);

    const activeListings = useMemo(() => {
        return listings.filter((listing) => getRenewalStatus(listing).label === "Active");
    }, [listings]);

    async function renewListing(listing: any) {
        const id = getListingId(listing);
        if (!id) return;

        setActionLoadingId(id);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/listings/${id}/renew/`, {});
            setSuccess("Advert renewed successfully.");
            await loadListings();
        } catch (error: any) {
            setError(error.message || "Failed to renew advert.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function relistListing(listing: any) {
        const id = getListingId(listing);
        if (!id) return;

        setActionLoadingId(id);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/listings/${id}/relist/`, {});
            setSuccess("Advert relisted successfully.");
            await loadListings();
        } catch (error: any) {
            setError(error.message || "Failed to relist advert.");
        } finally {
            setActionLoadingId(null);
        }
    }

    if (!mounted) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading renewal center...
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Seller Tools
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
                    Renewal Center
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Keep your adverts visible by renewing listings that are expired or
                    expiring soon.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Total Adverts</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {listings.length}
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Need Action</p>
                    <p className="mt-2 text-3xl font-bold text-orange-600">
                        {renewalListings.length}
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Active</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {activeListings.length}
                    </p>
                </div>
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Adverts Needing Renewal
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Renew these adverts to keep them visible to buyers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadListings}
                        className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
                        Loading your adverts...
                    </div>
                ) : renewalListings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center">
                        <p className="font-bold text-slate-900">No adverts need renewal.</p>
                        <p className="mt-2 text-sm text-slate-600">
                            All your active adverts are currently okay.
                        </p>

                        <a
                            href="/my-listings"
                            className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            View My Listings
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renewalListings.map(({ listing, renewal }) => {
                            const id = getListingId(listing);
                            const expiryDate = getExpiryDate(listing);
                            const busy = actionLoadingId === id;

                            return (
                                <div
                                    key={id}
                                    className="rounded-2xl border p-5 transition hover:border-orange-200 hover:bg-orange-50/30"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                                                        renewal.tone
                                                    )}`}
                                                >
                                                    {renewal.label}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    Expires: {formatDate(expiryDate)}
                                                </span>
                                            </div>

                                            <h3 className="mt-3 text-lg font-bold text-slate-900">
                                                {listing?.title || "Untitled advert"}
                                            </h3>

                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {renewal.description}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                UGX{" "}
                                                {Number(listing?.price || 0).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-80">
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => renewListing(listing)}
                                                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                                            >
                                                {busy ? "Processing..." : "Renew Advert"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => relistListing(listing)}
                                                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                            >
                                                {busy ? "Processing..." : "Relist Advert"}
                                            </button>

                                            <a
                                                href={`/my-listings/${id}/edit`}
                                                className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-white"
                                            >
                                                Edit
                                            </a>

                                            <a
                                                href={`/listings/${id}`}
                                                className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-white"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}