"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import UserProfileTab from "@/components/layout/UserProfileTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faBriefcase,
    faCar,
    faChevronDown,
    faCouch,
    faEnvelope,
    faHeartRegular,
    faHouse,
    faLaptop,
    faLocationDot,
    faMagnifyingGlass,
    faMobileScreen,
    faPaw,
    faPlus,
    faShirt,
    faStore,
    faTag,
    faToolbox,
    faWrench,
} from "@/lib/faIcons";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type Category = {
    id?: string | number;
    name?: string;
    slug?: string;
    children?: Category[];
};

type City = {
    id?: string | number;
    name?: string;
    slug?: string;
    region?: string | number;
    region_name?: string;
};

type NavCounts = {
    favorites: number;
    messages: number;
    notifications: number;
};

type QuickMenu = "messages" | "favorites" | "notifications" | null;

type QotMarketplaceNavProps = {
    categories?: Category[];
    cities?: City[];
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.messages)) return data.messages;
    if (Array.isArray(data?.chats)) return data.chats;
    return [];
}

function getTotalCount(data: any) {
    if (typeof data?.count === "number") return data.count;
    if (typeof data?.total === "number") return data.total;
    if (typeof data?.total_count === "number") return data.total_count;
    return getArray(data).length;
}

function getUnreadCount(data: any) {
    if (typeof data?.unread_count === "number") return data.unread_count;
    if (typeof data?.unread === "number") return data.unread;
    if (typeof data?.unread_total === "number") return data.unread_total;

    const items = getArray(data);

    const summed = items.reduce((total, item) => {
        const value =
            item?.unread_count ||
            item?.unread_messages_count ||
            item?.unread_total ||
            0;

        return total + Number(value || 0);
    }, 0);

    if (summed > 0) return summed;

    return items.filter((item) => {
        return (
            item?.is_read === false ||
            item?.read === false ||
            item?.unread === true ||
            item?.status === "unread"
        );
    }).length;
}

function getFavoriteListing(item: any) {
    return item?.listing || item?.ad || item;
}

function getThreadName(thread: any) {
    return (
        thread?.other_user_name ||
        thread?.seller_name ||
        thread?.buyer_name ||
        "QOT member"
    );
}

function getThreadPreview(thread: any) {
    const lastMessage = thread?.last_message;

    if (typeof lastMessage === "string" && lastMessage.trim()) return lastMessage;
    if (lastMessage?.body) return lastMessage.body;

    return `Ask about ${getListingTitle(thread?.listing || thread)}`;
}

function isNotificationUnread(notification: any) {
    return notification?.is_read === false;
}

function getNotificationTitle(notification: any) {
    return notification?.title || notification?.subject || "QOT update";
}

function getNotificationMessage(notification: any) {
    return notification?.message || notification?.body || "You have a new update.";
}

function getNotificationLink(notification: any) {
    if (notification?.chat_thread) return `/account/messages/${notification.chat_thread}`;
    if (notification?.listing) return `/listings/${notification.listing}`;

    return notification?.link || notification?.url || "/account/notifications";
}

async function authGet(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        credentials: "include",
        cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Request failed.");
    }

    return data;
}

async function firstWorking(paths: string[]) {
    for (const path of paths) {
        try {
            return await authGet(path);
        } catch {
            // try next endpoint
        }
    }

    return null;
}

function getCategoryName(category: Category) {
    return category?.name || "Category";
}

function getCategorySlug(category: Category) {
    return (
        category?.slug ||
        category?.name?.toLowerCase().replaceAll(" ", "-") ||
        ""
    );
}

