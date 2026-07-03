"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.threads)) return data.threads;
    return [];
}

export default function MessagesClient() {
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadThreads() {
            const token = localStorage.getItem("qot_access_token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/chats/threads/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.detail ||
                        data?.message ||
                        data?.error ||
                        "Failed to load messages."
                    );
                }

                setThreads(getArray(data));
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        loadThreads();
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading messages...
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
        <section className="space-y-4">
            {threads.length > 0 ? (
                threads.map((thread: any) => (
                    <a
                        key={thread.id}
                        href={`/messages/${thread.id}`}
                        className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                    >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {thread.listing?.title ||
                                        thread.listing_title ||
                                        thread.title ||
                                        "Chat Thread"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {thread.last_message?.body ||
                                        thread.last_message ||
                                        "Open conversation"}
                                </p>
                            </div>

                            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                                Open Chat
                            </span>
                        </div>
                    </a>
                ))
            ) : (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have no messages yet.
                </div>
            )}
        </section>
    );
}