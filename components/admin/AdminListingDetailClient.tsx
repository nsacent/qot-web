"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowLeft,
    faBolt,
    faCalendar,
    faChartLine,
    faCircleCheck,
    faClock,
    faEye,
    faFlag,
    faHeart,
    faImages,
    faMoneyBillWave,
    faPenToSquare,
    faShieldHalved,
    faStore,
    faTag,
    faTrashCan,
    faUser,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getImageUrl } from "@/lib/listingImages";
import AdminActionModal, {
    type AdminModalField,
} from "@/components/admin/AdminActionModal";
import {
    AdminErrorState,
    AdminLoadingState,
    AdminRefreshButton,
    AdminStatCard,
} from "@/components/admin/AdminUi";

type ListingImage = {
    id: number;
    image?: string | null;
    image_url?: string | null;
    is_primary: boolean;
    sort_order: number;
};

type ListingAttribute = {
    id: number;
    filter_name?: string | null;
    filter_key?: string | null;
    filter_type?: string | null;
    value_text?: string | null;
    value_number?: string | number | null;
    value_boolean?: boolean | null;
};

type AdminListingDetail = {
    id: number;
    title: string;
    slug: string;
    seller: number;
    seller_name: string;
    seller_phone: string | null;
    seller_email: string | null;
    seller_role: string;
    seller_is_active: boolean;
    seller_is_verified: boolean;
    seller_is_banned: boolean;
    category: number;
    category_name: string;
    category_parent_name: string | null;
    city: number;
    city_name: string;
    region_name: string | null;
    price: string | number;
    currency: string;
    condition: string;
    status: string;
    description: string;
    is_negotiable: boolean;
    is_featured: boolean;
    featured_until: string | null;
    views_count: number;
    favorites_count: number;
    rejection_reason: string | null;
    primary_image: string | null;
    images: ListingImage[];
    image_count: number;
    attributes: ListingAttribute[];
    reports_count: number;
    open_reports_count: number;
    expires_at: string | null;
    sold_at: string | null;
    created_at: string;
    updated_at: string;
};

type ModerationAction = "reject" | "feature" | "unfeature" | "delete";

type ActionModal = {
    type: ModerationAction;
} | null;

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

