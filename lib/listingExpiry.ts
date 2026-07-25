const ACTIVE_STATUSES = new Set(["active", "approved", "available", "published"]);

export function getListingExpiryValue(listing: any) {
    return (
        listing?.expires_at ||
        listing?.expiry_date ||
        listing?.expires_on ||
        listing?.valid_until ||
        ""
    );
}

export function getListingFeaturedUntil(listing: any) {
    return (
        listing?.featured_until ||
        listing?.feature_expires_at ||
        listing?.promotion_expires_at ||
        ""
    );
}

export function getListingExpiryTime(value: unknown) {
    if (!value) return null;

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (value instanceof Date) {
        const dateTime = value.getTime();
        return Number.isNaN(dateTime) ? null : dateTime;
    }

    const time = new Date(String(value)).getTime();
    return Number.isNaN(time) ? null : time;
}

export function listingCanBeRenewed(listing: any, now = Date.now()) {
    const status = String(
        listing?.status || listing?.listing_status || listing?.approval_status || ""
    ).toLowerCase();

    if (status === "expired") return true;
    if (!ACTIVE_STATUSES.has(status)) return false;

    const expiryTime = getListingExpiryTime(getListingExpiryValue(listing));
    return expiryTime !== null && expiryTime <= now;
}

export function listingIsCurrentlyFeatured(listing: any, now = Date.now()) {
    if (!listing?.is_featured && !listing?.featured) return false;

    const featuredUntil = getListingFeaturedUntil(listing);
    const featuredUntilTime = getListingExpiryTime(featuredUntil);

    return featuredUntilTime === null || featuredUntilTime > now;
}

export function formatExpiryRemaining(value: unknown, now = Date.now()) {
    const expiryTime = getListingExpiryTime(value);
    if (expiryTime === null) return "Expiry time unavailable";

    const remaining = expiryTime - now;
    if (remaining <= 0) return "Expired — renewal is available";

    const totalMinutes = Math.max(1, Math.ceil(remaining / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
        return `${days} day${days === 1 ? "" : "s"}${hours > 0 ? ` ${hours} hr${hours === 1 ? "" : "s"}` : ""} remaining`;
    }

    if (hours > 0) {
        return `${hours} hr${hours === 1 ? "" : "s"}${minutes > 0 ? ` ${minutes} min` : ""} remaining`;
    }

    return `${minutes} min remaining`;
}
