"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faBullhorn,
    faCrown,
    faPenToSquare,
    faShieldHalved,
} from "@/lib/faIcons";
import FavoriteButton from "@/components/listings/FavoriteButton";
import ContactSellerButton from "@/components/chats/ContactSellerButton";
import SellerContactActions from "@/components/listings/SellerContactActions";
import ReviewSellerForm from "@/components/reviews/ReviewSellerForm";
import ReportListingButton from "@/components/listings/ReportListingButton";

type BuyerListingActionsProps = {
    listing: any;
    listingId: string | number;
};

async function checkIfOwner(listingId: string | number) {
    try {
        const response = await fetch(`/api/proxy/seller/listings/${listingId}/`, {
            credentials: "include",
            cache: "no-store",
        });

        if (response.ok) return true;

        if (
            response.status === 401 ||
            response.status === 403 ||
            response.status === 404
        ) {
            return false;
        }

        return false;
    } catch {
        return false;
    }
}

export default function BuyerListingActions({
    listing,
    listingId,
}: BuyerListingActionsProps) {
    const [checkingOwner, setCheckingOwner] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function checkOwnership() {
            setCheckingOwner(true);

            const ownsListing = await checkIfOwner(listingId);

            if (!isMounted) return;

            setIsOwner(ownsListing);
            setCheckingOwner(false);
        }

        checkOwnership();

        return () => {
            isMounted = false;
        };
    }, [listingId]);

    if (checkingOwner) {
        return (
            <div className="rounded-[11px] bg-white p-2.5 ring-1 ring-slate-200 sm:rounded-[24px] sm:p-4">
                <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-orange-50 text-orange-600 sm:h-9 sm:w-9 sm:rounded-xl">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wide sm:text-xs">
                        Preparing secure actions
                    </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                    <div className="h-10 animate-pulse rounded-[10px] bg-slate-100 sm:h-12 sm:rounded-[18px]" />
                    <div className="h-10 animate-pulse rounded-[10px] bg-slate-100 sm:h-12 sm:rounded-[18px]" />
                    <div className="col-span-2 h-10 animate-pulse rounded-[10px] bg-slate-100 sm:h-12 sm:rounded-[18px]" />
                </div>
            </div>
        );
    }

    if (isOwner) {
        return (
            <div className="rounded-[11px] bg-orange-50 p-2.5 ring-1 ring-orange-100 sm:rounded-[24px] sm:p-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
                        <FontAwesomeIcon icon={faCrown} className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-sm font-black text-slate-950">This is your ad</p>
                        <p className="mt-0.5 text-xs font-bold text-orange-700">
                            Manage its details and buyer enquiries.
                        </p>
                    </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                    <a
                        href={`/account/my-ads/${listingId}`}
                        className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-slate-950 px-3 text-[10px] font-black text-white transition hover:bg-slate-800 sm:h-auto sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-xs"
                    >
                        <FontAwesomeIcon icon={faBullhorn} className="h-3.5 w-3.5" />
                        Manage ad
                    </a>

                    <a
                        href={`/account/my-ads/${listingId}/edit`}
                        className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-orange-500 px-3 text-[10px] font-black text-white transition hover:bg-orange-600 sm:h-auto sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-xs"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                        Edit ad
                    </a>
                </div>

                <a
                    href="/account/my-ads"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 text-xs font-black text-orange-700 hover:text-orange-800"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                    Back to all my ads
                </a>
            </div>
        );
    }

    const actionShell =
        "min-w-0 [&_button]:!h-10 [&_button]:!w-full [&_button]:!rounded-[10px] " +
        "[&_button]:!border-0 [&_button]:!px-3 [&_button]:!text-[10px] [&_button]:!font-black [&_button]:!shadow-none " +
        "[&_a]:!h-10 [&_a]:!w-full [&_a]:!rounded-[10px] [&_a]:!border-0 [&_a]:!px-3 " +
        "[&_a]:!text-[10px] [&_a]:!font-black [&_a]:!shadow-none " +
        "sm:[&_button]:!h-12 sm:[&_button]:!rounded-[18px] sm:[&_button]:!px-4 sm:[&_button]:!text-xs " +
        "sm:[&_a]:!h-12 sm:[&_a]:!rounded-[18px] sm:[&_a]:!px-4 sm:[&_a]:!text-xs";

    return (
        <div className="grid gap-2 sm:gap-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div
                        className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-800 [&_button]:!ring-1 [&_button]:!ring-slate-200 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600`}
                    >
                        <FavoriteButton listingId={listingId} compact />
                    </div>

                    <div
                        className={`${actionShell} [&_button]:!bg-orange-500 [&_button]:!text-white [&_button:hover]:!bg-orange-600 [&_a]:!bg-orange-500 [&_a]:!text-white [&_a:hover]:!bg-orange-600`}
                    >
                        <ContactSellerButton listingId={listingId} listing={listing} />
                    </div>
                </div>

                <div
                    className={`${actionShell} [&_button]:!bg-emerald-600 [&_button]:!text-white [&_button:hover]:!bg-emerald-700 [&_a]:!bg-emerald-600 [&_a]:!text-white [&_a:hover]:!bg-emerald-700`}
                >
                    <SellerContactActions listing={listing} compact />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div
                        className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-700 [&_button]:!ring-1 [&_button]:!ring-slate-200 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600`}
                    >
                        <ReviewSellerForm listing={listing} compact />
                    </div>

                    <div
                        className={`${actionShell} [&_button]:!bg-red-50 [&_button]:!text-red-600 [&_button]:!ring-1 [&_button]:!ring-red-100 [&_button:hover]:!bg-red-100`}
                    >
                        <ReportListingButton
                            listingId={listingId}
                            listing={listing}
                            compact
                        />
                    </div>
                </div>
        </div>
    );
}