function formatLabel(value: string | null | undefined) {
    return String(value || "unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null, includeTime = false) {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
}

function formatMoney(value: string | number, currency: string) {
    const amount = Number(value || 0);

    return `${currency || "UGX"} ${amount.toLocaleString("en-UG", {
        maximumFractionDigits: 0,
    })}`;
}

function statusClass(status: string) {
    if (status === "active") return "bg-emerald-50 text-emerald-700";
    if (status === "pending") return "bg-orange-50 text-orange-700";
    if (status === "rejected" || status === "deleted") {
        return "bg-red-50 text-red-700";
    }
    if (status === "sold") return "bg-blue-50 text-blue-700";
    if (status === "expired") return "bg-violet-50 text-violet-700";
    return "bg-slate-100 text-slate-700";
}

function attributeValue(attribute: ListingAttribute) {
    if (attribute.value_boolean !== null && attribute.value_boolean !== undefined) {
        return attribute.value_boolean ? "Yes" : "No";
    }

    if (attribute.value_number !== null && attribute.value_number !== undefined) {
        return Number(attribute.value_number).toLocaleString("en-UG");
    }

    return attribute.value_text || "Not specified";
}

function imageSource(image: ListingImage) {
    return getImageUrl(image.image_url || image.image || "");
}

export default function AdminListingDetailClient({
    listingId,
}: {
    listingId: string;
}) {
    const [listing, setListing] = useState<AdminListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [modal, setModal] = useState<ActionModal>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [modalError, setModalError] = useState("");
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

    const fetchListing = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError("");

        try {
            const data = await apiGet<AdminListingDetail>(
                `/admin-panel/listings/${listingId}/`
            );
            setListing(data);
            setSelectedImageId((current) => {
                if (current && data.images.some((image) => image.id === current)) {
                    return current;
                }

                return (
                    data.images.find((image) => image.is_primary)?.id ||
                    data.images[0]?.id ||
                    null
                );
            });
        } catch (requestError: unknown) {
            setError(errorMessage(requestError, "Failed to load this listing."));
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        let cancelled = false;

        apiGet<AdminListingDetail>(`/admin-panel/listings/${listingId}/`)
            .then((data) => {
                if (cancelled) return;
                setListing(data);
                setSelectedImageId(
                    data.images.find((image) => image.is_primary)?.id ||
                    data.images[0]?.id ||
                    null
                );
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setError(errorMessage(requestError, "Failed to load this listing."));
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [listingId]);

    const orderedImages = useMemo(() => {
        if (!listing) return [];

        return [...listing.images].sort((first, second) => {
            if (first.is_primary !== second.is_primary) {
                return first.is_primary ? -1 : 1;
            }

            return first.sort_order - second.sort_order;
        });
    }, [listing]);

    const selectedImage =
        orderedImages.find((image) => image.id === selectedImageId) ||
        orderedImages[0];
    const heroImage = selectedImage
        ? imageSource(selectedImage)
        : getImageUrl(listing?.primary_image || "");

    function openModal(type: ModerationAction) {
        setModal({ type });
        setModalValues(type === "feature" ? { days: "7" } : { reason: "" });
        setModalError("");
    }

    async function approveListing() {
        if (!listing) return;
        setActionLoading("approve");
        setActionError("");
        setSuccess("");

        try {
            await apiPost(`/admin-panel/listings/${listing.id}/approve/`);
            setSuccess("Listing approved and published successfully.");
            await fetchListing(false);
        } catch (requestError: unknown) {
            setActionError(errorMessage(requestError, "The listing could not be approved."));
        } finally {
            setActionLoading("");
        }
    }

    async function confirmModal() {
        if (!listing || !modal) return;

        if (modal.type === "reject" && !modalValues.reason?.trim()) {
            setModalError("Enter a clear reason for rejecting this listing.");
            return;
        }

        const days = Number(modalValues.days);
        if (
            modal.type === "feature" &&
            (!Number.isFinite(days) || days < 1 || days > 365)
        ) {
            setModalError("Enter a featured duration from 1 to 365 days.");
            return;
        }

        setActionLoading(modal.type);
        setActionError("");
        setSuccess("");
        setModalError("");

        try {
            if (modal.type === "reject") {
                await apiPost(`/admin-panel/listings/${listing.id}/reject/`, {
                    rejection_reason: modalValues.reason.trim(),
                });
                setSuccess("Listing rejected. The seller can now review the reason.");
            } else if (modal.type === "feature") {
                await apiPost(`/admin-panel/listings/${listing.id}/feature/`, { days });
                setSuccess(`Listing featured for ${days} day${days === 1 ? "" : "s"}.`);
            } else if (modal.type === "unfeature") {
                await apiPost(`/admin-panel/listings/${listing.id}/unfeature/`);
                setSuccess("Featured placement removed from this listing.");
            } else {
                await apiPost(`/admin-panel/listings/${listing.id}/delete/`);
                setSuccess("Listing removed from the marketplace.");
            }

            setModal(null);
            await fetchListing(false);
        } catch (requestError: unknown) {
            setModalError(errorMessage(requestError, "The listing action failed."));
        } finally {
            setActionLoading("");
        }
    }

    if (loading && !listing) {
        return <AdminLoadingState label="Loading listing details" />;
    }

    if (error && !listing) {
        return <AdminErrorState message={error} onRetry={() => fetchListing()} />;
    }

    if (!listing) {
        return (
            <AdminErrorState
                message="This listing is unavailable or may have been removed."
                onRetry={() => fetchListing()}
            />
        );
    }

    const isDeleted = listing.status === "deleted";
    const canApprove = !isDeleted && listing.status !== "active";
    const canReject = !isDeleted && listing.status !== "rejected";
    const canFeature = listing.status === "active" && !listing.is_featured;

    let modalTitle = "";
    let modalDescription = "";
    let modalConfirmLabel = "Confirm";
    let modalTone: "orange" | "green" | "red" = "orange";
    let modalFields: AdminModalField[] = [];

    if (modal?.type === "reject") {
        modalTitle = "Reject this listing?";
        modalDescription = `Explain why “${listing.title}” cannot be published. The seller may see this reason.`;
        modalConfirmLabel = "Reject listing";
        modalTone = "red";
        modalFields = [
            {
                key: "reason",
                label: "Rejection reason",
                type: "textarea",
                placeholder: "Describe what the seller needs to correct…",
                required: true,
            },
        ];
    } else if (modal?.type === "feature") {
        modalTitle = "Feature this listing?";
        modalDescription = `Choose how long “${listing.title}” should receive promoted marketplace placement.`;
        modalConfirmLabel = "Feature listing";
        modalFields = [
            {
                key: "days",
                label: "Featured duration",
                type: "number",
                helper: "Enter a value from 1 to 365 days.",
                min: 1,
                max: 365,
                required: true,
            },
        ];
    } else if (modal?.type === "unfeature") {
        modalTitle = "Remove featured status?";
        modalDescription = `“${listing.title}” will immediately return to normal marketplace placement.`;
        modalConfirmLabel = "Remove feature";
        modalTone = "red";
    } else if (modal?.type === "delete") {
        modalTitle = "Remove this listing?";
        modalDescription = `“${listing.title}” will be hidden from the marketplace. This moderation action does not erase its audit record.`;
        modalConfirmLabel = "Remove listing";
        modalTone = "red";
    }

    return (
        <section>
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <Link
                        href="/admin/listings"
                        className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                        Back to listings
                    </Link>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${statusClass(listing.status)}`}>
                            {formatLabel(listing.status)}
                        </span>
                        {listing.is_featured && (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
                                Featured
                            </span>
                        )}
                        <span className="text-xs font-bold text-slate-400">
                            Listing #{listing.id}
                        </span>
                    </div>
                    <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                        {listing.title}
                    </h1>
                    <p className="mt-2 text-lg font-black text-orange-600">
                        {formatMoney(listing.price, listing.currency)}
                        {listing.is_negotiable && (
                            <span className="ml-2 text-xs font-bold text-slate-400">Negotiable</span>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {!isDeleted && (
                        <Link
                            href={`/admin/listings/${listing.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                            Edit listing
                        </Link>
                    )}
                    {listing.status === "active" && (
                        <Link
                            href={`/listings/${listing.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                            Public view
                        </Link>
                    )}
                    <AdminRefreshButton
                        onClick={() => fetchListing()}
                        loading={loading}
                    />
                </div>
            </div>

            {success && (
                <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />
                    {success}
                </div>
            )}
            {(actionError || (error && listing)) && (
                <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    {actionError || error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
                <div className="min-w-0 space-y-6">
                    <section className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-slate-200/70">
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                            {heroImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={heroImage}
                                    alt={listing.title}
                                    className="absolute inset-0 h-full w-full object-contain"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                    <FontAwesomeIcon icon={faImages} className="h-10 w-10" />
                                    <p className="mt-3 text-sm font-black">No listing images</p>
                                </div>
                            )}
                            <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur">
                                {listing.image_count} photo{listing.image_count === 1 ? "" : "s"}
                            </span>
                        </div>

                        {orderedImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto border-t border-slate-100 p-4">
                                {orderedImages.map((image, index) => {
                                    const source = imageSource(image);
                                    const active = image.id === selectedImage?.id;

                                    return (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() => setSelectedImageId(image.id)}
                                            aria-label={`Show image ${index + 1}`}
                                            className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 transition ${active ? "ring-orange-500" : "ring-transparent hover:ring-slate-300"}`}
                                        >
                                            {source && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={source}
                                                    alt=""
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminStatCard label="Views" value={listing.views_count.toLocaleString()} icon={faChartLine} tone="blue" />
                        <AdminStatCard label="Saves" value={listing.favorites_count.toLocaleString()} icon={faHeart} tone="red" />
                        <AdminStatCard label="Reports" value={listing.reports_count.toLocaleString()} detail={`${listing.open_reports_count} still open`} icon={faFlag} tone={listing.open_reports_count ? "red" : "green"} />
                        <AdminStatCard label="Images" value={listing.image_count.toLocaleString()} icon={faImages} tone="violet" />
                    </div>

                    {listing.rejection_reason && (
                        <section className="rounded-[26px] border border-red-200 bg-red-50 p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-red-600">Rejection reason</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-red-800">{listing.rejection_reason}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                        <h2 className="text-xl font-black tracking-tight text-slate-950">Listing description</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600">
                            {listing.description || "The seller did not provide a description."}
                        </p>
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Submitted details</p>
                                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Specifications</h2>
                            </div>
                            <FontAwesomeIcon icon={faTag} className="h-5 w-5 text-slate-300" />
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <DetailTile label="Category" value={[listing.category_parent_name, listing.category_name].filter(Boolean).join(" / ")} />
                            <DetailTile label="Condition" value={formatLabel(listing.condition)} />
                            <DetailTile label="Location" value={[listing.city_name, listing.region_name].filter(Boolean).join(", ")} />
                            <DetailTile label="Price terms" value={listing.is_negotiable ? "Negotiable" : "Fixed price"} />
                            {listing.attributes.map((attribute) => (
                                <DetailTile
                                    key={attribute.id}
                                    label={attribute.filter_name || attribute.filter_key || "Attribute"}
                                    value={attributeValue(attribute)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                        <h2 className="text-xl font-black tracking-tight text-slate-950">Listing timeline</h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <TimelineRow icon={faCalendar} label="Submitted" value={formatDate(listing.created_at, true)} />
                            <TimelineRow icon={faClock} label="Last updated" value={formatDate(listing.updated_at, true)} />
                            <TimelineRow icon={faCalendar} label="Expires" value={formatDate(listing.expires_at, true)} />
                            <TimelineRow icon={faCircleCheck} label="Sold" value={formatDate(listing.sold_at, true)} />
                            {listing.is_featured && (
                                <TimelineRow icon={faBolt} label="Featured until" value={formatDate(listing.featured_until, true)} />
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">Moderation</p>
                                <h2 className="text-lg font-black">Listing controls</h2>
                            </div>
                        </div>

                        {isDeleted ? (
                            <div className="mt-5 rounded-2xl bg-white/10 px-4 py-4 text-sm font-semibold leading-6 text-slate-300 ring-1 ring-white/10">
                                This listing has been removed. Its details remain available for moderation history.
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-2">
                                {canApprove && (
                                    <ActionButton
                                        icon={faCircleCheck}
                                        label={actionLoading === "approve" ? "Approving…" : "Approve and publish"}
                                        onClick={approveListing}
                                        disabled={Boolean(actionLoading)}
                                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                                    />
                                )}
                                {canReject && (
                                    <ActionButton
                                        icon={faXmark}
                                        label="Reject listing"
                                        onClick={() => openModal("reject")}
                                        disabled={Boolean(actionLoading)}
                                        className="bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                                    />
                                )}
                                {canFeature && (
                                    <ActionButton
                                        icon={faBolt}
                                        label="Feature listing"
                                        onClick={() => openModal("feature")}
                                        disabled={Boolean(actionLoading)}
                                        className="bg-violet-500 text-white hover:bg-violet-400"
                                    />
                                )}
                                {listing.is_featured && (
                                    <ActionButton
                                        icon={faBolt}
                                        label="Remove featured status"
                                        onClick={() => openModal("unfeature")}
                                        disabled={Boolean(actionLoading)}
                                        className="bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                                    />
                                )}
                            </div>
                        )}
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Seller</p>
                                <h2 className="mt-1 text-lg font-black text-slate-950">{listing.seller_name || `Seller #${listing.seller}`}</h2>
                            </div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faStore} className="h-4 w-4" />
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            <SellerRow icon={faUser} label="Role" value={formatLabel(listing.seller_role)} />
                            <SellerRow icon={faMoneyBillWave} label="Phone" value={listing.seller_phone || "Not provided"} />
                            <SellerRow icon={faStore} label="Email" value={listing.seller_email || "Not provided"} />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <StatusPill active={listing.seller_is_verified} label={listing.seller_is_verified ? "Verified" : "Not verified"} />
                            <StatusPill active={listing.seller_is_active} label={listing.seller_is_active ? "Active" : "Inactive"} />
                            {listing.seller_is_banned && <StatusPill active={false} label="Banned" />}
                        </div>

                        <Link
                            href={`/admin/users/${listing.seller}`}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                        >
                            <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                            Open seller account
                        </Link>
                    </section>

                    {!isDeleted && (
                        <section className="rounded-[28px] border border-red-200 bg-red-50 p-6">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                    <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-red-600">Danger zone</p>
                                    <p className="mt-0.5 text-sm font-bold text-red-900">Remove from marketplace</p>
                                </div>
                            </div>
                            <p className="mt-4 text-xs font-semibold leading-5 text-red-700">
                                The listing will be soft-deleted so its moderation record remains available.
                            </p>
                            <button
                                type="button"
                                onClick={() => openModal("delete")}
                                disabled={Boolean(actionLoading)}
                                className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                Remove listing
                            </button>
                        </section>
                    )}
                </aside>
            </div>

            {modal && (
                <AdminActionModal
                    title={modalTitle}
                    description={modalDescription}
                    confirmLabel={modalConfirmLabel}
                    tone={modalTone}
                    fields={modalFields}
                    values={modalValues}
                    error={modalError}
                    loading={actionLoading === modal.type}
                    onChange={(key, value) => {
                        setModalValues((current) => ({ ...current, [key]: value }));
                        setModalError("");
                    }}
                    onConfirm={confirmModal}
                    onClose={() => {
                        setModal(null);
                        setModalError("");
                    }}
                />
            )}
        </section>
    );
}

function DetailTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-bold text-slate-800">{value || "Not specified"}</p>
        </div>
    );
}

function TimelineRow({ icon, label, value }: { icon: IconDefinition; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
            </span>
            <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function SellerRow({ icon, label, value }: { icon: IconDefinition; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-slate-400" />
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
    return (
        <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {label}
        </span>
    );
}

function ActionButton({
    icon,
    label,
    onClick,
    disabled,
    className,
}: {
    icon: IconDefinition;
    label: string;
    onClick: () => void;
    disabled: boolean;
    className: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-black transition disabled:cursor-wait disabled:opacity-60 ${className}`}
        >
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}
