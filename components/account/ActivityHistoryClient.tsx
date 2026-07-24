"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faBell,
    faClock,
    faHeart,
    faList,
    faRotate,
    faStar,
    faStore,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet } from "@/lib/apiClient";
import { getStoredUser, getUserDisplayName } from "@/lib/auth";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";

type ActivityItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    href?: string;
    date?: string;
    badge: string;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.reviews)) return data.reviews;
    if (Array.isArray(data?.listings)) return data.listings;

    return [];
}

function safeDate(value: any) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
}

function getListingId(listing: any) {
    return listing?.id || listing?.listing_id || listing?.uuid || "";
}

function getListingTitle(listing: any) {
    return (
        listing?.title ||
        listing?.name ||
        listing?.listing?.title ||
        "Untitled advert"
    );
}

function getStatusLabel(status: string) {
    if (!status) return "Ad";

    return status
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActivityIcon(type: string) {
    if (type === "recent") return faClock;
    if (type === "favorite") return faHeart;
    if (type === "review") return faStar;
    if (type === "notification") return faBell;
    if (type === "seller_listing") return faStore;
    return faList;
}

function readRecentlyViewed(): any[] {
    if (typeof window === "undefined") return [];

    const keys = [
        "qot_recently_viewed",
        "qot_recently_viewed_listings",
        "recently_viewed",
    ];

    for (const key of keys) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) return parsed;
            if (Array.isArray(parsed?.items)) return parsed.items;
            if (Array.isArray(parsed?.listings)) return parsed.listings;
        } catch {
            continue;
        }
    }

    return [];
}

function buildRecentlyViewedItems(listings: any[]): ActivityItem[] {
    return listings.slice(0, 20).map((item, index) => {
        const listing = item?.listing || item;
        const id = getListingId(listing) || item?.id || index;

        return {
            id: `recent-${id}-${index}`,
            type: "recent",
            title: `Viewed: ${getListingTitle(listing)}`,
            description: "You recently opened this advert.",
            href: id ? `/ads/${id}` : undefined,
            date: safeDate(
                item?.viewed_at ||
                item?.viewedAt ||
                item?.created_at ||
                item?.updated_at ||
                new Date().toISOString()
            ),
            badge: "Viewed",
        };
    });
}

function buildFavoriteItems(favorites: any[]): ActivityItem[] {
    return favorites.slice(0, 30).map((item, index) => {
        const listing = item?.listing || item?.advert || item;
        const id = getListingId(listing);

        return {
            id: `favorite-${item?.id || id || index}`,
            type: "favorite",
            title: `Saved: ${getListingTitle(listing)}`,
            description: "You saved this advert to your favorites.",
            href: id ? `/ads/${id}` : "/account/saved",
            date: safeDate(
                item?.created_at ||
                item?.created ||
                item?.saved_at ||
                listing?.created_at ||
                listing?.updated_at
            ),
            badge: "Saved",
        };
    });
}

function buildReviewItems(reviews: any[]): ActivityItem[] {
    return reviews.slice(0, 30).map((review, index) => {
        const seller = review?.seller || review?.seller_name || review?.seller_full_name;
        const listing = review?.listing || review?.advert;
        const listingId = getListingId(listing);
        const rating = review?.rating ? `${review.rating}/5` : "Review";

        return {
            id: `review-${review?.id || index}`,
            type: "review",
            title: `Reviewed seller ${seller ? `: ${seller?.full_name || seller?.name || seller}` : ""}`,
            description:
                review?.comment ||
                review?.body ||
                `You submitted a ${rating} seller review.`,
            href: listingId ? `/ads/${listingId}` : "/account/my-reviews",
            date: safeDate(review?.created_at || review?.created || review?.updated_at),
            badge: rating,
        };
    });
}

function buildNotificationItems(notifications: any[]): ActivityItem[] {
    return notifications.slice(0, 40).map((notification, index) => {
        return {
            id: `notification-${notification?.id || index}`,
            type: "notification",
            title:
                notification?.title ||
                notification?.subject ||
                notification?.notification_type ||
                "Notification",
            description:
                notification?.message ||
                notification?.body ||
                notification?.description ||
                "You received a QOT notification.",
            href: notification?.url || notification?.link || "/account/notifications",
            date: safeDate(
                notification?.created_at ||
                notification?.created ||
                notification?.timestamp ||
                notification?.updated_at
            ),
            badge: notification?.is_read ? "Read" : "Unread",
        };
    });
}

