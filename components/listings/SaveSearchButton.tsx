"use client";

import { useState } from "react";

const STORAGE_KEY = "qot_saved_searches";

type SaveSearchButtonProps = {
    searchParams?: Record<string, any>;
};

function getCurrentSearchParams() {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
        if (value) result[key] = value;
    });

    return result;
}

function buildSearchUrl(params: Record<string, any>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            query.set(key, String(value));
        }
    });

    const queryString = query.toString();

    return queryString ? `/listings?${queryString}` : "/listings";
}

function getSearchTitle(params: Record<string, any>) {
    const parts: string[] = [];

    if (params.q) parts.push(`Search: ${params.q}`);
    if (params.category) parts.push(`Category: ${params.category}`);
    if (params.city) parts.push(`City: ${params.city}`);
    if (params.region) parts.push(`Region: ${params.region}`);
    if (params.brand) parts.push(`Brand: ${params.brand}`);
    if (params.condition) parts.push(`Condition: ${params.condition}`);
    if (params.ram) parts.push(`RAM: ${params.ram}`);
    if (params.bedrooms) parts.push(`${params.bedrooms} bedroom(s)`);

    if (params.min_price || params.max_price) {
        parts.push(
            `Price: ${params.min_price || "0"} - ${params.max_price || "Any"}`
        );
    }

    if (parts.length === 0) return "All listings";

    return parts.join(" · ");
}

function getSavedSearches() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export default function SaveSearchButton({
    searchParams = {},
}: SaveSearchButtonProps) {
    const [saved, setSaved] = useState(false);

    function saveSearch() {
        const params =
            Object.keys(searchParams || {}).length > 0
                ? searchParams
                : getCurrentSearchParams();

        const cleanParams: Record<string, string> = {};

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                cleanParams[key] = String(value);
            }
        });

        const url = buildSearchUrl(cleanParams);
        const title = getSearchTitle(cleanParams);

        const existing = getSavedSearches();

        const alreadyExists = existing.some((item: any) => item.url === url);

        if (alreadyExists) {
            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 1800);

            return;
        }

        const item = {
            id: Date.now(),
            title,
            url,
            params: cleanParams,
            created_at: new Date().toISOString(),
        };

        const updated = [item, ...existing].slice(0, 20);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 1800);
    }

    return (
        <button
            type="button"
            onClick={saveSearch}
            className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
            {saved ? "Search Saved ✓" : "Save Search"}
        </button>
    );
}