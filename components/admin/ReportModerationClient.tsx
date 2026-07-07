"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, buildQuery } from "@/lib/apiClient";

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

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.reports)) return data.data.reports;

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

    return (
        listing?.id ||
        report?.listing_id ||
        report?.advert_id ||
        report?.item_id ||
        ""
    );
}

function getListingTitle(report: any) {
    const listing = getListing(report);

    return (
        listing?.title ||
        report?.listing_title ||
        report?.advert_title ||
        "Reported listing"
    );
}

function getReporter(report: any) {
    return (
        report?.reporter?.full_name ||
        report?.reporter?.name ||
        report?.reporter?.username ||
        report?.reporter?.phone ||
        report?.reporter_name ||
        report?.user?.full_name ||
        report?.user?.username ||
        "Reporter"
    );
}

function getReasonLabel(reason: string) {
    const found = reportReasons.find((item) => item.value === reason);
    return found?.label || reason || "Not specified";
}

function getStatus(report: any) {
    if (report?.is_resolved === true || report?.resolved === true) {
        return "Resolved";
    }

    if (report?.status) return String(report.status);

    return "Pending";
}

function isResolved(report: any) {
    return (
        report?.is_resolved === true ||
        report?.resolved === true ||
        String(report?.status || "").toLowerCase() === "resolved"
    );
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

    async function loadReports() {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const query = buildQuery({
                search,
                reason,
                is_resolved:
                    status === "pending"
                        ? "false"
                        : status === "resolved"
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
    }, []);

    async function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await loadReports();
    }

    async function resolveReport(reportId: string | number) {
        setActionLoading(`resolve-${reportId}`);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/moderation/reports/${reportId}/resolve/`);
            setSuccess("Report resolved successfully.");
            await loadReports();
        } catch (error: any) {
            setError(error.message || "Failed to resolve report.");
        } finally {
            setActionLoading("");
        }
    }

    async function rejectListing(reportId: string | number) {
        const rejectionReason = window.prompt(
            "Enter reason for rejecting this listing:",
            "Reported listing contains suspicious or misleading content."
        );

        if (!rejectionReason) return;

        setActionLoading(`reject-${reportId}`);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/moderation/reports/${reportId}/reject-listing/`, {
                rejection_reason: rejectionReason,
            });

            setSuccess("Listing rejected successfully.");
            await loadReports();
        } catch (error: any) {
            setError(error.message || "Failed to reject listing.");
        } finally {
            setActionLoading("");
        }
    }

    async function deleteListing(reportId: string | number) {
        const confirmed = window.confirm(
            "Delete the reported listing? This is a serious moderation action."
        );

        if (!confirmed) return;

        setActionLoading(`delete-${reportId}`);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/moderation/reports/${reportId}/delete-listing/`);
            setSuccess("Listing deleted successfully.");
            await loadReports();
        } catch (error: any) {
            setError(error.message || "Failed to delete listing.");
        } finally {
            setActionLoading("");
        }
    }

    const pendingCount = reports.filter((report) => !isResolved(report)).length;
    const resolvedCount = reports.filter((report) => isResolved(report)).length;

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Admin Moderation
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Report Moderation
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Review buyer reports and take action on suspicious adverts.
                    </p>
                </div>

                <a
                    href="/admin"
                    className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                >
                    Admin Dashboard
                </a>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Loaded Reports</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {reports.length.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Pending</p>
                    <p className="mt-2 text-3xl font-black text-orange-600">
                        {pendingCount.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Resolved</p>
                    <p className="mt-2 text-3xl font-black text-green-600">
                        {resolvedCount.toLocaleString()}
                    </p>
                </div>
            </div>

            <form
                onSubmit={applyFilters}
                className="mb-6 rounded-2xl border bg-white p-5 shadow-sm"
            >
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Search
                        </label>

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search listing, reporter, reason..."
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Reason
                        </label>

                        <select
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        >
                            {reportReasons.map((item) => (
                                <option key={item.value || "all"} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="">All</option>
                        </select>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="submit"
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setReason("");
                            setStatus("pending");
                            setTimeout(loadReports, 0);
                        }}
                        className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Reset
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading reports...
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    No reports found.
                </div>
            ) : (
                <div className="grid gap-5">
                    {reports.map((report) => {
                        const reportId = getReportId(report);
                        const listingId = getListingId(report);
                        const resolved = isResolved(report);

                        return (
                            <article
                                key={reportId}
                                className="rounded-2xl border bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={
                                                    resolved
                                                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                                                        : "rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700"
                                                }
                                            >
                                                {getStatus(report)}
                                            </span>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                {getReasonLabel(report?.reason)}
                                            </span>
                                        </div>

                                        <h2 className="mt-4 text-xl font-bold text-slate-900">
                                            {getListingTitle(report)}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Reported by {getReporter(report)}
                                            {report?.created_at
                                                ? ` · ${formatDate(report.created_at)}`
                                                : ""}
                                        </p>

                                        <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">
                                            {report?.description ||
                                                report?.comment ||
                                                report?.message ||
                                                "No report description provided."}
                                        </p>

                                        {listingId && (
                                            <a
                                                href={`/listings/${listingId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                                            >
                                                Open reported listing →
                                            </a>
                                        )}
                                    </div>

                                    <div className="grid gap-2 lg:min-w-56">
                                        {!resolved && reportId && (
                                            <button
                                                type="button"
                                                onClick={() => resolveReport(reportId)}
                                                disabled={actionLoading === `resolve-${reportId}`}
                                                className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                                            >
                                                {actionLoading === `resolve-${reportId}`
                                                    ? "Resolving..."
                                                    : "Resolve Report"}
                                            </button>
                                        )}

                                        {!resolved && reportId && (
                                            <button
                                                type="button"
                                                onClick={() => rejectListing(reportId)}
                                                disabled={actionLoading === `reject-${reportId}`}
                                                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                                            >
                                                {actionLoading === `reject-${reportId}`
                                                    ? "Rejecting..."
                                                    : "Reject Listing"}
                                            </button>
                                        )}

                                        {!resolved && reportId && (
                                            <button
                                                type="button"
                                                onClick={() => deleteListing(reportId)}
                                                disabled={actionLoading === `delete-${reportId}`}
                                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                            >
                                                {actionLoading === `delete-${reportId}`
                                                    ? "Deleting..."
                                                    : "Delete Listing"}
                                            </button>
                                        )}

                                        {resolved && (
                                            <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                                                This report has been resolved.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}