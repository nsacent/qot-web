"use client";

import { useEffect, useMemo, useState } from "react";
import HomeAdCard from "@/components/home/HomeAdCard";

type SimilarListingsClientProps = {
    listings: any[];
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

function getListingId(item: any) {
    return item?.id || item?.listing_id || item?.slug || "";
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

export default function SimilarListingsClient({
    listings,
}: SimilarListingsClientProps) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    async function loadFavorites() {
        try {
            const response = await fetch("/api/proxy/favorites/", {
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                setFavoriteIds(new Set());
                return;
            }

            const data = await response.json();
            const favorites = getArray(data);

            setFavoriteIds(
                new Set(
                    favorites
                        .map((item: any) => String(getListingIdFromFavorite(item)))
                        .filter(Boolean)
                )
            );
        } catch {
            setFavoriteIds(new Set());
        }
    }

    useEffect(() => {
        loadFavorites();

        function handleFavoritesUpdated(event: Event) {
            const customEvent = event as CustomEvent<{
                listingId?: string;
                saved?: boolean;
            }>;

            const listingId = customEvent.detail?.listingId;
            const saved = customEvent.detail?.saved;

            if (!listingId) {
                loadFavorites();
                return;
            }

            setFavoriteIds((current) => {
                const next = new Set(current);

                if (saved) {
                    next.add(String(listingId));
                } else {
                    next.delete(String(listingId));
                }

                return next;
            });
        }

        window.addEventListener("qot_favorites_updated", handleFavoritesUpdated);

        return () => {
            window.removeEventListener(
                "qot_favorites_updated",
                handleFavoritesUpdated
            );
        };
    }, []);

    const cleanListings = useMemo(() => listings.slice(0, 12), [listings]);

    return (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {cleanListings.map((item: any) => {
                const id = String(getListingId(item));

                return (
                    <HomeAdCard
                        key={id || item?.slug}
                        ad={item}
                        favoriteIds={favoriteIds}
                    />
                );
            })}
        </div>
    );
}