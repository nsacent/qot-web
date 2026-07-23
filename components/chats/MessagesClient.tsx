"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import { faEnvelope, faMagnifyingGlass } from "@/lib/faIcons";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.threads)) return data.threads;
    return [];
}

function getParticipantName(thread: any) {
    return (
        thread?.other_user_name ||
        thread?.seller_name ||
        thread?.buyer_name ||
        "QOT member"
    );
}

function getListingTitle(thread: any) {
    return thread?.listing?.title || thread?.listing_title || "Marketplace advert";
}

function getListingImage(thread: any) {
    const listing = thread?.listing || {};

    return (
        listing?.cover_image ||
        listing?.image ||
        listing?.thumbnail ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        ""
    );
}

function getLastMessage(thread: any) {
    const message = thread?.last_message;

    if (typeof message === "string" && message.trim()) return message;
    if (message?.body) return message.body;

    return "Open the conversation";
}

export default function MessagesClient() {
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadThreads = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/proxy/chats/threads/", {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = "/login?next=/account/messages";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.detail || data?.message || "Failed to load messages."
                );
            }

            setThreads(getArray(data));
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadThreads(true);

        const interval = window.setInterval(() => loadThreads(), 30000);
        const refresh = () => loadThreads();

        window.addEventListener("focus", refresh);
        window.addEventListener("qot_messages_updated", refresh);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("qot_messages_updated", refresh);
        };
    }, [loadThreads]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                    <div key={item} className="flex animate-pulse gap-4 rounded-[24px] bg-white p-4 ring-1 ring-black/5">
                        <div className="h-16 w-16 rounded-[18px] bg-slate-100" />
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-4 w-1/3 rounded bg-slate-100" />
                            <div className="h-3 w-2/3 rounded bg-slate-100" />
                            <div className="h-3 w-1/2 rounded bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[26px] border border-red-200 bg-red-50 p-7 text-center text-red-700">
                <p className="font-black">We could not load your conversations.</p>
                <p className="mt-1 text-sm font-semibold">{error}</p>
                <button
                    type="button"
                    onClick={() => loadThreads(true)}
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">
                    {threads.length} {threads.length === 1 ? "conversation" : "conversations"}
                </p>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Live inbox
                </span>
            </div>

            {threads.length > 0 ? (
                <div className="space-y-3">
                    {threads.map((thread: any) => {
                        const unread = Number(thread?.unread_count || 0);
                        const image = getListingImage(thread);
                        const participant = getParticipantName(thread);

                        return (
                            <a
                                key={thread.id}
                                href={`/account/messages/${thread.id}`}
                                className={`group flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_10px_32px_rgba(15,23,42,0.06)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)] ${
                                    unread > 0 ? "ring-orange-200" : "ring-black/5"
                                }`}
                            >
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-slate-100">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt=""
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="flex h-full items-center justify-center text-slate-400">
                                            <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="truncate text-sm font-black text-slate-950 sm:text-base">
                                            {participant}
                                        </h2>
                                        <span className="shrink-0 text-[11px] font-bold text-slate-400">
                                            <span title={formatDateTime(thread?.last_message_at || thread?.created_at)}>
                                                {formatRelativeTime(thread?.last_message_at || thread?.created_at)}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-xs font-bold text-orange-600">
                                        {getListingTitle(thread)}
                                    </p>
                                    <div className="mt-1.5 flex items-center justify-between gap-3">
                                        <p className={`truncate text-sm ${unread > 0 ? "font-black text-slate-800" : "font-semibold text-slate-500"}`}>
                                            {getLastMessage(thread)}
                                        </p>
                                        {unread > 0 && (
                                            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-black text-white">
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-50 text-orange-600">
                        <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 text-xl font-black text-slate-950">Your inbox is ready</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                        Open an advert and message the seller. Your conversation will appear here.
                    </p>
                    <a
                        href="/ads"
                        className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-orange-500 px-5 py-3 text-sm font-black text-white"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                        Browse adverts
                    </a>
                </div>
            )}
        </section>
    );
}
