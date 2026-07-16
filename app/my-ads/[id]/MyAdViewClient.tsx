"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGear,
    faLocationDot,
    faTag,
    faTrash,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function getAdImage(ad: any) {
    const image =
        ad?.cover_image ||
        ad?.thumbnail ||
        ad?.image ||
        ad?.main_image ||
        ad?.featured_image ||
        ad?.images?.[0]?.image ||
        ad?.images?.[0]?.url ||
        ad?.photos?.[0]?.image ||
        ad?.photos?.[0]?.url;

    if (!image) return "";
    if (String(image).startsWith("http")) return image;
    if (String(image).startsWith("/")) return `${API_ORIGIN}${image}`;

    return image;
}

function getImages(ad: any) {
    const rawImages = ad?.images || ad?.photos || [];

    if (!Array.isArray(rawImages)) return [];

    return rawImages
        .map((item: any) => item?.image || item?.url || item)
        .filter(Boolean)
        .map((image: string) => {
            if (String(image).startsWith("http")) return image;
            if (String(image).startsWith("/")) return `${API_ORIGIN}${image}`;
            return image;
        });
}

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
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

function MyAdViewContent({ id }: { id: string }) {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);

    const [ad, setAd] = useState<any>(null);
    const [error, setError] = useState("");

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = `/login?next=/my-ads/${id}`;
        }
    }



    async function loadAd() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/proxy/seller/listings/${id}/`, {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}`;
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (response.status === 403 || response.status === 404) {
                throw new Error("Access denied. This ad does not belong to your account.");
            }

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to load ad.");
            }

            setAd(data?.listing || data?.data || data);
        } catch (err: any) {
            setError(err.message || "Failed to load ad.");
            setAd(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (!checkingSession) {
            loadAd();
        }
    }, [checkingSession]);

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this ad? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/proxy/seller/listings/${id}/`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok && response.status !== 204) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.detail || data?.message || "Failed to delete ad.");
            }

            window.location.href = "/my-ads";
        } catch (err: any) {
            alert(err.message || "Failed to delete ad.");
        }
    }

    if (checkingSession || loading) {
        return <QotLoader />;
    }

    if (error || !ad) {
        return (
            <section className="py-6">
                <div className="rounded-[34px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                    <h1 className="text-2xl font-black text-slate-950">
                        Access denied
                    </h1>

                    <p className="mt-2 text-sm font-bold text-red-600">{error}</p>

                    <a
                        href="/my-ads"
                        className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                    >
                        Back to My Ads
                    </a>
                </div>
            </section>
        );
    }

    const mainImage = getAdImage(ad);
    const images = getImages(ad);
    const allImages = mainImage ? [mainImage, ...images.filter((img) => img !== mainImage)] : images;

    return (
        <section className="py-6 text-slate-950">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
                <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                    <a
                        href="/my-ads"
                        className="text-sm font-black text-orange-600 hover:text-orange-700"
                    >
                        ← Back to My Ads
                    </a>

                    <div className="mt-6 overflow-hidden rounded-[28px] bg-slate-100">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={ad?.title || "Ad image"}
                                className="aspect-[16/10] w-full object-cover"
                            />
                        ) : (
                            <div className="flex aspect-[16/10] items-center justify-center text-sm font-black text-slate-400">
                                No image uploaded
                            </div>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                            {allImages.slice(0, 12).map((image, index) => (
                                <img
                                    key={`${image}-${index}`}
                                    src={image}
                                    alt=""
                                    className="aspect-square rounded-2xl object-cover ring-1 ring-black/5"
                                />
                            ))}
                        </div>
                    )}

                    <h1 className="mt-7 text-3xl font-black text-slate-950">
                        {ad?.title || "Untitled Ad"}
                    </h1>

                    <p className="mt-3 text-2xl font-black text-orange-600">
                        {formatPrice(ad?.price || ad?.amount || ad?.selling_price)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-black text-slate-700">
                            <FontAwesomeIcon icon={faTag} className="h-4 w-4 text-orange-500" />
                            {ad?.category_name || ad?.category?.name || "Category"}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-black text-slate-700">
                            <FontAwesomeIcon
                                icon={faLocationDot}
                                className="h-4 w-4 text-orange-500"
                            />
                            {ad?.city_name ||
                                ad?.city?.name ||
                                ad?.location_name ||
                                ad?.district ||
                                "Uganda"}
                        </span>
                    </div>

                    <div className="mt-7 rounded-[28px] bg-slate-50 p-5">
                        <h2 className="text-lg font-black text-slate-950">Description</h2>

                        <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                            {ad?.description || "No description provided."}
                        </p>
                    </div>
                </div>

                <aside className="h-fit rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-6">
                    <h2 className="text-xl font-black text-slate-950">Ad actions</h2>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                        Manage this ad from here.
                    </p>

                    <div className="mt-6 grid gap-3">
                        <a
                            href={`/my-ads/${id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                        >
                            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
                            Edit Ad
                        </a>

                        <a
                            href={`/listings/${id}`}
                            className="rounded-2xl bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            View Public Page
                        </a>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                        >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            Delete Ad
                        </button>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default function MyAdViewClient({ id }: { id: string }) {
    return (
        <Suspense fallback={<QotLoader />}>
            <MyAdViewContent id={id} />
        </Suspense>
    );
}