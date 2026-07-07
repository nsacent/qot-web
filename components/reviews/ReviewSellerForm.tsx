"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";

type ReviewSellerFormProps = {
    listing: any;
};

function getListingId(listing: any) {
    return listing?.id || listing?.listing_id || "";
}

function getSellerId(listing: any) {
    if (typeof listing?.seller === "number" || typeof listing?.seller === "string") {
        return listing.seller;
    }

    return (
        listing?.seller?.id ||
        listing?.seller_id ||
        listing?.user?.id ||
        listing?.user_id ||
        listing?.owner?.id ||
        listing?.owner_id ||
        ""
    );
}

function getSellerName(listing: any) {
    return (
        listing?.seller?.full_name ||
        listing?.seller?.name ||
        listing?.seller?.username ||
        listing?.seller_name ||
        "this seller"
    );
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to submit review. Please make sure you are logged in and verified.";
    }

    return message;
}

export default function ReviewSellerForm({ listing }: ReviewSellerFormProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const listingId = getListingId(listing);
    const sellerId = getSellerId(listing);
    const sellerName = getSellerName(listing);

    async function submitReview(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!listingId) {
            alert("Listing ID is missing. Review cannot be submitted.");
            return;
        }

        if (!sellerId) {
            alert("Seller ID is missing. Review cannot be submitted.");
            return;
        }

        setLoading(true);
        setSuccess("");

        try {
            await apiPost("/reviews/", {
                seller: sellerId,
                listing: listingId,
                rating: Number(rating),
                comment: comment.trim(),
            });

            setSuccess("Review submitted successfully. Thank you for your feedback.");
            setRating("5");
            setComment("");

            setTimeout(() => {
                setOpen(false);
                setSuccess("");
            }, 1600);
        } catch (error: any) {
            alert(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
            >
                Review Seller
            </button>
        );
    }

    return (
        <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-bold text-slate-900">Review {sellerName}</h3>

                    <p className="mt-1 text-sm text-slate-600">
                        Rate your experience with this seller for this advert.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                    ✕
                </button>
            </div>

            {success ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                    {success}
                </div>
            ) : (
                <form onSubmit={submitReview} className="mt-4 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Rating
                        </label>

                        <select
                            value={rating}
                            onChange={(event) => setRating(event.target.value)}
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-orange-500"
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very poor</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Comment
                        </label>

                        <textarea
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="Example: Good seller. Item was as described."
                            rows={4}
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            )}
        </div>
    );
}