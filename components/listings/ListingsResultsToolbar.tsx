"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

const LABELS: Record<string, string> = {
    q: "Search", search: "Search", category: "Category", region: "Region",
    city: "Location", condition: "Condition", is_negotiable: "Negotiable",
    verified_seller: "Verified sellers", posted_within: "Posted",
};
const HIDDEN_KEYS = new Set(["page", "sort", "status", "seller"]);

function valueOf(item: any) { return String(item?.slug || item?.id || item?.value || ""); }
function labelOf(item: any) { return String(item?.name || item?.label || item?.title || item?.value || ""); }
function flatten(items: any[]): any[] { return items.flatMap((item) => [item, ...flatten(item?.children || [])]); }
function titleCase(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function money(value: string) {
    const number = Number(value);
    if (number >= 1_000_000_000) return `UGX ${Number((number / 1_000_000_000).toFixed(1))}B`;
    if (number >= 1_000_000) return `UGX ${Number((number / 1_000_000).toFixed(1))}M`;
    return `UGX ${number.toLocaleString("en-UG")}`;
}

export default function ListingsResultsToolbar({ resultCount, categories = [], cities = [], action }: { resultCount: number; categories?: any[]; cities?: any[]; action?: ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryItems = useMemo(() => flatten(categories), [categories]);
    const sort = searchParams.get("sort") || "recommended";

    function update(mutator: (params: URLSearchParams) => void) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        mutator(params);
        router.push(params.toString() ? `/ads?${params}` : "/ads");
    }

    const chips: Array<{ key: string; keys: string[]; text: string }> = [];
    const minimumPrice = searchParams.get("min_price");
    const maximumPrice = searchParams.get("max_price");
    if (minimumPrice || maximumPrice) {
        chips.push({ key: "price", keys: ["min_price", "max_price"], text: minimumPrice && maximumPrice ? `${money(minimumPrice)} – ${money(maximumPrice)}` : minimumPrice ? `From ${money(minimumPrice)}` : `Up to ${money(maximumPrice!)}` });
    }
    searchParams.forEach((value, key) => {
        if (!value || HIDDEN_KEYS.has(key) || key === "min_price" || key === "max_price") return;
        if (key.endsWith("_min") || key.endsWith("_max")) {
            const base = key.replace(/_(min|max)$/, "");
            const chipKey = `${base}_range`;
            if (chips.some((chip) => chip.key === chipKey)) return;
            const min = searchParams.get(`${base}_min`);
            const max = searchParams.get(`${base}_max`);
            chips.push({ key: chipKey, keys: [`${base}_min`, `${base}_max`], text: `${titleCase(base)}: ${min ? `${min}+` : `up to ${max}`}` });
            return;
        }
        let display = value.split(",").map(titleCase).join(", ");
        if (key === "category") display = labelOf(categoryItems.find((item) => valueOf(item) === value)) || display;
        if (key === "city") display = value.split(",").map((part) => labelOf(cities.find((item) => valueOf(item) === part)) || titleCase(part)).join(", ");
        if (["is_negotiable", "verified_seller"].includes(key)) display = "Yes";
        if (key === "posted_within") display = value === "1" ? "Today" : `Last ${value} days`;
        chips.push({ key, keys: [key], text: `${LABELS[key] || titleCase(key)}: ${display}` });
    });

    return (
        <div className="mb-5 rounded-[26px] bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Marketplace results</p><h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{resultCount.toLocaleString()} ad{resultCount === 1 ? "" : "s"} found</h1></div>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="relative block min-w-52"><span className="sr-only">Sort ads</span>
                        <select value={sort} onChange={(event) => update((params) => event.target.value === "recommended" ? params.delete("sort") : params.set("sort", event.target.value))} className="h-11 w-full appearance-none rounded-2xl bg-slate-50 px-4 pr-10 text-sm font-black text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-300">
                            <option value="recommended">Recommended</option><option value="newest">Newest first</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option><option value="most_viewed">Most viewed</option>
                        </select><FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                    </label>
                    {action}
                </div>
            </div>
            {chips.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {chips.map((chip) => <button key={chip.key} type="button" onClick={() => update((params) => chip.keys.forEach((key) => params.delete(key)))} className="inline-flex max-w-full items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-[11px] font-black text-orange-700 ring-1 ring-orange-100 hover:bg-orange-100"><span className="truncate">{chip.text}</span><FontAwesomeIcon icon={faXmark} className="h-3 w-3 shrink-0" /></button>)}
                <button type="button" onClick={() => update((params) => Array.from(params.keys()).forEach((key) => { if (!["q", "search", "sort"].includes(key)) params.delete(key); }))} className="px-2 py-1 text-[11px] font-black text-slate-500 hover:text-orange-600">Clear filters</button>
            </div>}
        </div>
    );
}
