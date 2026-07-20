"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBan,
    faCalendar,
    faCircleCheck,
    faEnvelope,
    faMagnifyingGlass,
    faPhone,
    faRotateLeft,
    faShieldHalved,
    faUserCheck,
    faUsers,
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

const USERS_ENDPOINT = "/admin-panel/users/";

type UserModal =
    | {
        type: "ban" | "unban";
        id: string | number;
        name: string;
    }
    | null;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.users)) return data.users;
    return [];
}

function getUserName(user: any) {
    return user?.full_name || user?.name || user?.phone || user?.email || "QOT user";
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

function roleClass(role: string) {
    const value = String(role || "user").toLowerCase();
    if (value === "admin") return "bg-violet-50 text-violet-700";
    if (value === "moderator") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-700";
}

export default function AdminUsersClient() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [isBanned, setIsBanned] = useState("");
    const [isVerified, setIsVerified] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [modal, setModal] = useState<UserModal>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [modalError, setModalError] = useState("");

    function buildEndpoint() {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (role) params.set("role", role);
        if (isBanned) params.set("is_banned", isBanned);
        if (isVerified) params.set("is_verified", isVerified);

        const query = params.toString();
        return query ? `${USERS_ENDPOINT}?${query}` : USERS_ENDPOINT;
    }

    async function loadUsers() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(buildEndpoint());
            setUsers(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openUserModal(type: "ban" | "unban", user: any) {
        setModal({
            type,
            id: user.id,
            name: getUserName(user),
        });
        setModalValues({ reason: "" });
        setModalError("");
    }

    async function confirmUserModal() {
        if (!modal) return;

        if (modal.type === "ban" && !modalValues.reason?.trim()) {
            setModalError("Please enter a reason for restricting this account.");
            return;
        }

        const key = `${modal.type}-${modal.id}`;
        setActionLoading(key);
        setModalError("");

        try {
            if (modal.type === "ban") {
                await apiPost(`/admin-panel/users/${modal.id}/ban/`, {
                    banned_reason: modalValues.reason.trim(),
                });
            } else {
                await apiPost(`/admin-panel/users/${modal.id}/unban/`);
            }

            setModal(null);
            await loadUsers();
        } catch (error: any) {
            setModalError(error.message || "The account action failed.");
        } finally {
            setActionLoading("");
        }
    }

    function resetFilters() {
        setSearch("");
        setRole("");
        setIsBanned("");
        setIsVerified("");
        window.setTimeout(loadUsers, 0);
    }

    const verifiedCount = users.filter((user) => user?.is_verified).length;
    const bannedCount = users.filter((user) => user?.is_banned).length;
    const staffCount = users.filter((user) =>
        ["admin", "moderator"].includes(String(user?.role || "").toLowerCase())
    ).length;

    const modalFields: AdminModalField[] =
        modal?.type === "ban"
            ? [
                {
                    key: "reason",
                    label: "Restriction reason",
                    type: "textarea",
                    placeholder: "Explain why this account is being restricted…",
                    helper: "This note is stored with the account for future review.",
                    required: true,
                },
            ]
            : [];

    return (
        <section>
            <AdminPageHeader
                eyebrow="Account administration"
                title="Users"
                description="Search registered accounts, review trust signals, and control access with clear account status information."
                action={<AdminRefreshButton onClick={loadUsers} loading={loading} />}
            />

            {!loading && !error && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard label="Loaded users" value={users.length.toLocaleString()} detail="Current result set" icon={faUsers} tone="blue" />
                    <AdminStatCard label="Verified" value={verifiedCount.toLocaleString()} detail="Trusted accounts" icon={faUserCheck} tone="green" />
                    <AdminStatCard label="Banned" value={bannedCount.toLocaleString()} detail="Access restricted" icon={faBan} tone="red" />
                    <AdminStatCard label="Staff" value={staffCount.toLocaleString()} detail="Admins and moderators" icon={faShieldHalved} tone="violet" />
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    loadUsers();
                }}
                className="mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <label className="relative md:col-span-2">
                        <span className="sr-only">Search users</span>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, phone, or email…"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400 focus:bg-white"
                        />
                    </label>
                    <select value={role} onChange={(event) => setRole(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">All roles</option>
                        <option value="user">Users</option>
                        <option value="moderator">Moderators</option>
                        <option value="admin">Administrators</option>
                    </select>
                    <select value={isVerified} onChange={(event) => setIsVerified(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">Any verification</option>
                        <option value="true">Verified</option>
                        <option value="false">Not verified</option>
                    </select>
                    <select value={isBanned} onChange={(event) => setIsBanned(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400">
                        <option value="">Any access status</option>
                        <option value="false">Active</option>
                        <option value="true">Banned</option>
                    </select>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button type="submit" className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-600">
                        Apply filters
                    </button>
                    <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-200">
                        <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
                        Reset
                    </button>
                </div>
            </form>

            {loading ? (
                <AdminLoadingState label="Loading users" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={loadUsers} />
            ) : users.length === 0 ? (
                <AdminEmptyState title="No users found" description="Try a broader search or clear the selected status filters." />
            ) : (
                <div className="grid gap-3">
                    {users.map((user) => {
                        const name = getUserName(user);
                        const banned = Boolean(user?.is_banned);
                        const verified = Boolean(user?.is_verified);
                        const roleName = String(user?.role || "user");

                        return (
                            <article key={user.id} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                    <div className="flex min-w-0 flex-1 items-start gap-4">
                                        <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-base font-black text-white">
                                            {name.charAt(0).toUpperCase()}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${roleClass(roleName)}`}>
                                                    {roleName}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${verified ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                                                    {verified ? "Verified" : "Unverified"}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${banned ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                                                    {banned ? "Banned" : "Active"}
                                                </span>
                                            </div>

                                            <h3 className="mt-2 truncate text-lg font-black tracking-tight text-slate-950">
                                                {name}
                                            </h3>

                                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                                                {user.phone && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-slate-300" />
                                                        {user.phone}
                                                    </span>
                                                )}
                                                {user.email && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-slate-300" />
                                                        {user.email}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-slate-300" />
                                                    Joined {formatDate(user.date_joined)}
                                                </span>
                                                <span className="font-bold text-slate-400">ID #{user.id}</span>
                                            </div>

                                            {user.banned_reason && (
                                                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                                                    <span className="font-black">Reason:</span> {user.banned_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:w-40">
                                        {banned ? (
                                            <button
                                                type="button"
                                                onClick={() => openUserModal("unban", user)}
                                                disabled={actionLoading === `unban-${user.id}`}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                                                {actionLoading === `unban-${user.id}` ? "Restoring…" : "Restore access"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openUserModal("ban", user)}
                                                disabled={actionLoading === `ban-${user.id}`}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-700 hover:bg-red-100 disabled:opacity-60"
                                            >
                                                <FontAwesomeIcon icon={faBan} className="h-3 w-3" />
                                                {actionLoading === `ban-${user.id}` ? "Restricting…" : "Ban user"}
                                            </button>
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
                        modal.type === "ban"
                            ? "Restrict this account?"
                            : "Restore account access?"
                    }
                    description={
                        modal.type === "ban"
                            ? `${modal.name} will no longer be able to use protected QOT features until an administrator restores access.`
                            : `${modal.name} will regain access to their QOT account immediately.`
                    }
                    confirmLabel={modal.type === "ban" ? "Ban user" : "Restore access"}
                    tone={modal.type === "ban" ? "red" : "green"}
                    fields={modalFields}
                    values={modalValues}
                    error={modalError}
                    loading={actionLoading === `${modal.type}-${modal.id}`}
                    onChange={(key, value) => {
                        setModalValues((current) => ({ ...current, [key]: value }));
                        setModalError("");
                    }}
                    onConfirm={confirmUserModal}
                    onClose={() => {
                        setModal(null);
                        setModalError("");
                    }}
                />
            )}
        </section>
    );
}
