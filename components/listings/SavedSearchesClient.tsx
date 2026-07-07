"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "qot_saved_searches";

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

function getSavedSearches() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function getParamLabel(key: string) {
    const labels: Record<string, string> = {
        q: "Keyword",
        category: "Category",
        city: "City",
        region: "Region",
        min_price: "Min price",
        max_price: "Max price",
        condition: "Condition",
        sort: "Sort",
        brand: "Brand",
        ram: "RAM",
        bedrooms: "Bedrooms",
    };

    return labels[key] || key;
}

export default function SavedSearchesClient() {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    function loadItems() {
        setItems(getSavedSearches());
    }

    useEffect(() => {
        loadItems();
        setMounted(true);
    }, []);

    function removeItem(id: number | string) {
        const updated = items.filter((item) => String(item.id) !== String(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setItems(updated);
    }

    function clearAll() {
        const confirmed = window.confirm("Clear all saved searches?");
        if (!confirmed) return;

        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    }

    if (!mounted) {
        return null;
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Saved Searches
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Your Saved Search Filters
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Quickly reopen adverts you frequently search for.
                    </p>
                </div>

                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have not saved any searches yet. Go to listings, apply filters,
                    then click “Save Search”.
                </div>
            ) : (
                <div className="grid gap-5">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-2xl border bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {item.title || "Saved search"}
                                    </h2>

                                    {item.created_at && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            Saved on {formatDate(item.created_at)}
                                        </p>
                                    )}

                                    {item.params && Object.keys(item.params).length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {Object.entries(item.params).map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                                                >
                                                    {getParamLabel(key)}: {String(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2 sm:min-w-40">
                                    <a
                                        href={item.url || "/listings"}
                                        className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                                    >
                                        Open Search
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
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