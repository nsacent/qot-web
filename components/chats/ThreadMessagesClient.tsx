"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.messages)) return data.messages;
    return [];
}

export default function ThreadMessagesClient({
    threadId,
}: {
    threadId: string;
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    async function loadMessages() {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/chats/threads/${threadId}/messages/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    "Failed to load chat messages."
                );
            }

            setMessages(getArray(data));
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threadId]);

    async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        if (!body.trim()) return;

        setSending(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/chats/threads/${threadId}/messages/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        body,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to send message."
                );
            }

            setBody("");
            await loadMessages();
        } catch (err: any) {
            alert(err.message || "Something went wrong.");
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading chat...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
                <a
                    href="/messages"
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    ← Back to messages
                </a>
            </div>

            <div className="max-h-[520px] space-y-4 overflow-y-auto p-5">
                {messages.length > 0 ? (
                    messages.map((message: any) => (
                        <div key={message.id} className="rounded-2xl bg-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-700">
                                {message.sender?.full_name ||
                                    message.sender_name ||
                                    "QOT User"}
                            </p>
                            <p className="mt-2 whitespace-pre-line text-slate-800">
                                {message.body || message.message || ""}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                        No messages yet. Send the first message.
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="border-t p-5">
                <div className="flex gap-3">
                    <input
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <button
                        type="submit"
                        disabled={sending}
                        className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </div>
            </form>
        </section>
    );
}