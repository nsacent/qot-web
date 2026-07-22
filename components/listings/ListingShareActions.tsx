"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLink, faShareNodes } from "@/lib/faIcons";

type ListingShareActionsProps = {
    listing: any;
    listingId?: string | number;
    title?: string;
    className?: string;
};

function getListingId(listing: any, fallback?: string | number) {
    return fallback || listing?.id || listing?.listing_id || listing?.uuid || "";
}

function getListingTitle(listing: any, fallback?: string) {
    return fallback || listing?.title || listing?.name || "QOT ad";
}

export default function ListingShareActions({
    listing,
    listingId,
    title,
    className = "",
}: ListingShareActionsProps) {
    const [copied, setCopied] = useState(false);

    const id = getListingId(listing, listingId);
    const shareTitle = getListingTitle(listing, title);

    const shareUrl = useMemo(() => {
        if (typeof window === "undefined") return "";

        return `${window.location.origin}/ads/${id}`;
    }, [id]);

    async function handleCopyLink() {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch {
            alert("Could not copy link. Please copy it from the browser address bar.");
        }
    }

    async function handleShare() {
        if (!shareUrl) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: `Check this ad on QOT: ${shareTitle}`,
                    url: shareUrl,
                });

                return;
            } catch {
                return;
            }
        }

        await handleCopyLink();
    }

    if (!id) return null;

    return (
        <div className={`grid grid-cols-2 gap-3 ${className}`}>
            <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
            >
                <FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />
                Share
            </button>

            <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
            >
                <FontAwesomeIcon
                    icon={copied ? faCheck : faLink}
                    className="h-4 w-4"
                />
                {copied ? "Copied" : "Copy Link"}
            </button>
        </div>
    );
}
