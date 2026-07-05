"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";

const NOTIFICATIONS_ENDPOINT = "/notifications/";

const MARK_ALL_READ_ENDPOINT = "/notifications/read-all/";

const markReadEndpoint = (id: number | string) =>
    `/notifications/${id}/read/`;

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    return [];
}

function isUnread(notification: any) {
    return !(
        notification.is_read ||
        notification.read ||
        notification.status === "read"
    );
}

function getTitle(notification: any) {
    return (
        notification.title ||
        notification.subject ||
        notification.heading ||
        "Notification"
    );
}

function getMessage(notification: any) {
    return (
        notification.message ||
        notification.body ||
        notification.description ||
        ""
    );
}

function getLink(notification: any) {
    return (
        notification.link ||
        notification.url ||
        notification.action_url ||
        notification.target_url ||
        ""
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

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadNotifications() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(NOTIFICATIONS_ENDPOINT);
            setNotifications(getArray(data));
        } catch (error: any) {
            setError(error.message || "Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function markRead(notification: any) {
        if (!notification.id) return;

        setActionLoading(true);

        try {
            await apiPost(markReadEndpoint(notification.id));
            await loadNotifications();
        } catch (error: any) {
            alert(error.message || "Failed to mark notification as read.");
        } finally {
            setActionLoading(false);
        }
    }

    async function markAllRead() {
        setActionLoading(true);

        try {
            await apiPost(MARK_ALL_READ_ENDPOINT);
            await loadNotifications();
        } catch (error: any) {
            alert(error.message || "Failed to mark all notifications as read.");
        } finally {
            setActionLoading(false);
        }
    }

    async function openNotification(notification: any) {
        if (isUnread(notification)) {
            await markRead(notification);
        }

        const link = getLink(notification);

        if (link) {
            window.location.href = link;
        }
    }

    const unreadCount = notifications.filter(isUnread).length;

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Notification Center
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadNotifications}
                        className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={markAllRead}
                        disabled={actionLoading || unreadCount === 0}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        Mark all read
                    </button>
                </div>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading notifications...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && notifications.length === 0 && (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have no notifications yet.
                </div>
            )}

            {!loading && !error && notifications.length > 0 && (
                <div className="grid gap-4">
                    {notifications.map((notification) => {
                        const unread = isUnread(notification);
                        const link = getLink(notification);

                        return (
                            <article
                                key={notification.id}
                                className={
                                    unread
                                        ? "rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm"
                                        : "rounded-2xl border bg-white p-5 shadow-sm"
                                }
                            >
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={
                                                    unread
                                                        ? "rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white"
                                                        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                                                }
                                            >
                                                {unread ? "Unread" : "Read"}
                                            </span>

                                            {notification.type && (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                                                    {String(notification.type).replaceAll("_", " ")}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                                            {getTitle(notification)}
                                        </h3>

                                        {getMessage(notification) && (
                                            <p className="mt-2 leading-6 text-slate-600">
                                                {getMessage(notification)}
                                            </p>
                                        )}

                                        {(notification.created_at || notification.created) && (
                                            <p className="mt-3 text-sm text-slate-500">
                                                {formatDate(
                                                    notification.created_at || notification.created
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex w-full flex-col gap-3 md:w-44">
                                        {link && (
                                            <button
                                                type="button"
                                                onClick={() => openNotification(notification)}
                                                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                            >
                                                Open
                                            </button>
                                        )}

                                        {unread && (
                                            <button
                                                type="button"
                                                onClick={() => markRead(notification)}
                                                disabled={actionLoading}
                                                className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                                            >
                                                Mark read
                                            </button>
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