"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/listings/ListingCard";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function normalizeFavorite(item: any) {
    return item.listing || item;
}

export default function SavedListingsClient() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSavedListings() {
            const token = localStorage.getItem("qot_access_token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/favorites/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.detail ||
                        data?.message ||
                        data?.error ||
                        "Failed to load saved listings."
                    );
                }

                setListings(getArray(data).map(normalizeFavorite));
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        loadSavedListings();
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading saved listings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <section>
            {listings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing: any) => (
                        <ListingCard key={listing.id || listing.slug} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have not saved any listings yet.
                </div>
            )}
        </section>
    );
}