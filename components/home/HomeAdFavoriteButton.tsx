"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartRegular } from "@/lib/faIcons";

export default function HomeAdFavoriteButton({
    adId,
    initiallyFavorited = false,
}: {
    adId: string | number;
    initiallyFavorited?: boolean;
}) {
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

        const previous = favorited;
        const nextValue = !previous;
        const method = previous ? "DELETE" : "POST";

        inFlightRef.current = true;
        setLoading(true);
        setFavorited(nextValue);

        try {
            const response = await fetch(
                `/api/proxy/favorites/listings/${adId}/toggle/`,
                {
                    method,
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                window.location.href = `/login?next=${encodeURIComponent(
                    window.location.pathname
                )}`;
                return;
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
        } catch {
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
            aria-pressed={favorited}
            className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-[2px] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${favorited
                    ? "bg-white text-orange-500 shadow-[0_5px_16px_rgba(15,23,42,0.18)] ring-1 ring-white"
                    : "bg-slate-950/20 text-white shadow-[0_2px_8px_rgba(15,23,42,0.35)] ring-1 ring-white/40 hover:bg-white hover:text-orange-500"
                }`}
        >
            <FontAwesomeIcon
                icon={favorited ? faHeart : faHeartRegular}
                className="h-[18px] w-[18px]"
            />
        </button>
    );
}
