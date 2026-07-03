"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type MyListingCardProps = {
    listing: any;
    onChanged?: () => void;
};

export default function MyListingCard({
    listing,
    onChanged,
}: MyListingCardProps) {
    const [loadingAction, setLoadingAction] = useState("");

    const image =
        listing.primary_image ||
        listing.image ||
        listing.cover_image ||
        listing.images?.[0]?.image ||
        listing.images?.[0]?.url;

    async function updateStatus(status: string) {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setLoadingAction(status);

        try {
            const response = await fetch(`${API_BASE_URL}/listings/${listing.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to update listing status."
                );
            }

            if (onChanged) onChanged();
        } catch (error: any) {
            alert(error.message || "Something went wrong.");
        } finally {
            setLoadingAction("");
        }
    }

    return (
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex h-48 items-center justify-center bg-slate-200 text-slate-500">
                {image ? (
                    <img
                        src={image}
                        alt={listing.title || "Listing image"}
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
                    {listing.title || "Untitled listing"}
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
                        href={`/my-listings/${listing.id}/edit`}
                        className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
                    >
                        Edit Listing
                    </a>

                    <a
                        href={`/listings/${listing.id}`}
                        className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
                    >
                        View Public Page
                    </a>

                    <button
                        onClick={() => updateStatus("sold")}
                        disabled={loadingAction === "sold"}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loadingAction === "sold" ? "Updating..." : "Mark Sold"}
                    </button>

                    <button
                        onClick={() => updateStatus("active")}
                        disabled={loadingAction === "active"}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loadingAction === "active" ? "Updating..." : "Make Available"}
                    </button>

                    <button
                        onClick={() => updateStatus("unavailable")}
                        disabled={loadingAction === "unavailable"}
                        className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {loadingAction === "unavailable"
                            ? "Updating..."
                            : "Make Unavailable"}
                    </button>
                </div>
            </div>
        </article>
    );
}