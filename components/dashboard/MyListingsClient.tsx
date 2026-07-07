"use client";

import { useEffect, useMemo, useState } from "react";
import MyListingCard from "@/components/dashboard/MyListingCard";
import SellerStats from "@/components/dashboard/SellerStats";
import { apiGet } from "@/lib/apiClient";

const STATUS_OPTIONS = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Sold", value: "sold" },
    { label: "Draft", value: "draft" },
    { label: "Unavailable", value: "unavailable" },
];

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;
    if (Array.isArray(data?.recent_listings)) return data.recent_listings;
    return [];
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load your listings. Please make sure you are logged in and your seller account is verified.";
    }

    if (
        message.toLowerCase().includes("not verified") ||
        message.toLowerCase().includes("verification") ||
        message.toLowerCase().includes("verified")
    ) {
        return "Your account must be verified before you can access seller listings.";
    }

    return message;
}

export default function MyListingsClient() {
    const [listings, setListings] = useState<any[]>([]);
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    async function loadListings() {
        setLoading(true);
        setError("");

        try {
            const [dashboardResult, listingsResult] = await Promise.allSettled([
                apiGet("/seller/dashboard/"),
                apiGet("/seller/listings/"),
            ]);

            if (dashboardResult.status === "fulfilled") {
                setDashboard(dashboardResult.value);
            } else {
                console.warn("Seller dashboard API error:", dashboardResult.reason);
                setDashboard(null);
            }

            if (listingsResult.status === "rejected") {
                throw listingsResult.reason;
            }

            const sellerListings = getArray(listingsResult.value);
            setListings(sellerListings);
        } catch (error: any) {
            setListings([]);
            setDashboard(null);

            const message = String(error?.message || "").trim();

            setError(
                !message || message === "null" || message === "undefined"
                    ? "Failed to load your listings. Please make sure you are logged in and your seller account is verified."
                    : message
            );
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadListings();
    }, []);

    const filteredListings = useMemo(() => {
        let items = listings;

        if (status) {
            items = items.filter(
                (listing) =>
                    String(listing.status || "").toLowerCase() === status.toLowerCase()
            );
        }

        if (search) {
            const searchLower = search.toLowerCase();

            items = items.filter((listing) =>
                String(listing.title || "").toLowerCase().includes(searchLower)
            );
        }

        return items;
    }, [listings, status, search]);

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch(searchInput.trim());
    }

    function clearFilters() {
        setStatus("");
        setSearchInput("");
        setSearch("");
    }

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Seller Dashboard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        My Listings
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Manage your adverts, update status, edit details, and track your
                        selling activity.
                    </p>
                </div>

                <a
                    href="/seller/analytics"
                    className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                >
                    Seller Analytics
                </a>

                <a
                    href="/post-ad"
                    className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                >
                    Post New Advert
                </a>
            </div>

            <SellerStats listings={listings} dashboard={dashboard} />
            <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <form onSubmit={handleSearch}>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Search your adverts
                        </label>

                        <div className="flex gap-2">
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by title..."
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                            />

                            <button
                                type="submit"
                                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => setStatus(option.value)}
                            className={
                                status === option.value
                                    ? "rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                                    : "rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            }
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                    Showing {filteredListings.length} of your advert
                    {filteredListings.length === 1 ? "" : "s"}
                </p>

                {(status || search) && (
                    <p className="text-sm text-slate-500">
                        Filters applied
                        {status ? `: ${status}` : ""}
                        {search ? `, search: "${search}"` : ""}
                    </p>
                )}
            </div>

            {loading ? (
                <div className="mt-6 rounded-2xl border bg-white p-8 text-slate-600">
                    Loading your listings...
                </div>
            ) : error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="mt-6 rounded-2xl border bg-white p-8 text-slate-600">
                    No listings found. Try changing the filters or post a new advert.
                </div>
            ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredListings.map((listing) => (
                        <MyListingCard
                            key={listing.id || listing.slug}
                            listing={listing}
                            onChanged={loadListings}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}