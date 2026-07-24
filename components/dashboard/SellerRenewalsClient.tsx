"use client";

import { useEffect, useMemo, useState } from "react";

async function renewalApi(path: string, method: "GET" | "POST" = "GET") {
    const response = await fetch(`/api/proxy${path}`, { method, credentials: "include", cache: "no-store", headers: method === "POST" ? { "Content-Type": "application/json" } : undefined, body: method === "POST" ? JSON.stringify({}) : undefined });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.detail || "Renewal request failed.");
    return data;
}
const apiGet = (path: string) => renewalApi(path);
const apiPost = (path: string, _data?: any) => renewalApi(path, "POST");

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
        setMounted(true);
        loadListings();
    }, []);

    async function loadListings() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet("/seller/listings/?page_size=1000");
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
            .filter(({ listing, renewal }) =>
                ["active", "expired", "unavailable", "sold"].includes(
                    getStatus(listing)
                ) && renewal.label !== "Active"
            )
            .sort((a, b) => {
                const aDays = daysUntil(getExpiryDate(a.listing)) ?? 999;
                const bDays = daysUntil(getExpiryDate(b.listing)) ?? 999;
                return aDays - bDays;
            });
    }, [listings]);

    const activeListings = useMemo(() => {
        return listings.filter(
            (listing) =>
                getStatus(listing) === "active" &&
                getRenewalStatus(listing).label === "Active"
        );
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
            <section className="py-6">
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                    <p className="mt-4 text-sm font-black text-slate-600">Loading renewal center...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-6">
            <div className="relative mb-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-500/20 blur-2xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex rounded-full bg-amber-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-200 ring-1 ring-amber-300/20">Renewal Center</span>
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Keep your adverts working</h1>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">Renew expiring adverts and bring older ads back to buyers without starting over.</p>
                    </div>

                    <a href="/account/my-ads" className="rounded-[16px] bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15">View My Ads</a>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[26px] bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-[0_14px_40px_rgba(249,115,22,0.18)]">
                    <p className="text-xs font-black uppercase tracking-wide text-orange-100">Total Adverts</p>
                    <p className="mt-3 text-4xl font-black">
                        {listings.length}
                    </p>
                    <p className="mt-2 text-xs font-bold text-orange-100">All your ads</p>
                </div>

                <div className="rounded-[26px] bg-gradient-to-br from-amber-50 to-orange-100 p-6 text-amber-800 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5">
                    <p className="text-xs font-black uppercase tracking-wide opacity-75">Need Action</p>
                    <p className="mt-3 text-4xl font-black">
                        {renewalListings.length}
                    </p>
                    <p className="mt-2 text-xs font-bold opacity-70">Expired or expiring soon</p>
                </div>

                <div className="rounded-[26px] bg-gradient-to-br from-emerald-50 to-green-100 p-6 text-emerald-800 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5">
                    <p className="text-xs font-black uppercase tracking-wide opacity-75">Active</p>
                    <p className="mt-3 text-4xl font-black">
                        {activeListings.length}
                    </p>
                    <p className="mt-2 text-xs font-bold opacity-70">Currently visible</p>
                </div>
            </div>

            <div className="mt-8 rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:p-8">
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
                        className="rounded-[14px] bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-[24px] bg-slate-50 p-10 text-center">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                        <p className="mt-4 text-sm font-black text-slate-500">Loading your adverts...</p>
                    </div>
                ) : renewalListings.length === 0 ? (
                    <div className="rounded-[24px] border-2 border-dashed border-green-200 bg-green-50/60 p-10 text-center">
                        <p className="font-bold text-slate-900">No adverts need renewal.</p>
                        <p className="mt-2 text-sm text-slate-600">
                            All your active adverts are currently okay.
                        </p>

                        <a
                            href="/account/my-ads"
                            className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            View My Ads
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renewalListings.map(({ listing, renewal }) => {
                            const id = getListingId(listing);
                            const expiryDate = getExpiryDate(listing);
                            const busy = actionLoadingId === id;
                            const listingStatus = getStatus(listing);
                            const canRenew = ["active", "expired"].includes(listingStatus);
                            const canRelist = ["expired", "unavailable", "sold"].includes(
                                listingStatus
                            );

                            return (
                                <div
                                    key={id}
                                    className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
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
                                            {canRenew && (
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => renewListing(listing)}
                                                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
                                                >
                                                    {busy ? "Processing..." : "Renew Advert"}
                                                </button>
                                            )}

                                            {canRelist && (
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => relistListing(listing)}
                                                    className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
                                                >
                                                    {busy ? "Processing..." : "Relist Advert"}
                                                </button>
                                            )}

                                            <a
                                                href={`/account/my-ads/${id}/edit`}
                                                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50"
                                            >
                                                Edit
                                            </a>

                                            <a
                                                href={`/ads/${id}`}
                                                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50"
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
