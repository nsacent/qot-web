"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ListingImageManagerProps = {
    listing?: any;
    listingId?: number | string;
    onChanged?: () => void;
};

function getApiOrigin() {
    return API_BASE_URL.replace("/api/v1", "");
}

function normalizeImageUrl(image: string) {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${getApiOrigin()}${image}`;
    }

    return `${getApiOrigin()}/media/${image}`;
}

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;
    return [];
}

function getListingId(listing: any) {
    return listing?.id || listing?.listing_id || listing?.listing?.id || "";
}

function getImages(listing: any) {
    const item = listing?.listing || listing;

    const images =
        item?.images ||
        item?.listing_images ||
        item?.photos ||
        item?.media ||
        [];

    if (Array.isArray(images)) return images;

    return [];
}

function getImageId(image: any) {
    return image?.id || image?.image_id || image?.pk || "";
}

function getImageUrl(image: any) {
    return normalizeImageUrl(
        String(
            image?.image ||
            image?.url ||
            image?.image_url ||
            image?.file ||
            image?.path ||
            ""
        )
    );
}

function isPrimaryImage(image: any, listing: any) {
    const item = listing?.listing || listing;

    return (
        image?.is_primary === true ||
        image?.primary === true ||
        String(image?.id) === String(item?.primary_image_id) ||
        image?.image === item?.primary_image ||
        image?.url === item?.primary_image
    );
}

export default function ListingImageManager({
    listing: initialListing = null,
    listingId,
    onChanged,
}: ListingImageManagerProps) {
    const [listing, setListing] = useState<any>(initialListing);
    const [loadingListing, setLoadingListing] = useState(!initialListing);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");

    const finalListingId = listingId || getListingId(listing);
    const images = getImages(listing);

    async function loadListing() {
        if (!finalListingId) {
            setLoadingListing(false);
            return;
        }

        setLoadingListing(true);
        setError("");

        try {
            const data = await apiGet("/seller/listings/");
            const sellerListings = getArray(data);

            const foundListing = sellerListings.find(
                (item) => String(getListingId(item)) === String(finalListingId)
            );

            if (!foundListing) {
                throw new Error("Listing not found among your seller listings.");
            }

            setListing(foundListing);
        } catch (error: any) {
            setError(error.message || "Failed to load listing images.");
        } finally {
            setLoadingListing(false);
        }
    }

    useEffect(() => {
        if (!initialListing) {
            loadListing();
        }
    }, [finalListingId]);

    async function refreshAfterChange() {
        if (onChanged) {
            onChanged();
            return;
        }

        await loadListing();
    }

    async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file || !finalListingId) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, JPEG, PNG, and WEBP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image must not exceed 5MB.");
            event.target.value = "";
            return;
        }

        if (images.length >= 10) {
            alert("Maximum 10 images are allowed per listing.");
            event.target.value = "";
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            await apiPost(`/listings/${finalListingId}/images/`, formData);

            event.target.value = "";
            await refreshAfterChange();
        } catch (error: any) {
            setError(error.message || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    }

    async function deleteImage(imageId: number | string) {
        if (!finalListingId || !imageId) return;

        const confirmed = window.confirm("Delete this image from the advert?");
        if (!confirmed) return;

        setActionLoading(`delete-${imageId}`);
        setError("");

        try {
            await apiDelete(`/listings/${finalListingId}/images/${imageId}/`);
            await refreshAfterChange();
        } catch (error: any) {
            setError(error.message || "Failed to delete image.");
        } finally {
            setActionLoading("");
        }
    }

    async function setPrimaryImage(imageId: number | string) {
        if (!finalListingId || !imageId) return;

        setActionLoading(`primary-${imageId}`);
        setError("");

        try {
            await apiPost(`/listings/${finalListingId}/images/${imageId}/set-primary/`);
            await refreshAfterChange();
        } catch (error: any) {
            setError(error.message || "Failed to set primary image.");
        } finally {
            setActionLoading("");
        }
    }

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Advert Images</h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Upload up to 10 images. JPG, JPEG, PNG, and WEBP are allowed. Maximum
                        size is 5MB per image.
                    </p>
                </div>

                <label className="cursor-pointer rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600">
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={uploadImage}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {loadingListing && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Loading advert images...
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loadingListing && (
                <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-600">
                        {images.length} image{images.length === 1 ? "" : "s"} uploaded
                    </p>

                    {images.length === 0 ? (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                            No images uploaded yet. Upload at least one image to make the advert
                            more attractive.
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {images.map((image: any, index: number) => {
                                const imageId = getImageId(image);
                                const imageUrl = getImageUrl(image);
                                const primary = isPrimaryImage(image, listing);

                                return (
                                    <div
                                        key={imageId || index}
                                        className="overflow-hidden rounded-2xl border bg-white"
                                    >
                                        <div className="flex h-44 items-center justify-center bg-slate-200 text-slate-500">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={`Advert image ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span>No image URL</span>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            {primary ? (
                                                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                    Primary Image
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                                    Image {index + 1}
                                                </span>
                                            )}

                                            <div className="mt-4 grid gap-2">
                                                {!primary && imageId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryImage(imageId)}
                                                        disabled={actionLoading === `primary-${imageId}`}
                                                        className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `primary-${imageId}`
                                                            ? "Setting..."
                                                            : "Set as Primary"}
                                                    </button>
                                                )}

                                                {imageId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteImage(imageId)}
                                                        disabled={actionLoading === `delete-${imageId}`}
                                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                                    >
                                                        {actionLoading === `delete-${imageId}`
                                                            ? "Deleting..."
                                                            : "Delete Image"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}