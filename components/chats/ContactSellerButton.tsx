"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCommentDots,
    faMoneyBillWave,
    faPaperPlane,
    faPhone,
    faSpinner,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import InlineError from "@/components/forms/InlineError";

type ContactMode = "question" | "offer" | "callback";

type ContactSellerButtonProps = {
    listingId: number | string;
    listing?: any;
    compact?: boolean;
};

const QUICK_QUESTIONS = [
    "Hi, is this ad still available?",
    "Hi, what is your best price for this ad?",
    "Hi, can I inspect this item before buying?",
    "Hi, where can we meet so I can see this item?",
];

function getThreadId(data: any) {
    return data?.id || data?.thread_id || data?.thread?.id || data?.data?.id || "";
}

function getLoginNext(listingId: string | number) {
    const fallback = `/ads/${listingId}`;
    if (typeof window === "undefined") return `/login?next=${fallback}`;
    return `/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}` || fallback)}`;
}

function apiError(data: any, fallback: string) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    for (const value of Object.values(data || {})) {
        if (Array.isArray(value) && value[0]) return String(value[0]);
        if (typeof value === "string") return value;
    }
    return fallback;
}

function normalizePhoneInput(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("256")) return `+${digits.slice(0, 12)}`;
    if (digits.startsWith("0")) return `+256${digits.slice(1, 10)}`;
    return `+256${digits.slice(0, 9)}`;
}

export default function ContactSellerButton({
    listingId,
    listing,
    compact = false,
}: ContactSellerButtonProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<ContactMode>("question");
    const [question, setQuestion] = useState(QUICK_QUESTIONS[0]);
    const [customQuestion, setCustomQuestion] = useState(false);
    const [offerAmount, setOfferAmount] = useState("");
    const [callbackName, setCallbackName] = useState("");
    const [callbackPhone, setCallbackPhone] = useState("+256");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const customQuestionRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const close = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) setOpen(false);
        };
        document.addEventListener("keydown", close);

        void fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
            .then((response) => response.ok ? response.json() : null)
            .then((payload) => {
                const user = payload?.user || payload?.data || payload;
                if (user?.full_name) setCallbackName((current) => current || user.full_name);
                if (user?.phone) setCallbackPhone((current) => current === "+256" ? user.phone : current);
            })
            .catch(() => null);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", close);
        };
    }, [open, loading]);

    const price = Number(listing?.price || 0);
    const suggestions = useMemo(() => {
        if (!Number.isFinite(price) || price <= 0) return [];
        return [0.85, 0.9, 0.95].map((ratio) =>
            Math.max(1000, Math.round((price * ratio) / 1000) * 1000)
        );
    }, [price]);

    async function submit() {
        if (loading) return;
        setError("");

        if (mode === "question" && !question.trim()) {
            setError("Write or choose a question for the seller.");
            return;
        }
        if (mode === "offer" && Number(offerAmount) <= 0) {
            setError("Enter an offer amount greater than zero.");
            return;
        }
        if (mode === "offer" && price > 0 && Number(offerAmount) < price * 0.5) {
            setError(`Offers cannot be below 50% of the ad price (UGX ${(price * 0.5).toLocaleString("en-UG", { maximumFractionDigits: 0 })}).`);
            return;
        }
        if (mode === "callback" && callbackName.trim().length < 2) {
            setError("Enter the name the seller should ask for.");
            return;
        }

        setLoading(true);
        try {
            const threadResponse = await fetch("/api/proxy/chats/threads/", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listing_id: listingId }),
            });

            if (threadResponse.status === 401) {
                window.location.assign(getLoginNext(listingId));
                return;
            }

            const threadData = await threadResponse.json().catch(() => ({}));
            if (!threadResponse.ok) throw new Error(apiError(threadData, "Failed to start chat."));

            const threadId = getThreadId(threadData);
            if (!threadId) throw new Error("The conversation could not be opened.");

            const messagePayload = mode === "offer"
                ? { message_type: "offer", offer_amount: Number(offerAmount) }
                : mode === "callback"
                    ? {
                        message_type: "callback",
                        callback_name: callbackName.trim(),
                        callback_phone: callbackPhone,
                    }
                    : { message_type: "text", body: question.trim() };

            const messageResponse = await fetch(`/api/proxy/chats/threads/${threadId}/messages/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messagePayload),
            });
            const messageData = await messageResponse.json().catch(() => ({}));
            if (!messageResponse.ok) throw new Error(apiError(messageData, "Failed to send your request."));

            window.location.assign(`/account/messages/${threadId}`);
        } catch (requestError: any) {
            setError(requestError?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    const modal = open && mounted ? createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Contact seller"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) setOpen(false);
            }}
            className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
        >
            <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Contact seller</p>
                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Start the conversation</h2>
                    </div>
                    <button type="button" onClick={() => !loading && setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900" aria-label="Close">
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-3 gap-2 rounded-[18px] bg-slate-100 p-1.5">
                        {([
                            ["question", faCommentDots, "Question"],
                            ["offer", faMoneyBillWave, "Make offer"],
                            ["callback", faPhone, "Callback"],
                        ] as const).map(([value, icon, label]) => (
                            <button key={value} type="button" onClick={() => { setMode(value); setError(""); }} className={`flex min-h-12 items-center justify-center gap-1.5 rounded-[14px] px-2 text-[10px] font-black transition sm:text-xs ${mode === value ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"}`}>
                                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />{label}
                            </button>
                        ))}
                    </div>

                    {mode === "question" && (
                        <div className="mt-5">
                            <p className="text-xs font-black text-slate-700">Choose a quick question</p>
                            <div className="mt-3 grid gap-2">
                                {QUICK_QUESTIONS.map((item) => (
                                    <button key={item} type="button" onClick={() => { setCustomQuestion(false); setQuestion(item); }} className={`rounded-[15px] px-4 py-3 text-left text-xs font-bold leading-5 ring-1 transition ${!customQuestion && question === item ? "bg-orange-50 text-orange-800 ring-orange-200" : "bg-white text-slate-600 ring-slate-200 hover:ring-orange-200"}`}>{item}</button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomQuestion(true);
                                        setQuestion("");
                                        window.setTimeout(() => customQuestionRef.current?.focus(), 0);
                                    }}
                                    className={`rounded-[15px] px-4 py-3 text-left text-xs font-black leading-5 ring-1 transition ${customQuestion ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-200 hover:ring-orange-200"}`}
                                >
                                    Write a custom message
                                    <span className={`mt-0.5 block text-[10px] font-semibold ${customQuestion ? "text-slate-300" : "text-slate-400"}`}>Ask the seller anything about this ad.</span>
                                </button>
                            </div>
                            {customQuestion && (
                                <textarea ref={customQuestionRef} value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} maxLength={1000} placeholder="Type your message to the seller…" className="mt-3 w-full resize-none rounded-[16px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" />
                            )}
                        </div>
                    )}

                    {mode === "offer" && (
                        <div className="mt-5">
                            <label className="text-xs font-black text-slate-700" htmlFor="seller-offer">Your offer (UGX)</label>
                            <input id="seller-offer" inputMode="numeric" value={offerAmount} onChange={(event) => setOfferAmount(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 850000" className="mt-2 h-14 w-full rounded-[16px] border border-slate-200 px-4 text-lg font-black outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" />
                            {suggestions.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                    {suggestions.map((amount) => <button key={amount} type="button" onClick={() => setOfferAmount(String(amount))} className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-[11px] font-black text-orange-700">UGX {amount.toLocaleString("en-UG")}</button>)}
                                </div>
                            )}
                            <p className="mt-4 rounded-[15px] bg-amber-50 px-4 py-3 text-[11px] font-bold leading-5 text-amber-800">Offers must be at least 50% of the ad price. An offer is not a payment—inspect the item before paying.</p>
                        </div>
                    )}

                    {mode === "callback" && (
                        <div className="mt-5 grid gap-4">
                            <p className="text-xs font-semibold leading-5 text-slate-500">Leave the name and Ugandan mobile number the seller should call.</p>
                            <label className="text-xs font-black text-slate-700">Name
                                <input value={callbackName} onChange={(event) => setCallbackName(event.target.value)} maxLength={150} placeholder="Your name" className="mt-2 h-12 w-full rounded-[15px] border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" />
                            </label>
                            <label className="text-xs font-black text-slate-700">Phone number
                                <input type="tel" inputMode="tel" value={callbackPhone} onChange={(event) => setCallbackPhone(normalizePhoneInput(event.target.value))} placeholder="+256700000001" className="mt-2 h-12 w-full rounded-[15px] border border-slate-200 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" />
                            </label>
                            <p className="text-[10px] font-semibold text-slate-400">Only the seller and QOT moderation can see this number in the conversation.</p>
                        </div>
                    )}

                    {error && <InlineError message={error} onDismiss={() => setError("")} className="mt-4" />}
                    <button type="button" onClick={() => void submit()} disabled={loading} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-60">
                        <FontAwesomeIcon icon={loading ? faSpinner : mode === "callback" ? faPhone : faPaperPlane} className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Sending…" : mode === "offer" ? "Send offer" : mode === "callback" ? "Request callback" : "Send question"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-600">
                {!compact && <FontAwesomeIcon icon={faCommentDots} className="h-4 w-4" />}
                Chat Seller
            </button>
            {modal}
        </>
    );
}
