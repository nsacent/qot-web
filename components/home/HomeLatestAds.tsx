"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@/lib/faIcons";
import HomeAdCard from "@/components/home/HomeAdCard";

type HomeLatestAdsProps = {
    ads?: any[];
    initialHasMore?: boolean;
    totalAvailable?: number;
};

const PAGE_SIZE = 24;
const MAX_HOME_ADS = 500;

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

function uniqueAds(items: any[]) {
    const seen = new Set<string>();

    return items.filter((item) => {
        const id = getAdId(item);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export default function HomeLatestAds({
    ads = [],
    initialHasMore = false,
    totalAvailable,
}: HomeLatestAdsProps) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [visibleAds, setVisibleAds] = useState(() => uniqueAds(ads).slice(0, MAX_HOME_ADS));
    const [hasMore, setHasMore] = useState(initialHasMore && ads.length < MAX_HOME_ADS);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState("");
    const nextPageRef = useRef(2);
    const loadingRef = useRef(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

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

    const loadMoreAds = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        setLoadingMore(true);
        setLoadError("");

        try {
            const params = new URLSearchParams({
                sort: "newest",
                page_size: String(PAGE_SIZE),
                page: String(nextPageRef.current),
            });
            const response = await fetch(`/api/proxy/listings/?${params.toString()}`, {
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) throw new Error("Could not load more ads.");

            const data = await response.json();
            const batch = getArray(data);
            const existingIds = new Set(visibleAds.map(getAdId).filter(Boolean));
            const additions = batch.filter((ad) => {
                const id = getAdId(ad);
                if (!id || existingIds.has(id)) return false;
                existingIds.add(id);
                return true;
            });
            const combined = [...visibleAds, ...additions].slice(0, MAX_HOME_ADS);

            setVisibleAds(combined);

            nextPageRef.current += 1;
            setHasMore(Boolean(data?.next) && batch.length > 0 && combined.length < MAX_HOME_ADS);
        } catch (error) {
            setLoadError(error instanceof Error ? error.message : "Could not load more ads.");
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMore, visibleAds.length]);

    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target || !hasMore || loadError) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) void loadMoreAds();
            },
            { rootMargin: "600px 0px" }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, loadError, loadMoreAds]);

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

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">                {visibleAds.length > 0 ? (
                visibleAds.map((ad) => (
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

            <div ref={loadMoreRef} className="flex min-h-20 flex-col items-center justify-center py-5 text-center">
                {loadingMore ? (
                    <>
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-orange-100 border-t-orange-500" />
                        <span className="mt-2 text-[11px] font-bold text-slate-500">Loading more ads…</span>
                    </>
                ) : loadError ? (
                    <>
                        <p className="text-xs font-bold text-red-600">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setLoadError("");
                                void loadMoreAds();
                            }}
                            className="mt-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white hover:bg-orange-600"
                        >
                            Try again
                        </button>
                    </>
                ) : hasMore ? (
                    <span className="text-[11px] font-bold text-slate-400">Scroll to load more ads</span>
                ) : visibleAds.length > 0 ? (
                    <span className="text-[11px] font-bold text-slate-400">
                        {visibleAds.length >= MAX_HOME_ADS
                            ? `Showing the newest ${MAX_HOME_ADS.toLocaleString()} ads`
                            : `All ${Math.min(totalAvailable || visibleAds.length, visibleAds.length).toLocaleString()} available ads are loaded`}
                    </span>
                ) : null}
            </div>
        </section>
    );
}
