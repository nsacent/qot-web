"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faCalendar,
    faCircleCheck,
    faEye,
    faLocationDot,
    faMagnifyingGlass,
    faRotateLeft,
    faUser,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "@/lib/apiClient";
import AdminActionModal, {
    type AdminModalField,
} from "@/components/admin/AdminActionModal";
import {
    AdminEmptyState,
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminRefreshButton,
} from "@/components/admin/AdminUi";
import ListingExpiryCountdown from "@/components/listings/ListingExpiryCountdown";
import PaginationControls from "@/components/common/PaginationControls";
import {
    getListingExpiryValue,
    getListingFeaturedUntil,
    listingIsCurrentlyFeatured,
} from "@/lib/listingExpiry";

const LISTINGS_ENDPOINT = "/admin-panel/listings/";
const PENDING_LISTINGS_ENDPOINT = "/admin-panel/listings/pending/";
const PAGE_SIZE = 12;

type ListingFilters = {
    search: string;
    status: string;
    seller: string;
    category: string;
    city: string;
    featured: string;
    dateFrom: string;
    dateTo: string;
};

type RenewableListing = {
    status?: string | null;
    expires_at?: string | null;
};

const DEFAULT_FILTERS: ListingFilters = {
    search: "",
    status: "pending_only",
    seller: "",
    category: "",
    city: "",
    featured: "",
    dateFrom: "",
    dateTo: "",
};

type ListingModal =
    | {
        type: "reject" | "renew" | "feature" | "unfeature";
        id: string | number;
        title: string;
    }
    | null;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function formatPrice(listing: any) {
    const price = Number(listing?.price || 0);
    if (price <= 0) return "Price on request";
    return `${listing?.currency || "UGX"} ${price.toLocaleString()}`;
}

function formatDate(value: string) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getImage(listing: any) {
    return (
        listing?.primary_image ||
        listing?.image ||
        listing?.cover_image ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        ""
    );
}

function isFeatured(listing: any) {
    return listingIsCurrentlyFeatured(listing);
}

function isRenewable(listing: RenewableListing) {
    if (listing?.status === "expired") return true;
    if (listing?.status !== "active" || !listing?.expires_at) return false;

    const expiry = new Date(listing.expires_at).getTime();
    return Number.isFinite(expiry) && expiry <= Date.now();
}

function statusClass(status: string) {
    const value = String(status || "").toLowerCase();
    if (value === "active") return "bg-emerald-50 text-emerald-700";
    if (value === "rejected") return "bg-red-50 text-red-700";
    if (value === "pending") return "bg-orange-50 text-orange-700";
    if (value === "sold") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-700";
}

