"use client";

import { useState } from "react";

type ShareListingButtonProps = {
    listing: any;
};

function getListingUrl(listingId: number | string) {
    if (typeof window === "undefined") return "";

    return `${window.location.origin}/ads/${listingId}`;
}

function getShareText(listing: any, url: string) {
    const title = listing?.title || "QOT ad";
    const price = listing?.price
        ? `UGX ${Number(listing.price).toLocaleString()}`
        : "Contact seller";

    return `${title} - ${price}\nView it on QOT: ${url}`;
}

export default function ShareListingButton({ listing }: ShareListingButtonProps) {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
        const url = getListingUrl(listing.id);

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            alert("Failed to copy link.");
        }
    }

    async function shareNative() {
        const url = getListingUrl(listing.id);
        const text = getShareText(listing, url);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing?.title || "QOT ad",
                    text,
                    url,
                });
            } catch {
                // User cancelled share; no need to alert.
            }

            return;
        }

        copyLink();
    }

    function shareWhatsApp() {
        const url = getListingUrl(listing.id);
        const text = getShareText(listing, url);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

        window.open(whatsappUrl, "_blank");
    }

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Share this Advert</h2>

            <p className="mt-2 text-sm text-slate-600">
                Send this ad to someone who may be interested.
            </p>

            <div className="mt-5 grid gap-3">
                <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                    Share on WhatsApp
                </button>

                <button
                    type="button"
                    onClick={shareNative}
                    className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                    Share
                </button>

                <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                >
                    {copied ? "Link Copied ✓" : "Copy Link"}
                </button>
            </div>
        </div>
    );
}
