"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faMagnifyingGlass } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import HomeAdCard from "@/components/home/HomeAdCard";
import { getCurrentUser } from "@/lib/sessionClient";
import PaginationControls from "@/components/common/PaginationControls";

const PAGE_SIZE = 20;

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function normalizeFavorite(item: any) {
    return item?.listing || item?.ad || item;
}

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.pk;
}

function SavedAdsContent() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);

    const [ads, setAds] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = "/login?next=/account/saved";
        }
    }

    async function loadSavedAds(pageNumber = page) {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/proxy/favorites/?page=${pageNumber}&page_size=${PAGE_SIZE}`, {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = "/login?next=/account/saved";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.detail || data?.message || "Failed to load saved ads."
                );
            }

            const items = getArray(data);
            const normalizedAds = items.map(normalizeFavorite).filter(Boolean);

            const ids = new Set<string>();

            normalizedAds.forEach((ad: any) => {
                const id = getAdId(ad);

                if (id) {
                    ids.add(String(id));
                }
            });

            setAds(normalizedAds);
            setFavoriteIds(ids);
            setTotalCount(Number.isFinite(Number(data?.count)) ? Number(data.count) : normalizedAds.length);
            setPage(pageNumber);
        } catch (err: any) {
            setError(err.message || "Failed to load saved ads.");
            setAds([]);
            setFavoriteIds(new Set());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (!checkingSession) {
            void loadSavedAds();
        }
    }, [checkingSession]);

    useEffect(() => {
        function handleFavoritesUpdated() {
            void loadSavedAds(page);
        }

        window.addEventListener("qot_favorites_updated", handleFavoritesUpdated);

        return () => {
            window.removeEventListener("qot_favorites_updated", handleFavoritesUpdated);
        };
    }, [page]);

    if (checkingSession) {
        return <QotLoader />;
    }

    function changePage(nextPage: number) {
        void loadSavedAds(nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <section className="pt-2 text-slate-950 md:pt-4">
            <div className="rounded-[24px] bg-white p-3 shadow-[0_14px_42px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-5">
                <div className="flex items-center justify-end gap-3 border-b border-slate-100 pb-2 md:justify-between md:pb-4">
                    <div className="hidden min-w-0 items-center gap-3 md:flex">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-lg font-black text-slate-950 sm:text-xl">Saved Ads</h1>
                            <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
                                {totalCount > 0 ? `${totalCount} saved ${totalCount === 1 ? "ad" : "ads"}` : "Your favourite ads"}
                            </p>
                        </div>
                    </div>

                    <a
                        href="/ads"
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-orange-500 px-3 text-xs font-black text-white hover:bg-orange-600 sm:px-4"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Browse Ads</span>
                    </a>
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16">
                        <QotLoader />
                    </div>
                ) : ads.length > 0 ? (
                    <>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {ads.map((ad) => (
                                <HomeAdCard
                                    key={String(getAdId(ad))}
                                    ad={ad}
                                    favoriteIds={favoriteIds}
                                />
                            ))}
                        </div>
                        <PaginationControls
                            currentPage={page}
                            pageSize={PAGE_SIZE}
                            totalCount={totalCount}
                            itemLabel="saved ads"
                            loading={loading}
                            onPageChange={changePage}
                        />
                    </>
                ) : (
                    <div className="mt-4 rounded-[22px] bg-slate-50 px-5 py-9 text-center ring-1 ring-slate-100">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                            <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                        </div>

                        <h2 className="mt-4 text-lg font-black text-slate-950">
                            No saved ads yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Tap the heart icon on any ad you like. It will be saved here.
                        </p>

                        <a
                            href="/ads"
                            className="mt-5 inline-flex rounded-[14px] bg-orange-500 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-600"
                        >
                            Explore Ads
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function SavedAdsClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <SavedAdsContent />
        </Suspense>
    );
}
