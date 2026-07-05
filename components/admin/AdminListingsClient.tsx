"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const LISTINGS_ENDPOINT = "/admin-panel/listings/";
const PENDING_LISTINGS_ENDPOINT = "/admin-panel/listings/pending/";

const approveListingEndpoint = (listingId: number | string) =>
    `/admin-panel/listings/${listingId}/approve/`;

const rejectListingEndpoint = (listingId: number | string) =>
    `/admin-panel/listings/${listingId}/reject/`;

const featureListingEndpoint = (listingId: number | string) =>
    `/admin-panel/listings/${listingId}/feature/`;

const unfeatureListingEndpoint = (listingId: number | string) =>
    `/admin-panel/listings/${listingId}/unfeature/`;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function formatPrice(price: any) {
    if (!price) return "Contact seller";
    return `UGX ${Number(price).toLocaleString()}`;
}

function formatDate(dateValue: string) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getSellerName(listing: any) {
    const seller = listing.seller || listing.user || {};

    return (
        seller.full_name ||
        seller.name ||
        seller.username ||
        seller.phone ||
        listing.seller_name ||
        "Seller"
    );
}

function getImage(listing: any) {
    return (
        listing.primary_image ||
        listing.image ||
        listing.cover_image ||
        listing.images?.[0]?.image ||
        listing.images?.[0]?.url ||
        ""
    );
}

function isFeatured(listing: any) {
    return Boolean(
        listing.is_featured ||
        listing.featured ||
        listing.featured_until
    );
}

