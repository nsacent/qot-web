"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faBan,
    faCalendar,
    faChartLine,
    faCircleCheck,
    faCreditCard,
    faEnvelope,
    faEye,
    faFloppyDisk,
    faHeart,
    faIdBadge,
    faListCheck,
    faPhone,
    faShieldHalved,
    faStar,
    faStore,
    faTriangleExclamation,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";
import AdminActionModal, {
    type AdminModalField,
} from "@/components/admin/AdminActionModal";
import {
    AdminErrorState,
    AdminLoadingState,
    AdminRefreshButton,
    AdminStatCard,
} from "@/components/admin/AdminUi";

type UserPermissions = {
    is_self: boolean;
    can_edit: boolean;
    can_manage_role: boolean;
    can_manage_access: boolean;
};

type UserStats = {
    listings: number;
    favorites: number;
    payments: number;
    paid_spend: string;
    reviews: number;
    average_rating: number | null;
    reports_submitted: number;
    reports_against: number;
};

type RecentListing = {
    id: number;
    title: string;
    status: string;
    price: string;
    currency: string;
    category_name?: string;
    city_name?: string;
    created_at: string;
};

type RecentPayment = {
    id: number;
    reference: string;
    purpose: string;
    amount: string;
    currency: string;
    status: string;
    package_name?: string;
    created_at: string;
};

type AdminUserDetail = {
    id: number;
    phone: string | null;
    email: string | null;
    full_name: string;
    role: "user" | "moderator" | "admin";
    is_active: boolean;
    is_verified: boolean;
    is_banned: boolean;
    banned_reason: string | null;
    is_staff: boolean;
    date_joined: string;
    last_login: string | null;
    updated_at: string;
    business_name: string | null;
    bio: string | null;
    trust_score: number;
    google_connected: boolean;
    listing_counts: Record<string, number>;
    stats: UserStats;
    recent_listings: RecentListing[];
    recent_payments: RecentPayment[];
    permissions: UserPermissions;
};

type EditForm = {
    full_name: string;
    phone: string;
    email: string;
    role: AdminUserDetail["role"];
    is_active: boolean;
    is_verified: boolean;
};

type AccessModal = "ban" | "unban" | null;

function formatDate(value: string | null, includeTime = false) {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return date.toLocaleString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...(includeTime
            ? { hour: "2-digit", minute: "2-digit" }
            : {}),
    });
}

function formatMoney(value: string | number, currency = "UGX") {
    const amount = Number(value || 0);

    return `${currency} ${amount.toLocaleString("en-UG", {
        maximumFractionDigits: 0,
    })}`;
}

