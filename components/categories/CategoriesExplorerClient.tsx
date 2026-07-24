"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCar,
    faChevronDown,
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

function SubcategoryPanel({
    category,
    slug,
    className = "",
}: {
    category: Category;
    slug: string;
    className?: string;
}) {
    return (
        <div className={`${className} rounded-[24px] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] ring-1 ring-black/5 sm:p-5`}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Choose a subcategory</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">{getCategoryName(category)}</h3>
                </div>
                <Link
                    href={`/ads?category=${encodeURIComponent(slug)}`}
                    className="inline-flex h-10 w-fit items-center rounded-[13px] bg-slate-950 px-4 text-xs font-black text-white hover:bg-orange-500"
                >
                    Browse all {getCategoryName(category)}
                </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {(category.children || []).map((child) => (
                    <Link
                        key={child.id || child.slug}
                        href={`/ads?category=${encodeURIComponent(getCategorySlug(child))}`}
                        className="flex min-h-12 items-center justify-between gap-2 rounded-[14px] bg-slate-50 px-3 py-2.5 text-xs font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-orange-50 hover:text-orange-700 hover:ring-orange-200"
                    >
                        <span>{getCategoryName(child)}</span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] text-slate-400 ring-1 ring-slate-100">
                            {getCategoryAdCount(child)}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function CategoriesExplorerClient({
    categories,
}: CategoriesExplorerClientProps) {
    const [query, setQuery] = useState("");
    const [activeSlug, setActiveSlug] = useState("");

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
        <div className="pb-8 pt-1 sm:pt-4">
            <section className="relative overflow-hidden rounded-[24px] bg-slate-950 px-4 py-3 text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)] sm:rounded-[30px] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
                <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
                <div className="absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

                <div className="relative grid items-center gap-2 sm:gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-white/15 backdrop-blur">
                            <FontAwesomeIcon icon={faTag} className="h-3 w-3" />
                            Marketplace directory
                        </span>

                        <h1 className="mt-2.5 max-w-3xl text-2xl font-black leading-[1.08] tracking-[-0.035em] sm:mt-4 sm:text-4xl lg:text-5xl">
                            Everything you need,{" "}
                            <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent sm:block">
                                beautifully organized.
                            </span>
                        </h1>

                        <p className="mt-3 hidden max-w-xl text-sm font-semibold leading-6 text-slate-300 sm:block">
                            Explore QOT&apos;s marketplace by category and move from browsing to the right advert in just a few clicks.
                        </p>

                        <div className="mt-2 grid max-w-lg grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2">
                            <div className="rounded-[13px] bg-white/8 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur sm:rounded-[16px] sm:p-3">
                                <p className="text-sm font-black text-white sm:text-xl">{categories.length}</p>
                                <p className="mt-0.5 text-[7px] font-black uppercase tracking-wide text-slate-400 sm:mt-1 sm:text-[9px]">Categories</p>
                            </div>
                            <div className="rounded-[13px] bg-white/8 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur sm:rounded-[16px] sm:p-3">
                                <p className="text-sm font-black text-white sm:text-xl">{totalSubcategories}</p>
                                <p className="mt-0.5 text-[7px] font-black uppercase tracking-wide text-slate-400 sm:mt-1 sm:text-[9px]">Collections</p>
                            </div>
                            <div className="rounded-[13px] bg-white/8 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur sm:rounded-[16px] sm:p-3">
                                <p className="text-sm font-black text-white sm:text-xl">{totalAds}</p>
                                <p className="mt-0.5 text-[7px] font-black uppercase tracking-wide text-slate-400 sm:mt-1 sm:text-[9px]">Active ads</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[18px] bg-white p-1.5 text-slate-950 shadow-[0_16px_36px_rgba(0,0,0,0.20)] ring-1 ring-white/50 sm:rounded-[24px] sm:p-5">
                        <div className="hidden items-center gap-3 sm:flex">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-orange-100 text-orange-600">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Quick discovery</p>
                                <h2 className="mt-0.5 text-lg font-black">What are you looking for?</h2>
                            </div>
                        </div>

                        <label className="flex h-10 items-center gap-3 rounded-[13px] bg-slate-50 px-3 ring-1 ring-slate-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-300 sm:mt-4 sm:h-12 sm:rounded-[16px] sm:px-4">
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
                                        href={`/ads?category=${encodeURIComponent(getCategorySlug(category))}`}
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

            <section id="category-grid" className="scroll-mt-6 py-5 sm:py-9">
                <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:flex-row">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Browse the marketplace</p>
                        <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Explore every category</h2>
                        <p className="mt-2 hidden max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:block">
                            Start with a department, then narrow your search using its specialized collections.
                        </p>
                    </div>

                    <span className="inline-flex w-fit shrink-0 rounded-full bg-white px-3 py-2 text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-black/5 sm:px-4 sm:text-xs">
                        {query ? `${visibleCategories.length} matches` : `${categories.length} departments`}
                    </span>
                </div>

                {visibleCategories.length > 0 ? (
                    <div>
                        <div className="grid grid-flow-dense grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                            {visibleCategories.map((category, index) => {
                                const visual = categoryVisuals[index % categoryVisuals.length];
                                const children = category.children || [];
                                const slug = getCategorySlug(category);
                                const active = slug === activeSlug;
                                const tileClass = `group relative min-h-[108px] min-w-0 overflow-hidden rounded-[18px] bg-gradient-to-br ${visual.panel} p-3 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[118px] sm:rounded-[19px] sm:p-3.5 ${active ? "ring-2 ring-orange-400" : "ring-black/5"}`;
                                const content = (
                                    <>
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] shadow-sm ${visual.icon}`}>
                                            <FontAwesomeIcon icon={getCategoryIcon(category)} className="h-4 w-4" />
                                        </span>
                                        <span className="mt-2.5 block line-clamp-2 text-xs font-black leading-4 text-slate-950 sm:mt-3 sm:text-sm sm:leading-5">{getCategoryName(category)}</span>
                                        <span className="mt-1 flex flex-col gap-0.5 text-[8px] font-black uppercase tracking-wide text-slate-400">
                                            <span className={visual.accent}>
                                                {getCategoryAdCount(category)} active {getCategoryAdCount(category) === 1 ? "ad" : "ads"}
                                            </span>
                                            {children.length > 0 && (
                                                <span>{children.length} {children.length === 1 ? "subcategory" : "subcategories"}</span>
                                            )}
                                        </span>
                                        {children.length > 0 && (
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className={`absolute right-3 top-3 h-2.5 w-2.5 transition ${active ? "rotate-180 text-orange-600" : "text-slate-400"}`}
                                            />
                                        )}
                                    </>
                                );

                                const categoryTile = children.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveSlug((current) => current === slug ? "" : slug)}
                                        aria-expanded={active}
                                        className={tileClass}
                                    >
                                        {content}
                                    </button>
                                ) : (
                                    <Link
                                        href={`/ads?category=${encodeURIComponent(slug)}`}
                                        className={tileClass}
                                    >
                                        {content}
                                    </Link>
                                );

                                return (
                                    <Fragment key={category.id || category.slug}>
                                        {categoryTile}
                                        {active && children.length > 0 && (
                                            <SubcategoryPanel
                                                category={category}
                                                slug={slug}
                                                className="col-span-full"
                                            />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </div>
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
                            href="/ads"
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
                            href="/ads"
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
