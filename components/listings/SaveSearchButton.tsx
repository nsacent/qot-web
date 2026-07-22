"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faCheck } from "@fortawesome/free-solid-svg-icons";

type SaveSearchButtonProps = {
    searchParams?: Record<string, any>;
};

const OMITTED_PARAMS = new Set(["page"]);

function getCurrentSearchParams() {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
        if (value && !OMITTED_PARAMS.has(key)) result[key] = value;
    });

    return result;
}

function cleanSearchParams(params: Record<string, any>) {
    const cleanParams: Record<string, string> = {};

    Object.entries(params || {}).forEach(([key, value]) => {
        if (OMITTED_PARAMS.has(key)) return;
        if (value === undefined || value === null || String(value).trim() === "") return;
        cleanParams[key] = String(value).trim();
    });

    return cleanParams;
}

function getParamLabel(key: string) {
    const labels: Record<string, string> = {
        q: "Search",
        category: "Category",
        city: "City",
        region: "Region",
        brand: "Brand",
        condition: "Condition",
        ram: "RAM",
        bedrooms: "Bedrooms",
        min_price: "Min price",
        max_price: "Max price",
        sort: "Sort",
    };

    return labels[key] || key.replaceAll("_", " ");
}

function getSearchTitle(params: Record<string, string>) {
    const parts = Object.entries(params)
        .filter(([key]) => key !== "sort")
        .map(([key, value]) => `${getParamLabel(key)}: ${value}`);

    return (parts.length ? parts.join(" · ") : "All ads").slice(0, 255);
}

function getErrorMessage(data: any) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;

    for (const value of Object.values(data || {})) {
        if (Array.isArray(value) && value[0]) return String(value[0]);
        if (typeof value === "string") return value;
    }

    return "Failed to save this search.";
}

export default function SaveSearchButton({
    searchParams = {},
}: SaveSearchButtonProps) {
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [error, setError] = useState("");

    async function saveSearch() {
        if (status === "saving" || status === "saved") return;

        const rawParams = Object.keys(searchParams).length
            ? searchParams
            : getCurrentSearchParams();
        const params = cleanSearchParams(rawParams);
        const query = params.q || "";
        const filters = Object.fromEntries(
            Object.entries(params).filter(([key]) => key !== "q")
        );

        setStatus("saving");
        setError("");

        try {
            const response = await fetch("/api/proxy/searches/saved/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: getSearchTitle(params),
                    query,
                    filters,
                    notify_user: false,
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                const next = encodeURIComponent(
                    window.location.pathname + window.location.search
                );
                window.location.href = `/login?next=${next}`;
                return;
            }

            if (!response.ok) {
                const message = getErrorMessage(data);

                if (message.toLowerCase().includes("already saved")) {
                    setStatus("saved");
                    return;
                }

                throw new Error(message);
            }

            setStatus("saved");
            window.dispatchEvent(new Event("qot_saved_searches_updated"));
        } catch (err: any) {
            setStatus("idle");
            setError(err.message || "Failed to save this search.");
        }
    }

    return (
        <div className="flex flex-col items-start gap-1.5 md:items-end">
            <button
                type="button"
                onClick={saveSearch}
                disabled={status === "saving"}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition disabled:cursor-wait disabled:opacity-70 ${
                    status === "saved"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] hover:bg-slate-800"
                }`}
            >
                <FontAwesomeIcon
                    icon={status === "saved" ? faCheck : faBookmark}
                    className="h-3.5 w-3.5"
                />
                {status === "saving"
                    ? "Saving..."
                    : status === "saved"
                      ? "Search saved"
                      : "Save search"}
            </button>

            {error && <p className="max-w-xs text-xs font-bold text-red-600">{error}</p>}
        </div>
    );
}
