"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faMagnifyingGlass } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import HomeAdCard from "@/components/home/HomeAdCard";
import { getCurrentUser } from "@/lib/sessionClient";

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

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = "/login?next=/saved";
        }
    }

    async function loadSavedAds() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/proxy/favorites/", {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = "/login?next=/saved";
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
            loadSavedAds();
        }
    }, [checkingSession]);

    useEffect(() => {
        function handleFavoritesUpdated() {
            loadSavedAds();
        }

        window.addEventListener("qot_favorites_updated", handleFavoritesUpdated);

        return () => {
            window.removeEventListener("qot_favorites_updated", handleFavoritesUpdated);
        };
    }, []);

    if (checkingSession) {
        return <QotLoader />;
    }

    return (
        <section className="py-6 text-slate-950">
            <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                            <FontAwesomeIcon icon={faHeart} className="h-6 w-6" />
                        </div>

                        <h1 className="mt-5 text-3xl font-black text-slate-950">
                            Saved Ads
                        </h1>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Ads you saved will appear here for quick access.
                        </p>
                    </div>

                    <a
                        href="/listings"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                        Browse Ads
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
                    <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {ads.map((ad) => (
                            <HomeAdCard
                                key={String(getAdId(ad))}
                                ad={ad}
                                favoriteIds={favoriteIds}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-7 rounded-[28px] bg-slate-50 px-6 py-14 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-orange-500 shadow-sm">
                            <FontAwesomeIcon icon={faHeart} className="h-7 w-7" />
                        </div>

                        <h2 className="mt-5 text-xl font-black text-slate-950">
                            No saved ads yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Tap the heart icon on any ad you like. It will be saved here.
                        </p>

                        <a
                            href="/listings"
                            className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
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