"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartRegular } from "@/lib/faIcons";
import { apiPost } from "@/lib/apiClient";
import { getStoredToken } from "@/lib/auth";

type HomeAdFavoriteButtonProps = {
    adId: string | number;
    initiallyFavorited?: boolean;
};

export default function HomeAdFavoriteButton({
    adId,
    initiallyFavorited = false,
}: HomeAdFavoriteButtonProps) {
    const [mounted, setMounted] = useState(false);
    const [favorited, setFavorited] = useState(initiallyFavorited);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function toggleFavorite() {
        const token = getStoredToken();

        if (!token) {
            window.location.href = `/login?next=/listings/${adId}`;
            return;
        }

        if (loading) return;

        setLoading(true);

        const previous = favorited;
        setFavorited(!previous);

        try {
            const data = await apiPost(`/favorites/listings/${adId}/toggle/`, {});

            const nextValue =
                data?.is_favorited ??
                data?.favorited ??
                data?.is_saved ??
                data?.saved ??
                !previous;

            setFavorited(Boolean(nextValue));

            window.dispatchEvent(new Event("qot_favorites_updated"));
        } catch (error) {
            setFavorited(previous);
            alert("Failed to update saved ad.");
        } finally {
            setLoading(false);
        }
    }

    if (!mounted || !adId) return null;

    return (
        <button
            type="button"
            onClick={toggleFavorite}
            disabled={loading}
            aria-label={favorited ? "Remove from saved ads" : "Save ad"}
            className={
                favorited
                    ? "absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                    : "absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:text-orange-600 disabled:opacity-60"
            }
        >
            <FontAwesomeIcon
                icon={favorited ? faHeart : faHeartRegular}
                className="h-4 w-4"
            />
        </button>
    );
}