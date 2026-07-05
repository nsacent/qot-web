"use client";

import { useEffect, useState } from "react";

type SaveSearchButtonProps = {
    searchParams: Record<string, string | undefined>;
};

function buildSearchTitle(params: Record<string, string | undefined>) {
    const parts = [];

    if (params.q) parts.push(`"${params.q}"`);
    if (params.category) parts.push(`Category: ${params.category}`);
    if (params.region) parts.push(`Region: ${params.region}`);
    if (params.city) parts.push(`City: ${params.city}`);
    if (params.min_price) parts.push(`Min: UGX ${params.min_price}`);
    if (params.max_price) parts.push(`Max: UGX ${params.max_price}`);
    if (params.condition) parts.push(`Condition: ${params.condition}`);

    return parts.length > 0 ? parts.join(" • ") : "All listings";
}

function buildSearchUrl(params: Record<string, string | undefined>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });

    const queryString = query.toString();

    return queryString ? `/listings?${queryString}` : "/listings";
}

export default function SaveSearchButton({ searchParams }: SaveSearchButtonProps) {
    const [mounted, setMounted] = useState(false);
    const [saved, setSaved] = useState(false);

    const title = buildSearchTitle(searchParams);
    const url = buildSearchUrl(searchParams);

    useEffect(() => {
        const existing = JSON.parse(localStorage.getItem("qot_saved_searches") || "[]");
        setSaved(existing.some((item: any) => item.url === url));
        setMounted(true);
    }, [url]);

    function saveSearch() {
        const existing = JSON.parse(localStorage.getItem("qot_saved_searches") || "[]");

        const alreadySaved = existing.some((item: any) => item.url === url);

        if (alreadySaved) {
            setSaved(true);
            return;
        }

        const newSearch = {
            id: Date.now(),
            title,
            url,
            created_at: new Date().toISOString(),
        };

        localStorage.setItem(
            "qot_saved_searches",
            JSON.stringify([newSearch, ...existing])
        );

        setSaved(true);
    }

    if (!mounted) return null;

    return (
        <button
            type="button"
            onClick={saveSearch}
            className={
                saved
                    ? "rounded-xl border border-green-300 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700"
                    : "rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            }
        >
            {saved ? "Search Saved ✓" : "Save Search"}
        </button>
    );
}