export default function AdminListingsClient() {
    const [listings, setListings] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("pending_only");
    const [seller, setSeller] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [isFeaturedFilter, setIsFeaturedFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function apiRequest(path: string, options: RequestInit = {}) {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            throw new Error("Login required.");
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.detail ||
                data?.message ||
                data?.error ||
                JSON.stringify(data) ||
                "Request failed."
            );
        }

        return data;
    }

    function buildListingsEndpoint() {
        if (status === "pending_only") {
            return PENDING_LISTINGS_ENDPOINT;
        }

        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (status && status !== "all") params.set("status", status);
        if (seller) params.set("seller", seller);
        if (category) params.set("category", category);
        if (city) params.set("city", city);
        if (isFeaturedFilter) params.set("is_featured", isFeaturedFilter);
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);

        const query = params.toString();

        return query ? `${LISTINGS_ENDPOINT}?${query}` : LISTINGS_ENDPOINT;
    }

    async function loadListings() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(buildListingsEndpoint());
            setListings(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load listings.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadListings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function approveListing(listingId: number | string) {
        setActionLoading(`approve-${listingId}`);

        try {
            await apiPost(approveListingEndpoint(listingId));

            await loadListings();
        } catch (error: any) {
            alert(error.message || "Failed to approve listing.");
        } finally {
            setActionLoading(null);
        }
    }

    async function rejectListing(listingId: number | string) {
        const rejectionReason = window.prompt(
            "Enter reason for rejecting this listing:"
        );

        if (!rejectionReason) return;

        setActionLoading(`reject-${listingId}`);

        try {
            await apiPost(rejectListingEndpoint(listingId), {
                rejection_reason: rejectionReason,
            });

            await loadListings();
        } catch (error: any) {
            alert(error.message || "Failed to reject listing.");
        } finally {
            setActionLoading(null);
        }
    }

    async function featureListing(listingId: number | string) {
        const daysInput = window.prompt("Feature this listing for how many days?", "7");

        if (!daysInput) return;

        const days = Number(daysInput);

        if (!Number.isFinite(days) || days <= 0) {
            alert("Please enter a valid number of days.");
            return;
        }

        setActionLoading(`feature-${listingId}`);

        try {
            await apiPost(featureListingEndpoint(listingId), {
                days,
            });

            await loadListings();
        } catch (error: any) {
            alert(error.message || "Failed to feature listing.");
        } finally {
            setActionLoading(null);
        }
    }

    async function unfeatureListing(listingId: number | string) {
        const confirmed = window.confirm("Remove featured status from this listing?");

        if (!confirmed) return;

        setActionLoading(`unfeature-${listingId}`);

        try {
            await apiPost(unfeatureListingEndpoint(listingId));
            await loadListings();
        } catch (error: any) {
            alert(error.message || "Failed to unfeature listing.");
        } finally {
            setActionLoading(null);
        }
    }

    function clearFilters() {
        setSearch("");
        setStatus("pending_only");
        setSeller("");
        setCategory("");
        setCity("");
        setIsFeaturedFilter("");
        setDateFrom("");
        setDateTo("");

        setTimeout(loadListings, 0);
    }

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-4">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search e.g. Toyota"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500 md:col-span-2"
                    />

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="pending_only">Pending only</option>
                        <option value="all">All listings</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="sold">Sold</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={isFeaturedFilter}
                        onChange={(event) => setIsFeaturedFilter(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Featured status</option>
                        <option value="true">Featured</option>
                        <option value="false">Not featured</option>
                    </select>

                    <input
                        value={seller}
                        onChange={(event) => setSeller(event.target.value)}
                        placeholder="Seller ID e.g. 5"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <input
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Category slug e.g. cars"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="City slug e.g. kampala"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadListings}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading listings...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Listings Queue
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {listings.length} listing{listings.length === 1 ? "" : "s"} found.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadListings}
                            className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {listings.length === 0 ? (
                        <div className="rounded-2xl border bg-white p-8 text-slate-600">
                            No listings found.
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {listings.map((listing: any) => {
                                const image = getImage(listing);
                                const featured = isFeatured(listing);

                                return (
                                    <article
                                        key={listing.id}
                                        className="rounded-2xl border bg-white p-5 shadow-sm"
                                    >
                                        <div className="grid gap-5 lg:grid-cols-[180px_1fr_220px]">
                                            <a
                                                href={`/listings/${listing.id}`}
                                                className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-200 text-sm text-slate-500"
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={listing.title || "Listing image"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    "No image"
                                                )}
                                            </a>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {listing.status && (
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700">
                                                            {listing.status}
                                                        </span>
                                                    )}

                                                    {featured && (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                            Featured
                                                        </span>
                                                    )}

                                                    {listing.category?.name && (
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                            {listing.category.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                                    {listing.title || "Untitled listing"}
                                                </h3>

                                                <p className="mt-2 text-lg font-bold text-orange-600">
                                                    {formatPrice(listing.price)}
                                                </p>

                                                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                                                    <p>
                                                        <span className="font-semibold">Seller:</span>{" "}
                                                        {getSellerName(listing)}
                                                    </p>

                                                    <p>
                                                        <span className="font-semibold">Location:</span>{" "}
                                                        {listing.city?.name ||
                                                            listing.location ||
                                                            listing.region?.name ||
                                                            "Uganda"}
                                                    </p>

                                                    {listing.created_at && (
                                                        <p>
                                                            <span className="font-semibold">Posted:</span>{" "}
                                                            {formatDate(listing.created_at)}
                                                        </p>
                                                    )}

                                                    {listing.featured_until && (
                                                        <p className="text-green-700">
                                                            <span className="font-semibold">
                                                                Featured until:
                                                            </span>{" "}
                                                            {formatDate(listing.featured_until)}
                                                        </p>
                                                    )}

                                                    {listing.rejection_reason && (
                                                        <p className="text-red-700">
                                                            <span className="font-semibold">
                                                                Rejection reason:
                                                            </span>{" "}
                                                            {listing.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>

                                                {listing.description && (
                                                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                                                        {listing.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <a
                                                    href={`/listings/${listing.id}`}
                                                    className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                                                >
                                                    Open Advert
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={() => approveListing(listing.id)}
                                                    disabled={actionLoading === `approve-${listing.id}`}
                                                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                                >
                                                    {actionLoading === `approve-${listing.id}`
                                                        ? "Approving..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => rejectListing(listing.id)}
                                                    disabled={actionLoading === `reject-${listing.id}`}
                                                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                                                >
                                                    {actionLoading === `reject-${listing.id}`
                                                        ? "Rejecting..."
                                                        : "Reject"}
                                                </button>

                                                {featured ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => unfeatureListing(listing.id)}
                                                        disabled={
                                                            actionLoading === `unfeature-${listing.id}`
                                                        }
                                                        className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `unfeature-${listing.id}`
                                                            ? "Removing..."
                                                            : "Unfeature"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => featureListing(listing.id)}
                                                        disabled={actionLoading === `feature-${listing.id}`}
                                                        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `feature-${listing.id}`
                                                            ? "Featuring..."
                                                            : "Feature"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}