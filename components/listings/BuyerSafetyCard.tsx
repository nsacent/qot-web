"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

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

    return (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                Buyer Safety
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
                Stay safe before making payment
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• Meet the seller in a safe public place.</li>
                <li>• Inspect the item carefully before paying.</li>
                <li>• Do not send money before confirming the item.</li>
                <li>• Be careful with deals that look too cheap.</li>
                <li>• Report suspicious adverts immediately.</li>
            </ul>

            <div
                className={
                    showReportButton
                        ? "mt-5 grid gap-3 sm:grid-cols-2"
                        : "mt-5 grid gap-3"
                }
            >
                <a
                    href="/safety/report"
                    className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-center text-sm font-semibold text-orange-700 hover:bg-orange-100"
                >
                    Safety Center
                </a>

                {showReportButton && (
                    <a
                        href={reportHref}
                        className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Report Advert
                    </a>
                )}
            </div>
        </div>
    );
}
