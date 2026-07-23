"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip, faList } from "@fortawesome/free-solid-svg-icons";
import HomeAdCard from "@/components/home/HomeAdCard";

type ListingsGridClientProps = {
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

export default function ListingsGridClient({
    listings,
}: ListingsGridClientProps) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");

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

    return (
        <section>
            <div className="mb-3 flex items-center justify-between md:hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Ad view
                </p>
                <div className="inline-flex rounded-[14px] bg-white p-1 shadow-sm ring-1 ring-slate-200" aria-label="Choose ad layout">
                    <button
                        type="button"
                        onClick={() => setDisplayMode("grid")}
                        aria-label="Show ads in grid view"
                        aria-pressed={displayMode === "grid"}
                        className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition ${displayMode === "grid" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        <FontAwesomeIcon icon={faGrip} className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDisplayMode("list")}
                        aria-label="Show ads in list view"
                        aria-pressed={displayMode === "list"}
                        className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition ${displayMode === "list" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className={`grid ${displayMode === "grid" ? "grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                {listings.map((item: any) => {
                    const id = String(getListingId(item));

                    return (
                        <HomeAdCard
                            key={id || item?.slug}
                            ad={item}
                            favoriteIds={favoriteIds}
                            displayMode={displayMode}
                        />
                    );
                })}
            </div>
        </section>
    );
}
