"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxArchive,
    faEllipsisVertical,
    faEnvelope,
    faEnvelopeOpen,
    faInbox,
    faMagnifyingGlass,
    faRotateLeft,
    faShieldHalved,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import UserAvatar from "@/components/account/UserAvatar";
import InlineError from "@/components/forms/InlineError";
import AdActionModal from "@/components/listings/AdActionModal";
import { createChatSocket } from "@/lib/chatSocket";

type ChatFolder = "all" | "unread" | "read" | "favourites" | "archived" | "spam";

type TabCounts = Record<ChatFolder, number>;

const EMPTY_COUNTS: TabCounts = {
    all: 0,
    unread: 0,
    read: 0,
    favourites: 0,
    archived: 0,
    spam: 0,
};

const FOLDER_TABS = [
    { id: "all" as const, label: "All messages", icon: faInbox },
    { id: "unread" as const, label: "Unread", icon: faEnvelope },
    { id: "read" as const, label: "Read", icon: faEnvelopeOpen },
    { id: "favourites" as const, label: "Favourites", icon: faStar },
    { id: "archived" as const, label: "Archived", icon: faBoxArchive },
    { id: "spam" as const, label: "Spam", icon: faShieldHalved },
];

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.threads)) return data.threads;
    return [];
}

function getParticipantName(thread: any) {
    return thread?.other_user_name || thread?.seller_name || thread?.buyer_name || "QOT member";
}

function getListingTitle(thread: any) {
    return thread?.listing?.title || thread?.listing_title || "Marketplace ad";
}

function getListingImage(thread: any) {
    const listing = thread?.listing || {};

    return listing?.cover_image || listing?.image || listing?.thumbnail || listing?.images?.[0]?.image || listing?.images?.[0]?.url || "";
}

function getLastMessage(thread: any) {
    const message = thread?.last_message;

    if (typeof message === "string" && message.trim()) return message;
    if (message?.body) return message.body;
    return "Open the conversation";
}

function folderEmptyMessage(folder: ChatFolder) {
    const messages: Record<ChatFolder, string> = {
        all: "Open an ad and message the seller. Your conversation will appear here.",
        unread: "You have caught up with every conversation.",
        read: "Conversations you have read will appear here.",
        favourites: "Favourite an important chat to keep it easy to find.",
        archived: "Chats you archive will stay safely stored here.",
        spam: "Conversations reported as spam will appear here.",
    };
    return messages[folder];
}

