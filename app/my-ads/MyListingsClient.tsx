"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faPause,
    faPenToSquare,
    faPlay,
    faRotateRight,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faList, faPlus, faStore } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import ListingCardImage from "@/components/listings/ListingCardImage";
import AdActionModal from "@/components/listings/AdActionModal";

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function getNextProxyPath(value: unknown) {
    if (typeof value !== "string" || !value) return "";

    if (value.startsWith("http")) {
        const url = new URL(value);
        return `${url.pathname}${url.search}`.replace(/^\/api\/v1/, "");
    }

    return value.replace(/^\/api\/v1/, "");
}

async function fetchAllMyAds() {
    const loadedAds: any[] = [];
    const visited = new Set<string>();
    let path = "/seller/listings/?page_size=50";

    while (path && !visited.has(path) && visited.size < 100) {
        visited.add(path);
        const response = await fetch(`/api/proxy${path}`, {
            credentials: "include",
            cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            throw new Error("__AUTH__");
        }

        if (!response.ok) {
            throw new Error(data?.detail || data?.message || "Failed to load your ads.");
        }

        loadedAds.push(...getArray(data));
        path = getNextProxyPath(data?.next);
    }

    return loadedAds;
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

function normalizeStatus(ad: any) {
    const status = String(getStatus(ad) || "").toLowerCase().replaceAll(" ", "_");

    if (["pending", "pending_approval", "under_review"].includes(status)) {
        return "pending";
    }

    return status || "draft";
}

const statusTabs = [
    { value: "all", label: "All ads" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending approval" },
    { value: "draft", label: "Drafts" },
    { value: "rejected", label: "Rejected" },
    { value: "sold", label: "Sold" },
    { value: "unavailable", label: "Unavailable" },
    { value: "expired", label: "Expired" },
];

const statusTone: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    pending: "bg-amber-50 text-amber-700 ring-amber-100",
    draft: "bg-blue-50 text-blue-700 ring-blue-100",
    rejected: "bg-red-50 text-red-700 ring-red-100",
    sold: "bg-violet-50 text-violet-700 ring-violet-100",
    unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
    expired: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusPriority: Record<string, number> = {
    active: 0,
    pending: 1,
    draft: 2,
    rejected: 3,
    sold: 4,
    unavailable: 5,
    expired: 6,
};

type CardAction = {
    action: string;
    label: string;
    title: string;
    description: string;
    confirmLabel: string;
    icon: any;
    tone: string;
    destructive?: boolean;
};

function getCardActions(status: string, isDraft: boolean): CardAction[] {
    if (isDraft) {
        return [{
            action: "discard-draft",
            label: "Discard",
            title: "Discard this draft?",
            description: "The unfinished ad and its staged photos will be removed. This cannot be undone.",
            confirmLabel: "Discard draft",
            icon: faTrash,
            tone: "bg-red-50 text-red-700",
            destructive: true,
        }];
    }

    const removeAction: CardAction = {
        action: "delete",
        label: "Remove",
        title: "Remove this ad?",
        description: "The ad will be removed from QOT. Pause it instead if the item may become available again.",
        confirmLabel: "Remove ad",
        icon: faTrash,
        tone: "bg-red-50 text-red-700",
        destructive: true,
    };

    if (status === "active") {
        return [
            {
                action: "mark-sold",
                label: "Mark as sold",
                title: "Mark this ad as sold?",
                description: "Buyers will see that the item is no longer available.",
                confirmLabel: "Mark as sold",
                icon: faCircleCheck,
                tone: "bg-emerald-50 text-emerald-700",
            },
            {
                action: "mark-unavailable",
                label: "Pause",
                title: "Pause this ad?",
                description: "The ad will be hidden from buyers until you resume it.",
                confirmLabel: "Pause ad",
                icon: faPause,
                tone: "bg-amber-50 text-amber-700",
            },
            removeAction,
        ];
    }

    if (["sold", "unavailable"].includes(status)) {
        return [
            {
                action: "mark-available",
                label: "Resume",
                title: "Make this ad available again?",
                description: "The ad will return to the marketplace for buyers to view and contact you.",
                confirmLabel: "Resume ad",
                icon: faPlay,
                tone: "bg-blue-50 text-blue-700",
            },
            removeAction,
        ];
    }

    if (status === "expired") {
        return [
            {
                action: "renew",
                label: "Renew",
                title: "Renew this ad?",
                description: "The ad duration will be extended and it will return to active status.",
                confirmLabel: "Renew ad",
                icon: faRotateRight,
                tone: "bg-violet-50 text-violet-700",
            },
            removeAction,
        ];
    }

    return [removeAction];
}

function SellerAdCard({ ad, onChanged }: { ad: any; onChanged: () => void }) {
    const id = getAdId(ad);
    const title = getAdTitle(ad);
    const status = normalizeStatus(ad);
    const isDraft = status === "draft" && ad?.is_incomplete_draft;
    const manageHref = isDraft ? "/post-ad" : `/account/my-ads/${id}`;
    const viewHref = isDraft ? "/post-ad" : `/ads/${id}`;
    const statusLabel = statusTabs.find((tab) => tab.value === status)?.label || status.replaceAll("_", " ");
    const [pendingAction, setPendingAction] = useState<CardAction | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const actions = getCardActions(status, isDraft);

    async function confirmAction() {
        if (!pendingAction) return;

        setActionLoading(true);
        setActionError("");

        try {
            let response: Response;

            if (pendingAction.action === "discard-draft") {
                response = await fetch("/api/proxy/listings/draft/", {
                    method: "DELETE",
                    credentials: "include",
                });
            } else if (pendingAction.action === "delete") {
                response = await fetch(`/api/proxy/seller/listings/${id}/`, {
                    method: "DELETE",
                    credentials: "include",
                });
            } else {
                response = await fetch(`/api/proxy/listings/${id}/${pendingAction.action}/`, {
                    method: "POST",
                    credentials: "include",
                });
            }

            if (response.status === 401) {
                window.location.href = "/login?next=/account/my-ads";
                return;
            }

            const data = response.status === 204
                ? {}
                : await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "The ad could not be updated.");
            }

            setPendingAction(null);
            onChanged();
        } catch (requestError: any) {
            setActionError(requestError.message || "The ad could not be updated.");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <article className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-black/5">
            <Link href={manageHref} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <ListingCardImage
                        listing={ad}
                        title={title}
                        href={manageHref}
                    />
                    <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ring-1 ${statusTone[status] || statusTone.unavailable}`}>
                        {statusLabel}
                    </span>
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
            </Link>

            <div className="border-t border-slate-100 px-3 py-2.5">
                <div className="grid grid-cols-2 gap-1.5">
                    <Link href={isDraft ? "/post-ad" : `/account/my-ads/${id}/edit`} className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-2 py-1.5 text-[10px] font-black leading-tight text-orange-700 transition hover:bg-orange-100 sm:text-[11px]">
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 shrink-0" />
                        <span className="text-center">Edit</span>
                    </Link>
                    {actions.map((action) => (
                        <button
                            key={action.action}
                            type="button"
                            onClick={() => {
                                setActionError("");
                                setPendingAction(action);
                            }}
                            className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[10px] font-black leading-tight transition hover:brightness-95 sm:text-[11px] ${action.tone}`}
                        >
                            <FontAwesomeIcon icon={action.icon} className="h-3 w-3 shrink-0" />
                            <span className="text-center">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
                <Link
                    href={viewHref}
                    className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                >
                    {isDraft ? "Continue" : "View"}
                </Link>

                <Link
                    href={manageHref}
                    className="rounded-2xl bg-orange-50 px-3 py-2 text-center text-xs font-black text-orange-600 hover:bg-orange-100"
                >
                    {isDraft ? "Edit draft" : "Manage"}
                </Link>
            </div>

            <AdActionModal
                open={Boolean(pendingAction)}
                title={pendingAction?.title || "Update ad?"}
                description={pendingAction?.description || "Confirm this change."}
                confirmLabel={pendingAction?.confirmLabel || "Confirm"}
                destructive={pendingAction?.destructive}
                loading={actionLoading}
                error={actionError}
                onClose={() => {
                    if (actionLoading) return;
                    setPendingAction(null);
                    setActionError("");
                }}
                onConfirm={confirmAction}
            />
        </article>
    );
}

function MyListingsContent() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);

    const [ads, setAds] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [error, setError] = useState("");

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = "/login?next=/account/my-ads";
        }
    }

    async function loadMyAds() {
        setLoading(true);
        setError("");

        try {
            const [loadedAds, draftResponse] = await Promise.all([
                fetchAllMyAds(),
                fetch("/api/proxy/listings/draft/", {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            const draftPayload = draftResponse.ok
                ? await draftResponse.json().catch(() => ({}))
                : {};
            const incompleteDraft = draftPayload?.draft;
            const draftData = incompleteDraft?.data || {};
            const draftImage = getArray(incompleteDraft?.staged_images)[0];
            const draftAd = incompleteDraft
                ? {
                    id: "incomplete-draft",
                    title: draftData.title || "Unfinished ad",
                    price: draftData.price || "",
                    city_name: "Continue where you stopped",
                    status: "draft",
                    is_incomplete_draft: true,
                    primary_image: draftImage?.card_image_url || draftImage?.image_url || null,
                    updated_at: incompleteDraft.updated_at,
                }
                : null;
            setAds(draftAd ? [draftAd, ...loadedAds] : loadedAds);
        } catch (err: any) {
            if (err?.message === "__AUTH__") {
                window.location.href = "/login?next=/account/my-ads";
                return;
            }

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

    const statusCounts = Object.fromEntries(
        statusTabs.map((tab) => [
            tab.value,
            tab.value === "all"
                ? ads.length
                : ads.filter((ad) => normalizeStatus(ad) === tab.value).length,
        ])
    );
    const sortedAds = [...ads].sort((firstAd, secondAd) => (
        (statusPriority[normalizeStatus(firstAd)] ?? 99) -
        (statusPriority[normalizeStatus(secondAd)] ?? 99)
    ));
    const filteredAds = selectedStatus === "all"
        ? sortedAds
        : sortedAds.filter((ad) => normalizeStatus(ad) === selectedStatus);

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

                    <Link
                        href="/post-ad"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                    >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        Post New Ad
                    </Link>
                </div>

                {!loading && ads.length > 0 && (
                    <div className="-mx-5 mt-7 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden">
                        <div className="flex min-w-max gap-2">
                            {statusTabs.map((tab) => {
                                const isSelected = selectedStatus === tab.value;
                                const count = statusCounts[tab.value] || 0;

                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setSelectedStatus(tab.value)}
                                        aria-pressed={isSelected}
                                        className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-black transition ${isSelected
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                                            : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:ring-orange-100"
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-white text-slate-500 ring-1 ring-slate-200"
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16">
                        <QotLoader />
                    </div>
                ) : filteredAds.length > 0 ? (
                    <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredAds.map((ad) => (
                            <SellerAdCard key={String(getAdId(ad))} ad={ad} onChanged={loadMyAds} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-7 rounded-[28px] bg-slate-50 px-6 py-14 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-orange-500 shadow-sm">
                            <FontAwesomeIcon icon={faList} className="h-7 w-7" />
                        </div>

                        <h2 className="mt-5 text-xl font-black text-slate-950">
                            {ads.length > 0 ? `No ${statusTabs.find((tab) => tab.value === selectedStatus)?.label.toLowerCase() || "ads"}` : "No ads posted yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            {ads.length > 0
                                ? "Choose another status above to see the rest of your ads."
                                : "Start selling by posting your first ad on QOT."
                            }
                        </p>

                        <Link
                            href="/post-ad"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                            Post Your First Ad
                        </Link>
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
