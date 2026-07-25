"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCamera,
    faClock,
    faEye,
    faLocationDot,
    faMagnifyingGlass,
    faStar,
    faTag,
    faTrash,
} from "@/lib/faIcons";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import { listingIsCurrentlyFeatured } from "@/lib/listingExpiry";

const STORAGE_KEY = "qot_recently_viewed";

function formatPrice(price: any) {
    if (!price) return "Contact seller";
    return `UGX ${Number(price).toLocaleString()}`;
}

function getListing(item: any) {
    return item?.live_listing || item;
}

function getTitle(item: any) {
    return getListing(item)?.title || item?.title || "Untitled ad";
}

function getImage(item: any) {
    const listing = getListing(item);
    return (
        listing?.primary_image ||
        listing?.image ||
        listing?.cover_image ||
        listing?.images?.find?.((image: any) => image?.is_primary)?.card_image_url ||
        listing?.images?.find?.((image: any) => image?.is_primary)?.image_url ||
        listing?.images?.[0]?.card_image_url ||
        listing?.images?.[0]?.image_url ||
        listing?.images?.[0]?.image ||
        item?.image ||
        ""
    );
}

function getCategory(item: any) {
    const listing = getListing(item);
    return listing?.category?.name || listing?.category_name || item?.category || "Ad";
}

function getLocation(item: any) {
    const listing = getListing(item);
    const city = listing?.city?.name || listing?.city_name || item?.city || "Uganda";
    const region = listing?.city?.region?.name || listing?.region_name || item?.region || "";
    return region && region !== city ? `${city}, ${region}` : city;
}

function getImageCount(item: any) {
    const listing = getListing(item);
    return Number(listing?.image_count || listing?.images?.length || item?.image_count || 0);
}

