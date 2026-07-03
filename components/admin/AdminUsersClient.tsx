"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const USERS_ENDPOINT = "/admin-panel/users/";

const banUserEndpoint = (userId: number | string) =>
    `/admin-panel/users/${userId}/ban/`;

const unbanUserEndpoint = (userId: number | string) =>
    `/admin-panel/users/${userId}/unban/`;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.users)) return data.users;
    return [];
}

function getUserName(user: any) {
    return (
        user.full_name ||
        user.name ||
        user.username ||
        user.phone ||
        user.email ||
        "User"
    );
}

function getUserContact(user: any) {
    return user.email || user.phone || "No contact";
}

function getUserRole(user: any) {
    return user.role || user.user_type || "user";
}

function isUserBanned(user: any) {
    return Boolean(user.is_banned || user.banned);
}

function isUserVerified(user: any) {
    return Boolean(user.is_verified || user.verified);
}

export default function AdminUsersClient() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [isBanned, setIsBanned] = useState("");
    const [isVerified, setIsVerified] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

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

    function buildUsersEndpoint() {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
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
            const data = await apiRequest(buildUsersEndpoint());
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

    async function banUser(userId: number | string) {
        const reason = window.prompt("Enter reason for banning this user:");

        if (!reason) return;

        setActionLoading(`ban-${userId}`);

        try {
            await apiRequest(banUserEndpoint(userId), {
                method: "POST",
                body: JSON.stringify({
                    reason,
                }),
            });

            await loadUsers();
        } catch (error: any) {
            alert(error.message || "Failed to ban user.");
        } finally {
            setActionLoading(null);
        }
    }

    async function unbanUser(userId: number | string) {
        const confirmed = window.confirm("Unban this user?");

        if (!confirmed) return;

        setActionLoading(`unban-${userId}`);

        try {
            await apiRequest(unbanUserEndpoint(userId), {
                method: "POST",
            });

            await loadUsers();
        } catch (error: any) {
            alert(error.message || "Failed to unban user.");
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-5">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search e.g. Brian"
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500 md:col-span-2"
                    />

                    <select
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">All roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                    </select>

                    <select
                        value={isBanned}
                        onChange={(event) => setIsBanned(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Ban status</option>
                        <option value="true">Banned</option>
                        <option value="false">Not banned</option>
                    </select>

                    <select
                        value={isVerified}
                        onChange={(event) => setIsVerified(event.target.value)}
                        className="rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Verification</option>
                        <option value="true">Verified</option>
                        <option value="false">Not verified</option>
                    </select>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadUsers}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setRole("");
                            setIsBanned("");
                            setIsVerified("");
                            setTimeout(loadUsers, 0);
                        }}
                        className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading users...
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
                                Users List
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {users.length} user{users.length === 1 ? "" : "s"} found.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadUsers}
                            className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {users.length === 0 ? (
                        <div className="rounded-2xl border bg-white p-8 text-slate-600">
                            No users found.
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {users.map((user: any) => {
                                const banned = isUserBanned(user);
                                const verified = isUserVerified(user);

                                return (
                                    <article
                                        key={user.id}
                                        className="rounded-2xl border bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                                                        {getUserRole(user)}
                                                    </span>

                                                    {verified ? (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                                            Not verified
                                                        </span>
                                                    )}

                                                    {banned ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                            Banned
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                                    {getUserName(user)}
                                                </h3>

                                                <div className="mt-2 grid gap-1 text-sm text-slate-600">
                                                    <p>
                                                        <span className="font-semibold">Contact:</span>{" "}
                                                        {getUserContact(user)}
                                                    </p>

                                                    <p>
                                                        <span className="font-semibold">User ID:</span>{" "}
                                                        {user.id}
                                                    </p>

                                                    {user.date_joined && (
                                                        <p>
                                                            <span className="font-semibold">Joined:</span>{" "}
                                                            {new Date(user.date_joined).toLocaleDateString(
                                                                "en-UG",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    )}

                                                    {user.ban_reason && (
                                                        <p className="text-red-700">
                                                            <span className="font-semibold">
                                                                Ban reason:
                                                            </span>{" "}
                                                            {user.ban_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex w-full flex-col gap-3 lg:w-48">
                                                {banned ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => unbanUser(user.id)}
                                                        disabled={actionLoading === `unban-${user.id}`}
                                                        className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `unban-${user.id}`
                                                            ? "Unbanning..."
                                                            : "Unban User"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => banUser(user.id)}
                                                        disabled={actionLoading === `ban-${user.id}`}
                                                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `ban-${user.id}`
                                                            ? "Banning..."
                                                            : "Ban User"}
                                                    </button>
                                                )}
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