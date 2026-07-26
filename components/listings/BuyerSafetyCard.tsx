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
            className="relative scroll-mt-24 overflow-hidden rounded-[16px] bg-slate-950 p-4 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] sm:rounded-[28px] sm:p-6 sm:shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
        >
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full bg-orange-400/10 blur-2xl" />

            <div className="relative">
                <div className="flex items-start gap-3 sm:gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-orange-500 text-white shadow-lg shadow-orange-950/30 sm:h-12 sm:w-12 sm:rounded-2xl">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">
                            QOT Buyer Safety
                        </p>
                        <h2 className="mt-0.5 text-base font-black tracking-tight text-white sm:mt-1 sm:text-xl">
                            Buy with confidence
                        </h2>
                        <p className="mt-0.5 text-[10px] font-semibold leading-4 text-slate-400 sm:mt-1 sm:text-xs sm:leading-5">
                            A few checks can help you avoid scams.
                        </p>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-5 sm:block sm:space-y-2.5">
                    {safetyTips.map((tip) => (
                        <div
                            key={tip.title}
                            className="flex flex-col items-center gap-1.5 rounded-[11px] bg-white/[0.07] p-2 text-center ring-1 ring-white/10 sm:flex-row sm:gap-3 sm:rounded-2xl sm:p-3.5 sm:text-left"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-white/10 text-orange-400 sm:h-9 sm:w-9 sm:rounded-xl">
                                <FontAwesomeIcon icon={tip.icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black leading-3 text-white sm:text-sm sm:leading-normal">{tip.title}</p>
                                <p className="mt-0.5 hidden text-[11px] font-semibold leading-[17px] text-slate-400 sm:block">
                                    {tip.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-3 grid gap-2 sm:mt-4 sm:gap-2.5 ${showReportButton ? "grid-cols-2" : "grid-cols-1"}`}>
                    <a
                        href="/safety/report"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[11px] bg-white px-3 text-[10px] font-black text-slate-950 transition hover:bg-orange-50 sm:min-h-11 sm:rounded-[15px] sm:text-xs"
                    >
                        Safety tips
                        <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                    </a>

                    {showReportButton && (
                        <a
                            href={reportHref}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[11px] bg-white/10 px-3 text-[10px] font-black text-white ring-1 ring-white/15 transition hover:bg-white/15 sm:min-h-11 sm:rounded-[15px] sm:text-xs"
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
