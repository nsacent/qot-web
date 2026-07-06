"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "qot_recently_viewed";

function formatPrice(price: any) {
    if (!price) return "Contact seller";
    return `UGX ${Number(price).toLocaleString()}`;
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

export default function RecentlyViewedClient() {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    function loadItems() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            setItems(saved);
        } catch {
            setItems([]);
        }
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
        const confirmed = window.confirm("Clear recently viewed listings?");

        if (!confirmed) return;

        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    }

    if (!mounted) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Your Recently Viewed Adverts
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {items.length} listing{items.length === 1 ? "" : "s"} viewed recently.
                    </p>
                </div>

                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    No recently viewed listings yet. Open a few adverts and they will appear here.
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                        >
                            <a
                                href={`/listings/${item.id}`}
                                className="flex h-52 items-center justify-center bg-slate-200 text-slate-500"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    "No image"
                                )}
                            </a>

                            <div className="p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                    {item.category || "Listing"}
                                </p>

                                <a href={`/listings/${item.id}`}>
                                    <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900 hover:text-orange-600">
                                        {item.title}
                                    </h3>
                                </a>

                                <p className="mt-2 text-sm text-slate-500">
                                    {item.city || "Uganda"}
                                </p>

                                <p className="mt-4 text-xl font-bold text-orange-600">
                                    {formatPrice(item.price)}
                                </p>

                                {item.viewed_at && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Viewed on {formatDate(item.viewed_at)}
                                    </p>
                                )}

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <a
                                        href={`/listings/${item.id}`}
                                        className="text-sm font-semibold text-slate-900 hover:text-orange-600"
                                    >
                                        Open advert →
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="text-sm font-semibold text-red-600 hover:text-red-700"
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