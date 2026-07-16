"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faPaperPlane,
    faStar,
    faUserCheck,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type ReviewSellerFormProps = {
    listing: any;
    compact?: boolean;
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
        listing?.seller?.business_name ||
        listing?.seller?.shop_name ||
        listing?.seller?.company_name ||
        listing?.seller?.full_name ||
        listing?.seller?.name ||
        listing?.seller?.username ||
        listing?.seller_name ||
        "this seller"
    );
}

async function readApiError(response: Response) {
    const text = await response.text();

    if (!text) {
        return "Failed to submit review. Please make sure you are logged in and verified.";
    }

    try {
        const data = JSON.parse(text);

        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        const firstKey = Object.keys(data || {})[0];
        const firstValue = firstKey ? data[firstKey] : "";

        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === "string") return firstValue;

        return "Failed to submit review. Please make sure you are logged in and verified.";
    } catch {
        return text;
    }
}

export default function ReviewSellerForm({
    listing,
    compact = false,
}: ReviewSellerFormProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const listingId = getListingId(listing);
    const sellerId = getSellerId(listing);
    const sellerName = getSellerName(listing);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [open, loading]);

    function closeModal() {
        if (loading) return;

        setOpen(false);
        setError("");
        setSuccess("");
    }

    async function submitReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!listingId) {
            setError("Listing ID is missing. Review cannot be submitted.");
            return;
        }

        if (!sellerId) {
            setError("Seller ID is missing. Review cannot be submitted.");
            return;
        }

        if (!comment.trim()) {
            setError("Please write a short comment about your experience.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/proxy/reviews/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    seller: sellerId,
                    listing: listingId,
                    rating,
                    comment: comment.trim(),
                }),
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/listings/${listingId}`;
                return;
            }

            if (!response.ok) {
                throw new Error(await readApiError(response));
            }

            setSuccess("Review submitted successfully. Thank you for your feedback.");
            setRating(5);
            setComment("");
        } catch (error: any) {
            setError(
                error?.message ||
                "Failed to submit review. Please make sure you are logged in and verified."
            );
        } finally {
            setLoading(false);
        }
    }

    const buttonClass = compact
        ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
        : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-orange-50 hover:text-orange-600";

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={buttonClass}
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-orange-500 ring-1 ring-orange-100">
                    <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                </span>

                Review Seller
            </button>

            {mounted && open
                ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
                        <div
                            className="absolute inset-0"
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        <div className="relative w-full max-w-lg overflow-hidden rounded-[34px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faUserCheck} className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-slate-950">
                                            Review {sellerName}
                                        </h2>
                                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                            Rate your experience with this seller for this advert.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </button>
                            </div>

                            {success ? (
                                <div className="p-6">
                                    <div className="rounded-[26px] bg-green-50 p-5 text-center ring-1 ring-green-100">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
                                            <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                                        </div>

                                        <p className="mt-4 text-lg font-black text-slate-950">
                                            Review submitted
                                        </p>

                                        <p className="mt-2 text-sm font-bold leading-6 text-green-700">
                                            {success}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitReview} className="p-6">
                                    <div className="rounded-[24px] bg-orange-50 p-4 ring-1 ring-orange-100">
                                        <p className="font-black text-slate-950">
                                            Help other buyers
                                        </p>
                                        <p className="mt-1 text-sm font-bold leading-6 text-orange-700">
                                            Give an honest review based on your real experience with
                                            this seller.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mt-5">
                                        <label className="mb-3 block text-sm font-black text-slate-800">
                                            Rating
                                        </label>

                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setRating(value)}
                                                    className={`flex h-12 items-center justify-center rounded-[18px] text-sm font-black transition ${rating >= value
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600"
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                                                </button>
                                            ))}
                                        </div>

                                        <p className="mt-2 text-xs font-bold text-slate-500">
                                            {rating === 5 && "Excellent"}
                                            {rating === 4 && "Good"}
                                            {rating === 3 && "Average"}
                                            {rating === 2 && "Poor"}
                                            {rating === 1 && "Very poor"}
                                        </p>
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-black text-slate-800">
                                            Comment
                                        </label>

                                        <textarea
                                            value={comment}
                                            onChange={(event) => setComment(event.target.value)}
                                            placeholder="Example: Good seller. Item was as described."
                                            rows={5}
                                            className="w-full resize-none rounded-[18px] border-0 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-200"
                                        />
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-4 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
                                        >
                                            <FontAwesomeIcon
                                                icon={loading ? faUserCheck : faPaperPlane}
                                                className="h-4 w-4"
                                            />
                                            {loading ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>,
                    document.body
                )
                : null}
        </>
    );
}