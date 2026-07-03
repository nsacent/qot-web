"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type FavoriteButtonProps = {
    listingId: number | string;
    small?: boolean;
    onChanged?: () => void;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function getListingIdFromFavorite(item: any) {
    return (
        item?.listing?.id ||
        item?.listing_id ||
        item?.listing ||
        item?.id
    );
}

export default function FavoriteButton({
    listingId,
    small = false,
    onChanged,
}: FavoriteButtonProps) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkIfSaved() {
            const token = localStorage.getItem("qot_access_token");

            if (!token) {
                setChecking(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/favorites/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    setChecking(false);
                    return;
                }

                const data = await response.json();
                const favorites = getArray(data);

                const isSaved = favorites.some((item: any) => {
                    const favoriteListingId = getListingIdFromFavorite(item);
                    return String(favoriteListingId) === String(listingId);
                });

                setSaved(isSaved);
            } catch (error) {
                console.error("Favorite check failed:", error);
            } finally {
                setChecking(false);
            }
        }

        checkIfSaved();
    }, [listingId]);

    async function toggleFavorite() {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/favorites/listings/${listingId}/toggle/`,
                {
                    method: saved ? "DELETE" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to update saved listing."
                );
            }

            setSaved((current) => !current);

            if (onChanged) {
                onChanged();
            }

            if (saved && window.location.pathname === "/saved") {
                window.location.reload();
            }
        } catch (error: any) {
            alert(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading || checking}
            className={
                small
                    ? saved
                        ? "rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-60"
                        : "rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                    : saved
                        ? "rounded-xl border border-orange-300 bg-orange-50 px-5 py-3 font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-60"
                        : "rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50 disabled:opacity-60"
            }
        >
            {checking
                ? "Checking..."
                : loading
                    ? saved
                        ? "Removing..."
                        : "Saving..."
                    : saved
                        ? "Saved ✓"
                        : "Save Listing"}
        </button>
    );
}