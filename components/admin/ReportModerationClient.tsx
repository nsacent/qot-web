"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faCircleCheck,
    faFlag,
    faMagnifyingGlass,
    faRotateLeft,
    faShieldHalved,
    faTrash,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost, buildQuery } from "@/lib/apiClient";
import AdminActionModal, {
    type AdminModalField,
} from "@/components/admin/AdminActionModal";
import {
    AdminEmptyState,
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminRefreshButton,
    AdminStatCard,
} from "@/components/admin/AdminUi";

const reportReasons = [
    { value: "", label: "All reasons" },
    { value: "scam", label: "Scam or fraud" },
    { value: "fake", label: "Fake or misleading advert" },
    { value: "wrong_price", label: "Wrong or misleading price" },
    { value: "sold", label: "Item already sold" },
    { value: "suspicious_seller", label: "Suspicious seller" },
    { value: "duplicate", label: "Duplicate advert" },
    { value: "offensive", label: "Offensive content" },
    { value: "other", label: "Other issue" },
];

type ReportModal =
    | {
        type: "reject" | "delete";
        id: string | number;
        title: string;
    }
    | null;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    return [];
}

function getReportId(report: any) {
    return report?.id || report?.report_id || report?.pk || "";
}

function getListing(report: any) {
    return report?.listing || report?.advert || report?.item || {};
}

function getListingId(report: any) {
    const listing = getListing(report);
    return listing?.id || report?.listing_id || report?.advert_id || "";
}

function getListingTitle(report: any) {
    const listing = getListing(report);
    return listing?.title || report?.listing_title || report?.advert_title || "Reported listing";
}

function getReporter(report: any) {
    return (
        report?.reporter?.full_name ||
        report?.reporter?.phone ||
        report?.reporter_name ||
        report?.user?.full_name ||
        "QOT user"
    );
}

function isResolved(report: any) {
    return (
        report?.is_resolved === true ||
        report?.resolved === true ||
        String(report?.status || "").toLowerCase() === "resolved"
    );
}

function reasonLabel(reason: string) {
    return reportReasons.find((item) => item.value === reason)?.label || reason || "Not specified";
}

