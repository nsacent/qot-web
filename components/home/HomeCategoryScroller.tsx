"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCar,
    faChevronDown,
    faCouch,
    faHouse,
    faLaptop,
    faMobileScreen,
    faPaw,
    faShirt,
    faStore,
    faToolbox,
    faWrench,
} from "@/lib/faIcons";

type HomeCategoryScrollerProps = {
    categories?: any[];
};

const categoryVisuals = [
    { panel: "from-orange-50 to-amber-50", icon: "from-orange-500 to-amber-500", accent: "text-orange-600" },
    { panel: "from-blue-50 to-cyan-50", icon: "from-blue-600 to-cyan-500", accent: "text-blue-600" },
    { panel: "from-emerald-50 to-teal-50", icon: "from-emerald-600 to-teal-500", accent: "text-emerald-600" },
    { panel: "from-violet-50 to-purple-50", icon: "from-violet-600 to-purple-500", accent: "text-violet-600" },
    { panel: "from-rose-50 to-pink-50", icon: "from-rose-500 to-pink-500", accent: "text-rose-600" },
    { panel: "from-amber-50 to-yellow-50", icon: "from-amber-500 to-yellow-500", accent: "text-amber-700" },
];

function getCategoryName(category: any) {
    if (typeof category === "string") return category;
    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();
    return category?.slug || category?.id || "";
}

function getCategoryAdCount(category: any) {
    const count = Number(category?.listings_count);
    return Number.isFinite(count) ? count : null;
}

function getCategoryChildren(category: any) {
    return Array.isArray(category?.children) ? category.children : [];
}

function normalizeKey(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getCategoryIcon(category: any) {
    const text = normalizeKey(`${getCategoryName(category)} ${String(getCategorySlug(category) || "")}`);

    if (text.includes("phone") || text.includes("tablet") || text.includes("mobile")) return faMobileScreen;
    if (text.includes("electronic") || text.includes("computer") || text.includes("laptop") || text.includes("gaming")) return faLaptop;
    if (text.includes("vehicle") || text.includes("car") || text.includes("motor") || text.includes("truck")) return faCar;
    if (text.includes("property") || text.includes("house") || text.includes("land") || text.includes("apartment")) return faHouse;
    if (text.includes("fashion") || text.includes("cloth") || text.includes("shoe") || text.includes("wear")) return faShirt;
    if (text.includes("furniture") || text.includes("home") || text.includes("garden") || text.includes("sofa")) return faCouch;
    if (text.includes("job")) return faBriefcase;
    if (text.includes("service") || text.includes("repair") || text.includes("clean")) return faWrench;
    if (text.includes("farm") || text.includes("agric") || text.includes("tool")) return faToolbox;
    if (text.includes("pet") || text.includes("animal")) return faPaw;
    return faStore;
}

export default function HomeCategoryScroller({ categories = [] }: HomeCategoryScrollerProps) {
    const [activeSlug, setActiveSlug] = useState("");
    const activeCategory = categories.find((category) => String(getCategorySlug(category)) === activeSlug);
    const activeChildren = getCategoryChildren(activeCategory);

    return (
        <section className="mx-auto mt-5 max-w-[1390px] overflow-hidden rounded-[26px] bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-black/5 sm:p-5">
            <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600">Explore the marketplace</p>
                    <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">Browse Categories</h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">Tap a category to see its subcategories.</p>
                </div>
                <Link href="/categories" className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] bg-slate-950 px-3 py-2 text-[11px] font-black text-white transition hover:bg-orange-500">
                    View all <span aria-hidden="true">→</span>
                </Link>
            </div>

            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category, index) => {
                    const name = getCategoryName(category);
                    const slug = String(getCategorySlug(category));
                    const icon = getCategoryIcon(category);
                    const adCount = getCategoryAdCount(category);
                    const children = getCategoryChildren(category);
                    const visual = categoryVisuals[index % categoryVisuals.length];
                    const active = slug === activeSlug;
                    const content = (
                        <>
                            <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br text-white shadow-sm ${visual.icon}`}>
                                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                            </span>
                            <span className="mt-2 line-clamp-2 text-xs font-black leading-4 text-slate-950">{name}</span>
                            <span className="mt-auto flex flex-col gap-0.5 pt-1.5 text-[8px] font-black uppercase tracking-wide text-slate-400">
                                <span className={visual.accent}>
                                    {(adCount ?? 0).toLocaleString()} active {(adCount ?? 0) === 1 ? "ad" : "ads"}
                                </span>
                                {children.length > 0 && (
                                    <span>{children.length} {children.length === 1 ? "subcategory" : "subcategories"}</span>
                                )}
                            </span>
                            {children.length > 0 && (
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`absolute right-2.5 top-2.5 h-2.5 w-2.5 transition ${active ? "rotate-180 text-orange-600" : "text-slate-400"}`}
                                />
                            )}
                        </>
                    );
                    const tileClass = `relative flex min-h-[116px] min-w-[112px] snap-start flex-col rounded-[18px] bg-gradient-to-br p-3 text-left ring-1 transition sm:min-w-[120px] ${visual.panel} ${active ? "ring-2 ring-orange-400 shadow-md" : "ring-black/5 hover:-translate-y-0.5 hover:shadow-md"}`;

                    return children.length > 0 ? (
                        <button
                            key={slug || name}
                            type="button"
                            onClick={() => setActiveSlug((current) => current === slug ? "" : slug)}
                            aria-expanded={active}
                            className={tileClass}
                        >
                            {content}
                        </button>
                    ) : (
                        <Link key={slug || name} href={slug ? `/ads?category=${encodeURIComponent(slug)}` : "/categories"} className={tileClass}>
                            {content}
                        </Link>
                    );
                })}
            </div>

            {activeCategory && activeChildren.length > 0 && (
                <div className="mt-2 rounded-[20px] bg-slate-50 p-3.5 ring-1 ring-slate-100 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-600">Choose a subcategory</p>
                            <h3 className="mt-1 text-sm font-black text-slate-950">{getCategoryName(activeCategory)}</h3>
                        </div>
                        <Link href={`/ads?category=${encodeURIComponent(activeSlug)}`} className="shrink-0 text-[10px] font-black text-orange-600 hover:text-orange-700">
                            Browse all →
                        </Link>
                    </div>
                    <div className="mt-3 grid grid-flow-col grid-rows-2 auto-cols-max gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                        {activeChildren.map((child: any) => (
                            <Link
                                key={getCategorySlug(child) || getCategoryName(child)}
                                href={`/ads?category=${encodeURIComponent(String(getCategorySlug(child)))}`}
                                className="inline-flex min-w-max items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-500 hover:text-white hover:ring-orange-500"
                            >
                                {getCategoryName(child)}
                                <span className="text-[9px] opacity-60">{getCategoryAdCount(child) ?? 0}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
