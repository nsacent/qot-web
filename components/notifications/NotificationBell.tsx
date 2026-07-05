"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getStoredToken } from "@/lib/auth";

const NOTIFICATIONS_ENDPOINT = "/notifications/";

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

export default function NotificationBell() {
    const [mounted, setMounted] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadNotifications() {
        const token = getStoredToken();

        if (!token) return;

        setLoading(true);

        try {
            const data = await apiGet(NOTIFICATIONS_ENDPOINT, {
                redirectOnUnauthorized: false,
            });

            setNotifications(getArray(data).slice(0, 8));
        } catch (error) {
            console.error("Notifications error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = getStoredToken();

        setHasToken(Boolean(token));
        setMounted(true);

        if (token) {
            loadNotifications();
        }
    }, []);

    async function openNotification(notification: any) {
        const id = notification.id;
        const link = getLink(notification);

        try {
            if (id && isUnread(notification)) {
                await apiPost(markReadEndpoint(id), undefined, {
                    redirectOnUnauthorized: false,
                });
            }
        } catch (error) {
            console.error("Mark notification read error:", error);
        }

        if (link) {
            window.location.href = link;
            return;
        }

        window.location.href = "/notifications";
    }

    if (!mounted) return null;
    if (!hasToken) return null;

    const unreadCount = notifications.filter(isUnread).length;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((current) => !current);
                    loadNotifications();
                }}
                className="relative rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <a
                            href="/notifications"
                            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                            View all
                        </a>
                    </div>

                    {loading ? (
                        <div className="p-4 text-sm text-slate-600">
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-slate-600">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                    className="block w-full border-b px-4 py-3 text-left hover:bg-slate-50"
                                >
                                    <div className="flex items-start gap-3">
                                        {isUnread(notification) && (
                                            <span className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-bold text-slate-900">
                                                {getTitle(notification)}
                                            </p>

                                            {getMessage(notification) && (
                                                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                                                    {getMessage(notification)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}