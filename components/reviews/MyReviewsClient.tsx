"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClock,
    faMagnifyingGlass,
    faStar,
    faUserRegular,
} from "@/lib/faIcons";
import { apiGet } from "@/lib/apiClient";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reviews)) return data.reviews;
    if (Array.isArray(data?.data?.reviews)) return data.data.reviews;
    return [];
}

function formatDate(value: any) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getSellerName(review: any) {
    return (
        review?.seller?.full_name ||
        review?.seller?.name ||
        review?.seller?.username ||
        review?.seller_name ||
        "Seller"
    );
}

function getSellerId(review: any) {
    return review?.seller?.id || review?.seller_id || review?.seller || "";
}

function getListingTitle(review: any) {
    return (
        review?.listing?.title ||
        review?.listing_title ||
        review?.advert_title ||
        "Reviewed ad"
    );
}

function getListingId(review: any) {
    return review?.listing?.id || review?.listing_id || review?.listing || "";
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "We could not load your reviews right now.";
    }

    return message;
}

function RatingStars({ rating }: { rating: number }) {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));

    return (
        <span className="inline-flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className={`h-3.5 w-3.5 ${index < normalizedRating ? "text-orange-500" : "text-slate-200"}`}
                />
            ))}
        </span>
    );
}

export default function MyReviewsClient() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadReviews() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet("/reviews/me/");
            setReviews(getArray(data));
        } catch (error: any) {
            setReviews([]);
            setError(cleanErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReviews();
    }, []);

    return (
        <section className="py-3 sm:py-6">
            <header className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-5 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
                <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-950/30">
                                <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                                Your marketplace activity
                            </p>
                        </div>
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                            Reviews you have shared.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300">
                            Revisit the feedback you left after dealing with sellers on QOT.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                        <span className="text-3xl font-black text-white">{loading ? "—" : reviews.length}</span>
                        <span className="text-[10px] font-black uppercase leading-4 tracking-wider text-slate-300">
                            Review{reviews.length === 1 ? "" : "s"}<br />submitted
                        </span>
                    </div>
                </div>
            </header>

            <div className="mt-6 rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] ring-1 ring-black/5 sm:p-7">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">My Reviews</h2>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                            Feedback you submitted for QOT sellers
                        </p>
                    </div>
                    <a
                        href="/ads"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-50 px-4 text-xs font-black text-orange-600 transition hover:bg-orange-100"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" />
                        Browse Ads
                    </a>
                </div>

                {loading ? (
                    <div className="mt-6 grid gap-4">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="animate-pulse rounded-[26px] bg-slate-50 p-6">
                                <div className="h-4 w-32 rounded bg-slate-200" />
                                <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
                                <div className="mt-4 h-16 rounded bg-slate-200/70" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[26px] bg-red-50 px-6 py-10 text-center ring-1 ring-red-100">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                            <FontAwesomeIcon icon={faStar} className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 text-lg font-black text-slate-950">Reviews unavailable</h3>
                        <p className="mt-2 max-w-md text-sm font-bold leading-6 text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={loadReviews}
                            className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                        >
                            Try Again
                        </button>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-50 text-orange-500">
                            <FontAwesomeIcon icon={faStar} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-xl font-black text-slate-950">No reviews submitted yet</h3>
                        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                            Reviews you leave for sellers will be collected here for easy reference.
                        </p>
                        <a
                            href="/ads"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600"
                        >
                            Explore Ads
                            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5 rotate-180" />
                        </a>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4">
                        {reviews.map((review) => {
                            const sellerId = getSellerId(review);
                            const listingId = getListingId(review);
                            const rating = Number(review.rating || 0);

                            return (
                                <article
                                    key={review.id || `${sellerId}-${listingId}`}
                                    className="rounded-[26px] bg-slate-50 p-5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)] sm:p-6"
                                >
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <RatingStars rating={rating} />
                                                <span className="text-xs font-black text-slate-700">
                                                    {rating.toFixed(1)} / 5
                                                </span>
                                            </div>

                                            <h3 className="mt-4 text-lg font-black text-slate-950 sm:text-xl">
                                                {getListingTitle(review)}
                                            </h3>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                                                <span className="inline-flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faUserRegular} className="h-3.5 w-3.5 text-orange-500" />
                                                    {sellerId ? (
                                                        <a href={`/sellers/${sellerId}`} className="text-slate-700 hover:text-orange-600">
                                                            {getSellerName(review)}
                                                        </a>
                                                    ) : (
                                                        getSellerName(review)
                                                    )}
                                                </span>

                                                {review.created_at && (
                                                    <span className="inline-flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-orange-500" />
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-green-700 ring-1 ring-green-100">
                                            Published
                                        </span>
                                    </div>

                                    <blockquote className="mt-5 rounded-2xl bg-white px-4 py-4 text-sm font-semibold leading-7 text-slate-700 ring-1 ring-slate-100 sm:px-5">
                                        “{review.comment || review.description || "No comment provided."}”
                                    </blockquote>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {listingId && (
                                            <a
                                                href={`/ads/${listingId}`}
                                                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-orange-500"
                                            >
                                                View Ad
                                            </a>
                                        )}
                                        {sellerId && (
                                            <a
                                                href={`/sellers/${sellerId}`}
                                                className="inline-flex h-10 items-center justify-center rounded-xl bg-orange-50 px-4 text-xs font-black text-orange-600 transition hover:bg-orange-100"
                                            >
                                                View Seller
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
