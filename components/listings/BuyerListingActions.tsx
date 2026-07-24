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
            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide">
                        Preparing secure actions
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-12 animate-pulse rounded-[18px] bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-[18px] bg-slate-100" />
                    <div className="col-span-2 h-12 animate-pulse rounded-[18px] bg-slate-100" />
                </div>
            </div>
        );
    }

    if (isOwner) {
        return (
            <div className="rounded-[24px] bg-orange-50 p-4 ring-1 ring-orange-100">
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

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <a
                        href={`/account/my-ads/${listingId}`}
                        className="flex items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-800"
                    >
                        <FontAwesomeIcon icon={faBullhorn} className="h-3.5 w-3.5" />
                        Manage ad
                    </a>

                    <a
                        href={`/account/my-ads/${listingId}/edit`}
                        className="flex items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-4 py-3 text-xs font-black text-white transition hover:bg-orange-600"
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
        "min-w-0 [&_button]:!h-12 [&_button]:!w-full [&_button]:!rounded-[18px] " +
        "[&_button]:!border-0 [&_button]:!px-4 [&_button]:!text-xs [&_button]:!font-black [&_button]:!shadow-none " +
        "[&_a]:!h-12 [&_a]:!w-full [&_a]:!rounded-[18px] [&_a]:!border-0 [&_a]:!px-4 " +
        "[&_a]:!text-xs [&_a]:!font-black [&_a]:!shadow-none";

    return (
        <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-800 [&_button]:!ring-1 [&_button]:!ring-slate-200 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600`}
                    >
                        <FavoriteButton listingId={listingId} compact />
                    </div>

                    <div
                        className={`${actionShell} [&_button]:!bg-orange-500 [&_button]:!text-white [&_button:hover]:!bg-orange-600 [&_a]:!bg-orange-500 [&_a]:!text-white [&_a:hover]:!bg-orange-600`}
                    >
                        <ContactSellerButton listingId={listingId} />
                    </div>
                </div>

                <div
                    className={`${actionShell} [&_button]:!bg-emerald-600 [&_button]:!text-white [&_button:hover]:!bg-emerald-700 [&_a]:!bg-emerald-600 [&_a]:!text-white [&_a:hover]:!bg-emerald-700`}
                >
                    <SellerContactActions listing={listing} compact />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
