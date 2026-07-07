"use client";

import { useEffect, useState } from "react";
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
        "Reviewed listing"
    );
}

function getListingId(review: any) {
    return review?.listing?.id || review?.listing_id || review?.listing || "";
}

function cleanErrorMessage(error: any) {
    const message = String(error?.message || "").trim();

    if (!message || message === "null" || message === "undefined") {
        return "Failed to load your reviews. Please make sure you are logged in.";
    }

    return message;
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
        <section className="mx-auto max-w-5xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    My Activity
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    My Reviews
                </h1>

                <p className="mt-2 text-slate-600">
                    View seller reviews you have submitted on QOT.
                </p>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading your reviews...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have not reviewed any seller yet.
                </div>
            ) : (
                <div className="grid gap-5">
                    {reviews.map((review) => {
                        const sellerId = getSellerId(review);
                        const listingId = getListingId(review);

                        return (
                            <article
                                key={review.id || `${sellerId}-${listingId}`}
                                className="rounded-2xl border bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                            Rating: {Number(review.rating || 0).toFixed(1)} / 5
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                                            {getListingTitle(review)}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-600">
                                            Seller:{" "}
                                            {sellerId ? (
                                                <a
                                                    href={`/sellers/${sellerId}`}
                                                    className="font-semibold text-orange-600 hover:text-orange-700"
                                                >
                                                    {getSellerName(review)}
                                                </a>
                                            ) : (
                                                getSellerName(review)
                                            )}
                                        </p>
                                    </div>

                                    {review.created_at && (
                                        <p className="text-sm text-slate-500">
                                            {formatDate(review.created_at)}
                                        </p>
                                    )}
                                </div>

                                <p className="mt-4 leading-7 text-slate-700">
                                    {review.comment || review.description || "No comment provided."}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {listingId && (
                                        <a
                                            href={`/listings/${listingId}`}
                                            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                        >
                                            View Listing
                                        </a>
                                    )}

                                    {sellerId && (
                                        <a
                                            href={`/sellers/${sellerId}`}
                                            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
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
        </section>
    );
}