"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faHeart,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faHeartRegular } from "@/lib/faIcons";

type FavoriteButtonProps = {
    listingId: number | string;
    small?: boolean;
    compact?: boolean;
    overlay?: boolean;
    onChanged?: () => void;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.favorites)) return data.data.favorites;
    return [];
}

function getListingIdFromFavorite(item: any) {
    return (
        item?.listing?.id ||
        item?.listing?.listing_id ||
        item?.listing_id ||
        item?.listing ||
        item?.advert_id ||
        item?.id ||
        ""
    );
}

async function readApiError(response: Response) {
    const text = await response.text();

    if (!text) return "Failed to update saved ad.";

    try {
        const data = JSON.parse(text);

        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        const firstKey = Object.keys(data || {})[0];
        const firstValue = firstKey ? data[firstKey] : "";

        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === "string") return firstValue;

        return "Failed to update saved ad.";
    } catch {
        return text;
    }
}

function getLoginNext(listingId: string | number) {
    if (typeof window === "undefined") {
        return `/login?next=/listings/${listingId}`;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;

    return `/login?next=${encodeURIComponent(
        currentPath || `/listings/${listingId}`
    )}`;
}

export default function FavoriteButton({
    listingId,
    small = false,
    compact = false,
    overlay = false,
    onChanged,
}: FavoriteButtonProps) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function checkIfSaved() {
            setChecking(true);

            try {
                const response = await fetch("/api/proxy/favorites/", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (response.status === 401) {
                    if (!mounted) return;
                    setSaved(false);
                    setChecking(false);
                    return;
                }

                if (!response.ok) {
                    if (!mounted) return;
                    setChecking(false);
                    return;
                }

                const data = await response.json();
                const favorites = getArray(data);

                const isSaved = favorites.some((item: any) => {
                    const favoriteListingId = getListingIdFromFavorite(item);
                    return String(favoriteListingId) === String(listingId);
                });

                if (!mounted) return;

                setSaved(isSaved);
            } catch (error) {
                console.error("Favorite check failed:", error);

                if (!mounted) return;
            } finally {
                if (mounted) {
                    setChecking(false);
                }
            }
        }

        checkIfSaved();

        return () => {
            mounted = false;
        };
    }, [listingId]);

    async function toggleFavorite() {
        if (loading || checking) return;

        setLoading(true);

        const nextSavedState = !saved;

        try {
            const response = await fetch(
                `/api/proxy/favorites/listings/${listingId}/toggle/`,
                {
                    method: saved ? "DELETE" : "POST",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                window.location.href = getLoginNext(listingId);
                return;
            }

            if (!response.ok) {
                throw new Error(await readApiError(response));
            }

            setSaved(nextSavedState);

            window.dispatchEvent(
                new CustomEvent("qot_favorites_updated", {
                    detail: {
                        listingId: String(listingId),
                        saved: nextSavedState,
                    },
                })
            );

            if (onChanged) {
                onChanged();
            }

            if (!nextSavedState && window.location.pathname === "/account/saved") {
                window.location.reload();
            }
        } catch (error: any) {
            alert(error?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    const label = checking
        ? "Checking"
        : loading
            ? saved
                ? "Removing"
                : "Saving"
            : saved
                ? "Saved"
                : "Save Ad";

    const icon = checking || loading
        ? faSpinner
        : saved
            ? overlay
                ? faHeart
                : faCheck
            : overlay
                ? faHeartRegular
                : faHeart;

    if (overlay) {
        return (
            <button
                type="button"
                onClick={toggleFavorite}
                disabled={loading || checking}
                aria-label={saved ? "Remove from saved ads" : "Save ad"}
                aria-pressed={saved}
                className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-[2px] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${saved
                        ? "bg-white text-orange-500 shadow-[0_5px_16px_rgba(15,23,42,0.18)] ring-1 ring-white"
                        : "bg-slate-950/20 text-white shadow-[0_2px_8px_rgba(15,23,42,0.35)] ring-1 ring-white/40 hover:bg-white hover:text-orange-500"
                    }`}
            >
                <FontAwesomeIcon
                    icon={icon}
                    className={`h-[18px] w-[18px] ${checking || loading ? "animate-spin" : ""}`}
                />
            </button>
        );
    }

    const sizeClass = small
        ? "h-10 rounded-xl px-3 text-xs"
        : "h-11 rounded-[18px] px-4 text-sm";

    const toneClass = saved
        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100 hover:bg-orange-100"
        : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600";

    return (
        <button
            type="button"
            onClick={toggleFavorite}
            disabled={loading || checking}
            aria-pressed={saved}
            className={`inline-flex w-full items-center justify-center gap-2 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${toneClass}`}
        >
            <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${saved
                        ? "bg-orange-500 text-white"
                        : "bg-white text-slate-500 ring-1 ring-slate-100"
                    }`}
            >
                <FontAwesomeIcon
                    icon={icon}
                    className={`h-3.5 w-3.5 ${checking || loading ? "animate-spin" : ""}`}
                />
            </span>

            {label}
        </button>
    );
}
