"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faTag,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import ListingShareActions from "@/components/listings/ListingShareActions";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function getImageUrl(value: any) {
    const image = value?.image || value?.url || value;

    if (!image) return "";

    if (String(image).startsWith("http")) return String(image);
    if (String(image).startsWith("/")) return `${API_ORIGIN}${image}`;

    return String(image);
}

function getImageId(value: any) {
    return value?.id || value?.pk || value?.image_id || "";
}

function getListingPrimaryUrl(ad: any) {
    const image =
        ad?.primary_image?.image ||
        ad?.primary_image?.url ||
        ad?.cover_image ||
        ad?.thumbnail ||
        ad?.main_image ||
        ad?.featured_image;

    return getImageUrl(image);
}

function getImageIsPrimary(item: any) {
    const value =
        item?.is_primary ??
        item?.primary ??
        item?.is_main ??
        item?.is_cover ??
        item?.is_featured;

    return value === true || value === "true" || value === 1 || value === "1";
}

function getOrderedAdImages(ad: any) {
    const rawImages = ad?.images || ad?.photos || [];

    const primaryUrl = getListingPrimaryUrl(ad);
    const primaryId =
        ad?.primary_image?.id ||
        ad?.primary_image_id ||
        ad?.cover_image_id ||
        ad?.main_image_id ||
        "";

    let images: any[] = [];

    if (Array.isArray(rawImages)) {
        images = rawImages
            .map((item: any, index: number) => {
                const id = String(getImageId(item) || "");
                const url = getImageUrl(item);

                return {
                    id,
                    url,
                    index,
                    backendSaysPrimary: getImageIsPrimary(item),
                    matchesPrimaryId: Boolean(primaryId && id && String(primaryId) === id),
                    matchesPrimaryUrl: Boolean(primaryUrl && url && primaryUrl === url),
                };
            })
            .filter((item: any) => item.url);
    }

    if (primaryUrl && !images.some((item) => item.url === primaryUrl)) {
        images.unshift({
            id: String(primaryId || ""),
            url: primaryUrl,
            index: -1,
            backendSaysPrimary: false,
            matchesPrimaryId: true,
            matchesPrimaryUrl: true,
        });
    }

    if (!images.length) return [];

    let primaryIndex = images.findIndex((item) => item.matchesPrimaryId);

    if (primaryIndex < 0) {
        primaryIndex = images.findIndex((item) => item.backendSaysPrimary);
    }

    if (primaryIndex < 0) {
        primaryIndex = images.findIndex((item) => item.matchesPrimaryUrl);
    }

    if (primaryIndex < 0) {
        primaryIndex = 0;
    }

    const primaryImage = images[primaryIndex];
    const otherImages = images.filter((_, index) => index !== primaryIndex);

    return [
        {
            ...primaryImage,
            isPrimary: true,
        },
        ...otherImages.map((item) => ({
            ...item,
            isPrimary: false,
        })),
    ];
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
    const [actionLoading, setActionLoading] = useState("");

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

    function getAdStatus(ad: any) {
        return String(
            ad?.status ||
            ad?.approval_status ||
            ad?.availability_status ||
            ""
        ).toLowerCase();
    }

    function getStatusInfo(status: string) {
        if (["active", "approved", "available", "published"].includes(status)) {
            return {
                label: "Active",
                badge: "bg-green-50 text-green-700 ring-green-100",
                title: "This ad is live",
                description: "Buyers can see this ad, contact you, and save it.",
            };
        }

        if (["sold"].includes(status)) {
            return {
                label: "Sold",
                badge: "bg-blue-50 text-blue-700 ring-blue-100",
                title: "This ad is marked as sold",
                description: "Buyers understand that this item is no longer available.",
            };
        }

        if (["unavailable", "inactive", "paused", "draft"].includes(status)) {
            return {
                label: "Unavailable",
                badge: "bg-yellow-50 text-yellow-700 ring-yellow-100",
                title: "This ad is paused",
                description: "The ad is not currently available to buyers.",
            };
        }

        if (["expired"].includes(status)) {
            return {
                label: "Expired",
                badge: "bg-orange-50 text-orange-700 ring-orange-100",
                title: "This ad has expired",
                description: "Renew or relist it so buyers can see it again.",
            };
        }

        if (["pending", "pending_approval", "under_review", "review"].includes(status)) {
            return {
                label: "Pending Approval",
                badge: "bg-purple-50 text-purple-700 ring-purple-100",
                title: "Waiting for approval",
                description: "This ad is being reviewed before it becomes public.",
            };
        }

        if (["rejected", "declined"].includes(status)) {
            return {
                label: "Rejected",
                badge: "bg-red-50 text-red-700 ring-red-100",
                title: "This ad was rejected",
                description: "Edit the ad details and submit again if allowed.",
            };
        }

        return {
            label: status ? status.replaceAll("_", " ") : "Unknown",
            badge: "bg-slate-50 text-slate-700 ring-slate-100",
            title: "Ad status unclear",
            description: "The current state of this ad could not be clearly identified.",
        };
    }

    function getStatusActions(status: string) {
        if (["active", "approved", "available", "published"].includes(status)) {
            return [
                {
                    action: "mark-sold",
                    label: "Mark as Sold",
                    motive: "Use this after the item has been bought.",
                    className: "bg-green-50 text-green-700 hover:bg-green-100",
                },
                {
                    action: "mark-unavailable",
                    label: "Pause Ad",
                    motive: "Use this when you want to hide the ad temporarily.",
                    className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
                },
                {
                    action: "renew",
                    label: "Renew Ad",
                    motive: "Use this to extend the life of the ad.",
                    className: "bg-orange-50 text-orange-700 hover:bg-orange-100",
                },
            ];
        }

        if (["sold"].includes(status)) {
            return [
                {
                    action: "mark-available",
                    label: "Mark Available Again",
                    motive: "Use this if the sale failed or the item is available again.",
                    className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
                },
                {
                    action: "relist",
                    label: "Relist Ad",
                    motive: "Use this to publish the item again as available.",
                    className: "bg-orange-50 text-orange-700 hover:bg-orange-100",
                },
            ];
        }

        if (["unavailable", "inactive", "paused", "draft"].includes(status)) {
            return [
                {
                    action: "mark-available",
                    label: "Make Available",
                    motive: "Use this when you want buyers to see and contact you again.",
                    className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
                },
            ];
        }

        if (["expired"].includes(status)) {
            return [
                {
                    action: "renew",
                    label: "Renew Ad",
                    motive: "Use this to extend the ad duration.",
                    className: "bg-orange-50 text-orange-700 hover:bg-orange-100",
                },
                {
                    action: "relist",
                    label: "Relist Ad",
                    motive: "Use this to publish the ad again.",
                    className: "bg-purple-50 text-purple-700 hover:bg-purple-100",
                },
            ];
        }

        return [];
    }

    async function handleListingAction(action: string) {
        setActionLoading(action);

        try {
            const response = await fetch(`/api/proxy/listings/${id}/${action}/`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}`;
                return;
            }

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Action failed.");
            }

            await loadAd();
        } catch (err: any) {
            alert(err.message || "Action failed.");
        } finally {
            setActionLoading("");
        }
    }

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

                    <div className="mt-6">
                        <ListingImageCarousel
                            listing={ad}
                            title={ad?.title || "Ad image"}
                        />
                    </div>



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
                    {(() => {
                        const status = getAdStatus(ad);
                        const statusInfo = getStatusInfo(status);
                        const actions = getStatusActions(status);

                        return (
                            <>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-950">
                                            Ad status
                                        </h2>

                                        <p className="mt-2 text-sm font-semibold text-slate-500">
                                            See what is happening with this ad and choose the right action.
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${statusInfo.badge}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                                    <h3 className="text-sm font-black text-slate-900">
                                        {statusInfo.title}
                                    </h3>

                                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                        {statusInfo.description}
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-3">
                                    <a
                                        href={`/my-ads/${id}/edit`}
                                        className="rounded-2xl bg-orange-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        Edit Ad Details
                                    </a>

                                    <a
                                        href={`/listings/${id}`}
                                        className="rounded-2xl bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        View Public Page
                                    </a>

                                    <ListingShareActions
                                        listing={ad}
                                        listingId={id}
                                        title={ad?.title}
                                        className="mt-3"
                                    />

                                    {actions.length > 0 && (
                                        <div className="mt-2 border-t border-slate-100 pt-4">
                                            <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                                                Recommended actions
                                            </p>

                                            <div className="grid gap-3">
                                                {actions.map((item) => (
                                                    <button
                                                        key={item.action}
                                                        type="button"
                                                        onClick={() => handleListingAction(item.action)}
                                                        disabled={Boolean(actionLoading)}
                                                        className={`rounded-2xl px-5 py-3 text-left text-sm font-black disabled:cursor-not-allowed disabled:opacity-60 ${item.className}`}
                                                    >
                                                        <span className="block">
                                                            {actionLoading === item.action
                                                                ? "Please wait..."
                                                                : item.label}
                                                        </span>

                                                        <span className="mt-1 block text-xs font-semibold opacity-75">
                                                            {item.motive}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-2 border-t border-slate-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="w-full rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                                        >
                                            Delete Ad
                                        </button>

                                        <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                                            Delete only when you no longer want this ad in your account.
                                        </p>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
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