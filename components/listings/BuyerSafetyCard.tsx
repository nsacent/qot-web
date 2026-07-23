"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faBoxOpen,
    faLocationDot,
    faShieldHalved,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type BuyerSafetyCardProps = {
    listingId?: string | number;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.listings)) return data.listings;
    return [];
}

function getListingId(listing: any) {
    return String(listing?.id || listing?.listing_id || listing?.uuid || "");
}

export default function BuyerSafetyCard({ listingId }: BuyerSafetyCardProps) {
    const [ownershipStatus, setOwnershipStatus] = useState<
        "checking" | "own" | "not-own"
    >("checking");

    const currentListingId = String(listingId || "");

    useEffect(() => {
        async function checkOwnership() {
            if (!currentListingId) {
                setOwnershipStatus("not-own");
                return;
            }

            try {
                const data = await apiGet("/seller/listings/?page_size=1000", {
                    redirectOnUnauthorized: false,
                });
                const listings = getArray(data);

                const isOwnListing = listings.some(
                    (listing) => getListingId(listing) === currentListingId
                );

                setOwnershipStatus(isOwnListing ? "own" : "not-own");
            } catch {
                setOwnershipStatus("not-own");
            }
        }

        checkOwnership();
    }, [currentListingId]);

    const reportHref = currentListingId
        ? `/safety/report?listing=${currentListingId}`
        : "/safety/report";

    const showReportButton = ownershipStatus === "not-own";

    const safetyTips = [
        {
            icon: faLocationDot,
            title: "Meet somewhere public",
            description: "Choose a busy, well-lit place and avoid meeting alone.",
        },
        {
            icon: faBoxOpen,
            title: "Inspect before paying",
            description: "Check the item carefully and confirm it matches this ad.",
        },
        {
            icon: faShieldHalved,
            title: "Keep your money safe",
            description: "Never pay in advance or share your PIN or verification code.",
        },
    ];

    return (
        <section
            id="buyer-safety"
            className="relative scroll-mt-24 overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] sm:p-6"
        >
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full bg-orange-400/10 blur-2xl" />

            <div className="relative">
                <div className="flex items-start gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
                    </span>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">
                            QOT Buyer Safety
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                            Buy with confidence
                        </h2>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                            A few checks can help you avoid scams.
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-2.5">
                    {safetyTips.map((tip) => (
                        <div
                            key={tip.title}
                            className="flex gap-3 rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                                <FontAwesomeIcon icon={tip.icon} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-white">{tip.title}</p>
                                <p className="mt-0.5 text-[11px] font-semibold leading-[17px] text-slate-400">
                                    {tip.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-4 grid gap-2.5 ${showReportButton ? "grid-cols-2" : "grid-cols-1"}`}>
                    <a
                        href="/safety/report"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-white px-3 text-xs font-black text-slate-950 transition hover:bg-orange-50"
                    >
                        Safety tips
                        <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                    </a>

                    {showReportButton && (
                        <a
                            href={reportHref}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-white/10 px-3 text-xs font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
                        >
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="h-3.5 w-3.5 text-orange-400"
                            />
                            Report ad
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
