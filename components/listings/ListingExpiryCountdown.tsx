"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@/lib/faIcons";
import {
    formatExpiryRemaining,
    getListingExpiryTime,
} from "@/lib/listingExpiry";

type ListingExpiryCountdownProps = {
    expiresAt: unknown;
    className?: string;
    label?: string;
    expiredLabel?: string;
};

export default function ListingExpiryCountdown({
    expiresAt,
    className = "",
    label = "",
    expiredLabel = "",
}: ListingExpiryCountdownProps) {
    const [now, setNow] = useState(() => Date.now());
    const expiryTime = getListingExpiryTime(expiresAt);

    useEffect(() => {
        if (expiryTime === null || expiryTime <= Date.now()) return;

        const interval = window.setInterval(() => setNow(Date.now()), 60000);
        return () => window.clearInterval(interval);
    }, [expiryTime]);

    if (expiryTime === null) return null;

    const expired = expiryTime <= now;

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-black ${
                expired ? "text-orange-600" : "text-slate-500"
            } ${className}`}
            title={new Date(expiryTime).toLocaleString()}
            aria-live="polite"
        >
            <FontAwesomeIcon icon={faClock} className="h-3 w-3 shrink-0" />
            {label && <span>{label}</span>}
            <span>
                {expired && expiredLabel
                    ? expiredLabel
                    : formatExpiryRemaining(expiryTime, now)}
            </span>
        </span>
    );
}
