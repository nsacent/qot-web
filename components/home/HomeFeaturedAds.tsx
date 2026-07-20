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
            <div className="relative overflow-hidden rounded-[30px] bg-slate-950 px-4 py-5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] sm:px-5 sm:py-6">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative mb-5 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                            Promoted marketplace picks
                        </p>
                        <h2 className="mt-1.5 flex items-center gap-2.5 text-xl font-black tracking-tight text-white sm:text-2xl">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                                <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                            </span>
                            Featured Ads
                        </h2>
                        <p className="mt-1.5 text-xs font-semibold text-slate-400 sm:text-sm">
                            Standout deals selected for more visibility.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollRail(-1)}
                            aria-label="Scroll featured ads left"
                            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white ring-1 ring-white/10 transition hover:bg-orange-500 sm:flex"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollRail(1)}
                            aria-label="Scroll featured ads right"
                            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white ring-1 ring-white/10 transition hover:bg-orange-500 sm:flex"
                        >
                            →
                        </button>
                        <Link
                            href="/listings?sort=featured"
                            className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-orange-500 hover:text-white"
                        >
                            View all
                        </Link>
                    </div>
                </div>

                <div
                    ref={railRef}
                    className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
                >
                    {ads.map((ad) => (
                        <div
                            key={getAdId(ad) || getAdTitle(ad)}
                            className="w-[210px] min-w-[210px] snap-start sm:w-[230px] sm:min-w-[230px] lg:w-[245px] lg:min-w-[245px]"
                        >
                            <HomeAdCard ad={ad} favoriteIds={favoriteIds} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
