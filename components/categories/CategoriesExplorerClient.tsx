"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCar,
    faCouch,
    faHouse,
    faLaptop,
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

type Category = {
    id?: string | number;
    name?: string;
    title?: string;
    slug?: string;
    icon?: string | null;
    listings_count?: number;
    children?: Category[];
};

type CategoriesExplorerClientProps = {
    categories: Category[];
};

const categoryVisuals = [
    {
        panel: "from-orange-50 to-amber-50",
        icon: "bg-orange-500 text-white shadow-orange-200",
        accent: "text-orange-600",
        ring: "group-hover:ring-orange-200",
        glow: "bg-orange-300/20",
    },
    {
        panel: "from-blue-50 to-cyan-50",
        icon: "bg-blue-600 text-white shadow-blue-200",
        accent: "text-blue-600",
        ring: "group-hover:ring-blue-200",
        glow: "bg-blue-300/20",
    },
    {
        panel: "from-emerald-50 to-teal-50",
        icon: "bg-emerald-600 text-white shadow-emerald-200",
        accent: "text-emerald-600",
        ring: "group-hover:ring-emerald-200",
        glow: "bg-emerald-300/20",
    },
    {
        panel: "from-violet-50 to-purple-50",
        icon: "bg-violet-600 text-white shadow-violet-200",
        accent: "text-violet-600",
        ring: "group-hover:ring-violet-200",
        glow: "bg-violet-300/20",
    },
    {
        panel: "from-rose-50 to-pink-50",
        icon: "bg-rose-500 text-white shadow-rose-200",
        accent: "text-rose-600",
        ring: "group-hover:ring-rose-200",
        glow: "bg-rose-300/20",
    },
    {
        panel: "from-amber-50 to-yellow-50",
        icon: "bg-amber-500 text-white shadow-amber-200",
        accent: "text-amber-700",
        ring: "group-hover:ring-amber-200",
        glow: "bg-amber-300/20",
    },
];

function getCategoryName(category: Category) {
    return category.name || category.title || "Category";
}

function getCategorySlug(category: Category) {
    return category.slug || String(category.id || "");
}

function getCategoryAdCount(category: Category) {
    return Number(category.listings_count || 0);
}

function getCategoryIcon(category: Category) {
    const text = `${category.name || ""} ${category.slug || ""}`.toLowerCase();

    if (text.includes("phone") || text.includes("tablet")) return faMobileScreen;
    if (
        text.includes("electronic") ||
        text.includes("computer") ||
        text.includes("laptop") ||
        text.includes("gaming")
    ) {
        return faLaptop;
    }
    if (
        text.includes("vehicle") ||
        text.includes("car") ||
        text.includes("motor") ||
        text.includes("truck")
    ) {
        return faCar;
    }
    if (
        text.includes("property") ||
        text.includes("house") ||
        text.includes("land") ||
        text.includes("apartment")
    ) {
        return faHouse;
    }
    if (
        text.includes("fashion") ||
        text.includes("cloth") ||
        text.includes("shoe") ||
        text.includes("wear")
    ) {
        return faShirt;
    }
    if (
        text.includes("furniture") ||
        text.includes("home") ||
        text.includes("garden") ||
        text.includes("sofa")
    ) {
        return faCouch;
    }
    if (text.includes("job")) return faBriefcase;
    if (
        text.includes("service") ||
        text.includes("repair") ||
        text.includes("clean")
    ) {
        return faWrench;
    }
    if (
        text.includes("farm") ||
        text.includes("agric") ||
        text.includes("tool")
    ) {
        return faToolbox;
    }
    if (text.includes("pet") || text.includes("animal")) return faPaw;

    return faStore;
}

function getCategoryDescription(category: Category) {
    const childCount = category.children?.length || 0;

    if (childCount === 0) {
        return "Discover available adverts and trusted local sellers.";
    }

    return `Explore ${childCount} ${childCount === 1 ? "specialized collection" : "specialized collections"}.`;
}