function getCategoryIcon(category: Category) {
    const text = `${category?.name || ""} ${category?.slug || ""}`.toLowerCase();

    if (text.includes("phone") || text.includes("tablet")) return faMobileScreen;
    if (
        text.includes("computer") ||
        text.includes("laptop") ||
        text.includes("electronics") ||
        text.includes("printer") ||
        text.includes("gaming")
    ) {
        return faLaptop;
    }

    if (
        text.includes("vehicle") ||
        text.includes("car") ||
        text.includes("motor") ||
        text.includes("truck") ||
        text.includes("bus")
    ) {
        return faCar;
    }

    if (
        text.includes("property") ||
        text.includes("house") ||
        text.includes("land") ||
        text.includes("apartment") ||
        text.includes("rental")
    ) {
        return faHouse;
    }

    if (
        text.includes("fashion") ||
        text.includes("clothing") ||
        text.includes("shoes") ||
        text.includes("wear") ||
        text.includes("bags")
    ) {
        return faShirt;
    }

    if (
        text.includes("furniture") ||
        text.includes("home") ||
        text.includes("sofa") ||
        text.includes("bed") ||
        text.includes("kitchen")
    ) {
        return faCouch;
    }

    if (text.includes("job")) return faBriefcase;

    if (
        text.includes("service") ||
        text.includes("repair") ||
        text.includes("cleaning") ||
        text.includes("construction")
    ) {
        return faWrench;
    }

    if (
        text.includes("agriculture") ||
        text.includes("farm") ||
        text.includes("tools")
    ) {
        return faToolbox;
    }

    if (text.includes("pet") || text.includes("dog") || text.includes("cat")) {
        return faPaw;
    }

    if (text.includes("health") || text.includes("beauty")) return faHeartRegular;

    return faStore;
}

function getCityName(city: City) {
    return city?.name || "Location";
}

function getCitySlug(city: City) {
    return city?.slug || city?.name?.toLowerCase().replaceAll(" ", "-") || "";
}

function getListingId(ad: any) {
    return ad?.id || ad?.slug || ad?.uuid || "";
}

function getListingTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

function getListingPrice(ad: any) {
    const price = ad?.price || ad?.amount || ad?.selling_price;

    if (!price) return "Price not set";

    return `UGX ${Number(price).toLocaleString()}`;
}

function getListingImage(ad: any) {
    return (
        ad?.cover_image ||
        ad?.image ||
        ad?.thumbnail ||
        ad?.main_image ||
        ad?.images?.[0]?.image ||
        ad?.images?.[0]?.url ||
        ""
    );
}

function getListingLocation(ad: any) {
    return (
        ad?.city_name ||
        ad?.location_name ||
        ad?.city?.name ||
        ad?.location?.name ||
        ad?.address ||
        "Uganda"
    );
}

function CountBadge({ count }: { count: number }) {
    if (!count || count < 1) return null;

    return (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
        </span>
    );
}

function NavDropdown({
    href,
    icon,
    label,
    count,
    open,
    eyebrow,
    children,
    onToggle,
    compact = false,
}: {
    href: string;
    icon: any;
    label: string;
    count: number;
    open: boolean;
    eyebrow: string;
    children: React.ReactNode;
    onToggle: () => void;
    compact?: boolean;
}) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className={`group inline-flex h-11 items-center gap-2 rounded-[15px] px-3 text-sm font-black transition ${
                    open
                        ? "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                        : "text-slate-700 hover:bg-slate-50 hover:text-orange-600"
                }`}
            >
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[11px] bg-slate-100 text-slate-700 transition group-hover:bg-orange-100 group-hover:text-orange-600">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                    <CountBadge count={count} />
                </span>
                <span className={compact ? "sr-only" : "hidden xl:inline"}>{label}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${compact ? "hidden" : "hidden xl:block"} h-2.5 w-2.5 transition ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] overflow-hidden rounded-[24px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] ring-1 ring-black/5">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white px-4 py-3.5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                {eyebrow}
                            </p>
                            <h2 className="mt-0.5 text-base font-black text-slate-950">{label}</h2>
                        </div>
                        {count > 0 && (
                            <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white">
                                {count > 99 ? "99+" : count}
                            </span>
                        )}
                    </div>

                    <div className="p-2">{children}</div>

                    <a
                        href={href}
                        className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50"
                    >
                        View all {label.toLowerCase()}
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            )}
        </div>
    );
}