function formatDate(value: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ReportModerationClient() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("pending");
    const [modal, setModal] = useState<ReportModal>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [modalError, setModalError] = useState("");

    async function loadReports(
        values = { search, reason, status },
        preserveSuccess = false
    ) {
        setLoading(true);
        setError("");
        if (!preserveSuccess) setSuccess("");

        try {
            const query = buildQuery({
                search: values.search.trim(),
                reason: values.reason,
                is_resolved:
                    values.status === "pending"
                        ? "false"
                        : values.status === "resolved"
                            ? "true"
                            : undefined,
            });
            const data = await apiGet(`/moderation/reports/${query}`);
            setReports(getArray(data));
        } catch (error: any) {
            setReports([]);
            setError(error.message || "Failed to load reports.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function performAction(
        key: string,
        successMessage: string,
        callback: () => Promise<any>
    ) {
        setActionLoading(key);
        setError("");
        setSuccess("");

        try {
            await callback();
            setSuccess(successMessage);
            await loadReports({ search, reason, status }, true);
        } catch (error: any) {
            setError(error.message || "The moderation action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function resolveReport(id: string | number) {
        return performAction(`resolve-${id}`, "Report resolved successfully.", () =>
            apiPost(`/moderation/reports/${id}/resolve/`)
        );
    }

    function openReportModal(type: "reject" | "delete", report: any) {
        setModal({
            type,
            id: getReportId(report),
            title: getListingTitle(report),
        });
        setModalValues({
            reason:
                type === "reject"
                    ? "Reported listing contains suspicious or misleading content."
                    : "",
        });
        setModalError("");
    }

    async function confirmReportModal() {
        if (!modal) return;

        if (modal.type === "reject" && !modalValues.reason?.trim()) {
            setModalError("Please enter a rejection reason.");
            return;
        }

        const key = `${modal.type}-${modal.id}`;
        setActionLoading(key);
        setModalError("");

        try {
            if (modal.type === "reject") {
                await apiPost(`/moderation/reports/${modal.id}/reject-listing/`, {
                    rejection_reason: modalValues.reason.trim(),
                });
                setSuccess("Listing rejected successfully.");
            } else {
                await apiPost(`/moderation/reports/${modal.id}/delete-listing/`);
                setSuccess("Listing deleted successfully.");
            }

            setModal(null);
            await loadReports({ search, reason, status }, true);
        } catch (error: any) {
            setModalError(error.message || "The moderation action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function resetFilters() {
        const defaults = { search: "", reason: "", status: "pending" };
        setSearch(defaults.search);
        setReason(defaults.reason);
        setStatus(defaults.status);
        loadReports(defaults);
    }

    const pendingCount = reports.filter((report) => !isResolved(report)).length;
    const resolvedCount = reports.filter(isResolved).length;
    const modalFields: AdminModalField[] =
        modal?.type === "reject"
            ? [
                {
                    key: "reason",
                    label: "Rejection reason",
                    type: "textarea",
                    placeholder: "Explain why the advert is being rejected…",
                    required: true,
                },
            ]
            : [];

    return (
        <section>
            <AdminPageHeader
                eyebrow="Trust and safety"
                title="Reports"
                description="Review marketplace complaints, inspect the reported advert, and take a clear moderation action."
                action={<AdminRefreshButton onClick={() => loadReports()} loading={loading} />}
            />

            {!loading && !error && (
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <AdminStatCard label="Loaded reports" value={reports.length.toLocaleString()} detail="Current result set" icon={faFlag} tone="slate" />
                    <AdminStatCard label="Pending" value={pendingCount.toLocaleString()} detail="Needs moderator attention" icon={faTriangleExclamation} tone="orange" />
                    <AdminStatCard label="Resolved" value={resolvedCount.toLocaleString()} detail="Completed cases" icon={faCircleCheck} tone="green" />
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    loadReports();
                }}
                className="mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="relative md:col-span-2">
                        <span className="sr-only">Search reports</span>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search listing, reporter, or description…"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white"
                        />
                    </label>
                    <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        {reportReasons.map((item) => (
                            <option key={item.value || "all"} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="">All statuses</option>
                    </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <button type="submit" className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-600">Apply filters</button>
                    <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-200">
                        <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" /> Reset
                    </button>
                </div>
            </form>

            {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                    {success}
                </div>
            )}

            {loading ? (
                <AdminLoadingState label="Loading reports" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={() => loadReports()} />
            ) : reports.length === 0 ? (
                <AdminEmptyState title="No reports found" description="There are no reports matching the selected moderation filters." />
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => {
                        const id = getReportId(report);
                        const listingId = getListingId(report);
                        const resolved = isResolved(report);

                        return (
                            <article key={id} className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${resolved ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                                                {resolved ? "Resolved" : "Pending"}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
                                                {reasonLabel(report?.reason)}
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                            {getListingTitle(report)}
                                        </h3>
                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                            Reported by {getReporter(report)}
                                            {report?.created_at ? ` · ${formatDate(report.created_at)}` : ""}
                                        </p>

                                        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
                                            {report?.description || report?.comment || report?.message || "No report description provided."}
                                        </p>

                                        {listingId && (
                                            <a href={`/listings/${listingId}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-orange-600 hover:text-orange-700">
                                                Open reported listing
                                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 lg:w-48 lg:grid-cols-1">
                                        {resolved ? (
                                            <div className="col-span-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700">
                                                <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" /> Resolved
                                            </div>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => resolveReport(id)} disabled={actionLoading === `resolve-${id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60">
                                                    <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Resolve
                                                </button>
                                                <button type="button" onClick={() => openReportModal("reject", report)} disabled={actionLoading === `reject-${id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-xs font-black text-orange-700 hover:bg-orange-100 disabled:opacity-60">
                                                    <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" /> Reject advert
                                                </button>
                                                <button type="button" onClick={() => openReportModal("delete", report)} disabled={actionLoading === `delete-${id}`} className="col-span-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-700 hover:bg-red-100 disabled:opacity-60">
                                                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" /> Delete advert
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {modal && (
                <AdminActionModal
                    title={
                        modal.type === "reject"
                            ? "Reject reported listing"
                            : "Delete reported listing?"
                    }
                    description={
                        modal.type === "reject"
                            ? `Add a clear moderation reason before rejecting “${modal.title}”.`
                            : `“${modal.title}” will be removed from QOT. This is a serious moderation action.`
                    }
                    confirmLabel={modal.type === "reject" ? "Reject listing" : "Delete listing"}
                    tone="red"
                    fields={modalFields}
                    values={modalValues}
                    error={modalError}
                    loading={actionLoading === `${modal.type}-${modal.id}`}
                    onChange={(key, value) => {
                        setModalValues((current) => ({ ...current, [key]: value }));
                        setModalError("");
                    }}
                    onConfirm={confirmReportModal}
                    onClose={() => {
                        setModal(null);
                        setModalError("");
                    }}
                />
            )}
        </section>
    );
}
