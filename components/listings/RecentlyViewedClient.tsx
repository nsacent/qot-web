"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClock,
    faLocationDot,
    faMagnifyingGlass,
    faTrash,
} from "@/lib/faIcons";

const STORAGE_KEY = "qot_recently_viewed";

function formatPrice(price: any) {
    if (!price) return "Contact seller";
    return `UGX ${Number(price).toLocaleString()}`;
}

function formatDate(value: string) {
    if (!value) return "Recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleDateString("en-UG", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function RecentlyViewedClient() {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    function loadItems() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            setItems(Array.isArray(saved) ? saved : []);
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
        const confirmed = window.confirm("Clear all recently viewed ads?");

        if (!confirmed) return;

        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    }

    if (!mounted) {
        return (
            <section className="py-3 sm:py-6">
                <div className="h-52 animate-pulse rounded-[34px] bg-slate-200/70" />
            </section>
        );
    }

    return (
        <section className="py-3 sm:py-6">
            <header className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-5 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
                <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                                <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                                Your browsing history
                            </p>
                        </div>

                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                            Pick up where you left off.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300">
                            Return to ads you opened recently without having to search for them again.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <a
                            href="/ads"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-orange-50"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-orange-500" />
                            Browse Ads
                        </a>

                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                Clear History
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="mt-6 rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] ring-1 ring-black/5 sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Recently viewed ads</h2>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                            {items.length} ad{items.length === 1 ? "" : "s"} in your history
                        </p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600">
                        Stored on this device
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-50 text-orange-500">
                            <FontAwesomeIcon icon={faClock} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-xl font-black text-slate-950">No browsing history yet</h3>
                        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Open a few ads and they will appear here automatically for quick access.
                        </p>
                        <a
                            href="/ads"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600"
                        >
                            Explore the marketplace
                            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5 rotate-180" />
                        </a>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="group overflow-hidden rounded-[26px] bg-slate-50 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                            >
                                <a
                                    href={`/ads/${item.id}`}
                                    className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-200 text-sm font-bold text-slate-400"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title || "Recently viewed ad"}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        "No image available"
                                    )}

                                    <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur">
                                        {item.category || "Ad"}
                                    </span>
                                </a>

                                <div className="p-5">
                                    <a href={`/ads/${item.id}`}>
                                        <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6 text-slate-950 transition hover:text-orange-600">
                                            {item.title || "Untitled ad"}
                                        </h3>
                                    </a>

                                    <p className="mt-2 text-lg font-black text-orange-600">
                                        {formatPrice(item.price)}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-[11px] font-bold text-slate-500">
                                        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                            <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 text-orange-500" />
                                            {item.city || "Uganda"}
                                        </span>
                                        <span className="shrink-0">{formatDate(item.viewed_at)}</span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                                        <a
                                            href={`/ads/${item.id}`}
                                            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-orange-500"
                                        >
                                            View Ad
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            aria-label={`Remove ${item.title || "ad"} from recently viewed`}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
