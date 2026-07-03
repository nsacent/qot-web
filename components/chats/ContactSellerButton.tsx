"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ContactSellerButtonProps = {
    listingId: number | string;
};

export default function ContactSellerButton({ listingId }: ContactSellerButtonProps) {
    const [loading, setLoading] = useState(false);

    async function createThread() {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setLoading(true);

        const payloads = [
            { listing: listingId },
            { listing_id: listingId },
        ];

        try {
            let lastError = "";

            for (const payload of payloads) {
                const response = await fetch(`${API_BASE_URL}/chats/threads/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json().catch(() => null);

                if (response.ok) {
                    const threadId = data?.id || data?.thread?.id || data?.data?.id;

                    if (threadId) {
                        window.location.href = `/messages/${threadId}`;
                        return;
                    }

                    window.location.href = "/messages";
                    return;
                }

                lastError =
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to start chat.";
            }

            throw new Error(lastError);
        } catch (error: any) {
            alert(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={createThread}
            disabled={loading}
            className="block w-full rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
            {loading ? "Starting chat..." : "Contact Seller"}
        </button>
    );
}