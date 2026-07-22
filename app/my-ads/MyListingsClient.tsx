"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPlus, faStore } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import ListingCardImage from "@/components/listings/ListingCardImage";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.pk;
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled Ad";
}
function formatPrice(value: any) {
    if (value === null || value === undefined || value === "") {
        return "Price on request";
    }

    const number = Number(String(value).replace(/[^\d.]/g, ""));

    if (!Number.isFinite(number) || number <= 0) {
        return "Price on request";
    }

    return `UGX ${new Intl.NumberFormat("en-UG").format(number)}`;
}

function getPrice(ad: any) {
    return formatPrice(ad?.price || ad?.amount || ad?.selling_price);
}

function getLocation(ad: any) {
    const city =
        ad?.city_name ||
        ad?.city?.name ||
        ad?.location?.city ||
        ad?.location_name ||
        ad?.district ||
        "";

    const region = ad?.region_name || ad?.region?.name || "";

    if (city && region) return `${city}, ${region}`;
    return city || region || "Uganda";
}

function getStatus(ad: any) {
    return (
        ad?.status ||
        ad?.approval_status ||
        ad?.listing_status ||
        (ad?.is_active ? "active" : "draft")
    );
}

function SellerAdCard({ ad }: { ad: any }) {
    const id = getAdId(ad);
    const title = getAdTitle(ad);
    const status = String(getStatus(ad)).replaceAll("_", " ");

    return (
        <article className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-black/5">
            <a href={`/my-ads/${ad.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <ListingCardImage
                        listing={ad}
                        title={title}
                        href={`/my-ads/${id}`}
                    />
                </div>

                <div className="p-4">
                    <h2 className="line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-950">
                        {getAdTitle(ad)}
                    </h2>

                    <p className="mt-2 text-sm font-black text-orange-600">
                        {getPrice(ad)}
                    </p>

                    <p className="mt-1 truncate text-xs font-bold text-slate-500">
                        {getLocation(ad)}
                    </p>
                </div>
            </a>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
                <a
                    href={`/ads/${id}`}
                    className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                >
                    View
                </a>

                <a
                    href={`/my-ads/${id}`}
                    className="rounded-2xl bg-orange-50 px-3 py-2 text-center text-xs font-black text-orange-600 hover:bg-orange-100"
                >
                    Manage
                </a>
            </div>
        </article>
    );
}

function MyListingsContent() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);

    const [ads, setAds] = useState<any[]>([]);
    const [error, setError] = useState("");

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = "/login?next=/my-ads";
        }
    }

    async function loadMyAds() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/proxy/seller/listings/?page_size=1000", {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = "/login?next=/my-ads";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to load your ads.");
            }

            setAds(getArray(data));
        } catch (err: any) {
            setError(err.message || "Failed to load your ads.");
            setAds([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (!checkingSession) {
            loadMyAds();
        }
    }, [checkingSession]);

    if (checkingSession) {
        return <QotLoader />;
    }

    return (
        <section className="py-6 text-slate-950">
            <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                            <FontAwesomeIcon icon={faStore} className="h-6 w-6" />
                        </div>

                        <h1 className="mt-5 text-3xl font-black text-slate-950">
                            My Ads
                        </h1>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Manage all ads you have posted on QOT.
                        </p>
                    </div>

                    <a
                        href="/post-ad"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                    >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        Post New Ad
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
                            <SellerAdCard key={String(getAdId(ad))} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-7 rounded-[28px] bg-slate-50 px-6 py-14 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-orange-500 shadow-sm">
                            <FontAwesomeIcon icon={faList} className="h-7 w-7" />
                        </div>

                        <h2 className="mt-5 text-xl font-black text-slate-950">
                            No ads posted yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Start selling by posting your first ad on QOT.
                        </p>

                        <a
                            href="/post-ad"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            Post Your First Ad
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function MyListingsClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <MyListingsContent />
        </Suspense>
    );
}