"use client";

import { useState } from "react";
import { apiDelete } from "@/lib/apiClient";

type SellerListingDeleteActionProps = {
    listing: any;
    onChanged?: () => void;
};

const listingDeleteEndpoint = (listingId: number | string) =>
    `/listings/${listingId}/`;

export default function SellerListingDeleteAction({
    listing,
    onChanged,
}: SellerListingDeleteActionProps) {
    const [loading, setLoading] = useState(false);

    async function deleteListing() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this advert? This may remove it from public view."
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            await apiDelete(listingDeleteEndpoint(listing.id));

            if (onChanged) {
                onChanged();
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            alert(error.message || "Failed to delete advert.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={deleteListing}
            disabled={loading}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
            {loading ? "Deleting..." : "Delete Advert"}
        </button>
    );
}