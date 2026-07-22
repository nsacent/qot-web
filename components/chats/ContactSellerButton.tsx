"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCommentDots,
    faPaperPlane,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type ContactSellerButtonProps = {
    listingId: number | string;
    compact?: boolean;
};

async function readApiError(response: Response) {
    const text = await response.text();

    if (!text) return "Failed to start chat.";

    try {
        const data = JSON.parse(text);

        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        const firstKey = Object.keys(data || {})[0];
        const firstValue = firstKey ? data[firstKey] : "";

        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === "string") return firstValue;

        return "Failed to start chat.";
    } catch {
        return text;
    }
}

function getThreadId(data: any) {
    return (
        data?.id ||
        data?.thread_id ||
        data?.thread?.id ||
        data?.data?.id ||
        data?.data?.thread_id ||
        data?.data?.thread?.id ||
        ""
    );
}

function getLoginNext(listingId: string | number) {
    if (typeof window === "undefined") {
        return `/login?next=/ads/${listingId}`;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;

    return `/login?next=${encodeURIComponent(
        currentPath || `/ads/${listingId}`
    )}`;
}

export default function ContactSellerButton({
    listingId,
    compact = false,
}: ContactSellerButtonProps) {
    const [loading, setLoading] = useState(false);

    async function createThread() {
        if (loading) return;

        setLoading(true);

        const payloads = [{ listing: listingId }, { listing_id: listingId }];

        try {
            let lastError = "Failed to start chat.";

            for (const payload of payloads) {
                const response = await fetch("/api/proxy/chats/threads/", {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.status === 401) {
                    window.location.href = getLoginNext(listingId);
                    return;
                }

                if (response.ok) {
                    const data = await response.json().catch(() => null);
                    const threadId = getThreadId(data);

                    if (threadId) {
                        window.location.href = `/account/messages/${threadId}`;
                        return;
                    }

                    window.location.href = "/account/messages";
                    return;
                }

                lastError = await readApiError(response);
            }

            throw new Error(lastError);
        } catch (error: any) {
            alert(error?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    const buttonClass =
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <button
            type="button"
            onClick={createThread}
            disabled={loading}
            className={buttonClass}
        >
            {!compact && (
                <FontAwesomeIcon
                    icon={loading ? faSpinner : faCommentDots}
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
            )}

            {loading ? "Starting chat..." : "Chat Seller"}
        </button>
    );
}
