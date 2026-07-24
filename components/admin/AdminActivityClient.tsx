"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faFingerprint,
    faMagnifyingGlass,
    faShieldHalved,
    faTriangleExclamation,
    faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, buildQuery } from "@/lib/apiClient";
import {
    AdminEmptyState,
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminRefreshButton,
    AdminStatCard,
} from "@/components/admin/AdminUi";

type ActivityRecord = {
    id: number;
    actor: number | null;
    actor_name: string;
    actor_email: string;
    actor_role: string;
    action: string;
    description: string;
    method: string;
    path: string;
    target_type: string;
    target_id: string;
    status_code: number;
    successful: boolean;
    ip_address?: string | null;
    payload?: Record<string, unknown>;
    created_at: string;
};

type ActivitySummary = {
    total: number;
    successful: number;
    failed: number;
    administrators: number;
    moderators: number;
};

type ActivityResponse = {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: ActivityRecord[];
    summary?: ActivitySummary;
};

type ActivityFilters = {
    search: string;
    role: string;
    result: string;
    date_from: string;
    date_to: string;
};

const emptyFilters: ActivityFilters = {
    search: "",
    role: "",
    result: "",
    date_from: "",
    date_to: "",
};

const emptySummary: ActivitySummary = {
    total: 0,
    successful: 0,
    failed: 0,
    administrators: 0,
    moderators: 0,
};

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown time";

    return new Intl.DateTimeFormat("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function initials(name: string) {
    return (name || "QOT Staff")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "QS";
}

function changedFields(payload?: Record<string, unknown>) {
    if (!payload) return [];
    return Object.keys(payload).filter((key) => !key.startsWith("_"));
}

export default function AdminActivityClient() {
    const [records, setRecords] = useState<ActivityRecord[]>([]);
    const [summary, setSummary] = useState<ActivitySummary>(emptySummary);
    const [filters, setFilters] = useState<ActivityFilters>(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState<ActivityFilters>(emptyFilters);
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(false);
    const [previousPage, setPreviousPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadActivity = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet<ActivityResponse>(
                `/admin-panel/activity/${buildQuery({
                    ...appliedFilters,
                    page,
                    page_size: 20,
                })}`
            );
            setRecords(Array.isArray(data?.results) ? data.results : []);
            setSummary(data?.summary || emptySummary);
            setNextPage(Boolean(data?.next));
            setPreviousPage(Boolean(data?.previous));
        } catch (requestError: unknown) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Failed to load the system trace."
            );
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, page]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            void loadActivity();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [loadActivity]);

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setAppliedFilters({ ...filters });
    }

    function clearFilters() {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    }

    return (
        <section>
            <AdminPageHeader
                eyebrow="Security and accountability"
                title="System trace"
                description="See every state-changing task performed by QOT administrators and moderators, including unsuccessful attempts. Sensitive credentials are automatically removed from the record."
                action={<AdminRefreshButton onClick={() => void loadActivity()} loading={loading} />}
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Matching events" value={summary.total.toLocaleString()} detail="Current filter range" icon={faFingerprint} tone="slate" />
                <AdminStatCard label="Successful" value={summary.successful.toLocaleString()} detail="Completed staff actions" icon={faCircleCheck} tone="green" />
                <AdminStatCard label="Failed attempts" value={summary.failed.toLocaleString()} detail="Rejected or unsuccessful" icon={faTriangleExclamation} tone="red" />
                <AdminStatCard label="Staff activity" value={(summary.administrators + summary.moderators).toLocaleString()} detail={`${summary.administrators} admin · ${summary.moderators} moderator`} icon={faUserShield} tone="violet" />
            </div>

            <form
                onSubmit={applyFilters}
                className="mt-6 rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_180px_170px_170px_auto]">
                    <label className="relative">
                        <span className="sr-only">Search system trace</span>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                            placeholder="Staff, action, target…"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:bg-white"
                        />
                    </label>

                    <label>
                        <span className="sr-only">Staff role</span>
                        <select
                            value={filters.role}
                            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
                        >
                            <option value="">All staff roles</option>
                            <option value="admin">Administrators</option>
                            <option value="moderator">Moderators</option>
                        </select>
                    </label>

                    <label>
                        <span className="sr-only">Action result</span>
                        <select
                            value={filters.result}
                            onChange={(event) => setFilters((current) => ({ ...current, result: event.target.value }))}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
                        >
                            <option value="">All results</option>
                            <option value="success">Successful</option>
                            <option value="failed">Failed attempts</option>
                        </select>
                    </label>

                    <label>
                        <span className="sr-only">From date</span>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
                        />
                    </label>

                    <label>
                        <span className="sr-only">To date</span>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
                        />
                    </label>

                    <button type="submit" className="h-12 rounded-2xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-orange-500">
                        Apply filters
                    </button>
                </div>

                {Object.values(appliedFilters).some(Boolean) && (
                    <button type="button" onClick={clearFilters} className="mt-3 text-xs font-black text-orange-600 hover:text-orange-700">
                        Clear all filters
                    </button>
                )}
            </form>

            <div className="mt-6">
                {loading && records.length === 0 ? (
                    <AdminLoadingState label="Loading system trace" />
                ) : error ? (
                    <AdminErrorState message={error} onRetry={() => void loadActivity()} />
                ) : records.length === 0 ? (
                    <AdminEmptyState title="No staff activity found" description="No admin or moderator changes match the selected filters." />
                ) : (
                    <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/70">
                        <div className="divide-y divide-slate-100">
                            {records.map((record) => {
                                const fields = changedFields(record.payload);

                                return (
                                    <article key={record.id} className="p-4 transition hover:bg-slate-50/80 sm:p-5">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${record.successful ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                                {initials(record.actor_name)}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm font-black text-slate-950">{record.description}</h3>
                                                            <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${record.successful ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                                                {record.successful ? "Completed" : `Failed ${record.status_code}`}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                                            <span className="font-black text-slate-700">{record.actor_name || "Unknown staff member"}</span>
                                                            {record.actor_role && <> · {record.actor_role}</>}
                                                            {record.actor_email && <> · {record.actor_email}</>}
                                                        </p>
                                                    </div>

                                                    <time className="shrink-0 text-[10px] font-bold text-slate-400" dateTime={record.created_at}>
                                                        {formatDate(record.created_at)}
                                                    </time>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wide">
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-600">{record.method}</span>
                                                    <span className="rounded-full bg-orange-50 px-2.5 py-1.5 text-orange-700">{record.action.replaceAll("_", " ")}</span>
                                                    {record.ip_address && <span className="rounded-full bg-blue-50 px-2.5 py-1.5 text-blue-700">IP {record.ip_address}</span>}
                                                    {fields.length > 0 && <span className="rounded-full bg-violet-50 px-2.5 py-1.5 text-violet-700">Fields: {fields.join(", ")}</span>}
                                                </div>

                                                <p className="mt-3 break-all font-mono text-[10px] font-semibold leading-4 text-slate-400">
                                                    {record.path}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
                            <p className="text-xs font-bold text-slate-500">Page {page}</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!previousPage || loading}
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={!nextPage || loading}
                                    onClick={() => setPage((current) => current + 1)}
                                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50 p-4 text-blue-900">
                <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs font-semibold leading-5">
                    Audit records are generated by the server and cannot be created or edited from this screen. Passwords, access tokens, API keys, OTPs, and other credentials are redacted before storage.
                </p>
            </div>
        </section>
    );
}
