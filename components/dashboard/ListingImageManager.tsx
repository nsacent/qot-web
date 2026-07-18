"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import { getOrderedListingImages } from "@/lib/listingImages";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ListingImageManagerProps = {
    listingId: string | number;
};

function getApiOrigin() {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

function normalizeImageUrl(image: string) {
    if (!image) return "";

    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:") ||
        image.startsWith("blob:")
    ) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${getApiOrigin()}${image}`;
    }

    if (image.startsWith("media/")) {
        return `${getApiOrigin()}/${image}`;
    }

    return `${getApiOrigin()}/media/${image}`;
}

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;

    return [];
}

function getListingId(listing: any) {
    return listing?.id || listing?.listing?.id || listing?.listing_id || "";
}

function getImages(listing: any) {
    return getOrderedListingImages(listing).map((image: any, index: number) => ({
        id: image.id || `${image.url}-${index}`,
        image: image.url,
        url: image.url,
        is_primary: image.isPrimary || index === 0,
        isPrimary: image.isPrimary || index === 0,
    }));
}

function findListingById(listings: any[], listingId: string | number) {
    return listings.find(
        (listing) => String(getListingId(listing)) === String(listingId)
    );
}

export default function ListingImageManager({
    listingId,
}: ListingImageManagerProps) {
    const router = useRouter();
    const [images, setImages] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadListing(options?: { keepMessages?: boolean }) {
        setLoading(true);

        if (!options?.keepMessages) {
            setError("");
            setSuccess("");
        }

        try {
            const sellerListingsData = await apiGet("/my-ads/");
            const sellerListings = getArray(sellerListingsData);

            const foundListing = findListingById(sellerListings, listingId);

            if (!foundListing) {
                throw new Error(
                    "This listing was not found in your seller listings. Make sure you are logged in as the owner."
                );
            }

            setImages(getImages(foundListing));
        } catch (error: any) {
            setImages([]);
            setError(error.message || "Failed to load listing images.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadListing();
    }, [listingId]);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        setError("");
        setSuccess("");

        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            setSelectedFiles([]);
            return;
        }

        if (images.length + files.length > 10) {
            setError("You can upload a maximum of 10 images per advert.");
            event.target.value = "";
            return;
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
                event.target.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError("Each image must be 5MB or less.");
                event.target.value = "";
                return;
            }
        }

        setSelectedFiles(files);
    }

    async function uploadImages(event?: React.MouseEvent<HTMLButtonElement>) {
        event?.preventDefault();
        event?.stopPropagation();

        if (selectedFiles.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            console.log("Uploading images to:", `/listings/${listingId}/images/`);

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append("image", file);

                await apiPost(`/listings/${listingId}/images/`, formData);
            }

            setSelectedFiles([]);

            const input = document.getElementById(
                "listing-image-input"
            ) as HTMLInputElement | null;

            if (input) input.value = "";

            await loadListing({ keepMessages: true });

            setSuccess(
                "Images uploaded successfully. You can upload more images, edit the advert, or return to your listings."
            );
            setTimeout(() => {
                router.push("/my-ads");
            }, 1800);
        } catch (error: any) {
            setError(error.message || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    }

    async function deleteImage(imageId: string | number) {
        const confirmed = window.confirm("Delete this image?");
        if (!confirmed) return;

        setActionLoading(`delete-${imageId}`);
        setError("");
        setSuccess("");

        try {
            await apiDelete(`/listings/${listingId}/images/${imageId}/`);
            setSuccess("Image deleted successfully.");
            await loadListing();
        } catch (error: any) {
            setError(error.message || "Failed to delete image.");
        } finally {
            setActionLoading("");
        }
    }

    async function setPrimaryImage(imageId: string | number) {
        setActionLoading(`primary-${imageId}`);
        setError("");
        setSuccess("");

        try {
            await apiPost(`/listings/${listingId}/images/${imageId}/set-primary/`);
            setSuccess("Primary image updated.");
            await loadListing();
        } catch (error: any) {
            setError(error.message || "Failed to set primary image.");
        } finally {
            setActionLoading("");
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
                Loading images...
            </div>
        );
    }

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Advert Images
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Upload listing images
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                    Select images, then click Upload Images. Do not click the selected file
                    name or browser preview.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
                    <p className="font-bold">Upload successful!</p>

                    <p className="mt-1 text-sm">{success}</p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <a
                            href="/my-ads"
                            className="rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                        >
                            Go to My Listings
                        </a>

                        <a
                            href={`/account/analytics/${listingId}`}
                            className="rounded-xl border border-green-200 bg-white px-5 py-3 text-center text-sm font-semibold text-green-700 hover:bg-green-100"
                        >
                            View Analytics
                        </a>

                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
                        >
                            Upload More Images
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border bg-slate-50 p-5">
                <label
                    htmlFor="listing-image-input"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Select Images
                </label>

                <input
                    id="listing-image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                    Allowed: JPG, JPEG, PNG, WEBP. Maximum 5MB per image. Maximum 10
                    images per advert.
                </p>

                {selectedFiles.length > 0 && (
                    <div className="mt-4 rounded-xl border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-700">
                            Selected files:
                        </p>

                        <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            {selectedFiles.map((file, index) => (
                                <li key={`${file.name}-${index}`}>
                                    {index + 1}. {file.name} —{" "}
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    type="button"
                    onClick={uploadImages}
                    disabled={uploading || selectedFiles.length === 0}
                    className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                    {uploading ? "Uploading..." : "Upload Images"}
                </button>
            </div>

            <div className="mt-8">
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <h3 className="text-xl font-bold text-slate-900">Current Images</h3>

                    <p className="text-sm text-slate-500">
                        {images.length.toLocaleString()} image
                        {images.length === 1 ? "" : "s"}
                    </p>
                </div>

                {images.length === 0 ? (
                    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-600">
                        No images uploaded yet.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {images.map((image, index) => (
                            <article
                                key={image.id || image.url || index}
                                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                            >
                                <div className="relative h-44 bg-slate-200">
                                    {image.url ? (
                                        <img
                                            src={image.url}
                                            alt={`Listing image ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            Image unavailable
                                        </div>
                                    )}

                                    {image.is_primary && (
                                        <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                            Primary
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-2 p-3">
                                    {!image.is_primary && image.id && (
                                        <button
                                            type="button"
                                            onClick={() => setPrimaryImage(image.id)}
                                            disabled={actionLoading === `primary-${image.id}`}
                                            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                                        >
                                            {actionLoading === `primary-${image.id}`
                                                ? "Setting..."
                                                : "Set Primary"}
                                        </button>
                                    )}

                                    {image.id && (
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(image.id)}
                                            disabled={actionLoading === `delete-${image.id}`}
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                        >
                                            {actionLoading === `delete-${image.id}`
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
