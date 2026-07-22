"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { getStoredUser, getUserDisplayName } from "@/lib/auth";

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

function formatDate(value?: string) {
    if (!value) return "Recent activity";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recent activity";

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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
            href: listingId ? `/ads/${listingId}` : "/my-reviews",
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
            href: id ? `/my-ads/${id}/edit` : "/my-ads",
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

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Activity History
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
                    Your QOT Activity
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Track your recent marketplace actions, saved adverts, reviews,
                    notifications, and seller ad updates in one place.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-bold text-slate-900">{name}</p>
                            <p className="mt-1 text-sm text-slate-600">
                                {allItems.length} activity item{allItems.length === 1 ? "" : "s"} found
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadActivity}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Refresh Activity
                        </button>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => setActiveFilter(filter.key)}
                                className={
                                    activeFilter === filter.key
                                        ? "rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white"
                                        : "rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                                }
                            >
                                {filter.label}{" "}
                                <span className="ml-1 opacity-80">({filter.count})</span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
                            Loading your activity...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-8 text-center">
                            <p className="font-bold text-slate-900">No activity found</p>
                            <p className="mt-2 text-sm text-slate-600">
                                Start browsing, saving adverts, reviewing sellers, or managing
                                ads to build your activity history.
                            </p>

                            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                                <a
                                    href="/ads"
                                    className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                                >
                                    Browse Adverts
                                </a>

                                <a
                                    href="/post-ad"
                                    className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Post Advert
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="relative space-y-4">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border p-5 transition hover:border-orange-200 hover:bg-orange-50/30"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                    {item.badge}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {formatDate(item.date)}
                                                </span>
                                            </div>

                                            <h2 className="mt-3 font-bold text-slate-900">
                                                {item.title}
                                            </h2>

                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {item.description}
                                            </p>
                                        </div>

                                        {item.href && (
                                            <a
                                                href={item.href}
                                                className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-white"
                                            >
                                                Open
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Summary
                        </p>

                        <div className="mt-5 grid gap-3">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-2xl font-bold text-slate-900">
                                    {recentItems.length}
                                </p>
                                <p className="text-sm text-slate-600">Recently viewed</p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-2xl font-bold text-slate-900">
                                    {favoriteItems.length}
                                </p>
                                <p className="text-sm text-slate-600">Saved adverts</p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-2xl font-bold text-slate-900">
                                    {sellerListingItems.length}
                                </p>
                                <p className="text-sm text-slate-600">Your adverts</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Quick Actions
                        </p>

                        <div className="mt-4 grid gap-3">
                            <a
                                href="/account/saved"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Saved Adverts
                            </a>

                            <a
                                href="/recently-viewed"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Recently Viewed
                            </a>

                            <a
                                href="/my-reviews"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                My Reviews
                            </a>

                            <a
                                href="/my-ads"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                My Ads
                            </a>

                            <a
                                href="/account/notifications"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Notifications
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
