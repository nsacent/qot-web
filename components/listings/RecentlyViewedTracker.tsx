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
        description: listing?.description || "",
        price: listing?.price || "",
        image: getImage(listing),
        category: listing?.category?.name || listing?.category_name || "",
        city:
            listing?.city?.name ||
            listing?.city_name ||
            listing?.location ||
            "Uganda",
        region: listing?.city?.region?.name || listing?.region_name || "",
        condition: listing?.condition || "",
        is_negotiable: Boolean(listing?.is_negotiable),
        is_featured: Boolean(listing?.is_featured),
        featured_until: listing?.featured_until || null,
        views_count: Number(listing?.views_count || listing?.views || 0),
        image_count: Number(listing?.image_count || listing?.images?.length || 0),
        created_at: listing?.created_at || null,
        viewed_at: new Date().toISOString(),
    };
}

export default function RecentlyViewedTracker({
    listing,
}: RecentlyViewedTrackerProps) {
    useEffect(() => {
        if (!listing?.id) {
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
        } catch {
            // Browsing history is optional and must never interrupt the ad page.
        }
    }, [listing?.id]);

    return null;
}
