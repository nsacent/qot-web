"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";

type SellerListingStatusActionsProps = {
    listing: any;
    onChanged?: () => void;
};

function getStatus(listing: any) {
    return String(listing?.status || "active").toLowerCase();
}

function isExpired(listing: any) {
    return (
        listing?.is_expired === true ||
        listing?.expired === true ||
        getStatus(listing) === "expired"
    );
}

function needsRenewal(listing: any) {
    return (
        listing?.needs_renewal === true ||
        listing?.requires_renewal === true ||
        listing?.renewal_required === true ||
        isExpired(listing)
    );
}

export default function SellerListingStatusActions({
    listing,
    onChanged,
}: SellerListingStatusActionsProps) {
    const [loading, setLoading] = useState("");

    const status = getStatus(listing);
    const listingId = listing?.id;

    async function runAction(action: string, label: string) {
        if (!listingId) return;

        const confirmed = window.confirm(`Are you sure you want to ${label}?`);

        if (!confirmed) return;

        setLoading(action);

        try {
            await apiPost(`/listings/${listingId}/${action}/`);

            if (onChanged) {
                onChanged();
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            alert(error.message || `Failed to ${label}.`);
        } finally {
            setLoading("");
        }
    }

    return (
        <div className="mt-3 grid gap-2">
            {status !== "sold" && (
                <button
                    type="button"
                    onClick={() => runAction("mark-sold", "mark this advert as sold")}
                    disabled={loading === "mark-sold"}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {loading === "mark-sold" ? "Marking..." : "Mark as Sold"}
                </button>
            )}

            {(status === "sold" || status === "unavailable") && (
                <button
                    type="button"
                    onClick={() =>
                        runAction("mark-available", "make this advert available")
                    }
                    disabled={loading === "mark-available"}
                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                    {loading === "mark-available" ? "Updating..." : "Make Available"}
                </button>
            )}

            {status === "active" && (
                <button
                    type="button"
                    onClick={() =>
                        runAction("mark-unavailable", "make this advert unavailable")
                    }
                    disabled={loading === "mark-unavailable"}
                    className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                    {loading === "mark-unavailable"
                        ? "Updating..."
                        : "Make Unavailable"}
                </button>
            )}

            {isExpired(listing) && (
                <button
                    type="button"
                    onClick={() => runAction("relist", "relist this advert")}
                    disabled={loading === "relist"}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading === "relist" ? "Relisting..." : "Relist Advert"}
                </button>
            )}

            {needsRenewal(listing) && (
                <button
                    type="button"
                    onClick={() => runAction("renew", "renew this advert")}
                    disabled={loading === "renew"}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                    {loading === "renew" ? "Renewing..." : "Renew Advert"}
                </button>
            )}
        </div>
    );
}