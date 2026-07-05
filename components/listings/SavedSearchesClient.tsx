"use client";

import { useEffect, useState } from "react";

function formatDate(value: string) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function SavedSearchesClient() {
    const [mounted, setMounted] = useState(false);
    const [searches, setSearches] = useState<any[]>([]);

    function loadSearches() {
        const saved = JSON.parse(localStorage.getItem("qot_saved_searches") || "[]");
        setSearches(saved);
    }

    useEffect(() => {
        loadSearches();
        setMounted(true);
    }, []);

    function removeSearch(id: number | string) {
        const remaining = searches.filter((item) => String(item.id) !== String(id));

        localStorage.setItem("qot_saved_searches", JSON.stringify(remaining));
        setSearches(remaining);
    }

    function clearAll() {
        const confirmed = window.confirm("Clear all saved searches?");

        if (!confirmed) return;

        localStorage.removeItem("qot_saved_searches");
        setSearches([]);
    }

    if (!mounted) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Your Saved Searches
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {searches.length} saved search{searches.length === 1 ? "" : "es"}.
                    </p>
                </div>

                {searches.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {searches.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    No saved searches yet. Go to listings, apply filters, and click Save Search.
                </div>
            ) : (
                <div className="grid gap-4">
                    {searches.map((search) => (
                        <article
                            key={search.id}
                            className="rounded-2xl border bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div>
                                    <h3 className="font-bold text-slate-900">{search.title}</h3>

                                    {search.created_at && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            Saved on {formatDate(search.created_at)}
                                        </p>
                                    )}

                                    <p className="mt-2 break-all text-sm text-slate-500">
                                        {search.url}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href={search.url}
                                        className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                                    >
                                        Open Search
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => removeSearch(search.id)}
                                        className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}