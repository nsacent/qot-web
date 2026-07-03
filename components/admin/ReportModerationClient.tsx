"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const REPORTS_LIST_ENDPOINT = "/moderation/reports/";

const resolveReportEndpoint = (reportId: number | string) =>
    `/moderation/reports/${reportId}/resolve/`;

const rejectListingEndpoint = (reportId: number | string) =>
    `/moderation/reports/${reportId}/reject-listing/`;

const deleteListingEndpoint = (reportId: number | string) =>
    `/moderation/reports/${reportId}/delete-listing/`;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;
    return [];
}

function getListing(report: any) {
    return report?.listing || report?.advert || {};
}

function getListingId(report: any) {
    const listing = getListing(report);

    return listing?.id || report?.listing_id || report?.advert_id;
}

function getListingTitle(report: any) {
    const listing = getListing(report);

    return (
        listing?.title ||
        report?.listing_title ||
        report?.advert_title ||
        "Untitled listing"
    );
}

function getReporter(report: any) {
    const reporter = report?.reporter || report?.user || report?.reported_by;

    return (
        reporter?.full_name ||
        reporter?.name ||
        reporter?.username ||
        reporter?.phone ||
        report?.reporter_name ||
        "Reporter"
    );
}

function formatDate(dateValue: string) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

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
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [reason, setReason] = useState("");
    const [isResolved, setIsResolved] = useState("false");

    async function apiRequest(path: string, options: RequestInit = {}) {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            throw new Error("Login required.");
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.detail ||
                data?.message ||
                data?.error ||
                JSON.stringify(data) ||
                "Request failed."
            );
        }

        return data;
    }

    function buildReportsEndpoint() {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (reason) params.set("reason", reason);

        if (isResolved !== "all") {
            params.set("is_resolved", isResolved);
        }

        const query = params.toString();

        return query ? `${REPORTS_LIST_ENDPOINT}?${query}` : REPORTS_LIST_ENDPOINT;
    }

    async function loadReports() {
        setLoading(true);
        setError("");

        try {
            const data = await apiRequest(buildReportsEndpoint());
            setReports(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load reports.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function resolveReport(reportId: number | string) {
        setActionLoading(`resolve-${reportId}`);

        try {
            await apiRequest(resolveReportEndpoint(reportId), {
                method: "POST",
            });

            await loadReports();
        } catch (error: any) {
            alert(error.message || "Failed to resolve report.");
        } finally {
            setActionLoading(null);
        }
    }

    async function rejectListing(reportId: number | string) {
        const rejectionReason = window.prompt(
            "Enter the reason for rejecting this listing:"
        );

        if (!rejectionReason) return;

        setActionLoading(`reject-${reportId}`);

        try {
            await apiRequest(rejectListingEndpoint(reportId), {
                method: "POST",
                body: JSON.stringify({
                    rejection_reason: rejectionReason,
                }),
            });

            await loadReports();
        } catch (error: any) {
            alert(error.message || "Failed to reject listing.");
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteListing(reportId: number | string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this reported listing? This action may be permanent."
        );

        if (!confirmed) return;

        setActionLoading(`delete-${reportId}`);

        try {
            await apiRequest(deleteListingEndpoint(reportId), {
                method: "POST",
            });

            await loadReports();
        } catch (error: any) {
            alert(error.message || "Failed to delete listing.");
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-4">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search e.g. Toyota"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500 md:col-span-2"
                    />

                    <select
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">All reasons</option>
                        <option value="scam">Scam</option>
                        <option value="fraud">Fraud</option>
                        <option value="fake_item">Fake item</option>
                        <option value="wrong_category">Wrong category</option>
                        <option value="offensive">Offensive content</option>
                        <option value="duplicate">Duplicate advert</option>
                        <option value="sold_unavailable">Sold or unavailable</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        value={isResolved}
                        onChange={(event) => setIsResolved(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="false">Unresolved</option>
                        <option value="true">Resolved</option>
                        <option value="all">All reports</option>
                    </select>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadReports}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setReason("");
                            setIsResolved("false");
                            setTimeout(loadReports, 0);
                        }}
                        className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading reported adverts...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Reports Queue
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {reports.length} report{reports.length === 1 ? "" : "s"} found.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadReports}
                            className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {reports.length === 0 ? (
                        <div className="rounded-2xl border bg-white p-8 text-slate-600">
                            No reports found.
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {reports.map((report: any) => {
                                const listingId = getListingId(report);
                                const listing = getListing(report);

                                const resolved =
                                    report?.is_resolved ||
                                    report?.is_reviewed ||
                                    report?.status === "resolved" ||
                                    report?.status === "reviewed";

                                return (
                                    <article
                                        key={report.id}
                                        className="rounded-2xl border bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-col justify-between gap-5 lg:flex-row">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={
                                                            resolved
                                                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                                                                : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                                                        }
                                                    >
                                                        {resolved ? "Resolved" : "Unresolved"}
                                                    </span>

                                                    {report.reason && (
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                                                            {String(report.reason).replaceAll("_", " ")}
                                                        </span>
                                                    )}

                                                    {listing?.status && (
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700">
                                                            Listing: {listing.status}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                                    {getListingTitle(report)}
                                                </h3>

                                                <div className="mt-2 grid gap-1 text-sm text-slate-600">
                                                    <p>
                                                        <span className="font-semibold">Reported by:</span>{" "}
                                                        {getReporter(report)}
                                                    </p>

                                                    {report.created_at && (
                                                        <p>
                                                            <span className="font-semibold">Date:</span>{" "}
                                                            {formatDate(report.created_at)}
                                                        </p>
                                                    )}

                                                    {listingId && (
                                                        <p>
                                                            <span className="font-semibold">Listing ID:</span>{" "}
                                                            {listingId}
                                                        </p>
                                                    )}
                                                </div>

                                                {report.details && (
                                                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                                                        {report.details}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex w-full flex-col gap-3 lg:w-60">
                                                {listingId && (
                                                    <a
                                                        href={`/listings/${listingId}`}
                                                        className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                                                    >
                                                        Open Advert
                                                    </a>
                                                )}

                                                {!resolved && (
                                                    <button
                                                        type="button"
                                                        onClick={() => resolveReport(report.id)}
                                                        disabled={actionLoading === `resolve-${report.id}`}
                                                        className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `resolve-${report.id}`
                                                            ? "Resolving..."
                                                            : "Resolve Report"}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => rejectListing(report.id)}
                                                    disabled={actionLoading === `reject-${report.id}`}
                                                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                                                >
                                                    {actionLoading === `reject-${report.id}`
                                                        ? "Rejecting..."
                                                        : "Reject Listing"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteListing(report.id)}
                                                    disabled={actionLoading === `delete-${report.id}`}
                                                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                                >
                                                    {actionLoading === `delete-${report.id}`
                                                        ? "Deleting..."
                                                        : "Delete Listing"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}