export default function MessagesClient() {
    const [threads, setThreads] = useState<any[]>([]);
    const [tabCounts, setTabCounts] = useState<TabCounts>(EMPTY_COUNTS);
    const [activeFolder, setActiveFolder] = useState<ChatFolder>("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState<{ threadId: string; message: string } | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState("");
    const [menuThreadId, setMenuThreadId] = useState("");
    const [spamTarget, setSpamTarget] = useState<any>(null);
    const [liveConnected, setLiveConnected] = useState(false);

    const loadThreads = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/proxy/chats/threads/?filter=${encodeURIComponent(activeFolder)}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                window.location.assign("/login?next=/account/messages");
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to load messages.");
            }

            setThreads(getArray(data));
            setTabCounts({ ...EMPTY_COUNTS, ...(data?.tabs || {}) });
        } catch (requestError: any) {
            setError(requestError?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [activeFolder]);

    useEffect(() => {
        void loadThreads(true);

        const interval = window.setInterval(() => void loadThreads(), 30000);
        const refresh = () => void loadThreads();

        window.addEventListener("focus", refresh);
        window.addEventListener("qot_messages_updated", refresh);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("qot_messages_updated", refresh);
        };
    }, [loadThreads]);

    useEffect(() => {
        const socket = createChatSocket({
            path: "/ws/chats/presence/",
            onConnectionChange: setLiveConnected,
            onUnauthorized: () => {
                window.location.assign("/login?next=/account/messages");
            },
            onMessage: (event) => {
                if (event.type === "presence") {
                    setThreads((current) => current.map((thread) => (
                        String(thread?.other_user_id) === String(event.user_id)
                            ? { ...thread, other_user_online: Boolean(event.is_online) }
                            : thread
                    )));
                }

                if (event.type === "thread_updated") {
                    void loadThreads();
                }
            },
        });

        return () => socket.close();
    }, [loadThreads]);

    const visibleThreads = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return threads;

        return threads.filter((thread) => [
            getParticipantName(thread),
            getListingTitle(thread),
            getLastMessage(thread),
            thread?.other_user_phone,
        ].some((value) => String(value || "").toLowerCase().includes(term)));
    }, [search, threads]);

    async function updateThreadState(thread: any, payload: Record<string, boolean>) {
        const threadId = String(thread.id);
        setActionLoadingId(threadId);
        setActionError(null);

        try {
            const response = await fetch(`/api/proxy/chats/threads/${threadId}/state/`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to update this chat.");
            }

            setMenuThreadId("");
            await loadThreads();
            return true;
        } catch (requestError: any) {
            setActionError({
                threadId,
                message: requestError?.message || "Failed to update this chat.",
            });
            return false;
        } finally {
            setActionLoadingId("");
        }
    }

    async function markThreadRead(thread: any) {
        const threadId = String(thread.id);
        setActionLoadingId(threadId);
        setActionError(null);

        try {
            const response = await fetch(`/api/proxy/chats/threads/${threadId}/mark-read/`, {
                method: "POST",
                credentials: "include",
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to mark this chat as read.");
            }

            setMenuThreadId("");
            await loadThreads();
            window.dispatchEvent(new Event("qot_messages_updated"));
        } catch (requestError: any) {
            setActionError({
                threadId,
                message: requestError?.message || "Failed to mark this chat as read.",
            });
        } finally {
            setActionLoadingId("");
        }
    }

    async function confirmSpam() {
        if (!spamTarget) return;
        const updated = await updateThreadState(spamTarget, { is_spam: true, is_archived: false });
        if (updated) setSpamTarget(null);
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                    <div key={item} className="flex animate-pulse gap-4 rounded-[24px] bg-white p-4 ring-1 ring-black/5">
                        <div className="h-14 w-14 rounded-[18px] bg-slate-100" />
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
                <button type="button" onClick={() => void loadThreads(true)} className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between gap-3">
                <label className="relative min-w-0 flex-1">
                    <span className="sr-only">Search conversations</span>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chats, ads or phone numbers" className="h-11 w-full rounded-[16px] border-0 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-200" />
                </label>
                <span className={`hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-wider sm:flex ${liveConnected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    <span className={`h-2 w-2 rounded-full ${liveConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {liveConnected ? "Live" : "Updating"}
                </span>
            </div>

            <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FOLDER_TABS.map((tab) => {
                    const active = activeFolder === tab.id;
                    return (
                        <button key={tab.id} type="button" onClick={() => {
                            setActiveFolder(tab.id);
                            setMenuThreadId("");
                            setActionError(null);
                        }} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[14px] px-3 text-[11px] font-black transition ${active ? "bg-slate-950 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-700"}`}>
                            <FontAwesomeIcon icon={tab.icon} className={`h-3.5 w-3.5 ${active && tab.id === "favourites" ? "text-amber-300" : ""}`} />
                            {tab.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                                {tabCounts[tab.id] > 99 ? "99+" : tabCounts[tab.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="mb-3 mt-1 text-xs font-bold text-slate-500">
                {visibleThreads.length} {visibleThreads.length === 1 ? "conversation" : "conversations"}
            </p>

            {visibleThreads.length > 0 ? (
                <div className="space-y-3">
                    {visibleThreads.map((thread: any) => {
                        const unreadCount = Number(thread?.unread_count || 0);
                        const unread = unreadCount > 0 || thread?.is_marked_unread;
                        const participant = getParticipantName(thread);
                        const listingImage = getListingImage(thread);
                        const busy = actionLoadingId === String(thread.id);

                        return (
                            <div key={thread.id}>
                                <article className={`relative flex items-center gap-2 rounded-[22px] bg-white p-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] ring-1 transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)] sm:p-3 ${unread ? "ring-orange-200" : "ring-black/5"}`}>
                                    <Link href={`/account/messages/${thread.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-[17px] p-1.5 sm:gap-4">
                                        <span className="relative shrink-0">
                                            <UserAvatar src={thread?.other_user_avatar} name={participant} className="h-[52px] w-[52px] rounded-[17px] bg-slate-950 text-sm text-white sm:h-14 sm:w-14" />
                                            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white ${thread?.other_user_online ? "bg-emerald-500" : "bg-slate-300"}`} aria-label={thread?.other_user_online ? "Online" : "Offline"} />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-3">
                                                <span className="truncate text-sm font-black text-slate-950 sm:text-base">{participant}</span>
                                                <span className="shrink-0 text-[10px] font-bold text-slate-400" title={formatDateTime(thread?.last_message_at || thread?.created_at)}>
                                                    {formatRelativeTime(thread?.last_message_at || thread?.created_at)}
                                                </span>
                                            </span>
                                            <span className="mt-0.5 flex items-center gap-2">
                                                <span className="truncate text-[11px] font-black text-orange-600">{getListingTitle(thread)}</span>
                                                {thread?.other_user_online && <span className="shrink-0 text-[9px] font-black text-emerald-600">Online</span>}
                                            </span>
                                            <span className="mt-1 flex items-center justify-between gap-3">
                                                <span className={`truncate text-xs sm:text-sm ${unread ? "font-black text-slate-800" : "font-semibold text-slate-500"}`}>{getLastMessage(thread)}</span>
                                                {unread && (
                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[9px] font-black text-white">
                                                        {unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : ""}
                                                    </span>
                                                )}
                                            </span>
                                        </span>

                                        {listingImage && <img src={listingImage} alt="" className="hidden h-11 w-[52px] shrink-0 rounded-[13px] object-cover ring-1 ring-slate-100 sm:block" />}
                                    </Link>

                                    <div className="relative flex shrink-0 flex-col gap-1">
                                        <button type="button" disabled={busy} onClick={() => void updateThreadState(thread, { is_favourite: !thread?.is_favourite })} aria-label={thread?.is_favourite ? "Remove from favourites" : "Add to favourites"} className={`flex h-9 w-9 items-center justify-center rounded-[12px] transition disabled:opacity-40 ${thread?.is_favourite ? "bg-amber-50 text-amber-500" : "text-slate-300 hover:bg-amber-50 hover:text-amber-500"}`}>
                                            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                                        </button>
                                        <button type="button" disabled={busy} onClick={() => setMenuThreadId((current) => current === String(thread.id) ? "" : String(thread.id))} aria-label="Chat options" className="flex h-9 w-9 items-center justify-center rounded-[12px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40">
                                            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
                                        </button>

                                        {menuThreadId === String(thread.id) && (
                                            <div className="absolute right-0 top-[76px] z-30 w-48 overflow-hidden rounded-[16px] bg-white p-1.5 shadow-2xl ring-1 ring-slate-200">
                                                <button type="button" onClick={() => unread ? void markThreadRead(thread) : void updateThreadState(thread, { is_marked_unread: true })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 hover:bg-slate-50">
                                                    <FontAwesomeIcon icon={unread ? faEnvelopeOpen : faEnvelope} className="h-3.5 w-3.5 text-orange-500" />
                                                    Mark as {unread ? "read" : "unread"}
                                                </button>
                                                <button type="button" onClick={() => void updateThreadState(thread, { is_archived: !thread?.is_archived })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 hover:bg-slate-50">
                                                    <FontAwesomeIcon icon={thread?.is_archived ? faRotateLeft : faBoxArchive} className="h-3.5 w-3.5 text-blue-500" />
                                                    {thread?.is_archived ? "Unarchive chat" : "Archive chat"}
                                                </button>
                                                <button type="button" onClick={() => thread?.is_spam ? void updateThreadState(thread, { is_spam: false }) : setSpamTarget(thread)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-red-600 hover:bg-red-50">
                                                    <FontAwesomeIcon icon={thread?.is_spam ? faRotateLeft : faShieldHalved} className="h-3.5 w-3.5" />
                                                    {thread?.is_spam ? "Not spam" : "Report as spam"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>

                                {actionError?.threadId === String(thread.id) && (
                                    <InlineError message={actionError.message} onDismiss={() => setActionError(null)} className="mx-2 mt-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-50 text-orange-600">
                        <FontAwesomeIcon icon={activeFolder === "spam" ? faShieldHalved : faEnvelope} className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 text-xl font-black text-slate-950">Nothing here yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                        {search ? "No conversations match your search." : folderEmptyMessage(activeFolder)}
                    </p>
                    {activeFolder === "all" && !search && (
                        <Link href="/ads" className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-orange-500 px-5 py-3 text-sm font-black text-white">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                            Browse ads
                        </Link>
                    )}
                </div>
            )}

            <AdActionModal
                open={Boolean(spamTarget)}
                title="Report this chat as spam?"
                description={`This moves the conversation with ${spamTarget ? getParticipantName(spamTarget) : "this user"} to Spam and sends a report to QOT moderation. You can restore it later.`}
                confirmLabel="Report spam"
                destructive
                loading={Boolean(spamTarget && actionLoadingId === String(spamTarget.id))}
                error={spamTarget && actionError?.threadId === String(spamTarget.id) ? actionError.message : ""}
                onClose={() => {
                    if (actionLoadingId) return;
                    setSpamTarget(null);
                    setActionError(null);
                }}
                onConfirm={() => void confirmSpam()}
            />
        </section>
    );
}