export default function CategoriesExplorerClient({
    categories,
}: CategoriesExplorerClientProps) {
    const [query, setQuery] = useState("");

    const totalSubcategories = useMemo(
        () => categories.reduce((total, category) => total + (category.children?.length || 0), 0),
        [categories]
    );

    const totalAds = useMemo(
        () => categories.reduce((total, category) => total + getCategoryAdCount(category), 0),
        [categories]
    );

    const visibleCategories = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) return categories;

        return categories.reduce<Category[]>((matches, category) => {
            const parentMatches = getCategoryName(category).toLowerCase().includes(term);
            const matchingChildren = (category.children || []).filter((child) =>
                getCategoryName(child).toLowerCase().includes(term)
            );

            if (parentMatches) {
                matches.push(category);
            } else if (matchingChildren.length > 0) {
                matches.push({ ...category, children: matchingChildren });
            }

            return matches;
        }, []);
    }, [categories, query]);

    return (
        <div className="pb-8 pt-4">
            <section className="relative overflow-hidden rounded-[30px] bg-slate-950 px-6 py-7 text-white shadow-[0_22px_65px_rgba(15,23,42,0.20)] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
                <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
                <div className="absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

                <div className="relative grid items-center gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-white/15 backdrop-blur">
                            <FontAwesomeIcon icon={faTag} className="h-3 w-3" />
                            Marketplace directory
                        </span>

                        <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.06] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                            Everything you need,
                            <span className="block bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                                beautifully organized.
                            </span>
                        </h1>

                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300">
                            Explore QOT&apos;s marketplace by category and move from browsing to the right advert in just a few clicks.
                        </p>

                        <div className="mt-5 grid max-w-lg grid-cols-3 gap-2">
                            <div className="rounded-[16px] bg-white/8 p-3 ring-1 ring-white/10 backdrop-blur">
                                <p className="text-xl font-black text-white">{categories.length}</p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Categories</p>
                            </div>
                            <div className="rounded-[16px] bg-white/8 p-3 ring-1 ring-white/10 backdrop-blur">
                                <p className="text-xl font-black text-white">{totalSubcategories}</p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Collections</p>
                            </div>
                            <div className="rounded-[16px] bg-white/8 p-3 ring-1 ring-white/10 backdrop-blur">
                                <p className="text-xl font-black text-white">{totalAds}</p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Active ads</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] bg-white p-4 text-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/50 sm:p-5">
                        <div className="hidden items-center gap-3 sm:flex">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-orange-100 text-orange-600">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Quick discovery</p>
                                <h2 className="mt-0.5 text-lg font-black">What are you looking for?</h2>
                            </div>
                        </div>

                        <label className="flex h-12 items-center gap-3 rounded-[16px] bg-slate-50 px-4 ring-1 ring-slate-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-300 sm:mt-4">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-slate-400" />
                            <span className="sr-only">Search categories</span>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Try phones, cars, property..."
                                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-semibold placeholder:text-slate-400"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-600 hover:bg-slate-300"
                                >
                                    Clear
                                </button>
                            )}
                        </label>

                        <div className="mt-4 hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Popular right now</p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                                {categories.slice(0, 4).map((category) => (
                                    <Link
                                        key={category.id || category.slug}
                                        href={`/listings?category=${encodeURIComponent(getCategorySlug(category))}`}
                                        className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-black text-orange-700 ring-1 ring-orange-100 transition hover:bg-orange-500 hover:text-white"
                                    >
                                        {getCategoryName(category)}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section id="category-grid" className="scroll-mt-6 py-8 sm:py-9">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Browse the marketplace</p>
                        <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Explore every category</h2>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                            Start with a department, then narrow your search using its specialized collections.
                        </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm ring-1 ring-black/5">
                        {query ? `${visibleCategories.length} matches` : `${categories.length} departments`}
                    </span>
                </div>

                {visibleCategories.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleCategories.map((category, index) => {
                            const visual = categoryVisuals[index % categoryVisuals.length];
                            const children = category.children || [];
                            const slug = getCategorySlug(category);

                            return (
                                <article
                                    key={category.id || category.slug}
                                    className={`group relative overflow-hidden rounded-[24px] bg-gradient-to-br ${visual.panel} p-px shadow-[0_12px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.11)]`}
                                >
                                    <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${visual.glow} blur-2xl transition duration-500 group-hover:scale-125`} />
                                    <div className={`relative flex h-full flex-col rounded-[23px] bg-white/90 p-5 ring-1 ring-black/5 backdrop-blur ${visual.ring}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <span className={`flex h-11 w-11 items-center justify-center rounded-[15px] shadow-[0_10px_22px] ${visual.icon}`}>
                                                <FontAwesomeIcon icon={getCategoryIcon(category)} className="h-5 w-5" />
                                            </span>

                                            <div className="text-right">
                                                <p className={`text-xl font-black ${visual.accent}`}>{getCategoryAdCount(category)}</p>
                                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                    active {getCategoryAdCount(category) === 1 ? "ad" : "ads"}
                                                </p>
                                            </div>
                                        </div>

                                        <Link href={`/listings?category=${encodeURIComponent(slug)}`} className="mt-4 block">
                                            <h3 className="text-xl font-black tracking-tight text-slate-950 transition group-hover:text-orange-600">
                                                {getCategoryName(category)}
                                            </h3>
                                            <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                                                {getCategoryDescription(category)}
                                            </p>
                                        </Link>

                                        {children.length > 0 ? (
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {children.slice(0, query ? 6 : 4).map((child) => (
                                                    <Link
                                                        key={child.id || child.slug}
                                                        href={`/listings?category=${encodeURIComponent(getCategorySlug(child))}`}
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700 hover:ring-orange-200"
                                                    >
                                                        {getCategoryName(child)}
                                                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-400 ring-1 ring-slate-100">
                                                            {getCategoryAdCount(child)}
                                                        </span>
                                                    </Link>
                                                ))}
                                                {children.length > (query ? 6 : 4) && (
                                                    <span className="rounded-full bg-slate-950 px-2.5 py-1.5 text-[10px] font-black text-white">
                                                        +{children.length - (query ? 6 : 4)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-[14px] bg-slate-50 px-3 py-2.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100">
                                                Fresh adverts are waiting to be discovered.
                                            </div>
                                        )}

                                        <Link
                                            href={`/listings?category=${encodeURIComponent(slug)}`}
                                            className={`mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black ${visual.accent}`}
                                        >
                                            Browse {getCategoryName(category)}
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-base text-white transition group-hover:translate-x-1 group-hover:bg-orange-500">→</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="rounded-[30px] bg-white px-6 py-14 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-100 text-orange-600">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-2xl font-black text-slate-950">No matching category</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Try a broader search, or browse all departments to find something close.
                        </p>
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="mt-6 rounded-[16px] bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(249,115,22,0.24)] hover:bg-orange-600"
                        >
                            Show all categories
                        </button>
                    </div>
                ) : (
                    <div className="rounded-[30px] bg-white px-6 py-14 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-100 text-orange-600">
                            <FontAwesomeIcon icon={faStore} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-2xl font-black text-slate-950">Categories are being prepared</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Please check back shortly, or explore all available marketplace adverts now.
                        </p>
                        <Link
                            href="/listings"
                            className="mt-6 inline-flex rounded-[16px] bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(249,115,22,0.24)] hover:bg-orange-600"
                        >
                            Browse all adverts
                        </Link>
                    </div>
                )}
            </section>

            <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-[0_18px_45px_rgba(249,115,22,0.22)] sm:p-7">
                <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/15 ring-1 ring-white/25 backdrop-blur">
                            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-100">Have something to sell?</p>
                            <h2 className="mt-1.5 text-2xl font-black tracking-tight">Put it in front of the right buyers.</h2>
                            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-orange-50">
                                Choose the best category, upload clear photos, and publish your advert across QOT Uganda.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/post-ad"
                            className="rounded-[16px] bg-slate-950 px-6 py-3.5 text-center text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-900"
                        >
                            Post an advert
                        </Link>
                        <Link
                            href="/listings"
                            className="rounded-[16px] bg-white/15 px-6 py-3.5 text-center text-sm font-black text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-orange-600"
                        >
                            Browse all adverts
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