export default function AdminListingsClient() {
    const [listings, setListings] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("pending_only");
    const [seller, setSeller] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [featured, setFeatured] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [success, setSuccess] = useState("");
    const [modal, setModal] = useState<ListingModal>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [modalError, setModalError] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    function currentFilters(): ListingFilters {
        return { search, status, seller, category, city, featured, dateFrom, dateTo };
    }

    function buildEndpoint(pageNumber: number, values: ListingFilters) {
        const params = new URLSearchParams();

        if (values.search.trim()) params.set("search", values.search.trim());
        if (values.status && values.status !== "all" && values.status !== "pending_only") {
            params.set("status", values.status);
        }
        if (values.seller.trim()) params.set("seller", values.seller.trim());
        if (values.category.trim()) params.set("category", values.category.trim());
        if (values.city.trim()) params.set("city", values.city.trim());
        if (values.featured) params.set("is_featured", values.featured);
        if (values.dateFrom) params.set("date_from", values.dateFrom);
        if (values.dateTo) params.set("date_to", values.dateTo);
        params.set("page", String(pageNumber));
        params.set("page_size", String(PAGE_SIZE));

        const base =
            values.status === "pending_only" ? PENDING_LISTINGS_ENDPOINT : LISTINGS_ENDPOINT;
        const query = params.toString();

        return `${base}?${query}`;
    }

    async function loadListings(pageNumber = page, values = currentFilters()) {
        setLoading(true);
        setError("");

        try {
            const data: any = await apiGet(buildEndpoint(pageNumber, values));
            const rows = getArray(data);
            setListings(rows);
            setTotalCount(Number.isFinite(Number(data?.count)) ? Number(data.count) : rows.length);
            setPage(pageNumber);
        } catch (error: any) {
            setError(error.message || "Failed to load ads.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadListings(1, DEFAULT_FILTERS);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function runAction(key: string, callback: () => Promise<any>) {
        setActionLoading(key);
        setActionError("");
        setSuccess("");

        try {
            await callback();
            await loadListings(listings.length === 1 && page > 1 ? page - 1 : page);
        } catch (error: any) {
            setActionError(error.message || "The ad action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function approveListing(id: string | number) {
        return runAction(`approve-${id}`, () =>
            apiPost(`/admin-panel/listings/${id}/approve/`)
        );
    }

    function openListingModal(
        type: "reject" | "renew" | "feature" | "unfeature",
        listing: any
    ) {
        setModal({
            type,
            id: listing.id,
            title: listing.title || "this ad",
        });
        setModalValues(type === "feature" ? { days: "7" } : { reason: "" });
        setModalError("");
    }

    async function confirmListingModal() {
        if (!modal) return;

        if (modal.type === "reject" && !modalValues.reason?.trim()) {
            setModalError("Please enter a clear rejection reason.");
            return;
        }

        const days = Number(modalValues.days);

        if (
            modal.type === "feature" &&
            (!Number.isFinite(days) || days < 1 || days > 365)
        ) {
            setModalError("Enter a duration between 1 and 365 days.");
            return;
        }

        const key = `${modal.type}-${modal.id}`;
        setActionLoading(key);
        setModalError("");
        setActionError("");
        setSuccess("");

        try {
            if (modal.type === "reject") {
                await apiPost(`/admin-panel/listings/${modal.id}/reject/`, {
                    rejection_reason: modalValues.reason.trim(),
                });
                setSuccess(`“${modal.title}” was rejected. The seller can now see the reason.`);
            } else if (modal.type === "renew") {
                await apiPost(`/admin-panel/listings/${modal.id}/renew/`);
                setSuccess(`“${modal.title}” was renewed and is active for another 30 days.`);
            } else if (modal.type === "feature") {
                await apiPost(`/admin-panel/listings/${modal.id}/feature/`, {
                    days,
                });
            } else {
                await apiPost(`/admin-panel/listings/${modal.id}/unfeature/`);
            }

            setModal(null);
            await loadListings(listings.length === 1 && page > 1 ? page - 1 : page);
        } catch (error: any) {
            setModalError(error.message || "The ad action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function clearFilters() {
        setSearch("");
        setStatus("pending_only");
        setSeller("");
        setCategory("");
        setCity("");
        setFeatured("");
        setDateFrom("");
        setDateTo("");
        void loadListings(1, DEFAULT_FILTERS);
    }

    function changePage(nextPage: number) {
        void loadListings(nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    let modalFields: AdminModalField[] = [];
    let modalTitle = "";
    let modalDescription = "";
    let modalConfirmLabel = "Confirm";
    let modalTone: "orange" | "green" | "red" = "orange";

    if (modal?.type === "reject") {
        modalTitle = "Reject ad";
        modalDescription = `Explain why “${modal.title}” cannot be published. The seller may see this reason.`;
        modalConfirmLabel = "Reject ad";
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
        modalTitle = "Feature ad";
        modalDescription = `Choose how long “${modal.title}” should receive featured placement.`;
        modalConfirmLabel = "Feature ad";
        modalFields = [
            {
                key: "days",
                label: "Featured duration",
                type: "number",
                helper: "Enter a value from 1 to 365 days.",
                required: true,
                min: 1,
                max: 365,
            },
        ];
    } else if (modal?.type === "renew") {
        modalTitle = "Renew expired ad?";
        modalDescription = `“${modal.title}” will become active immediately with a new 30-day expiry period.`;
        modalConfirmLabel = "Renew for 30 days";
        modalTone = "green";
    } else if (modal?.type === "unfeature") {
        modalTitle = "Remove featured status?";
        modalDescription = `“${modal.title}” will return to normal marketplace placement immediately.`;
        modalConfirmLabel = "Remove feature";
        modalTone = "red";
    }

    return (
        <section>
            <AdminPageHeader
                eyebrow="Marketplace moderation"
                title="Ads"
                description="Review new adverts, search the catalogue, and manage approval or featured status without leaving the queue."
                action={<AdminRefreshButton onClick={() => void loadListings()} loading={loading} />}
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    void loadListings(1);
                }}
                className="mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="relative md:col-span-2">
                        <span className="sr-only">Search ads</span>
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title, description, seller…"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:bg-white"
                        />
                    </label>

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400"
                    >
                        <option value="pending_only">Pending queue</option>
                        <option value="all">All ads</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="sold">Sold</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={featured}
                        onChange={(event) => setFeatured(event.target.value)}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400"
                    >
                        <option value="">Any promotion status</option>
                        <option value="true">Featured</option>
                        <option value="false">Not featured</option>
                    </select>

                    <input
                        value={seller}
                        onChange={(event) => setSeller(event.target.value)}
                        placeholder="Seller ID"
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400"
                    />
                    <input
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Category slug"
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400"
                    />
                    <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="City slug"
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            aria-label="Date from"
                            className="h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold outline-none focus:border-orange-400"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            aria-label="Date to"
                            className="h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold outline-none focus:border-orange-400"
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                    >
                        Apply filters
                    </button>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
                        Reset
                    </button>
                </div>
            </form>

            {actionError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    {actionError}
                </div>
            )}

            {success && (
                <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                    {success}
                </div>
            )}

            {loading ? (
                <AdminLoadingState label="Loading ads" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={() => void loadListings()} />
            ) : listings.length === 0 ? (
                <AdminEmptyState
                    title="No ads found"
                    description="Try changing the filters or check back when sellers submit new adverts."
                />
            ) : (
                <>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-black text-slate-700">
                            {totalCount.toLocaleString()} ad{totalCount === 1 ? "" : "s"}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">Newest first</p>
                    </div>

                    <div className="grid gap-4">
                        {listings.map((listing) => {
                            const image = getImage(listing);
                            const listingFeatured = isFeatured(listing);
                            const listingExpiry = getListingExpiryValue(listing);
                            const featuredUntil = getListingFeaturedUntil(listing);
                            const listingRenewable = isRenewable(listing);
                            const id = listing.id;

                            return (
                                <article
                                    key={id}
                                    className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-200/70"
                                >
                                    <div className="grid lg:grid-cols-[190px_1fr_auto]">
                                        <a
                                            href={`/ads/${id}`}
                                            className="relative min-h-44 overflow-hidden bg-slate-100 lg:min-h-full"
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={listing.title || "Ad"}
                                                    className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-300">
                                                    QOT
                                                </span>
                                            )}
                                        </a>

                                        <div className="min-w-0 p-5 sm:p-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${statusClass(listing.status)}`}>
                                                    {listing.status || "Unknown"}
                                                </span>
                                                {listing.status === "pending" && listing.review_submission_type === "edit" && (
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">
                                                        Edited — review changes
                                                    </span>
                                                )}
                                                {listingFeatured && (
                                                    <span className="rounded-full bg-violet-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
                                                        Featured
                                                    </span>
                                                )}
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
                                                    {listing.category_name || "Marketplace"}
                                                </span>
                                            </div>

                                            <h3 className="mt-3 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                                {listing.title || "Untitled ad"}
                                            </h3>
                                            <p className="mt-1 text-base font-black text-orange-600">
                                                {formatPrice(listing)}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-slate-300" />
                                                    {listing.seller_name || listing.seller_phone || `Seller #${listing.seller}`}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 text-orange-400" />
                                                    {listing.city_name || "Uganda"}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-slate-300" />
                                                    {formatDate(listing.created_at)}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                                                {listingExpiry && (
                                                    <ListingExpiryCountdown
                                                        expiresAt={listingExpiry}
                                                        label="Ad:"
                                                    />
                                                )}
                                                {listingFeatured && featuredUntil && (
                                                    <ListingExpiryCountdown
                                                        expiresAt={featuredUntil}
                                                        label="Featured:"
                                                        expiredLabel="Featured period ended"
                                                        className="text-violet-700"
                                                    />
                                                )}
                                            </div>

                                            {listing.rejection_reason && (
                                                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700">
                                                    <span className="font-black">Rejection:</span>{" "}
                                                    {listing.rejection_reason}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4 sm:grid-cols-4 lg:w-44 lg:grid-cols-1 lg:border-l lg:border-t-0">
                                            <a
                                                href={`/admin/ads/${id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-[11px] font-black text-slate-700 hover:bg-slate-200"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                                                Review
                                            </a>
                                            {listingRenewable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openListingModal("renew", listing)}
                                                    disabled={actionLoading === `renew-${id}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                                                >
                                                    <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
                                                    {actionLoading === `renew-${id}` ? "Working…" : "Renew ad"}
                                                </button>
                                            ) : listing.status !== "active" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => approveListing(id)}
                                                    disabled={actionLoading === `approve-${id}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                                                >
                                                    <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                                                    {actionLoading === `approve-${id}` ? "Working…" : "Approve"}
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => openListingModal("reject", listing)}
                                                disabled={actionLoading === `reject-${id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-black text-red-700 hover:bg-red-100 disabled:opacity-60"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                                                {actionLoading === `reject-${id}` ? "Working…" : "Reject"}
                                            </button>
                                            {(listing.status === "active" || listingFeatured) && !listingRenewable && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openListingModal(
                                                            listingFeatured ? "unfeature" : "feature",
                                                            listing
                                                        )
                                                    }
                                                    disabled={actionLoading.endsWith(`-${id}`)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-[11px] font-black text-violet-700 hover:bg-violet-100 disabled:opacity-60"
                                                >
                                                    <FontAwesomeIcon icon={faBolt} className="h-3 w-3" />
                                                    {listingFeatured ? "Unfeature" : "Feature"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <PaginationControls
                        currentPage={page}
                        pageSize={PAGE_SIZE}
                        totalCount={totalCount}
                        itemLabel="ads"
                        loading={loading}
                        onPageChange={changePage}
                    />
                </>
            )}

            {modal && (
                <AdminActionModal
                    title={modalTitle}
                    description={modalDescription}
                    confirmLabel={modalConfirmLabel}
                    tone={modalTone}
                    fields={modalFields}
                    values={modalValues}
                    error={modalError}
                    loading={actionLoading === `${modal.type}-${modal.id}`}
                    onChange={(key, value) => {
                        setModalValues((current) => ({ ...current, [key]: value }));
                        setModalError("");
                    }}
                    onConfirm={confirmListingModal}
                    onClose={() => {
                        setModal(null);
                        setModalError("");
                    }}
                />
            )}
        </section>
    );
}