function OptionModal({
    open,
    title,
    children,
    onClose,
}: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm md:items-center md:p-6">
            <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-t-[30px] bg-white shadow-2xl md:rounded-[30px]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-lg font-black text-slate-950">{title}</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[72vh] overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

export default function QotMarketplaceNav({
    categories = [],
    cities = [],
}: QotMarketplaceNavProps) {
    const [counts, setCounts] = useState<NavCounts>({
        favorites: 0,
        messages: 0,
        notifications: 0,
    });
    const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
    const [messageThreads, setMessageThreads] = useState<any[]>([]);
    const [notificationItems, setNotificationItems] = useState<any[]>([]);
    const [quickMenu, setQuickMenu] = useState<QuickMenu>(null);
    const [navDataLoading, setNavDataLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );

    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const searchBoxRef = useRef<HTMLFormElement | null>(null);
    const quickMenuRef = useRef<HTMLElement | null>(null);

    const citiesByRegion = useMemo(() => {
        const grouped: Record<string, City[]> = {};

        for (const city of cities) {
            const region = city.region_name || "Other Locations";

            if (!grouped[region]) grouped[region] = [];
            grouped[region].push(city);
        }

        return grouped;
    }, [cities]);

    const regions = useMemo(() => Object.keys(citiesByRegion).sort(), [citiesByRegion]);

    async function loadNavData() {
        setNavDataLoading(true);

        const [sessionResponse, favoritesData, messagesData, notificationsData] =
            await Promise.all([
                fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                }).catch(() => null),
                firstWorking(["/favorites/"]),
                firstWorking(["/chats/threads/"]),
                firstWorking(["/notifications/"]),
            ]);

        const signedIn = Boolean(sessionResponse?.ok);
        const favorites = favoritesData ? getArray(favoritesData) : [];
        const threads = messagesData ? getArray(messagesData) : [];
        const notifications = notificationsData ? getArray(notificationsData) : [];

        setIsSignedIn(signedIn);
        setFavoriteItems(favorites);
        setMessageThreads(threads);
        setNotificationItems(notifications);

        setCounts({
            favorites: signedIn && favoritesData ? getTotalCount(favoritesData) : 0,
            messages: signedIn && messagesData ? getUnreadCount(messagesData) : 0,
            notifications:
                signedIn && notificationsData ? getUnreadCount(notificationsData) : 0,
        });

        setNavDataLoading(false);
    }

    useEffect(() => {
        loadNavData();

        const interval = window.setInterval(loadNavData, 60000);

        window.addEventListener("focus", loadNavData);
        window.addEventListener("qot_session_updated", loadNavData);
        window.addEventListener("qot_favorites_updated", loadNavData);
        window.addEventListener("qot_messages_updated", loadNavData);
        window.addEventListener("qot_notifications_updated", loadNavData);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", loadNavData);
            window.removeEventListener("qot_session_updated", loadNavData);
            window.removeEventListener("qot_favorites_updated", loadNavData);
            window.removeEventListener("qot_messages_updated", loadNavData);
            window.removeEventListener("qot_notifications_updated", loadNavData);
        };
    }, []);

    async function openNotification(notification: any) {
        if (notification?.id && isNotificationUnread(notification)) {
            try {
                await fetch(`/api/proxy/notifications/${notification.id}/read/`, {
                    method: "POST",
                    credentials: "include",
                });
                window.dispatchEvent(new Event("qot_notifications_updated"));
            } catch {
                // Navigation should still continue if the read receipt fails.
            }
        }

        window.location.href = getNotificationLink(notification);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }

            if (
                quickMenuRef.current &&
                !quickMenuRef.current.contains(event.target as Node)
            ) {
                setQuickMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const cleanQuery = query.trim();

        if (cleanQuery.length < 2) {
            setSuggestions([]);
            setSearchLoading(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            try {
                setSearchLoading(true);

                const params = new URLSearchParams();
                params.set("q", cleanQuery);
                params.set("page_size", "6");

                if (selectedCity) {
                    params.set("city", getCitySlug(selectedCity));
                }

                if (selectedRegion && !selectedCity) {
                    params.set("region", selectedRegion);
                }

                if (selectedCategory) {
                    params.set("category", getCategorySlug(selectedCategory));
                }

                const response = await fetch(`${API_BASE_URL}/listings/?${params}`, {
                    cache: "no-store",
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setSuggestions([]);
                    return;
                }

                setSuggestions(getArray(data));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query, selectedCity, selectedRegion, selectedCategory]);

    function buildListingUrl(extra?: {
        query?: string;
        city?: City | null;
        region?: string;
        category?: Category | null;
    }) {
        const params = new URLSearchParams();

        const q = extra?.query ?? query;
        const city = extra?.city === undefined ? selectedCity : extra.city;
        const region = extra?.region ?? selectedRegion;
        const category =
            extra?.category === undefined ? selectedCategory : extra.category;

        if (q.trim()) params.set("q", q.trim());

        if (city) {
            params.set("city", getCitySlug(city));
        } else if (region) {
            params.set("region", region);
        }

        if (category) {
            params.set("category", getCategorySlug(category));
        }

        const text = params.toString();

        return text ? `/listings?${text}` : "/listings";
    }

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        window.location.href = buildListingUrl();
    }

    function selectCity(city: City | null) {
        setSelectedCity(city);
        setSelectedRegion("");
        setLocationModalOpen(false);
        window.location.href = buildListingUrl({ city, region: "" });
    }

    function selectRegion(region: string) {
        setSelectedRegion(region);
        setSelectedCity(null);
        setLocationModalOpen(false);
        window.location.href = buildListingUrl({ city: null, region });
    }

    function selectCategory(category: Category | null) {
        setSelectedCategory(category);
        setCategoryModalOpen(false);
        window.location.href = buildListingUrl({ category });
    }

    const locationLabel =
        selectedCity?.name || selectedRegion || "Uganda";

    const categoryLabel = selectedCategory?.name || "Category";

    return (
        <>
            <header className="sticky top-3 z-40 mb-4 rounded-[24px] border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_14px_40px_rgba(15,23,42,0.09)] backdrop-blur-xl md:px-4">
                <div className="flex items-center gap-2 lg:gap-3">
                    <a href="/" className="flex shrink-0 items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-black text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)] md:h-11 md:w-11">
                            Q
                        </span>

                        <span className="hidden text-xl font-black tracking-[-0.04em] text-slate-950 sm:inline xl:text-2xl">
                            QOT
                        </span>
                    </a>

                    <form
                        ref={searchBoxRef}
                        onSubmit={submitSearch}
                        className="relative flex min-w-0 flex-1 items-center rounded-[16px] bg-slate-100/70 px-3 py-2.5 ring-1 ring-slate-200/70 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 md:px-4"
                    >
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="mr-2 h-4 w-4 shrink-0 text-slate-400"
                        />

                        <input
                            name="q"
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Search ads..."
                            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />

                        <button
                            type="button"
                            onClick={() => setLocationModalOpen(true)}
                            className="ml-2 hidden max-w-[150px] items-center gap-2 truncate rounded-xl px-2 py-1.5 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600 lg:inline-flex"
                        >
                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                            <span className="truncate">{locationLabel}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                        </button>

                        <span className="mx-2 hidden h-5 w-px bg-slate-200 lg:block" />

                        <button
                            type="button"
                            onClick={() => setCategoryModalOpen(true)}
                            className="hidden max-w-[170px] items-center gap-2 truncate rounded-xl px-2 py-1.5 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600 lg:inline-flex"
                        >
                            <span className="truncate">{categoryLabel}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                        </button>

                        {showSuggestions && (
                            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)] ring-1 ring-black/5">
                                <div className="flex gap-2 border-b border-slate-100 p-3 lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setLocationModalOpen(true)}
                                        className="flex-1 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-700"
                                    >
                                        {locationLabel}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCategoryModalOpen(true)}
                                        className="flex-1 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-700"
                                    >
                                        {categoryLabel}
                                    </button>
                                </div>

                                {query.trim().length < 2 ? (
                                    <div className="p-5 text-sm font-semibold text-slate-500">
                                        Type at least 2 letters to search ads.
                                    </div>
                                ) : searchLoading ? (
                                    <div className="p-5 text-sm font-semibold text-slate-500">
                                        Searching ads...
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="max-h-[420px] overflow-y-auto p-2">
                                        {suggestions.map((ad) => {
                                            const id = getListingId(ad);
                                            const image = getListingImage(ad);

                                            return (
                                                <a
                                                    key={id || getListingTitle(ad)}
                                                    href={`/listings/${id}`}
                                                    className="flex gap-3 rounded-2xl p-3 hover:bg-orange-50"
                                                >
                                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={getListingTitle(ad)}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : null}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-black text-slate-950">
                                                            {getListingTitle(ad)}
                                                        </p>

                                                        <p className="mt-1 text-xs font-black text-orange-600">
                                                            {getListingPrice(ad)}
                                                        </p>

                                                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                                                            {getListingLocation(ad)}
                                                        </p>
                                                    </div>
                                                </a>
                                            );
                                        })}

                                        <a
                                            href={buildListingUrl()}
                                            className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-black text-orange-600 hover:bg-orange-50"
                                        >
                                            View all matching ads →
                                        </a>
                                    </div>
                                ) : (
                                    <div className="p-5 text-sm font-semibold text-slate-500">
                                        No matching ads found.
                                    </div>
                                )}
                            </div>
                        )}
                    </form>

                    <nav
                        ref={quickMenuRef}
                        className="hidden items-center gap-1 md:flex"
                    >
                        <NavDropdown
                            href="/account/messages"
                            icon={faEnvelope}
                            label="Messages"
                            count={counts.messages}
                            eyebrow="Your conversations"
                            open={quickMenu === "messages"}
                            onToggle={() =>
                                setQuickMenu((current) =>
                                    current === "messages" ? null : "messages"
                                )
                            }
                        >
                            {navDataLoading ? (
                                <div className="space-y-2 p-2">
                                    {[0, 1, 2].map((item) => (
                                        <div key={item} className="flex animate-pulse gap-3 rounded-2xl p-2">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 w-2/3 rounded bg-slate-100" />
                                                <div className="h-2.5 w-full rounded bg-slate-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !isSignedIn ? (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">Sign in to see messages</p>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                        Keep buyer and seller conversations in one place.
                                    </p>
                                    <a
                                        href="/login?next=/account/messages"
                                        className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
                                    >
                                        Sign in
                                    </a>
                                </div>
                            ) : messageThreads.length > 0 ? (
                                messageThreads.slice(0, 4).map((thread) => {
                                    const unread = Number(thread?.unread_count || 0);
                                    const name = getThreadName(thread);

                                    return (
                                        <a
                                            key={thread.id}
                                            href={`/account/messages/${thread.id}`}
                                            className="flex gap-3 rounded-[18px] p-3 transition hover:bg-orange-50"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-slate-950 text-sm font-black text-white">
                                                {name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-xs font-black text-slate-950">{name}</span>
                                                    {unread > 0 && (
                                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white">
                                                            {unread > 99 ? "99+" : unread}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="mt-1 block truncate text-[11px] font-bold text-slate-500">
                                                    {getThreadPreview(thread)}
                                                </span>
                                                <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
                                                    {getListingTitle(thread?.listing || {})}
                                                </span>
                                            </span>
                                        </a>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">No conversations yet</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        Ask a seller a question from any advert.
                                    </p>
                                </div>
                            )}
                        </NavDropdown>

                        <NavDropdown
                            href="/account/saved"
                            icon={faHeartRegular}
                            label="Favorites"
                            count={counts.favorites}
                            eyebrow="Saved for later"
                            open={quickMenu === "favorites"}
                            onToggle={() =>
                                setQuickMenu((current) =>
                                    current === "favorites" ? null : "favorites"
                                )
                            }
                        >
                            {navDataLoading ? (
                                <div className="space-y-2 p-2">
                                    {[0, 1, 2].map((item) => (
                                        <div key={item} className="flex animate-pulse gap-3 rounded-2xl p-2">
                                            <div className="h-12 w-14 rounded-xl bg-slate-100" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 w-3/4 rounded bg-slate-100" />
                                                <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !isSignedIn ? (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faHeartRegular} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">Sign in to save favorites</p>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                        Your saved adverts will stay available across devices.
                                    </p>
                                    <a
                                        href="/login?next=/account/saved"
                                        className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
                                    >
                                        Sign in
                                    </a>
                                </div>
                            ) : favoriteItems.length > 0 ? (
                                favoriteItems.slice(0, 4).map((item) => {
                                    const ad = getFavoriteListing(item);
                                    const id = getListingId(ad);
                                    const image = getListingImage(ad);

                                    return (
                                        <a
                                            key={item?.id || id}
                                            href={`/listings/${id}`}
                                            className="flex gap-3 rounded-[18px] p-3 transition hover:bg-orange-50"
                                        >
                                            <span className="h-12 w-14 shrink-0 overflow-hidden rounded-[13px] bg-slate-100">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full items-center justify-center text-slate-300">
                                                        <FontAwesomeIcon icon={faHeartRegular} className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1 py-0.5">
                                                <span className="block truncate text-xs font-black text-slate-950">
                                                    {getListingTitle(ad)}
                                                </span>
                                                <span className="mt-1 block text-xs font-black text-orange-600">
                                                    {getListingPrice(ad)}
                                                </span>
                                                <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
                                                    {getListingLocation(ad)}
                                                </span>
                                            </span>
                                        </a>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                        <FontAwesomeIcon icon={faHeartRegular} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">Nothing saved yet</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        Tap a heart on an advert to keep it here.
                                    </p>
                                </div>
                            )}
                        </NavDropdown>

                        <NavDropdown
                            href="/account/notifications"
                            icon={faBell}
                            label="Notifications"
                            count={counts.notifications}
                            eyebrow="Latest updates"
                            compact
                            open={quickMenu === "notifications"}
                            onToggle={() =>
                                setQuickMenu((current) =>
                                    current === "notifications" ? null : "notifications"
                                )
                            }
                        >
                            {navDataLoading ? (
                                <div className="space-y-2 p-2">
                                    {[0, 1, 2].map((item) => (
                                        <div key={item} className="flex animate-pulse gap-3 rounded-2xl p-2">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 w-2/3 rounded bg-slate-100" />
                                                <div className="h-2.5 w-full rounded bg-slate-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !isSignedIn ? (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">Sign in to see updates</p>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                        Follow messages, advert approvals, renewals, and account activity.
                                    </p>
                                    <a
                                        href="/login?next=/account/notifications"
                                        className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
                                    >
                                        Sign in
                                    </a>
                                </div>
                            ) : notificationItems.length > 0 ? (
                                notificationItems.slice(0, 5).map((notification) => {
                                    const unread = isNotificationUnread(notification);

                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => openNotification(notification)}
                                            className={`flex w-full gap-3 rounded-[18px] p-3 text-left transition hover:bg-orange-50 ${unread ? "bg-orange-50/60" : ""}`}
                                        >
                                            <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${unread ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                                                {unread && (
                                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-orange-500" />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className={`block truncate text-xs text-slate-950 ${unread ? "font-black" : "font-bold"}`}>
                                                    {getNotificationTitle(notification)}
                                                </span>
                                                <span className="mt-1 line-clamp-2 block text-[11px] font-semibold leading-4 text-slate-500">
                                                    {getNotificationMessage(notification)}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-8 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                                    </span>
                                    <p className="mt-3 text-sm font-black text-slate-950">You are all caught up</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        New marketplace updates will appear here.
                                    </p>
                                </div>
                            )}
                        </NavDropdown>
                    </nav>

                    <a
                        href={isSignedIn ? "/account/notifications" : "/login?next=/account/notifications"}
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-100/70 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 md:hidden"
                        aria-label="Notifications"
                    >
                        <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                        <CountBadge count={counts.notifications} />
                    </a>

                    <a
                        href="/post-ad"
                        className="hidden h-11 shrink-0 items-center rounded-[15px] bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-black text-white shadow-[0_10px_22px_rgba(249,115,22,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(249,115,22,0.28)] md:inline-flex"
                    >
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                            Post Ad
                        </span>
                    </a>

                    <div className="hidden md:block">
                        <UserProfileTab />
                    </div>
                </div>
            </header>

            <OptionModal
                open={locationModalOpen}
                title="Choose location"
                onClose={() => setLocationModalOpen(false)}
            >
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => selectCity(null)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-orange-500 px-4 py-3 text-left text-sm font-black text-white hover:bg-orange-600"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                        </span>

                        <span>All Uganda</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {regions.map((region) => (
                        <div key={region}>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-base font-black text-slate-950">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                                    </span>
                                    {region}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => selectRegion(region.toLowerCase().replaceAll(" ", "-"))}
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-600 hover:bg-orange-100"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                    All {region}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {(citiesByRegion[region] || []).map((city) => (
                                    <button
                                        key={city.id || city.slug || city.name}
                                        type="button"
                                        onClick={() => selectCity(city)}
                                        className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                                        </span>

                                        <span className="truncate">{getCityName(city)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </OptionModal>

            <OptionModal
                open={categoryModalOpen}
                title="Choose category"
                onClose={() => setCategoryModalOpen(false)}
            >
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => selectCategory(null)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-orange-500 px-4 py-3 text-left text-sm font-black text-white hover:bg-orange-600"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                        </span>

                        <span>All Categories</span>
                    </button>
                </div>

                <div className="space-y-5">
                    {categories.map((category) => {
                        const children = Array.isArray(category.children)
                            ? category.children
                            : [];

                        return (
                            <div key={category.id || category.slug || category.name}>
                                <button
                                    type="button"
                                    onClick={() => selectCategory(category)}
                                    className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-black text-slate-950 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                        <FontAwesomeIcon icon={getCategoryIcon(category)} className="h-4 w-4" />
                                    </span>

                                    <span>All {getCategoryName(category)}</span>
                                </button>
                                {children.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                        {children.map((child) => (
                                            <button
                                                key={child.id || child.slug || child.name}
                                                type="button"
                                                onClick={() => selectCategory(child)}
                                                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                                    <FontAwesomeIcon icon={getCategoryIcon(child)} className="h-3.5 w-3.5" />
                                                </span>

                                                <span className="truncate">{getCategoryName(child)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </OptionModal>
        </>
    );
}
