"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faBullhorn,
    faCrown,
    faPenToSquare,
    faShieldHalved,
    faStar,
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
            <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-slate-950 p-6 text-white">
                    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />

                    <div className="relative flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-lg font-black">Checking ad access</p>
                            <p className="mt-1 text-sm font-semibold text-white/75">
                                Preparing safe actions for this listing...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 p-5">
                    <div className="h-14 animate-pulse rounded-[24px] bg-slate-100" />
                    <div className="h-14 animate-pulse rounded-[24px] bg-slate-100" />
                    <div className="h-14 animate-pulse rounded-[24px] bg-slate-100" />
                </div>
            </div>
        );
    }

    if (isOwner) {
        return (
            <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_22px_60px_rgba(249,115,22,0.16)] ring-1 ring-orange-100">
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-slate-950 p-6 text-white">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-white/10" />

                    <div className="relative flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white/20 shadow-inner backdrop-blur">
                            <FontAwesomeIcon icon={faCrown} className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xl font-black">This is your ad</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
                                Buyer actions are hidden because you cannot contact, save,
                                review, or report your own ad.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 p-5">
                    <a
                        href={`/my-ads/${listingId}`}
                        className="flex items-center justify-between rounded-[24px] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                <FontAwesomeIcon icon={faBullhorn} className="h-4 w-4" />
                            </span>
                            Manage Ad
                        </span>

                        <span className="text-white/60">→</span>
                    </a>

                    <a
                        href={`/my-ads/${listingId}/edit`}
                        className="flex items-center justify-between rounded-[24px] bg-orange-500 px-5 py-4 text-sm font-black text-white shadow-[0_16px_35px_rgba(249,115,22,0.25)] transition hover:-translate-y-0.5 hover:bg-orange-600"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                            </span>
                            Edit Ad
                        </span>

                        <span className="text-white/70">→</span>
                    </a>

                    <a
                        href="/my-ads"
                        className="flex items-center justify-between rounded-[24px] bg-orange-50 px-5 py-4 text-sm font-black text-orange-700 ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-100"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            </span>
                            Back to My Ads
                        </span>

                        <span className="text-orange-400">→</span>
                    </a>
                </div>
            </div>
        );
    }

    const actionShell =
        "rounded-[24px] bg-white p-2 shadow-sm ring-1 ring-slate-100 " +
        "[&_button]:!w-full [&_button]:!rounded-[20px] [&_button]:!border-0 [&_button]:!px-5 [&_button]:!py-4 " +
        "[&_button]:!text-sm [&_button]:!font-black [&_button]:!shadow-none " +
        "[&_a]:!w-full [&_a]:!rounded-[20px] [&_a]:!border-0 [&_a]:!px-5 [&_a]:!py-4 " +
        "[&_a]:!text-sm [&_a]:!font-black [&_a]:!shadow-none";

    return (
        <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
            <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/25 blur-sm" />
                <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-white/10 blur-sm" />

                <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500 shadow-[0_18px_40px_rgba(249,115,22,0.35)]">
                        <FontAwesomeIcon icon={faStar} className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 text-2xl font-black tracking-tight">
                        Interested?
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
                        Contact the seller, save this ad, or report anything suspicious.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 bg-gradient-to-b from-white to-slate-50 p-5">


                <div className="grid gap-3 sm:grid-cols-2">
                    <div
                        className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-800 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600`}
                    >
                        <FavoriteButton listingId={listingId} compact />
                    </div>

                    <div
                        className={`${actionShell} bg-orange-50 ring-orange-100 [&_button]:!bg-orange-500 [&_button]:!text-white [&_button:hover]:!bg-orange-600 [&_a]:!bg-orange-500 [&_a]:!text-white [&_a:hover]:!bg-orange-600`}
                    >
                        <ContactSellerButton listingId={listingId} />
                    </div>
                </div>

                <div
                    className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-800 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600 [&_a]:!bg-white [&_a]:!text-slate-800 [&_a:hover]:!bg-orange-50 [&_a:hover]:!text-orange-600`}
                >
                    <SellerContactActions listing={listing} compact />
                </div>

                <div
                    className={`${actionShell} [&_button]:!bg-white [&_button]:!text-slate-800 [&_button:hover]:!bg-orange-50 [&_button:hover]:!text-orange-600`}
                >
                    <ReviewSellerForm listing={listing} compact />
                </div>

                <div
                    className={`${actionShell} bg-red-50 ring-red-100 [&_button]:!bg-white [&_button]:!text-red-600 [&_button:hover]:!bg-red-100 [&_a]:!bg-white [&_a]:!text-red-600 [&_a:hover]:!bg-red-100`}
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