function formatCondition(value: unknown) {
    const condition = String(value || "").trim();
    if (!condition) return "";
    return condition.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RecentlyViewedClient() {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    async function loadItems() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            const history = Array.isArray(saved) ? saved : [];
            setItems(history);

            const enriched = await Promise.all(
                history.map(async (item: any) => {
                    try {
                        const response = await fetch(`/api/proxy/listings/${item.id}/`, {
                            credentials: "include",
                            cache: "no-store",
                        });
                        if (!response.ok) return item;

                        const data = await response.json().catch(() => ({}));
                        const listing = data?.listing || data?.data || data;
                        return listing?.id ? { ...item, live_listing: listing } : item;
                    } catch {
                        return item;
                    }
                })
            );
            setItems(enriched);
        } catch {
            setItems([]);
        }
    }

    useEffect(() => {
        loadItems();
        setMounted(true);
    }, []);

    const normalizedQuery = query.trim().toLowerCase();
    const visibleItems = normalizedQuery
        ? items.filter((item) =>
            [getTitle(item), getCategory(item), getLocation(item)]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)
        )
        : items;

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
            <section className="py-0 md:py-6">
                <div className="h-52 animate-pulse rounded-[34px] bg-slate-200/70" />
            </section>
        );
    }

    return (
        <section className="py-0 md:py-6">
            <header className="relative hidden overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-8 py-9 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] md:block">
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

            <div className="mt-0 rounded-[22px] bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.09)] ring-1 ring-black/5 md:mt-6 md:rounded-[34px] md:p-7">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 md:gap-4 md:pb-5">
                    <div>
                        <h2 className="hidden text-xl font-black text-slate-950 md:block">Recently viewed ads</h2>
                        <p className="text-xs font-bold text-slate-500 md:mt-1">
                            {items.length} ad{items.length === 1 ? "" : "s"} in your history
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="inline-flex h-9 items-center gap-1.5 rounded-[13px] bg-red-50 px-3 text-[10px] font-black text-red-600 ring-1 ring-red-100 md:hidden"
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                        <span className="hidden rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600 sm:inline-flex">
                            Stored on this device
                        </span>
                    </div>
                </div>

                {items.length > 0 && (
                    <label className="relative mt-3 block md:mt-5 md:max-w-md">
                        <span className="sr-only">Search recently viewed ads</span>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search your history"
                            className="h-11 w-full rounded-2xl bg-slate-50 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-orange-200"
                        />
                    </label>
                )}

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
                ) : visibleItems.length === 0 ? (
                    <div className="mt-5 rounded-[22px] bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-100">
                        <p className="text-sm font-black text-slate-800">No history matches “{query.trim()}”</p>
                        <button type="button" onClick={() => setQuery("")} className="mt-3 text-xs font-black text-orange-600">Clear search</button>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-3 md:mt-6 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
                        {visibleItems.map((item) => {
                            const listing = getListing(item);
                            const image = getImage(item);
                            const condition = formatCondition(listing?.condition || item?.condition);
                            const negotiable = Boolean(listing?.is_negotiable ?? item?.is_negotiable);
                            const featured = listingIsCurrentlyFeatured(listing);
                            const views = Number(listing?.views_count || listing?.views || item?.views_count || 0);
                            const imageCount = getImageCount(item);
                            const createdAt = listing?.created_at || item?.created_at;
                            const description = listing?.description || item?.description || "";

                            return (
                                <article
                                    key={item.id}
                                    className="group grid grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-[22px] bg-slate-50 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] md:block md:rounded-[26px] md:hover:-translate-y-1"
                                >
                                    <a
                                        href={`/ads/${item.id}`}
                                        className="relative flex min-h-48 items-center justify-center overflow-hidden bg-slate-200 text-[10px] font-bold text-slate-400 md:h-44 md:min-h-0"
                                    >
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={getTitle(item)}
                                                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            "No image"
                                        )}

                                        <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-slate-950/80 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-white backdrop-blur md:left-3 md:top-3 md:px-3 md:py-1.5 md:text-[9px]">
                                            {getCategory(item)}
                                        </span>
                                        {featured && (
                                            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[7px] font-black uppercase text-slate-950 md:bottom-3 md:left-3 md:text-[9px]">
                                                <FontAwesomeIcon icon={faStar} className="h-2.5 w-2.5" />
                                                Featured
                                            </span>
                                        )}
                                    </a>

                                    <div className="min-w-0 p-3 md:p-5">
                                        <a href={`/ads/${item.id}`}>
                                            <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950 transition hover:text-orange-600 md:min-h-12 md:text-base md:leading-6">
                                                {getTitle(item)}
                                            </h3>
                                        </a>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:mt-2">
                                            <p className="text-sm font-black text-orange-600 md:text-lg">
                                                {formatPrice(listing?.price || item?.price)}
                                            </p>
                                            {negotiable && (
                                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[7px] font-black uppercase text-orange-700 ring-1 ring-orange-100 md:text-[8px]">Negotiable</span>
                                            )}
                                        </div>

                                        {(condition || description) && (
                                            <div className="mt-2">
                                                {condition && (
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[8px] font-black text-slate-600 ring-1 ring-slate-200">
                                                        <FontAwesomeIcon icon={faTag} className="h-2.5 w-2.5 text-orange-400" />
                                                        {condition}
                                                    </span>
                                                )}
                                                {description && (
                                                    <p className="mt-2 line-clamp-1 text-[9px] font-semibold leading-4 text-slate-500 md:line-clamp-2 md:text-[11px] md:leading-5">{description}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-2 grid grid-cols-2 gap-1.5 md:mt-3 md:grid-cols-3">
                                            <DetailStat icon={faEye} label="Views" value={views.toLocaleString()} />
                                            <DetailStat icon={faCamera} label="Photos" value={imageCount ? imageCount.toLocaleString() : "—"} />
                                            <DetailStat icon={faClock} label="Posted" value={createdAt ? formatRelativeTime(createdAt) : "—"} className="col-span-2 md:col-span-1" />
                                        </div>

                                        <div className="mt-2 flex min-w-0 flex-col gap-1 border-t border-slate-200 pt-2 text-[9px] font-bold text-slate-500 md:mt-4 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-4 md:text-[11px]">
                                            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                                <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 shrink-0 text-orange-500" />
                                                {getLocation(item)}
                                            </span>
                                            <span className="shrink-0" title={formatDateTime(item.viewed_at)}>
                                                Viewed {formatRelativeTime(item.viewed_at)}
                                            </span>
                                        </div>

                                        <div className="mt-2 grid grid-cols-[1fr_auto] gap-1.5 md:mt-4 md:gap-2">
                                            <a
                                                href={`/ads/${item.id}`}
                                                className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-[10px] font-black text-white transition hover:bg-orange-500 md:h-10 md:px-4 md:text-xs"
                                            >
                                                View Ad
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                aria-label={`Remove ${getTitle(item)} from recently viewed`}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 md:h-10 md:w-10"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

function DetailStat({ icon, label, value, className = "" }: { icon: any; label: string; value: string; className?: string }) {
    return (
        <span className={`min-w-0 rounded-lg bg-white px-2 py-1.5 ring-1 ring-slate-200 ${className}`}>
            <span className="flex items-center gap-1 text-[7px] font-black uppercase tracking-wide text-slate-400">
                <FontAwesomeIcon icon={icon} className="h-2.5 w-2.5" />
                {label}
            </span>
            <span className="mt-0.5 block truncate text-[9px] font-black text-slate-800 md:text-[10px]">{value}</span>
        </span>
    );
}
