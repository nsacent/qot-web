"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { getStoredToken, getStoredUser } from "@/lib/auth";
import FavoriteButton from "@/components/listings/FavoriteButton";
import ContactSellerButton from "@/components/chats/ContactSellerButton";
import SellerContactActions from "@/components/listings/SellerContactActions";
import ReviewSellerForm from "@/components/reviews/ReviewSellerForm";
import ReportListingButton from "@/components/listings/ReportListingButton";

type BuyerListingActionsProps = {
    listing: any;
    listingId: string | number;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;

    return [];
}

function getListingId(item: any) {
    return (
        item?.id ||
        item?.listing?.id ||
        item?.listing_id ||
        item?.advert_id ||
        item?.listing?.listing_id ||
        ""
    );
}

function cleanValue(value: any) {
    if (value === undefined || value === null || value === "") return "";
    return String(value).trim().toLowerCase();
}

function uniqueValues(values: any[]) {
    return Array.from(new Set(values.map(cleanValue).filter(Boolean)));
}

function getCurrentUserIdentifiers(user: any) {
    return uniqueValues([
        user?.id,
        user?.user_id,
        user?.pk,
        user?.sub,
        user?.profile?.id,
        user?.profile?.user_id,
        user?.account?.id,
        user?.phone,
        user?.phone_number,
        user?.mobile,
        user?.email,
        user?.username,
        user?.identifier,
    ]);
}

function getListingOwnerIdentifiers(listing: any) {
    return uniqueValues([
        listing?.seller?.id,
        listing?.seller?.user?.id,
        listing?.seller?.user_id,
        listing?.seller_id,

        listing?.user?.id,
        listing?.user_id,

        listing?.owner?.id,
        listing?.owner?.user?.id,
        listing?.owner_id,

        listing?.created_by?.id,
        listing?.created_by_id,

        listing?.seller?.phone,
        listing?.seller?.phone_number,
        listing?.seller?.mobile,
        listing?.seller?.email,
        listing?.seller?.username,

        listing?.user?.phone,
        listing?.user?.email,
        listing?.user?.username,

        listing?.owner?.phone,
        listing?.owner?.email,
        listing?.owner?.username,
    ]);
}

function userOwnsListingByIdentifiers(user: any, listing: any) {
    const userIdentifiers = getCurrentUserIdentifiers(user);
    const ownerIdentifiers = getListingOwnerIdentifiers(listing);

    return userIdentifiers.some((value) => ownerIdentifiers.includes(value));
}

export default function BuyerListingActions({
    listing,
    listingId,
}: BuyerListingActionsProps) {
    const [checkingOwner, setCheckingOwner] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        async function checkOwnership() {
            setCheckingOwner(true);

            const token = getStoredToken();
            const user = getStoredUser();

            if (!token) {
                setIsOwner(false);
                setCheckingOwner(false);
                return;
            }

            if (user && listing && userOwnsListingByIdentifiers(user, listing)) {
                setIsOwner(true);
                setCheckingOwner(false);
                return;
            }

            try {
                const sellerListingsData = await apiGet(
                    "/my-ads/?page_size=1000",
                    {
                        redirectOnUnauthorized: false,
                    }
                );

                const sellerListings = getArray(sellerListingsData);

                const found = sellerListings.some(
                    (item) => String(getListingId(item)) === String(listingId)
                );

                setIsOwner(found);

                console.log("Buyer actions ownership check:", {
                    currentListingId: String(listingId),
                    sellerListingIds: sellerListings.map((item) =>
                        String(getListingId(item))
                    ),
                    owns: found,
                });
            } catch (error) {
                setIsOwner(false);
                console.log("Buyer actions ownership check failed:", error);
            } finally {
                setCheckingOwner(false);
            }
        }

        checkOwnership();
    }, [listingId, listing]);

    if (checkingOwner) {
        return (
            <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                Checking advert ownership...
            </div>
        );
    }

    if (isOwner) {
        return (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-bold text-orange-800">This is your advert.</p>

                <p className="mt-1 text-sm leading-6 text-orange-700">
                    Buyer actions are hidden because you cannot contact, review, save, or
                    report your own listing.
                </p>

                <div className="mt-4 grid gap-3">
                    <a
                        href={`/my-ads/${listingId}/edit`}
                        className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                    >
                        Edit Advert
                    </a>

                    <a
                        href={`/seller/analytics/${listingId}`}
                        className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-center font-semibold text-orange-700 hover:bg-orange-100"
                    >
                        View Analytics
                    </a>

                    <a
                        href="/my-ads"
                        className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-center font-semibold text-orange-700 hover:bg-orange-100"
                    >
                        My Listings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <FavoriteButton listingId={listingId} />

            <ContactSellerButton listingId={listingId} />

            <SellerContactActions listing={listing} />

            <ReviewSellerForm listing={listing} />

            <a
                href="/messages"
                className="block rounded-xl border px-5 py-3 text-center font-semibold text-slate-900 hover:bg-slate-50"
            >
                My Messages
            </a>

            <ReportListingButton listingId={listingId} listing={listing} />
        </div>
    );
}