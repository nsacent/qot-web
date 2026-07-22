"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faBullhorn,
    faCircleCheck,
    faClock,
    faEnvelope,
    faShieldHalved,
} from "@/lib/faIcons";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    return [];
}

function isUnread(notification: any) {
    return notification?.is_read === false;
}

function getTitle(notification: any) {
    return notification?.title || notification?.subject || "QOT update";
}

function getMessage(notification: any) {
    return notification?.message || notification?.body || "You have a new update.";
}

function getType(notification: any) {
    return notification?.notification_type || notification?.type || "system";
}

function getLink(notification: any) {
    if (notification?.chat_thread) return `/account/messages/${notification.chat_thread}`;
    if (notification?.listing) return `/ads/${notification.listing}`;

    return notification?.link || notification?.url || "";
}

function getVisual(notification: any) {
    switch (getType(notification)) {
        case "message":
            return { icon: faEnvelope, tone: "bg-blue-50 text-blue-600 ring-blue-100", label: "Message" };
        case "listing_approved":
            return { icon: faCircleCheck, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100", label: "Approved" };
        case "listing_rejected":
            return { icon: faShieldHalved, tone: "bg-rose-50 text-rose-600 ring-rose-100", label: "Needs attention" };
        case "listing_expired":
            return { icon: faClock, tone: "bg-amber-50 text-amber-700 ring-amber-100", label: "Expired" };
        default:
            return { icon: faBullhorn, tone: "bg-violet-50 text-violet-600 ring-violet-100", label: "QOT update" };
    }
}

function formatDate(value: string | undefined) {
    if (!value) return "Recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently";

    return new Intl.DateTimeFormat("en-UG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

async function notificationRequest(path: string, init: RequestInit = {}) {
    const response = await fetch(`/api/proxy${path}`, {
        ...init,
        credentials: "include",
        cache: "no-store",
    });

    if (response.status === 401) {
        window.location.href = "/login?next=/account/notifications";
        throw new Error("Login required.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Request failed.");
    }

    return data;
}

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        setError("");

        try {
            const data = await notificationRequest("/notifications/");
            setNotifications(getArray(data));
        } catch (requestError: any) {
            if (requestError?.message !== "Login required.") {
                setError(requestError?.message || "Failed to load notifications.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications(true);

        const interval = window.setInterval(() => loadNotifications(), 60000);
        const refresh = () => loadNotifications();

        window.addEventListener("focus", refresh);
        window.addEventListener("qot_notifications_updated", refresh);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("qot_notifications_updated", refresh);
        };
    }, [loadNotifications]);

    const unreadCount = useMemo(
        () => notifications.filter(isUnread).length,
        [notifications]
    );

    const visibleNotifications = useMemo(
        () => filter === "unread" ? notifications.filter(isUnread) : notifications,
        [filter, notifications]
    );

    async function markRead(notification: any, openAfter = false) {
        const link = getLink(notification);

        if (notification?.id && isUnread(notification)) {
            setActionLoading(String(notification.id));

            try {
                await notificationRequest(`/notifications/${notification.id}/read/`, {
                    method: "POST",
                });
                setNotifications((current) =>
                    current.map((item) =>
                        item.id === notification.id ? { ...item, is_read: true } : item
                    )
                );
                window.dispatchEvent(new Event("qot_notifications_updated"));
            } catch (requestError: any) {
                setError(requestError?.message || "Failed to mark notification as read.");
                return;
            } finally {
                setActionLoading(null);
            }
        }

        if (openAfter && link) window.location.href = link;
    }

    async function markAllRead() {
        setActionLoading("all");
        setError("");

        try {
            await notificationRequest("/notifications/read-all/", {
                method: "POST",
            });
            setNotifications((current) =>
                current.map((notification) => ({ ...notification, is_read: true }))
            );
            window.dispatchEvent(new Event("qot_notifications_updated"));
        } catch (requestError: any) {
            setError(requestError?.message || "Failed to mark notifications as read.");
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <section className="py-6">
            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-6 py-7 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:px-8">
                <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-orange-200 ring-1 ring-white/15">
                            <FontAwesomeIcon icon={faBell} className="h-3 w-3" />
                            Notification center
                        </span>
                        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Stay on top of every update.</h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                            Messages, advert decisions, expiry reminders, and important account news in one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-[17px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                            <p className="text-xl font-black">{notifications.length}</p>
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">All updates</p>
                        </div>
                        <div className="rounded-[17px] bg-orange-500 px-4 py-3 shadow-lg">
                            <p className="text-xl font-black">{unreadCount}</p>
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-orange-100">Unread</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                    <div className="flex rounded-[14px] bg-slate-100 p-1">
                        {(["all", "unread"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setFilter(option)}
                                className={`rounded-[11px] px-4 py-2 text-xs font-black capitalize transition ${
                                    filter === option ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                {option} {option === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => loadNotifications(true)}
                            disabled={loading}
                            className="rounded-[13px] bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={markAllRead}
                            disabled={actionLoading !== null || unreadCount === 0}
                            className="rounded-[13px] bg-orange-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {actionLoading === "all" ? "Updating..." : "Mark all read"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="mt-5 space-y-3">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="flex animate-pulse gap-4 rounded-[20px] bg-slate-50 p-4">
                                <div className="h-12 w-12 rounded-[15px] bg-slate-200" />
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : visibleNotifications.length > 0 ? (
                    <div className="mt-5 space-y-3">
                        {visibleNotifications.map((notification) => {
                            const unread = isUnread(notification);
                            const visual = getVisual(notification);
                            const link = getLink(notification);
                            const busy = actionLoading === String(notification.id);

                            return (
                                <article
                                    key={notification.id}
                                    className={`relative overflow-hidden rounded-[22px] p-4 ring-1 transition sm:p-5 ${
                                        unread
                                            ? "bg-orange-50/70 ring-orange-100"
                                            : "bg-slate-50/70 ring-slate-100 hover:bg-white"
                                    }`}
                                >
                                    {unread && <span className="absolute bottom-0 left-0 top-0 w-1 bg-orange-500" />}
                                    <div className="flex gap-4">
                                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ring-1 ${visual.tone}`}>
                                            <FontAwesomeIcon icon={visual.icon} className="h-5 w-5" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                                            {visual.label}
                                                        </span>
                                                        {unread && (
                                                            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h2 className="mt-1.5 text-base font-black text-slate-950">
                                                        {getTitle(notification)}
                                                    </h2>
                                                </div>
                                                <span className="shrink-0 text-[11px] font-bold text-slate-400">
                                                    {formatDate(notification?.created_at || notification?.created)}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                                                {getMessage(notification)}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {link && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markRead(notification, true)}
                                                        disabled={busy}
                                                        className="rounded-[12px] bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-500 disabled:opacity-50"
                                                    >
                                                        {busy ? "Opening..." : "Open update"}
                                                    </button>
                                                )}
                                                {unread && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markRead(notification)}
                                                        disabled={busy}
                                                        className="rounded-[12px] bg-white px-4 py-2.5 text-xs font-black text-slate-600 ring-1 ring-slate-200 transition hover:text-orange-600 disabled:opacity-50"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-50 text-emerald-600">
                            <FontAwesomeIcon icon={faCircleCheck} className="h-6 w-6" />
                        </span>
                        <h2 className="mt-5 text-xl font-black text-slate-950">
                            {filter === "unread" ? "You are all caught up" : "No notifications yet"}
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            {filter === "unread"
                                ? "There are no unread updates waiting for you."
                                : "Messages and marketplace updates will appear here as they arrive."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
