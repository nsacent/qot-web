"use client";

import SellerListingStatusActions from "@/components/dashboard/SellerListingStatusActions";
import SellerListingDeleteAction from "@/components/dashboard/SellerListingDeleteAction";

type MyListingCardProps = {
    listing: any;
    onChanged?: () => void;
};

export default function MyListingCard({
    listing,
    onChanged,
}: MyListingCardProps) {
    const image =
        listing.primary_image ||
        listing.image ||
        listing.cover_image ||
        listing.images?.[0]?.image ||
        listing.images?.[0]?.url;

    return (
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex h-48 items-center justify-center bg-slate-200 text-slate-500">
                {image ? (
                    <img
                        src={image}
                        alt={listing.title || "Ad image"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span>No image</span>
                )}
            </div>

            <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                        {listing.status || "active"}
                    </span>

                    <span className="text-xs text-slate-500">ID: {listing.id}</span>
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {listing.title || "Untitled ad"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    {listing.city?.name || listing.location || "Uganda"}
                </p>

                <p className="mt-4 text-xl font-bold text-orange-600">
                    {listing.price
                        ? `UGX ${Number(listing.price).toLocaleString()}`
                        : "Contact seller"}
                </p>

                <div className="mt-5 grid gap-2">
                    <a
                        href={`/account/my-ads/${listing.id}/edit`}
                        className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
                    >
                        Edit Ad
                    </a>

                    <a
                        href={`/ads/${listing.id}`}
                        className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
                    >
                        View Public Page
                    </a>

                    <SellerListingStatusActions
                        listing={listing}
                        onChanged={onChanged}
                    />
                    <SellerListingDeleteAction
                        listing={listing}
                        onChanged={onChanged}
                    />
                </div>
            </div>
        </article>
    );
}
