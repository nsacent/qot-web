"use client";

import { useEffect } from "react";

const STORAGE_KEY = "qot_recently_viewed";
const MAX_ITEMS = 12;

type RecentlyViewedTrackerProps = {
    listing: any;
};

function getImage(listing: any) {
    return (
        listing?.primary_image ||
        listing?.image ||
        listing?.cover_image ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        ""
    );
}

function getItem(listing: any) {
    return {
        id: listing?.id,
        title: listing?.title || "Untitled ad",
        price: listing?.price || "",
        image: getImage(listing),
        category: listing?.category?.name || listing?.category_name || "",
        city:
            listing?.city?.name ||
            listing?.city_name ||
            listing?.location ||
            "Uganda",
        viewed_at: new Date().toISOString(),
    };
}

export default function RecentlyViewedTracker({
    listing,
}: RecentlyViewedTrackerProps) {
    useEffect(() => {
        if (!listing?.id) {
            console.log("Recently viewed skipped. Missing listing ID:", listing);
            return;
        }

        try {
            const existingRaw = localStorage.getItem(STORAGE_KEY);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];

            const withoutCurrent = existing.filter(
                (item: any) => String(item.id) !== String(listing.id)
            );

            const item = getItem(listing);
            const updated = [item, ...withoutCurrent].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            console.log("Recently viewed saved:", item);
        } catch (error) {
            console.error("Recently viewed error:", error);
        }
    }, [listing?.id]);

    return null;
}
