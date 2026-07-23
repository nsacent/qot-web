"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClock,
    faEye,
    faHeart,
    faLocationDot,
    faPenToSquare,
    faStore,
    faTag,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import ListingShareActions from "@/components/listings/ListingShareActions";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";

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

function cleanLabel(value: any, fallback = "Not specified") {
    if (!value) return fallback;

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCount(value: any) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? new Intl.NumberFormat("en-UG").format(number) : "0";
}

function getLocation(ad: any) {
    const city = ad?.city?.name || ad?.city_name;
    const region = ad?.region?.name || ad?.region_name || ad?.district_name || ad?.district;

    if (city && region) return `${city}, ${region}`;
    return city || region || ad?.location_name || "Uganda";
}

function getAttributeDetails(ad: any) {
    if (!Array.isArray(ad?.attributes)) return [];

    return ad.attributes.flatMap((item: any) => {
        const label = item?.filter_name || item?.name || item?.label || item?.key || "Detail";
        const rawValue = item?.value_text ?? item?.value_number ?? item?.value_boolean ?? item?.value;

        if (rawValue === "" || rawValue === null || rawValue === undefined) return [];

        return [{ label, value: typeof rawValue === "boolean" ? (rawValue ? "Yes" : "No") : String(rawValue) }];
    });
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



    const status = getAdStatus(ad);
    const statusInfo = getStatusInfo(status);
    const actions = getStatusActions(status);
    const attributes = getAttributeDetails(ad);
    const location = getLocation(ad);
    const condition = cleanLabel(ad?.condition);
    const updatedValue = ad?.updated_at || ad?.modified_at || ad?.created_at;
    const viewCount = ad?.views_count ?? ad?.view_count ?? ad?.views ?? 0;
    const savedCount = ad?.favorites_count ?? ad?.favourites_count ?? ad?.saved_count ?? 0;

    return (
        <section className="pb-10 pt-5 text-slate-950">
            <a
                href="/my-ads"
                className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-black text-slate-600 hover:text-orange-600"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                My Ads
            </a>

            <div className="mt-3 overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
                <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-6 sm:px-7 sm:py-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">
                                    <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-orange-500" />
                                    Ad workspace
                                </span>
                                <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ring-1 ${statusInfo.badge}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <h1 className="mt-4 max-w-4xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                                {ad?.title || "Untitled Ad"}
                            </h1>
                            <p className="mt-3 text-2xl font-black text-orange-600 sm:text-3xl">
                                {formatPrice(ad?.price || ad?.amount || ad?.selling_price)}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTag} className="h-3.5 w-3.5 text-orange-500" />
                                    {ad?.category_name || ad?.category?.name || "Category"}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-orange-500" />
                                    {location}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                            <a
                                href={`/ads/${id}`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white px-4 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                                <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                Public page
                            </a>
                            <a
                                href={`/my-ads/${id}/edit`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
                            >
                                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                Edit Ad
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-950">{formatCount(viewCount)}</p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Views</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                            <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-950">{formatCount(savedCount)}</p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Saved</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-950" title={formatDateTime(updatedValue)}>
                                {formatRelativeTime(updatedValue)}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Last updated</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-6">
                    <div className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Ad photos</p>
                                <h2 className="mt-1 text-lg font-black text-slate-950">Your gallery</h2>
                            </div>
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                Cover first
                            </span>
                        </div>
                        <ListingImageCarousel listing={ad} title={ad?.title || "Ad image"} />
                    </div>

                    <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Ad content</p>
                                <h2 className="mt-1 text-xl font-black text-slate-950">Description & details</h2>
                            </div>
                            <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600">
                                {condition}
                            </span>
                        </div>

                        <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                            {ad?.description || "No description provided."}
                        </p>

                        {attributes.length > 0 && (
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-black text-slate-950">Product details</h3>
                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {attributes.map((item: any) => (
                                        <div key={`${item.label}-${item.value}`} className="rounded-2xl bg-slate-50 px-4 py-3.5">
                                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{item.label}</p>
                                            <p className="mt-1 break-words text-sm font-black text-slate-800">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-5 lg:sticky lg:top-5 lg:h-fit">
                    <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Current state</p>
                                <h2 className="mt-1 text-xl font-black text-slate-950">{statusInfo.title}</h2>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{statusInfo.description}</p>

                        <div className="mt-5 grid gap-2">
                            <a href={`/my-ads/${id}/edit`} className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600">
                                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                Edit Ad Details
                            </a>
                            <a href={`/ads/${id}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800">
                                <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                View as Buyer
                            </a>
                        </div>

                        {actions.length > 0 && (
                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Manage availability</p>
                                <div className="grid gap-2">
                                    {actions.map((item) => (
                                        <button
                                            key={item.action}
                                            type="button"
                                            onClick={() => handleListingAction(item.action)}
                                            disabled={Boolean(actionLoading)}
                                            className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${item.className}`}
                                        >
                                            <span className="block">{actionLoading === item.action ? "Please wait..." : item.label}</span>
                                            <span className="mt-1 block text-[11px] font-semibold opacity-70">{item.motive}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
                        <p className="text-sm font-black text-slate-950">Share your ad</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Send it to buyers or promote it on your channels.</p>
                        <ListingShareActions listing={ad} listingId={id} title={ad?.title} className="mt-4" />
                    </div>

                    <div className="rounded-[24px] border border-red-100 bg-red-50/70 p-5">
                        <p className="text-sm font-black text-red-700">Remove this ad</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-red-500">Deleting is permanent. Pause the ad instead if it may become available again.</p>
                        <button type="button" onClick={handleDelete} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-white text-sm font-black text-red-600 ring-1 ring-red-100 hover:bg-red-100">
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
