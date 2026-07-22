"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBan,
    faCalendar,
    faCircleCheck,
    faCreditCard,
    faMagnifyingGlass,
    faMoneyBillTrendUp,
    faReceipt,
    faRotateLeft,
    faTriangleExclamation,
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
    AdminStatCard,
} from "@/components/admin/AdminUi";

type PaymentModal =
    | {
        type: "paid" | "failed" | "cancel";
        payment: any;
    }
    | null;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.payments)) return data.payments;
    return [];
}

function money(paymentOrAmount: any, currency = "UGX") {
    const value =
        typeof paymentOrAmount === "object"
            ? paymentOrAmount?.amount
            : paymentOrAmount;
    const paymentCurrency =
        typeof paymentOrAmount === "object"
            ? paymentOrAmount?.currency || currency
            : currency;

    return `${paymentCurrency} ${Number(value || 0).toLocaleString()}`;
}

function formatLabel(value: string) {
    return String(value || "Unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function statusClass(status: string) {
    if (status === "paid") return "bg-emerald-50 text-emerald-700";
    if (status === "pending") return "bg-orange-50 text-orange-700";
    if (status === "failed") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
}

export default function AdminPaymentsClient() {
    const [payments, setPayments] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [purpose, setPurpose] = useState("");
    const [method, setMethod] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modal, setModal] = useState<PaymentModal>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [modalError, setModalError] = useState("");

    function buildEndpoint() {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (status) params.set("status", status);
        if (purpose) params.set("purpose", purpose);
        if (method) params.set("payment_method", method);
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);

        const query = params.toString();
        return query
            ? `/admin-panel/payments/?${query}`
            : "/admin-panel/payments/";
    }

    async function loadPayments(preserveSuccess = false) {
        setLoading(true);
        setError("");
        if (!preserveSuccess) setSuccess("");

        try {
            const data = await apiGet(buildEndpoint());
            setPayments(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load payments.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openPaymentModal(type: "paid" | "failed" | "cancel", payment: any) {
        setModal({ type, payment });
        setModalValues({
            provider_reference: payment?.provider_reference || "",
            notes: "",
        });
        setModalError("");
    }

    async function confirmPaymentModal() {
        if (!modal) return;

        if (modal.type === "failed" && !modalValues.notes?.trim()) {
            setModalError("Please enter a reason for marking this payment as failed.");
            return;
        }

        const payment = modal.payment;
        const key = `${modal.type}-${payment.id}`;
        setActionLoading(key);
        setModalError("");
        setSuccess("");

        try {
            if (modal.type === "paid") {
                await apiPost(`/admin-panel/payments/${payment.id}/mark-paid/`, {
                    provider_reference: modalValues.provider_reference?.trim() || "",
                    notes: modalValues.notes?.trim() || "",
                });
                setSuccess("Payment marked as paid successfully.");
            } else if (modal.type === "failed") {
                await apiPost(`/admin-panel/payments/${payment.id}/mark-failed/`, {
                    notes: modalValues.notes.trim(),
                });
                setSuccess("Payment marked as failed.");
            } else {
                await apiPost(`/admin-panel/payments/${payment.id}/cancel/`, {
                    notes: modalValues.notes?.trim() || "",
                });
                setSuccess("Payment cancelled successfully.");
            }

            setModal(null);
            await loadPayments(true);
        } catch (error: any) {
            setModalError(error.message || "The payment action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function resetFilters() {
        setSearch("");
        setStatus("");
        setPurpose("");
        setMethod("");
        setDateFrom("");
        setDateTo("");
        window.setTimeout(() => loadPayments(), 0);
    }

    const paid = payments.filter((payment) => payment.status === "paid");
    const pending = payments.filter((payment) => payment.status === "pending");
    const failed = payments.filter((payment) => payment.status === "failed");
    const paidValue = paid.reduce(
        (total, payment) => total + Number(payment?.amount || 0),
        0
    );

    let modalFields: AdminModalField[] = [];

    if (modal?.type === "paid") {
        modalFields = [
            {
                key: "provider_reference",
                label: "Provider reference",
                placeholder: "Transaction or provider reference",
                helper: "Optional, but recommended for reconciliation.",
            },
            {
                key: "notes",
                label: "Admin note",
                type: "textarea",
                placeholder: "Optional reconciliation note…",
            },
        ];
    } else if (modal?.type === "failed") {
        modalFields = [
            {
                key: "notes",
                label: "Failure reason",
                type: "textarea",
                placeholder: "Explain why this payment failed…",
                required: true,
            },
        ];
    } else if (modal?.type === "cancel") {
        modalFields = [
            {
                key: "notes",
                label: "Cancellation note",
                type: "textarea",
                placeholder: "Optional note for this cancellation…",
            },
        ];
    }

    return (
        <section>
            <AdminPageHeader
                eyebrow="Revenue operations"
                title="Payments"
                description="Review payment records, reconcile references, and resolve pending or failed transactions."
                action={<AdminRefreshButton onClick={() => loadPayments()} loading={loading} />}
            />

            {!loading && !error && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard label="Loaded payments" value={payments.length.toLocaleString()} detail="Current result set" icon={faReceipt} tone="slate" />
                    <AdminStatCard label="Paid value" value={money(paidValue)} detail={`${paid.length} successful payments`} icon={faMoneyBillTrendUp} tone="green" />
                    <AdminStatCard label="Pending" value={pending.length.toLocaleString()} detail="Awaiting confirmation" icon={faCreditCard} tone="orange" />
                    <AdminStatCard label="Failed" value={failed.length.toLocaleString()} detail="Needs reconciliation" icon={faTriangleExclamation} tone="red" />
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    loadPayments();
                }}
                className="mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="relative md:col-span-2">
                        <span className="sr-only">Search payments</span>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Reference, customer, phone, ad…" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white" />
                    </label>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={purpose} onChange={(event) => setPurpose(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">All purposes</option>
                        <option value="featured_listing">Featured ad</option>
                        <option value="boost_listing">Boost ad</option>
                        <option value="subscription">Subscription</option>
                    </select>
                    <select value={method} onChange={(event) => setMethod(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">All methods</option>
                        <option value="mtn_mobile_money">MTN Mobile Money</option>
                        <option value="airtel_money">Airtel Money</option>
                        <option value="card">Card</option>
                        <option value="cash">Cash</option>
                        <option value="manual">Manual</option>
                    </select>
                    <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Date from" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400" />
                    <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Date to" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <button type="submit" className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-600">Apply filters</button>
                    <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-200">
                        <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" /> Reset
                    </button>
                </div>
            </form>

            {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">{success}</div>
            )}

            {loading ? (
                <AdminLoadingState label="Loading payments" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={() => loadPayments()} />
            ) : payments.length === 0 ? (
                <AdminEmptyState title="No payments found" description="There are no payment records matching the selected filters." />
            ) : (
                <div className="grid gap-3">
                    {payments.map((payment) => {
                        const pendingPayment = payment.status === "pending";
                        const failedPayment = payment.status === "failed";

                        return (
                            <article key={payment.id} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${statusClass(payment.status)}`}>
                                                {formatLabel(payment.status)}
                                            </span>
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
                                                {formatLabel(payment.purpose)}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight text-slate-950">
                                                    {money(payment)}
                                                </h3>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                    {payment.user_name || payment.user_phone || `User #${payment.user}`}
                                                    {payment.listing_title ? ` · ${payment.listing_title}` : ""}
                                                </p>
                                            </div>
                                            <p className="font-mono text-[11px] font-bold text-slate-400">
                                                {payment.reference}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3 text-slate-300" />
                                                {formatLabel(payment.payment_method)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-slate-300" />
                                                {formatDate(payment.created_at)}
                                            </span>
                                            {payment.provider_reference && (
                                                <span>Provider: {payment.provider_reference}</span>
                                            )}
                                        </div>

                                        {payment.notes && (
                                            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                                                {payment.notes}
                                            </p>
                                        )}
                                    </div>

                                    {(pendingPayment || failedPayment) && (
                                        <div className="grid grid-cols-2 gap-2 lg:w-44 lg:grid-cols-1">
                                            <button type="button" onClick={() => openPaymentModal("paid", payment)} disabled={actionLoading === `paid-${payment.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-black text-white hover:bg-emerald-700 disabled:opacity-60">
                                                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Mark paid
                                            </button>
                                            {pendingPayment && (
                                                <button type="button" onClick={() => openPaymentModal("failed", payment)} disabled={actionLoading === `failed-${payment.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-black text-red-700 hover:bg-red-100 disabled:opacity-60">
                                                    <FontAwesomeIcon icon={faTriangleExclamation} className="h-3 w-3" /> Mark failed
                                                </button>
                                            )}
                                            <button type="button" onClick={() => openPaymentModal("cancel", payment)} disabled={actionLoading === `cancel-${payment.id}`} className="col-span-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-[11px] font-black text-slate-700 hover:bg-slate-200 disabled:opacity-60 lg:col-span-1">
                                                <FontAwesomeIcon icon={faBan} className="h-3 w-3" /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {modal && (
                <AdminActionModal
                    title={
                        modal.type === "paid"
                            ? "Mark payment as paid"
                            : modal.type === "failed"
                                ? "Mark payment as failed"
                                : "Cancel payment?"
                    }
                    description={`${money(modal.payment)} · ${modal.payment.reference}. Review the details before confirming this status change.`}
                    confirmLabel={
                        modal.type === "paid"
                            ? "Mark as paid"
                            : modal.type === "failed"
                                ? "Mark as failed"
                                : "Cancel payment"
                    }
                    tone={modal.type === "paid" ? "green" : "red"}
                    fields={modalFields}
                    values={modalValues}
                    error={modalError}
                    loading={actionLoading === `${modal.type}-${modal.payment.id}`}
                    onChange={(key, value) => {
                        setModalValues((current) => ({ ...current, [key]: value }));
                        setModalError("");
                    }}
                    onConfirm={confirmPaymentModal}
                    onClose={() => {
                        setModal(null);
                        setModalError("");
                    }}
                />
            )}
        </section>
    );
}
