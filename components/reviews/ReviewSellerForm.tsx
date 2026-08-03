"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faPaperPlane,
    faShieldHalved,
    faStar,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type ReviewSellerFormProps = {
    listing: any;
    compact?: boolean;
    onSubmitted?: () => void;
};

type Eligibility = {
    eligible: boolean;
    already_reviewed?: boolean;
    reason?: string;
    transaction?: any;
};

function getListingId(listing: any) {
    if (typeof listing === "number" || typeof listing === "string") return listing;
    return listing?.id || listing?.listing_id || listing?.listing || "";
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

    if (!text) return "Failed to submit your review. Please try again.";

    try {
        const data = JSON.parse(text);

        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        const firstKey = Object.keys(data || {})[0];
        const firstValue = firstKey ? data[firstKey] : "";
        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === "string") return firstValue;

        return "Failed to submit your review. Please try again.";
    } catch {
        return text;
    }
}

function RatingRow({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[16px] bg-slate-50 px-3 py-2.5">
            <span className="min-w-0 text-xs font-black text-slate-700 sm:text-sm">{label}</span>
            <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label={label}>
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange(rating)}
                        aria-label={`${rating} out of 5`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-orange-100"
                    >
                        <FontAwesomeIcon
                            icon={faStar}
                            className={`h-3.5 w-3.5 ${rating <= value ? "text-orange-500" : "text-slate-200"}`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ReviewSellerForm({
    listing,
    compact = false,
    onSubmitted,
}: ReviewSellerFormProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const [eligibility, setEligibility] = useState<Eligibility | null>(null);
    const [rating, setRating] = useState(5);
    const [accuracyRating, setAccuracyRating] = useState(5);
    const [conditionRating, setConditionRating] = useState(5);
    const [communicationRating, setCommunicationRating] = useState(5);
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
        if (!listingId) {
            setEligibility({ eligible: false, reason: "Ad information is unavailable." });
            setChecking(false);
            return;
        }

        if (listing?.offer && listing?.seller) {
            setEligibility({ eligible: true, transaction: listing });
            setChecking(false);
            return;
        }

        const controller = new AbortController();
        setChecking(true);

        fetch(`/api/proxy/reviews/eligibility/?listing=${encodeURIComponent(String(listingId))}`, {
            credentials: "include",
            signal: controller.signal,
        })
            .then(async (response) => {
                if (response.status === 401) {
                    return {
                        eligible: false,
                        reason: "Sign in and complete a purchase to leave a review.",
                    };
                }
                if (!response.ok) throw new Error(await readApiError(response));
                return response.json();
            })
            .then((data) => setEligibility(data))
            .catch((error: any) => {
                if (error?.name !== "AbortError") {
                    setEligibility({
                        eligible: false,
                        reason: error?.message || "Review eligibility is unavailable.",
                    });
                }
            })
            .finally(() => setChecking(false));

        return () => controller.abort();
    }, [listing, listingId]);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") closeModal();
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
        const completed = Boolean(success);
        setOpen(false);
        setError("");
        setSuccess("");
        if (completed) onSubmitted?.();
    }

    async function submitReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!eligibility?.eligible) {
            setError(eligibility?.reason || "This purchase is not ready to review.");
            return;
        }
        if (!listingId || !sellerId) {
            setError("The transaction information is incomplete.");
            return;
        }
        if (comment.trim().length < 5) {
            setError("Please write at least 5 characters about your experience.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/proxy/reviews/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    seller: sellerId,
                    listing: listingId,
                    rating,
                    item_accuracy_rating: accuracyRating,
                    item_condition_rating: conditionRating,
                    communication_rating: communicationRating,
                    comment: comment.trim(),
                }),
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/account/my-reviews`;
                return;
            }
            if (!response.ok) throw new Error(await readApiError(response));

            setEligibility({
                eligible: false,
                already_reviewed: true,
                reason: "You have reviewed this purchase.",
            });
            setSuccess("Your verified transaction review is now published.");
        } catch (error: any) {
            setError(error?.message || "Failed to submit your review. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const isEligible = Boolean(eligibility?.eligible);
    const buttonLabel = checking
        ? "Checking review…"
        : eligibility?.already_reviewed
            ? "Purchase reviewed"
            : isEligible
                ? "Review Purchase"
                : "Review after purchase";
    const buttonClass = compact
        ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-3 text-sm font-black text-slate-700 transition enabled:hover:bg-orange-50 enabled:hover:text-orange-600 disabled:cursor-not-allowed disabled:text-slate-400"
        : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-3 text-sm font-black text-slate-700 ring-1 ring-slate-100 transition enabled:hover:bg-orange-50 enabled:hover:text-orange-600 disabled:cursor-not-allowed disabled:text-slate-400";

    return (
        <>
            <button
                type="button"
                onClick={() => isEligible && setOpen(true)}
                disabled={!isEligible || checking}
                title={eligibility?.reason}
                className={buttonClass}
            >
                <FontAwesomeIcon
                    icon={eligibility?.already_reviewed ? faCheck : faStar}
                    className="h-3.5 w-3.5 text-orange-500"
                />
                {buttonLabel}
            </button>

            {mounted && open
                ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
                        <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />

                        <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:rounded-[34px]">
                            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-4 sm:p-6">
                                <div className="flex min-w-0 gap-3 sm:gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-green-700 ring-1 ring-green-100">
                                            Verified purchase
                                        </div>
                                        <h2 className="mt-1.5 truncate text-lg font-black text-slate-950 sm:text-xl">
                                            Review {sellerName}
                                        </h2>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                                            Your accepted offer and completed sale have been verified by QOT.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    aria-label="Close review"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </button>
                            </div>

                            {success ? (
                                <div className="p-5 sm:p-6">
                                    <div className="rounded-[24px] bg-green-50 p-5 text-center ring-1 ring-green-100">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
                                            <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                                        </div>
                                        <p className="mt-4 text-lg font-black text-slate-950">Review published</p>
                                        <p className="mt-2 text-sm font-bold leading-6 text-green-700">{success}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitReview} className="p-4 sm:p-6">
                                    {error && (
                                        <div className="mb-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <RatingRow label="Overall experience" value={rating} onChange={setRating} />
                                        <RatingRow label="Item matched the ad" value={accuracyRating} onChange={setAccuracyRating} />
                                        <RatingRow label="Item condition" value={conditionRating} onChange={setConditionRating} />
                                        <RatingRow label="Seller communication" value={communicationRating} onChange={setCommunicationRating} />
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-black text-slate-800">Tell buyers what happened</label>
                                        <textarea
                                            value={comment}
                                            onChange={(event) => setComment(event.target.value)}
                                            placeholder="Was the item as described? How was the seller?"
                                            minLength={5}
                                            maxLength={1000}
                                            rows={4}
                                            className="w-full resize-none rounded-[18px] border-0 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-200"
                                        />
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center rounded-[16px] bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-4 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
                                            {loading ? "Publishing…" : "Publish Review"}
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
