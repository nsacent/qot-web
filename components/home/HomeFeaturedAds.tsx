"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@/lib/faIcons";
import HomeAdCard from "@/components/home/HomeAdCard";

type ListingRecord = Record<string, unknown>;

type HomeFeaturedAdsProps = {
    ads?: ListingRecord[];
};

function isRecord(value: unknown): value is ListingRecord {
    return typeof value === "object" && value !== null;
}

function getArray(data: unknown): ListingRecord[] {
    if (Array.isArray(data)) return data.filter(isRecord);
    if (!isRecord(data)) return [];

    for (const key of ["results", "data", "favorites", "listings"]) {
        const value = data[key];

        if (Array.isArray(value)) return value.filter(isRecord);
    }

    return [];
}

function normalizeFavorite(item: ListingRecord) {
    return isRecord(item.listing) ? item.listing : item;
}

function getAdId(ad: ListingRecord) {
    const id = ad.id || ad.listing_id || ad.uuid;
    return id ? String(id) : "";
}

function getAdTitle(ad: ListingRecord) {
    return String(ad.title || ad.name || "Untitled ad");
}

export default function HomeFeaturedAds({ ads = [] }: HomeFeaturedAdsProps) {
    const railRef = useRef<HTMLDivElement | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    async function loadSavedAds() {
        try {
            const response = await fetch("/api/proxy/favorites/", {
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                setFavoriteIds(new Set());
                return;
            }

            const favorites = getArray(await response.json());
            const ids = new Set<string>();

            favorites.forEach((item) => {
                const id = getAdId(normalizeFavorite(item));
                if (id) ids.add(id);
            });

            setFavoriteIds(ids);
        } catch {
            setFavoriteIds(new Set());
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadSavedAds();

        function refreshSavedAds() {
            void loadSavedAds();
        }

        window.addEventListener("qot_favorites_updated", refreshSavedAds);

        return () => {
            window.removeEventListener("qot_favorites_updated", refreshSavedAds);
        };
    }, []);

    function scrollRail(direction: -1 | 1) {
        railRef.current?.scrollBy({
            left: direction * 520,
            behavior: "smooth",
        });
    }

    if (!ads.length) return null;

    return (
        <section className="mx-auto max-w-[1390px] px-2 pb-4 pt-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 sm:text-2xl">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                    </span>
                    Featured Ads
                </h2>

                <div className="flex shrink-0 items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => scrollRail(-1)}
                        aria-label="Scroll featured ads left"
                        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-black text-slate-600 transition hover:border-orange-200 hover:text-orange-600 sm:flex"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollRail(1)}
                        aria-label="Scroll featured ads right"
                        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-black text-slate-600 transition hover:border-orange-200 hover:text-orange-600 sm:flex"
                    >
                        →
                    </button>
                    <Link
                        href="/ads?sort=featured"
                        className="rounded-xl px-3 py-2 text-xs font-black text-orange-600 transition hover:bg-orange-50"
                    >
                        View all →
                    </Link>
                </div>
            </div>

            <div
                ref={railRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
            >
                {ads.map((ad) => (
                    <div
                        key={getAdId(ad) || getAdTitle(ad)}
                        className="w-[210px] min-w-[210px] snap-start sm:w-[230px] sm:min-w-[230px] lg:w-[245px] lg:min-w-[245px]"
                    >
                        <HomeAdCard ad={ad} favoriteIds={favoriteIds} featured />
                    </div>
                ))}
            </div>
        </section>
    );
}
