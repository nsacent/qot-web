"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faBookmark,
    faCalendarDays,
    faMagnifyingGlass,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import QotLoader from "@/components/common/QotLoader";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.saved_searches)) return data.saved_searches;
    if (Array.isArray(data?.searches)) return data.searches;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.saved_searches)) return data.data.saved_searches;
    if (Array.isArray(data?.data?.searches)) return data.data.searches;
    return [];
}

function getNextPage(data: any) {
    return data?.next || data?.data?.next || data?.pagination?.next || null;
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
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    async function loadItems() {
        setLoading(true);
        setError("");

        try {
            const loadedItems: any[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage && page <= 20) {
                const response = await fetch(
                    `/api/proxy/searches/saved/?page=${page}&page_size=100`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                );
                const data = await response.json().catch(() => ({}));

                if (response.status === 401 || response.status === 403) {
                    window.location.href = "/login?next=%2Faccount%2Fsaved%3Ftab%3Dsearches";
                    return;
                }

                if (!response.ok) {
                    throw new Error(data?.detail || "Failed to load saved searches.");
                }

                loadedItems.push(...getArray(data));
                hasNextPage = Boolean(getNextPage(data));
                page += 1;
            }

            const uniqueItems = Array.from(
                new Map(
                    loadedItems.map((item) => [
                        String(item?.id || `${item?.name}-${item?.created_at}`),
                        item,
                    ])
                ).values()
            );

            setItems(uniqueItems);
        } catch (err: any) {
            setError(err.message || "Failed to load saved searches.");
            setItems([]);
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
        setError("");

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
        setClearing(true);
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

        setClearing(false);
        setConfirmClearOpen(false);

        if (failed) {
            setError("Some saved searches could not be removed. Please try again.");
            await loadItems();
            return;
        }

        setItems([]);
    }

    return (
        <section className="py-4 text-slate-950 sm:py-6">
            <div className="rounded-[30px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] ring-1 ring-black/5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="flex h-14 w-14 items-center justify-center rounded-[19px] bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faBookmark} className="h-5 w-5" />
                        </span>
                        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                            Saved Searches
                        </h2>
                        <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                            Reopen your favourite searches without selecting every filter again.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setConfirmClearOpen(true)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] bg-red-50 px-4 text-xs font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100"
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                Clear all
                            </button>
                        )}
                        <a
                            href="/ads"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-orange-500"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" />
                            Find ads
                        </a>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16">
                        <QotLoader />
                    </div>
                ) : items.length === 0 ? (
                    <div className="mt-7 rounded-[26px] bg-slate-50 px-5 py-12 text-center ring-1 ring-slate-100 sm:px-8">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-orange-500 shadow-sm ring-1 ring-slate-100">
                            <FontAwesomeIcon icon={faBookmark} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-xl font-black text-slate-950">
                            No saved searches yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Apply filters while browsing ads, then tap “Save search” to keep them here.
                        </p>
                        <a
                            href="/ads"
                            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[15px] bg-orange-500 px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)] hover:bg-orange-600"
                        >
                            Browse ads
                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                        </a>
                    </div>
                ) : (
                    <div className="mt-7 grid gap-3 sm:gap-4">
                        {items.map((item) => {
                            const params = getSearchParams(item);
                            const savedDate = formatDate(item.created_at);

                            return (
                                <article
                                    key={item.id}
                                    className="overflow-hidden rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100 transition hover:ring-orange-200 sm:p-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-orange-500 shadow-sm ring-1 ring-slate-100">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-base font-black text-slate-950 sm:text-lg">
                                                {item.name || "Saved search"}
                                            </h3>
                                            {savedDate && (
                                                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                    <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3" />
                                                    Saved {savedDate}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            aria-label={`Remove ${item.name || "saved search"}`}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {Object.keys(params).length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {Object.entries(params).map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="max-w-full truncate rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 ring-1 ring-slate-200"
                                                >
                                                    <span className="text-slate-400">{getParamLabel(key)}:</span>{" "}
                                                    {String(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <a
                                        href={getSearchUrl(item)}
                                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[15px] bg-white text-xs font-black text-orange-600 shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-500 hover:text-white"
                                    >
                                        Open this search
                                        <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                    </a>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {confirmClearOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:p-5">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="clear-saved-searches-title"
                        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-6"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-red-50 text-red-600">
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </span>
                        <h2 id="clear-saved-searches-title" className="mt-5 text-xl font-black text-slate-950">
                            Clear all saved searches?
                        </h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                            This removes every saved filter. You cannot undo this action.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmClearOpen(false)}
                                disabled={clearing}
                                className="h-12 rounded-[16px] bg-slate-100 text-sm font-black text-slate-700 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                disabled={clearing}
                                className="h-12 rounded-[16px] bg-red-600 text-sm font-black text-white disabled:opacity-60"
                            >
                                {clearing ? "Clearing…" : "Clear all"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