function buildSellerListingItems(listings: any[]): ActivityItem[] {
    return listings.slice(0, 40).map((listing, index) => {
        const id = getListingId(listing);
        const status =
            listing?.status ||
            listing?.approval_status ||
            listing?.listing_status ||
            "";

        return {
            id: `seller-listing-${id || index}`,
            type: "seller_listing",
            title: `Your advert: ${getListingTitle(listing)}`,
            description: `Current status: ${getStatusLabel(status)}`,
            href: id ? `/account/my-ads/${id}/edit` : "/account/my-ads",
            date: safeDate(
                listing?.updated_at ||
                listing?.created_at ||
                listing?.published_at ||
                listing?.expires_at
            ),
            badge: getStatusLabel(status),
        };
    });
}

export default function ActivityHistoryClient() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [recentItems, setRecentItems] = useState<ActivityItem[]>([]);
    const [favoriteItems, setFavoriteItems] = useState<ActivityItem[]>([]);
    const [reviewItems, setReviewItems] = useState<ActivityItem[]>([]);
    const [notificationItems, setNotificationItems] = useState<ActivityItem[]>([]);
    const [sellerListingItems, setSellerListingItems] = useState<ActivityItem[]>(
        []
    );

    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = getStoredUser();

        if (!storedUser) {
            window.location.href = "/login?next=/account/activity";
            return;
        }

        setUser(storedUser);
        setMounted(true);

        loadActivity();
    }, []);

    async function loadActivity() {
        setLoading(true);
        setError("");

        try {
            const recentlyViewed = readRecentlyViewed();
            setRecentItems(buildRecentlyViewedItems(recentlyViewed));

            const results = await Promise.allSettled([
                apiGet("/favorites/"),
                apiGet("/reviews/me/"),
                apiGet("/notifications/"),
                apiGet("/seller/listings/?page_size=1000"),
            ]);

            const [favoritesResult, reviewsResult, notificationsResult, listingsResult] =
                results;

            if (favoritesResult.status === "fulfilled") {
                setFavoriteItems(buildFavoriteItems(getArray(favoritesResult.value)));
            }

            if (reviewsResult.status === "fulfilled") {
                setReviewItems(buildReviewItems(getArray(reviewsResult.value)));
            }

            if (notificationsResult.status === "fulfilled") {
                setNotificationItems(
                    buildNotificationItems(getArray(notificationsResult.value))
                );
            }

            if (listingsResult.status === "fulfilled") {
                setSellerListingItems(
                    buildSellerListingItems(getArray(listingsResult.value))
                );
            }
        } catch (error: any) {
            setError(error.message || "Failed to load activity history.");
        } finally {
            setLoading(false);
        }
    }

    const allItems = useMemo(() => {
        const combined = [
            ...recentItems,
            ...favoriteItems,
            ...reviewItems,
            ...notificationItems,
            ...sellerListingItems,
        ];

        return combined.sort((a, b) => {
            const left = a.date ? new Date(a.date).getTime() : 0;
            const right = b.date ? new Date(b.date).getTime() : 0;
            return right - left;
        });
    }, [
        recentItems,
        favoriteItems,
        reviewItems,
        notificationItems,
        sellerListingItems,
    ]);

    const filteredItems = useMemo(() => {
        if (activeFilter === "all") return allItems;
        return allItems.filter((item) => item.type === activeFilter);
    }, [allItems, activeFilter]);

    const filters = [
        { key: "all", label: "All", count: allItems.length },
        { key: "recent", label: "Viewed", count: recentItems.length },
        { key: "favorite", label: "Saved", count: favoriteItems.length },
        { key: "review", label: "Reviews", count: reviewItems.length },
        {
            key: "notification",
            label: "Notifications",
            count: notificationItems.length,
        },
        {
            key: "seller_listing",
            label: "My Adverts",
            count: sellerListingItems.length,
        },
    ];

    if (!mounted || !user) {
        return (
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading activity history...
                </div>
            </section>
        );
    }

    const name = getUserDisplayName(user);

    const summaryItems = [
        { label: "Viewed", value: recentItems.length, icon: faClock },
        { label: "Saved", value: favoriteItems.length, icon: faHeart },
        { label: "My ads", value: sellerListingItems.length, icon: faStore },
        { label: "Alerts", value: notificationItems.length, icon: faBell },
    ];

    return (
        <section className="space-y-4">
            <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">
                            Activity history
                        </p>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                            Your recent activity
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                            Saved ads, reviews, notifications, and seller updates for {name}.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadActivity}
                        disabled={loading}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-orange-500 disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
                        aria-label="Refresh activity"
                    >
                        <FontAwesomeIcon icon={faRotate} className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        <span className="hidden text-xs font-black sm:inline">Refresh</span>
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-4 divide-x divide-slate-100 rounded-[20px] bg-slate-50 px-1 py-3 ring-1 ring-slate-100">
                    {summaryItems.map((item) => (
                        <div key={item.label} className="min-w-0 px-1.5 text-center sm:px-3">
                            <FontAwesomeIcon icon={item.icon} className="mx-auto h-3.5 w-3.5 text-orange-500" />
                            <p className="mt-1 text-lg font-black text-slate-950">{item.value}</p>
                            <p className="truncate text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-[9px]">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {error}
                </div>
            )}

            <div className="-mx-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-2">
                    {filters.map((filter) => {
                        const selected = activeFilter === filter.key;

                        return (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => setActiveFilter(filter.key)}
                                aria-pressed={selected}
                                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-black transition ${
                                    selected
                                        ? "bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.20)]"
                                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                            >
                                {filter.label}
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                                    selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                    {filter.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-black/5">
                    {loading ? (
                        <div className="p-10 text-center">
                            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                <FontAwesomeIcon icon={faRotate} className="h-5 w-5 animate-spin" />
                            </span>
                            <p className="mt-3 text-sm font-bold text-slate-500">Loading your activity...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-8 text-center sm:p-12">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 text-slate-400">
                                <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
                            </span>
                            <h2 className="mt-4 text-lg font-black text-slate-950">No activity here yet</h2>
                            <p className="mx-auto mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-500">
                                Browse, save, review, or manage ads to build your QOT activity.
                            </p>
                            <Link
                                href="/ads"
                                className="mt-5 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white"
                            >
                                Browse ads
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group flex gap-3 p-4 transition hover:bg-orange-50/50 sm:p-5"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-slate-50 text-slate-500 transition group-hover:bg-white group-hover:text-orange-600">
                                        <FontAwesomeIcon icon={getActivityIcon(item.type)} className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-orange-600">
                                                {item.badge}
                                            </span>
                                            <span
                                                className="text-[10px] font-bold text-slate-400"
                                                title={formatDateTime(item.date)}
                                            >
                                                {formatRelativeTime(item.date)}
                                            </span>
                                        </div>
                                        <h2 className="mt-2 text-sm font-black leading-5 text-slate-950">
                                            {item.title}
                                        </h2>
                                        <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                                            {item.description}
                                        </p>
                                    </div>
                                    {item.href && (
                                        <Link
                                            href={item.href}
                                            aria-label={`Open ${item.title}`}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-[14px] bg-slate-50 text-slate-400 transition hover:bg-orange-500 hover:text-white"
                                        >
                                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="hidden space-y-3 xl:block">
                    <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-300">
                            Activity total
                        </p>
                        <p className="mt-2 text-4xl font-black">{allItems.length}</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                            Marketplace events collected for your account.
                        </p>
                    </div>

                    {[
                        { href: "/account/saved", label: "Saved Ads" },
                        { href: "/account/recently-viewed", label: "Recently Viewed" },
                        { href: "/account/my-reviews", label: "My Reviews" },
                        { href: "/account/my-ads", label: "My Ads" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 ring-1 ring-black/5 transition hover:text-orange-600"
                        >
                            {item.label}
                            <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-slate-300" />
                        </Link>
                    ))}
                </aside>
            </div>
        </section>
    );
}