function formatLabel(value: string) {
    return String(value || "unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function listingStatusClass(status: string) {
    if (status === "active") return "bg-emerald-50 text-emerald-700";
    if (status === "pending") return "bg-amber-50 text-amber-700";
    if (status === "rejected") return "bg-red-50 text-red-700";
    if (status === "sold") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-700";
}

function paymentStatusClass(status: string) {
    if (status === "paid") return "bg-emerald-50 text-emerald-700";
    if (status === "pending") return "bg-amber-50 text-amber-700";
    if (status === "failed") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
}

function getErrorMessage(error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed.";

    try {
        const parsed = JSON.parse(message) as Record<string, unknown>;
        const firstValue = Object.values(parsed)[0];

        if (Array.isArray(firstValue) && firstValue[0]) {
            return String(firstValue[0]);
        }

        if (typeof firstValue === "string") return firstValue;
    } catch {
        // The API already returned a readable message.
    }

    return message;
}

function formFromUser(user: AdminUserDetail): EditForm {
    return {
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
        role: user.role || "user",
        is_active: user.is_active,
        is_verified: user.is_verified,
    };
}

export default function AdminUserDetailClient({ userId }: { userId: string }) {
    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [form, setForm] = useState<EditForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [accessModal, setAccessModal] = useState<AccessModal>(null);
    const [accessValues, setAccessValues] = useState<Record<string, string>>({});
    const [accessError, setAccessError] = useState("");
    const [accessLoading, setAccessLoading] = useState(false);

    const loadUser = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet<AdminUserDetail>(
                `/admin-panel/users/${userId}/`
            );
            setUser(data);
            setForm(formFromUser(data));
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        // The request owns the initial loading state and resolves asynchronously.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadUser();
    }, [loadUser]);

    async function saveUser(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form || !user?.permissions.can_edit) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await apiPatch<{
                message: string;
                user: AdminUserDetail;
            }>(`/admin-panel/users/${userId}/`, {
                ...form,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                full_name: form.full_name.trim(),
            });

            setUser(response.user);
            setForm(formFromUser(response.user));
            setMessage(response.message || "User account updated successfully.");
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    function openAccessModal(type: Exclude<AccessModal, null>) {
        setAccessModal(type);
        setAccessValues({ reason: "" });
        setAccessError("");
    }

    async function confirmAccessModal() {
        if (!user || !accessModal) return;

        if (accessModal === "ban" && !accessValues.reason?.trim()) {
            setAccessError("Please provide a clear reason for restricting this account.");
            return;
        }

        setAccessLoading(true);
        setAccessError("");
        setMessage("");

        try {
            if (accessModal === "ban") {
                await apiPost(`/admin-panel/users/${user.id}/ban/`, {
                    banned_reason: accessValues.reason.trim(),
                });
            } else {
                await apiPost(`/admin-panel/users/${user.id}/unban/`);
            }

            setAccessModal(null);
            setMessage(
                accessModal === "ban"
                    ? "Account access has been restricted."
                    : "Account access has been restored."
            );
            await loadUser();
        } catch (error: unknown) {
            setAccessError(getErrorMessage(error));
        } finally {
            setAccessLoading(false);
        }
    }

    if (loading) return <AdminLoadingState label="Loading user account" />;

    if (!user || !form) {
        return <AdminErrorState message={error || "User not found."} onRetry={loadUser} />;
    }

    const initials = user.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "Q";
    const roleName = formatLabel(user.role);
    const accountHealthy = user.is_active && !user.is_banned;
    const accessFields: AdminModalField[] =
        accessModal === "ban"
            ? [
                {
                    key: "reason",
                    label: "Restriction reason",
                    type: "textarea",
                    placeholder: "Explain the policy or safety issue…",
                    helper: "This note stays on the account until access is restored.",
                    required: true,
                },
            ]
            : [];

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-orange-600"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                    Back to users
                </Link>
                <AdminRefreshButton onClick={loadUser} loading={loading} />
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:px-8 sm:py-9">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-5">
                        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-black shadow-xl shadow-orange-950/30">
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                                    {roleName}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${user.is_verified ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>
                                    {user.is_verified ? "Verified" : "Unverified"}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${accountHealthy ? "bg-blue-400/15 text-blue-300" : "bg-red-400/15 text-red-300"}`}>
                                    {user.is_banned ? "Banned" : user.is_active ? "Active" : "Deactivated"}
                                </span>
                            </div>
                            <h1 className="mt-3 truncate text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                                {user.full_name}
                            </h1>
                            <p className="mt-2 text-sm font-semibold text-slate-400">
                                User #{user.id} · Joined {formatDate(user.date_joined)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/sellers/${user.id}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-slate-950 hover:bg-orange-50"
                        >
                            <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                            Public profile
                        </Link>
                        {user.permissions.can_manage_access && !user.permissions.is_self && (
                            <button
                                type="button"
                                onClick={() => openAccessModal(user.is_banned ? "unban" : "ban")}
                                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black ${user.is_banned ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500/15 text-red-200 ring-1 ring-red-400/30 hover:bg-red-500/25"}`}
                            >
                                <FontAwesomeIcon icon={user.is_banned ? faCircleCheck : faBan} className="h-3 w-3" />
                                {user.is_banned ? "Restore access" : "Ban account"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {(message || error) && (
                <div className={`mt-5 rounded-2xl px-5 py-4 text-sm font-bold ${error ? "border border-red-200 bg-red-50 text-red-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {error || message}
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Trust score" value={`${user.trust_score}/100`} detail={user.is_verified ? "Verified marketplace identity" : "Verification can improve trust"} icon={faChartLine} tone="orange" />
                <AdminStatCard label="Listings" value={user.stats.listings.toLocaleString()} detail={`${user.listing_counts.active || 0} currently active`} icon={faStore} tone="blue" />
                <AdminStatCard label="Paid activity" value={formatMoney(user.stats.paid_spend)} detail={`${user.stats.payments} payment records`} icon={faCreditCard} tone="green" />
                <AdminStatCard label="Seller reviews" value={user.stats.average_rating ? Number(user.stats.average_rating).toFixed(1) : "—"} detail={`${user.stats.reviews} published reviews`} icon={faStar} tone="violet" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <form onSubmit={saveUser} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Identity and permissions</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Edit account</h2>
                            <p className="mt-1 text-sm font-medium text-slate-500">Update login details, role, verification, and account availability.</p>
                        </div>
                        {!user.permissions.can_edit && (
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">Read only</span>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-black text-slate-700">Full name</span>
                            <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} disabled={!user.permissions.can_edit || saving} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
                        </label>
                        <label>
                            <span className="mb-2 block text-xs font-black text-slate-700">Phone number</span>
                            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} disabled={!user.permissions.can_edit || saving} placeholder="+256…" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
                        </label>
                        <label>
                            <span className="mb-2 block text-xs font-black text-slate-700">Email address</span>
                            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} disabled={!user.permissions.can_edit || saving} placeholder="name@example.com" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
                        </label>
                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-black text-slate-700">Account role</span>
                            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as EditForm["role"] })} disabled={!user.permissions.can_manage_role || user.permissions.is_self || saving} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
                                <option value="user">Marketplace user</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Administrator</option>
                            </select>
                            {user.permissions.is_self && <span className="mt-2 block text-[11px] font-semibold text-slate-400">Your own administrator role is protected from accidental changes.</span>}
                        </label>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <input type="checkbox" checked={form.is_verified} onChange={(event) => setForm({ ...form, is_verified: event.target.checked })} disabled={!user.permissions.can_edit || saving} className="mt-0.5 h-4 w-4 accent-orange-500" />
                            <span>
                                <span className="block text-xs font-black text-slate-800">Verified account</span>
                                <span className="mt-1 block text-[11px] font-medium leading-4 text-slate-500">Confirms this user has passed QOT identity verification.</span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} disabled={!user.permissions.can_edit || user.permissions.is_self || saving} className="mt-0.5 h-4 w-4 accent-orange-500" />
                            <span>
                                <span className="block text-xs font-black text-slate-800">Active login</span>
                                <span className="mt-1 block text-[11px] font-medium leading-4 text-slate-500">Inactive accounts cannot authenticate, even if they are not banned.</span>
                            </span>
                        </label>
                    </div>

                    {user.permissions.can_edit ? (
                        <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:opacity-60 sm:w-auto">
                            <FontAwesomeIcon icon={faFloppyDisk} className="h-4 w-4" />
                            {saving ? "Saving changes…" : "Save account changes"}
                        </button>
                    ) : (
                        <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-700">Moderators can inspect user records and manage ordinary-account restrictions. Only administrators can edit identity, verification, activation, and roles.</p>
                    )}
                </form>

                <div className="grid content-start gap-5">
                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account record</p>
                        <h2 className="mt-2 text-xl font-black text-slate-950">Profile details</h2>
                        <div className="mt-5 grid gap-4 text-sm">
                            <DetailRow icon={faPhone} label="Phone" value={user.phone || "Not provided"} />
                            <DetailRow icon={faEnvelope} label="Email" value={user.email || "Not provided"} />
                            <DetailRow icon={faIdBadge} label="Google sign-in" value={user.google_connected ? "Connected" : "Not connected"} />
                            <DetailRow icon={faCalendar} label="Last login" value={formatDate(user.last_login, true)} />
                            <DetailRow icon={faUser} label="Business" value={user.business_name || "Personal account"} />
                        </div>
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Safety signals</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <MiniMetric icon={faHeart} label="Saved ads" value={user.stats.favorites} />
                            <MiniMetric icon={faTriangleExclamation} label="Reports made" value={user.stats.reports_submitted} />
                            <MiniMetric icon={faShieldHalved} label="Reports received" value={user.stats.reports_against} />
                            <MiniMetric icon={faListCheck} label="Rejected ads" value={user.listing_counts.rejected || 0} />
                        </div>
                        {user.banned_reason && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-5 text-red-700">
                                <span className="font-black">Restriction reason:</span>{" "}
                                {user.banned_reason}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Marketplace activity</p>
                            <h2 className="mt-2 text-xl font-black text-slate-950">Recent listings</h2>
                        </div>
                        <Link href="/admin/listings" className="text-xs font-black text-orange-600 hover:text-orange-700">All listings</Link>
                    </div>
                    <div className="mt-5 grid gap-3">
                        {user.recent_listings.length ? user.recent_listings.map((listing) => (
                            <Link key={listing.id} href={`/listings/${listing.id}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-orange-50">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${listingStatusClass(listing.status)}`}>{formatLabel(listing.status)}</span>
                                        <span className="text-[10px] font-bold text-slate-400">#{listing.id}</span>
                                    </div>
                                    <p className="mt-2 truncate text-sm font-black text-slate-900">{listing.title}</p>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{listing.category_name || "Uncategorised"} · {formatDate(listing.created_at)}</p>
                                </div>
                                <span className="shrink-0 text-xs font-black text-slate-900">{formatMoney(listing.price, listing.currency)}</span>
                            </Link>
                        )) : <EmptyPanel label="This user has not posted any listings." />}
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Billing history</p>
                            <h2 className="mt-2 text-xl font-black text-slate-950">Recent payments</h2>
                        </div>
                        <Link href="/admin/payments" className="text-xs font-black text-orange-600 hover:text-orange-700">All payments</Link>
                    </div>
                    <div className="mt-5 grid gap-3">
                        {user.recent_payments.length ? user.recent_payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${paymentStatusClass(payment.status)}`}>{formatLabel(payment.status)}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{payment.reference}</span>
                                    </div>
                                    <p className="mt-2 truncate text-sm font-black text-slate-900">{payment.package_name || formatLabel(payment.purpose)}</p>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{formatDate(payment.created_at)}</p>
                                </div>
                                <span className="shrink-0 text-xs font-black text-slate-900">{formatMoney(payment.amount, payment.currency)}</span>
                            </div>
                        )) : <EmptyPanel label="This user has no payment records." />}
                    </div>
                </section>
            </div>

            {accessModal && (
                <AdminActionModal
                    title={accessModal === "ban" ? "Restrict this account?" : "Restore account access?"}
                    description={accessModal === "ban" ? `${user.full_name} will lose access to protected QOT features until an administrator restores the account.` : `${user.full_name} will regain access to protected QOT features immediately.`}
                    confirmLabel={accessModal === "ban" ? "Ban account" : "Restore access"}
                    tone={accessModal === "ban" ? "red" : "green"}
                    fields={accessFields}
                    values={accessValues}
                    error={accessError}
                    loading={accessLoading}
                    onChange={(key, value) => {
                        setAccessValues((current) => ({ ...current, [key]: value }));
                        setAccessError("");
                    }}
                    onConfirm={confirmAccessModal}
                    onClose={() => {
                        setAccessModal(null);
                        setAccessError("");
                    }}
                />
            )}
        </section>
    );
}

function DetailRow({ icon, label, value }: { icon: typeof faUser; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 break-words text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function MiniMetric({ icon, label, value }: { icon: typeof faUser; label: string; value: number }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-slate-400" />
            <p className="mt-3 text-xl font-black text-slate-950">{value.toLocaleString()}</p>
            <p className="mt-1 text-[10px] font-bold text-slate-500">{label}</p>
        </div>
    );
}

function EmptyPanel({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs font-semibold text-slate-400">
            {label}
        </div>
    );
}
