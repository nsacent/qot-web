"use client";

import { useEffect, useState } from "react";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

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

    return labels[key] || key.replaceAll("_", " ");
}

function getSearchParams(item: any) {
    return {
        ...(item?.query ? { q: item.query } : {}),
        ...(item?.filters && typeof item.filters === "object" ? item.filters : {}),
    };
}

function getSearchUrl(item: any) {
    const query = new URLSearchParams();

    Object.entries(getSearchParams(item)).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim()) {
            query.set(key, String(value));
        }
    });

    const text = query.toString();
    return text ? `/ads?${text}` : "/ads";
}

export default function SavedSearchesClient() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadItems() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/proxy/searches/saved/", {
                credentials: "include",
                cache: "no-store",
            });
            const data = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                window.location.href = "/login?next=/saved-searches";
                return;
            }

            if (!response.ok) throw new Error(data?.detail || "Failed to load saved searches.");
            setItems(getArray(data));
        } catch (err: any) {
            setError(err.message || "Failed to load saved searches.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
        window.addEventListener("qot_saved_searches_updated", loadItems);

        return () => window.removeEventListener("qot_saved_searches_updated", loadItems);
    }, []);

    async function removeItem(id: number | string) {
        const response = await fetch(`/api/proxy/searches/saved/${id}/`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok && response.status !== 204) {
            const data = await response.json().catch(() => ({}));
            setError(data?.detail || "Failed to remove saved search.");
            return;
        }

        setItems((current) => current.filter((item) => String(item.id) !== String(id)));
    }

    async function clearAll() {
        if (!window.confirm("Clear all saved searches?")) return;

        setError("");
        const results = await Promise.allSettled(
            items.map((item) =>
                fetch(`/api/proxy/searches/saved/${item.id}/`, {
                    method: "DELETE",
                    credentials: "include",
                })
            )
        );
        const failed = results.some(
            (result) => result.status === "rejected" || !result.value.ok
        );

        if (failed) {
            setError("Some saved searches could not be removed. Please try again.");
            await loadItems();
            return;
        }

        setItems([]);
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Saved Searches</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Your Saved Search Filters</h1>
                    <p className="mt-2 text-slate-600">Quickly reopen adverts you frequently search for.</p>
                </div>

                {items.length > 0 && (
                    <button type="button" onClick={clearAll} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">
                        Clear All
                    </button>
                )}
            </div>

            {error && <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div>}

            {loading ? (
                <div className="rounded-2xl bg-white p-8 text-slate-600 ring-1 ring-black/5">Loading saved searches...</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have not saved any searches yet. Go to ads, apply filters, then click “Save search”.
                </div>
            ) : (
                <div className="grid gap-5">
                    {items.map((item) => {
                        const params = getSearchParams(item);

                        return (
                            <article key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{item.name || "Saved search"}</h2>
                                        {item.created_at && <p className="mt-1 text-sm text-slate-500">Saved on {formatDate(item.created_at)}</p>}

                                        {Object.keys(params).length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {Object.entries(params).map(([key, value]) => (
                                                    <span key={key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                        {getParamLabel(key)}: {String(value)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2 sm:min-w-40">
                                        <a href={getSearchUrl(item)} className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600">Open Search</a>
                                        <button type="button" onClick={() => removeItem(item.id)} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100">Remove</button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
