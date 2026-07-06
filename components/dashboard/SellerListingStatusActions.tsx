"use client";

import { useState } from "react";
import { apiPatch } from "@/lib/apiClient";

type SellerListingStatusActionsProps = {
    listing: any;
    onChanged?: () => void;
};

const listingUpdateEndpoint = (listingId: number | string) =>
    `/listings/${listingId}/`;

function getStatus(listing: any) {
    return String(listing?.status || "").toLowerCase();
}

export default function SellerListingStatusActions({
    listing,
    onChanged,
}: SellerListingStatusActionsProps) {
    const [loading, setLoading] = useState("");

    const status = getStatus(listing);
    const listingId = listing?.id;

    async function updateStatus(nextStatus: string) {
        if (!listingId) return;

        const confirmed = window.confirm(
            `Are you sure you want to mark this advert as ${nextStatus}?`
        );

        if (!confirmed) return;

        setLoading(nextStatus);

        try {
            await apiPatch(listingUpdateEndpoint(listingId), {
                status: nextStatus,
            });

            if (onChanged) {
                onChanged();
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            alert(error.message || "Failed to update listing status.");
        } finally {
            setLoading("");
        }
    }

    return (
        <div className="mt-3 grid gap-2">
            {status !== "sold" && (
                <button
                    type="button"
                    onClick={() => updateStatus("sold")}
                    disabled={loading === "sold"}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {loading === "sold" ? "Marking..." : "Mark as Sold"}
                </button>
            )}

            {status === "sold" && (
                <button
                    type="button"
                    onClick={() => updateStatus("active")}
                    disabled={loading === "active"}
                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                    {loading === "active" ? "Reactivating..." : "Reactivate Advert"}
                </button>
            )}

            {status !== "draft" && status !== "sold" && (
                <button
                    type="button"
                    onClick={() => updateStatus("draft")}
                    disabled={loading === "draft"}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                    {loading === "draft" ? "Saving..." : "Move to Draft"}
                </button>
            )}
        </div>
    );
}