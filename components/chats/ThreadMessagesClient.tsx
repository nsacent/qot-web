"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope, faShieldHalved } from "@/lib/faIcons";
import {
    faBoxArchive,
    faEllipsisVertical,
    faFileLines,
    faPaperclip,
    faPaperPlane,
    faRotateLeft,
    faStar,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import InlineError from "@/components/forms/InlineError";
import AdActionModal from "@/components/listings/AdActionModal";
import MessageText from "@/components/chats/MessageText";
import { createChatSocket, type ChatSocketController } from "@/lib/chatSocket";

const QUICK_MESSAGES = [
    "Hi, is this ad still available?",
    "What is your best price?",
    "I would like to offer UGX ",
    "Where can I inspect the item?",
];

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function formatFileSize(value: any) {
    const size = Number(value || 0);
    if (!size) return "";
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

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

function mergeMessage(current: any[], incoming: any) {
    if (!incoming) return current;

    const incomingId = String(incoming?.id || "");
    const existingIndex = incomingId
        ? current.findIndex((message) => String(message?.id) === incomingId)
        : -1;

    if (existingIndex < 0) return [...current, incoming];

    return current.map((message, index) => (
        index === existingIndex ? { ...message, ...incoming } : message
    ));
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

export default function ThreadMessagesClient({ threadId }: { threadId: string }) {
    const [thread, setThread] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [sendError, setSendError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [otherUserOnline, setOtherUserOnline] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [liveConnected, setLiveConnected] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [spamModalOpen, setSpamModalOpen] = useState(false);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const chatSocketRef = useRef<ChatSocketController | null>(null);
    const typingStopTimerRef = useRef<number | null>(null);
    const otherTypingTimerRef = useRef<number | null>(null);
    const menuAreaRef = useRef<HTMLDivElement | null>(null);

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
                window.location.assign(`/login?next=/account/messages/${threadId}`);
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
            setOtherUserOnline(Boolean(threadData?.other_user_online));
            setError("");

            const hasUnreadMessages = items.some(
                (message) =>
                    message?.is_read === false &&
                    String(getSenderId(message)) !== String(user?.id)
            );

            if (hasUnreadMessages || threadData?.is_marked_unread) {
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
                window.location.assign(`/login?next=/account/messages/${threadId}`);
                return;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        void loadConversation(true);

        const interval = window.setInterval(() => void loadConversation(), 30000);
        const refresh = () => void loadConversation();

        window.addEventListener("focus", refresh);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
        };
    }, [loadConversation]);

    useEffect(() => {
        const currentUserId = currentUser?.id;
        const otherUserId = thread?.other_user_id;
        if (!currentUserId || !otherUserId) return;

        const socket = createChatSocket({
            path: `/ws/chats/threads/${threadId}/`,
            onConnectionChange: (connected) => {
                setLiveConnected(connected);
                if (!connected) setOtherUserTyping(false);
            },
            onUnauthorized: () => {
                window.location.assign(`/login?next=/account/messages/${threadId}`);
            },
            onMessage: (event) => {
                if (
                    event.type === "presence" &&
                    String(event.user_id) === String(otherUserId)
                ) {
                    setOtherUserOnline(Boolean(event.is_online));
                }

                if (
                    event.type === "typing" &&
                    String(event.user_id) === String(otherUserId)
                ) {
                    if (otherTypingTimerRef.current !== null) {
                        window.clearTimeout(otherTypingTimerRef.current);
                    }

                    const isTyping = Boolean(event.is_typing);
                    setOtherUserTyping(isTyping);

                    if (isTyping) {
                        otherTypingTimerRef.current = window.setTimeout(() => {
                            setOtherUserTyping(false);
                            otherTypingTimerRef.current = null;
                        }, 3000);
                    }
                }

                if (event.type === "chat_message" && event.message) {
                    setMessages((current) => mergeMessage(current, event.message));
                    setOtherUserTyping(false);
                    window.dispatchEvent(new Event("qot_messages_updated"));

                    if (String(getSenderId(event.message)) !== String(currentUserId)) {
                        void fetch(`/api/proxy/chats/threads/${threadId}/mark-read/`, {
                            method: "POST",
                            credentials: "include",
                        });
                    }
                }

                if (event.type === "error" && event.message) {
                    setSendError(String(event.message));
                }
            },
        });

        chatSocketRef.current = socket;

        return () => {
            socket.close();
            chatSocketRef.current = null;
            if (otherTypingTimerRef.current !== null) {
                window.clearTimeout(otherTypingTimerRef.current);
                otherTypingTimerRef.current = null;
            }
        };
    }, [currentUser?.id, thread?.other_user_id, threadId]);

    useEffect(() => {
        const container = messageListRef.current;
        if (container) container.scrollTop = container.scrollHeight;
    }, [messages, otherUserTyping]);

    useEffect(() => () => {
        if (typingStopTimerRef.current !== null) {
            window.clearTimeout(typingStopTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const closeOutside = (event: PointerEvent) => {
            if (
                menuAreaRef.current &&
                !menuAreaRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", closeOutside);
        return () => document.removeEventListener("pointerdown", closeOutside);
    }, [menuOpen]);

    function stopTyping() {
        if (typingStopTimerRef.current !== null) {
            window.clearTimeout(typingStopTimerRef.current);
            typingStopTimerRef.current = null;
        }
        chatSocketRef.current?.send({ type: "typing", is_typing: false });
    }

    function updateComposer(value: string) {
        setBody(value);

        if (!value.trim()) {
            stopTyping();
            return;
        }

        chatSocketRef.current?.send({ type: "typing", is_typing: true });
        if (typingStopTimerRef.current !== null) {
            window.clearTimeout(typingStopTimerRef.current);
        }
        typingStopTimerRef.current = window.setTimeout(() => {
            chatSocketRef.current?.send({ type: "typing", is_typing: false });
            typingStopTimerRef.current = null;
        }, 1200);
    }

    async function updateThreadState(payload: Record<string, boolean>) {
        setActionLoading(true);
        setActionError("");

        try {
            const response = await fetch(`/api/proxy/chats/threads/${threadId}/state/`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                window.location.assign(`/login?next=/account/messages/${threadId}`);
                return false;
            }
            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to update this chat.");
            }

            setThread(data?.thread?.id ? data.thread : (current: any) => ({ ...current, ...payload }));
            setMenuOpen(false);
            window.dispatchEvent(new Event("qot_messages_updated"));
            return true;
        } catch (requestError: any) {
            setActionError(requestError?.message || "Failed to update this chat.");
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function confirmSpam() {
        const updated = await updateThreadState({ is_spam: true, is_archived: false });
        if (updated) setSpamModalOpen(false);
    }

    async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanBody = body.trim();
        if ((!cleanBody && attachments.length === 0) || sending) return;

        stopTyping();
        setSending(true);
        setSendError("");

        try {
            let response: Response;

            if (attachments.length > 0) {
                const formData = new FormData();
                if (cleanBody) formData.append("message", cleanBody);
                attachments.forEach((file) => formData.append("files", file));

                response = await fetch(`/api/proxy/chats/threads/${threadId}/attachments/`, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
            } else {
                response = await fetch(`/api/proxy/chats/threads/${threadId}/messages/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ body: cleanBody }),
                });
            }

            if (response.status === 401) {
                window.location.assign(`/login?next=/account/messages/${threadId}`);
                return;
            }

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.files?.[0] ||
                    data?.file?.[0] ||
                    data?.message ||
                    data?.error ||
                    "Failed to send message."
                );
            }

            setBody("");
            setAttachments([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setMessages((current) => mergeMessage(current, data?.chat_message || data));
            window.dispatchEvent(new Event("qot_messages_updated"));
        } catch (requestError: any) {
            setSendError(requestError?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    }

    function chooseAttachments(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;

        const oversizedFile = selectedFiles.find((file) => file.size > MAX_ATTACHMENT_SIZE);
        if (oversizedFile) {
            setSendError(`${oversizedFile.name} is larger than 10 MB.`);
            event.target.value = "";
            return;
        }

        if (attachments.length + selectedFiles.length > 5) {
            setSendError("You can attach up to 5 files at a time.");
            event.target.value = "";
            return;
        }

        setSendError("");
        setAttachments((current) => [...current, ...selectedFiles]);
        event.target.value = "";
    }

    function removeAttachment(index: number) {
        setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
                    <Link href="/account/messages" className="rounded-[13px] bg-white px-4 py-2.5 text-sm font-black ring-1 ring-red-200">
                        Back to inbox
                    </Link>
                    <button type="button" onClick={() => void loadConversation(true)} className="rounded-[13px] bg-red-600 px-4 py-2.5 text-sm font-black text-white">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const participantName = thread?.other_user_name || thread?.seller_name || thread?.buyer_name || "QOT member";
    const listingTitle = thread?.listing?.title || "Marketplace ad";
    const listingImage = getListingImage(thread);
    const listingId = thread?.listing?.id;

    return (
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_65px_rgba(15,23,42,0.11)] ring-1 ring-black/5">
            <header className="border-b border-slate-100 bg-white p-3.5 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <Link href="/account/messages" aria-label="Back to messages" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-slate-100 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        </Link>
                        <span className="relative shrink-0">
                            <span className="flex h-11 w-11 overflow-hidden rounded-[15px] bg-slate-100 text-slate-300 ring-1 ring-slate-200">
                                {listingImage ? (
                                    <img src={listingImage} alt={listingTitle} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                                    </span>
                                )}
                            </span>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white ${otherUserOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-black text-slate-950 sm:text-base">{participantName}</h1>
                            <p className={`mt-0.5 flex items-center gap-1.5 text-[10px] font-black sm:text-[11px] ${otherUserTyping ? "text-orange-600" : otherUserOnline ? "text-emerald-600" : "text-slate-400"}`}>
                                {otherUserTyping ? (
                                    <><span className="flex gap-0.5"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:240ms]" /></span>is typing…</>
                                ) : (
                                    <><span className={`h-2 w-2 rounded-full ${otherUserOnline ? "bg-emerald-500" : "bg-slate-300"}`} />{otherUserOnline ? "Online" : liveConnected ? "Offline" : "Checking status…"}</>
                                )}
                            </p>
                        </div>
                    </div>

                    <div ref={menuAreaRef} className="relative flex shrink-0 items-center gap-1">
                        <button type="button" disabled={actionLoading} onClick={() => void updateThreadState({ is_favourite: !thread?.is_favourite })} aria-label={thread?.is_favourite ? "Remove from favourites" : "Favourite chat"} className={`flex h-10 w-10 items-center justify-center rounded-[13px] transition disabled:opacity-40 ${thread?.is_favourite ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400 hover:text-amber-500"}`}>
                            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" disabled={actionLoading} onClick={() => setMenuOpen((open) => !open)} aria-label="Conversation options" className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40">
                            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-12 z-30 w-48 overflow-hidden rounded-[16px] bg-white p-1.5 shadow-2xl ring-1 ring-slate-200">
                                <button type="button" onClick={() => void updateThreadState({ is_marked_unread: true })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 hover:bg-slate-50">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5 text-orange-500" />Mark as unread
                                </button>
                                <button type="button" onClick={() => void updateThreadState({ is_archived: !thread?.is_archived })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-slate-700 hover:bg-slate-50">
                                    <FontAwesomeIcon icon={thread?.is_archived ? faRotateLeft : faBoxArchive} className="h-3.5 w-3.5 text-blue-500" />{thread?.is_archived ? "Unarchive chat" : "Archive chat"}
                                </button>
                                <button type="button" onClick={() => {
                                    if (thread?.is_spam) {
                                        void updateThreadState({ is_spam: false });
                                    } else {
                                        setMenuOpen(false);
                                        setSpamModalOpen(true);
                                    }
                                }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-red-600 hover:bg-red-50">
                                    <FontAwesomeIcon icon={thread?.is_spam ? faRotateLeft : faShieldHalved} className="h-3.5 w-3.5" />{thread?.is_spam ? "Not spam" : "Report as spam"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {listingId && (
                    <Link href={`/ads/${listingId}`} className="mt-3 flex min-w-0 items-center gap-3 rounded-[16px] bg-slate-50 p-2.5 pr-4 ring-1 ring-slate-100 transition hover:bg-orange-50 sm:ml-auto sm:max-w-md">
                        <span className="h-10 w-12 shrink-0 overflow-hidden rounded-[12px] bg-white">
                            {listingImage ? <img src={listingImage} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-slate-300"><FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" /></span>}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[9px] font-black uppercase tracking-wider text-orange-600">Discussing</span>
                            <span className="mt-0.5 block truncate text-xs font-black text-slate-800">{listingTitle}</span>
                        </span>
                    </Link>
                )}

                {actionError && <InlineError message={actionError} onDismiss={() => setActionError("")} className="mt-3" />}
            </header>

            <div ref={messageListRef} className="h-[54vh] min-h-[380px] max-h-[620px] space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-6">
                <div className="mx-auto flex max-w-md items-start gap-3 rounded-[18px] bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-100">
                    <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-[11px] font-bold leading-5">Keep payments on trusted channels, inspect items before paying, and never share verification codes.</p>
                </div>

                {messages.length > 0 ? messages.map((message: any) => {
                    const mine = String(getSenderId(message)) === String(currentUser?.id);
                    const legacyImage = message?.image;
                    const messageAttachments = Array.isArray(message?.attachments) ? message.attachments : [];

                    return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[86%] sm:max-w-[70%] ${mine ? "text-right" : "text-left"}`}>
                                <p className="mb-1.5 px-1 text-[10px] font-black text-slate-400">{mine ? "You" : message?.sender_name || participantName}</p>
                                <div className={`overflow-hidden rounded-[20px] px-4 py-3 text-left shadow-sm ${mine ? "rounded-br-[6px] bg-orange-500 text-white" : "rounded-bl-[6px] bg-white text-slate-800 ring-1 ring-slate-200"}`}>
                                    {legacyImage && <img src={legacyImage} alt="Message attachment" className="mb-3 max-h-72 w-full rounded-[14px] object-cover" />}
                                    {messageAttachments.map((attachment: any) => {
                                        const fileUrl = attachment?.file_url || attachment?.file;
                                        if (!fileUrl) return null;

                                        if (attachment?.file_type === "image") {
                                            return <a key={attachment.id || fileUrl} href={fileUrl} target="_blank" rel="noreferrer" className="mb-3 block last:mb-0"><img src={fileUrl} alt={attachment?.original_name || "Message attachment"} className="max-h-72 w-full rounded-[14px] object-cover" /></a>;
                                        }

                                        return (
                                            <a key={attachment.id || fileUrl} href={fileUrl} target="_blank" rel="noreferrer" className={`mb-2 flex items-center gap-3 rounded-[14px] p-3 last:mb-0 ${mine ? "bg-white/15 text-white" : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"}`}>
                                                <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 shrink-0" />
                                                <span className="min-w-0"><span className="block truncate text-xs font-black">{attachment?.original_name || "Attached file"}</span><span className={`mt-0.5 block text-[9px] font-bold ${mine ? "text-white/70" : "text-slate-400"}`}>{formatFileSize(attachment?.size)}</span></span>
                                            </a>
                                        );
                                    })}
                                    {(message?.body || message?.message) && <MessageText text={message?.body || message?.message} mine={mine} />}
                                </div>
                                <p className="mt-1.5 px-1 text-[9px] font-bold text-slate-400">{formatMessageTime(message?.created_at)}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="flex h-[260px] flex-col items-center justify-center text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-50 text-orange-600"><FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" /></span>
                        <h2 className="mt-4 text-lg font-black text-slate-950">Start the conversation</h2>
                        <p className="mt-1 max-w-sm text-sm font-semibold leading-6 text-slate-500">Ask a clear question about the ad to get the deal moving.</p>
                    </div>
                )}

                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200" aria-label={`${participantName} is typing`}>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3.5 sm:p-5">
                {sendError && <InlineError message={sendError} onDismiss={() => setSendError("")} className="mb-3" />}
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {QUICK_MESSAGES.map((message) => (
                        <button key={message} type="button" onClick={() => updateComposer(message)} className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-[11px] font-black text-orange-700 ring-1 ring-orange-100 transition hover:bg-orange-100">{message.trim()}</button>
                    ))}
                </div>

                {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                            <span key={`${file.name}-${file.lastModified}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-[13px] bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                                <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5 shrink-0 text-orange-500" /><span className="max-w-48 truncate">{file.name}</span><span className="shrink-0 text-[9px] text-slate-400">{formatFileSize(file.size)}</span>
                                <button type="button" onClick={() => removeAttachment(index)} aria-label={`Remove ${file.name}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 hover:text-red-600"><FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" /></button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-2 rounded-[20px] bg-slate-100 p-2 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 sm:gap-3">
                    <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={chooseAttachments} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={sending || attachments.length >= 5} aria-label="Attach files" title="Attach up to 5 files, 10 MB each" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-orange-600 disabled:opacity-40"><FontAwesomeIcon icon={faPaperclip} className="h-4 w-4" /></button>
                    <textarea value={body} onChange={(event) => updateComposer(event.target.value)} onBlur={stopTyping} placeholder="Write a message..." rows={1} maxLength={1000} className="max-h-28 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 sm:px-3" />
                    <button type="submit" disabled={sending || (!body.trim() && attachments.length === 0)} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-orange-500 text-white shadow-[0_8px_18px_rgba(249,115,22,0.20)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:px-5">
                        {sending ? <span className="text-xs font-black">...</span> : <><FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" /><span className="ml-2 hidden text-sm font-black sm:inline">Send</span></>}
                    </button>
                </div>
            </form>

            <AdActionModal open={spamModalOpen} title="Report this chat as spam?" description={`This moves the conversation with ${participantName} to Spam and sends a report to QOT moderation. You can restore it later.`} confirmLabel="Report spam" destructive loading={actionLoading} error={actionError} onClose={() => { if (actionLoading) return; setSpamModalOpen(false); setActionError(""); }} onConfirm={() => void confirmSpam()} />
        </section>
    );
}
