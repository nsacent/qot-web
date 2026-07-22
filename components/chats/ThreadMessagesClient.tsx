"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope, faShieldHalved } from "@/lib/faIcons";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.messages)) return data.messages;
    return [];
}

function unwrapUser(data: any) {
    return data?.user || data?.data || data;
}

function getSenderId(message: any) {
    return message?.sender?.id || message?.sender;
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

function formatMessageTime(value: string | undefined) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-UG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export default function ThreadMessagesClient({
    threadId,
}: {
    threadId: string;
}) {
    const [thread, setThread] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [sendError, setSendError] = useState("");
    const messageListRef = useRef<HTMLDivElement | null>(null);

    const loadConversation = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);

        try {
            const [threadResponse, messagesResponse, userResponse] = await Promise.all([
                fetch(`/api/proxy/chats/threads/${threadId}/`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/proxy/chats/threads/${threadId}/messages/`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            if (
                threadResponse.status === 401 ||
                messagesResponse.status === 401 ||
                userResponse.status === 401
            ) {
                window.location.href = `/login?next=/account/messages/${threadId}`;
                return;
            }

            const threadData = await threadResponse.json().catch(() => ({}));
            const messagesData = await messagesResponse.json().catch(() => ({}));
            const userData = await userResponse.json().catch(() => ({}));

            if (!threadResponse.ok || !messagesResponse.ok || !userResponse.ok) {
                throw new Error(
                    messagesData?.detail ||
                    threadData?.detail ||
                    "Failed to load this conversation."
                );
            }

            const user = unwrapUser(userData);
            const items = getArray(messagesData);

            setThread(threadData);
            setCurrentUser(user);
            setMessages(items);
            setError("");

            const hasUnreadMessages = items.some(
                (message) =>
                    message?.is_read === false &&
                    String(getSenderId(message)) !== String(user?.id)
            );

            if (hasUnreadMessages) {
                const markReadResponse = await fetch(
                    `/api/proxy/chats/threads/${threadId}/mark-read/`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                if (markReadResponse.ok) {
                    window.dispatchEvent(new Event("qot_messages_updated"));
                }
            }
        } catch (requestError: any) {
            const message = requestError?.message || "Something went wrong.";

            if (message.toLowerCase().includes("login")) {
                window.location.href = `/login?next=/account/messages/${threadId}`;
                return;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        loadConversation(true);

        const interval = window.setInterval(() => loadConversation(), 20000);
        const refresh = () => loadConversation();

        window.addEventListener("focus", refresh);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
        };
    }, [loadConversation]);

    useEffect(() => {
        const container = messageListRef.current;

        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanBody = body.trim();
        if (!cleanBody || sending) return;

        setSending(true);
        setSendError("");

        try {
            const response = await fetch(
                `/api/proxy/chats/threads/${threadId}/messages/`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ body: cleanBody }),
                }
            );

            if (response.status === 401) {
                window.location.href = `/login?next=/account/messages/${threadId}`;
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    "Failed to send message."
                );
            }

            setBody("");
            setMessages((current) => [...current, data]);
            window.dispatchEvent(new Event("qot_messages_updated"));
        } catch (requestError: any) {
            setSendError(requestError?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return (
            <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.09)] ring-1 ring-black/5">
                <div className="flex animate-pulse items-center gap-4 border-b border-slate-100 p-5">
                    <div className="h-12 w-12 rounded-[16px] bg-slate-100" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                </div>
                <div className="h-[440px] animate-pulse bg-slate-50/60" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center text-red-700">
                <p className="text-lg font-black">Conversation unavailable</p>
                <p className="mt-2 text-sm font-semibold">{error}</p>
                <div className="mt-5 flex justify-center gap-3">
                    <a
                        href="/account/messages"
                        className="rounded-[13px] bg-white px-4 py-2.5 text-sm font-black ring-1 ring-red-200"
                    >
                        Back to inbox
                    </a>
                    <button
                        type="button"
                        onClick={() => loadConversation(true)}
                        className="rounded-[13px] bg-red-600 px-4 py-2.5 text-sm font-black text-white"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const participantName = thread?.other_user_name || thread?.seller_name || thread?.buyer_name || "QOT member";
    const listingTitle = thread?.listing?.title || "Marketplace advert";
    const listingImage = getListingImage(thread);

    return (
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_65px_rgba(15,23,42,0.11)] ring-1 ring-black/5">
            <header className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                    <a
                        href="/account/messages"
                        aria-label="Back to messages"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-slate-100 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                    </a>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-slate-950 text-sm font-black text-white">
                        {participantName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-black text-slate-950">{participantName}</h1>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            QOT conversation
                        </p>
                    </div>
                </div>

                <a
                    href={`/ads/${thread?.listing?.id || ""}`}
                    className="flex min-w-0 items-center gap-3 rounded-[16px] bg-slate-50 p-2.5 pr-4 ring-1 ring-slate-100 transition hover:bg-orange-50"
                >
                    <span className="h-10 w-12 shrink-0 overflow-hidden rounded-[12px] bg-white">
                        {listingImage ? (
                            <img src={listingImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full items-center justify-center text-slate-300">
                                <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-orange-600">Discussing</span>
                        <span className="mt-0.5 block max-w-52 truncate text-xs font-black text-slate-800">{listingTitle}</span>
                    </span>
                </a>
            </header>

            <div
                ref={messageListRef}
                className="h-[54vh] min-h-[380px] max-h-[620px] space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-6"
            >
                <div className="mx-auto flex max-w-md items-start gap-3 rounded-[18px] bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-100">
                    <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-[11px] font-bold leading-5">
                        Keep payments on trusted channels, inspect items before paying, and never share verification codes.
                    </p>
                </div>

                {messages.length > 0 ? (
                    messages.map((message: any) => {
                        const mine = String(getSenderId(message)) === String(currentUser?.id);
                        const attachment = message?.image || message?.attachments?.[0]?.file_url || message?.attachments?.[0]?.file;

                        return (
                            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[82%] sm:max-w-[70%] ${mine ? "text-right" : "text-left"}`}>
                                    <p className="mb-1.5 px-1 text-[10px] font-black text-slate-400">
                                        {mine ? "You" : message?.sender_name || participantName}
                                    </p>
                                    <div className={`overflow-hidden rounded-[20px] px-4 py-3 text-left shadow-sm ${
                                        mine
                                            ? "rounded-br-[6px] bg-orange-500 text-white"
                                            : "rounded-bl-[6px] bg-white text-slate-800 ring-1 ring-slate-200"
                                    }`}>
                                        {attachment && (
                                            <img
                                                src={attachment}
                                                alt="Message attachment"
                                                className="mb-3 max-h-72 w-full rounded-[14px] object-cover"
                                            />
                                        )}
                                        {(message?.body || message?.message) && (
                                            <p className="whitespace-pre-line text-sm font-semibold leading-6">
                                                {message?.body || message?.message}
                                            </p>
                                        )}
                                    </div>
                                    <p className="mt-1.5 px-1 text-[9px] font-bold text-slate-400">
                                        {formatMessageTime(message?.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex h-[260px] flex-col items-center justify-center text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-50 text-orange-600">
                            <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                        </span>
                        <h2 className="mt-4 text-lg font-black text-slate-950">Start the conversation</h2>
                        <p className="mt-1 max-w-sm text-sm font-semibold leading-6 text-slate-500">
                            Ask a clear question about the advert to get the deal moving.
                        </p>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-4 sm:p-5">
                {sendError && (
                    <p className="mb-3 rounded-[13px] bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-100">
                        {sendError}
                    </p>
                )}
                <div className="flex items-end gap-3 rounded-[20px] bg-slate-100 p-2 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200">
                    <textarea
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder="Write a message..."
                        rows={1}
                        className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                        type="submit"
                        disabled={sending || !body.trim()}
                        className="h-11 shrink-0 rounded-[15px] bg-orange-500 px-5 text-sm font-black text-white shadow-[0_8px_18px_rgba(249,115,22,0.20)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {sending ? "Sending..." : "Send →"}
                    </button>
                </div>
            </form>
        </section>
    );
}
