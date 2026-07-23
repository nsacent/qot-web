"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@/lib/faIcons";
import HomeAdCard from "@/components/home/HomeAdCard";

type HomeLatestAdsProps = {
    ads?: any[];
};

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

function getAdId(ad: any) {
    return String(ad?.id || ad?.listing_id || ad?.uuid || "");
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

export default function HomeLatestAds({ ads = [] }: HomeLatestAdsProps) {
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

            const data = await response.json();
            const favorites = getArray(data);

            const ids = new Set<string>();

            favorites.forEach((item: any) => {
                const ad = normalizeFavorite(item);
                const id = getAdId(ad);

                if (id) {
                    ids.add(String(id));
                }
            });

            setFavoriteIds(ids);
        } catch {
            setFavoriteIds(new Set());
        }
    }

    useEffect(() => {
        loadSavedAds();

        function refreshSavedAds() {
            loadSavedAds();
        }

        window.addEventListener("qot_favorites_updated", refreshSavedAds);
        window.addEventListener("storage", refreshSavedAds);

        return () => {
            window.removeEventListener("qot_favorites_updated", refreshSavedAds);
            window.removeEventListener("storage", refreshSavedAds);
        };
    }, []);

    return (
        <section className="mx-auto max-w-[1390px] px-2 pb-5 pt-2">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
                    <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-lg shadow-slate-200 ring-1 ring-white/60">
                        <span className="absolute -bottom-2 -left-2 h-5 w-5 rounded-full bg-orange-500/70" />
                        <FontAwesomeIcon icon={faClock} className="relative h-4 w-4 text-orange-300" />
                    </span>
                    Latest Ads
                </h2>

                <a
                    href="/ads?sort=newest"
                    className="rounded-xl px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50"
                >
                    View More →
                </a>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">                {ads.length > 0 ? (
                ads.map((ad) => (
                    <HomeAdCard
                        key={getAdId(ad) || getAdTitle(ad)}
                        ad={ad}
                        favoriteIds={favoriteIds}
                    />
                ))
            ) : (
                <div className="col-span-full rounded-3xl border border-dashed bg-white p-10 text-center">
                    <p className="text-lg font-black text-slate-950">
                        No latest ads yet.
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                        New ads will appear here once sellers post.
                    </p>
                </div>
            )}
            </div>
        </section>
    );
}
