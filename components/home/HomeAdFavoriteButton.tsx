"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartRegular } from "@/lib/faIcons";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

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

    const inFlightRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!inFlightRef.current) {
            setFavorited(initiallyFavorited);
        }
    }, [initiallyFavorited, adId]);

    async function toggleFavorite(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (inFlightRef.current || loading) return;

        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login?next=/";
            return;
        }

        const previous = favorited;
        const nextValue = !previous;

        const method = previous ? "DELETE" : "POST";

        inFlightRef.current = true;
        setLoading(true);
        setFavorited(nextValue);

        try {
            const response = await fetch(
                `${API_BASE_URL}/favorites/listings/${adId}/toggle/`,
                {
                    method,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let data: any = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    "Failed to update saved ad."
                );
            }

            window.dispatchEvent(new Event("qot_favorites_updated"));
        } catch (error) {
            setFavorited(previous);
            alert("Failed to update saved ad.");
        } finally {
            setLoading(false);

            window.setTimeout(() => {
                inFlightRef.current = false;
            }, 400);
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
                    ? "absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    : "absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            }
        >
            <FontAwesomeIcon
                icon={favorited ? faHeart : faHeartRegular}
                className="h-4 w-4"
            />
        </button>
    );
}