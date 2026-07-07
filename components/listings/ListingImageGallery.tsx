"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ListingImageGalleryProps = {
    listing: any;
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

function getImages(listing: any) {
    const rawImages =
        listing?.images ||
        listing?.listing_images ||
        listing?.photos ||
        listing?.media ||
        [];

    const images: string[] = [];

    const primary =
        listing?.primary_image ||
        listing?.image ||
        listing?.image_url ||
        listing?.cover_image ||
        listing?.cover_image_url ||
        listing?.thumbnail ||
        listing?.main_image ||
        "";

    if (primary) {
        images.push(normalizeImageUrl(String(primary)));
    }

    if (Array.isArray(rawImages)) {
        rawImages.forEach((item: any) => {
            const image =
                item?.image ||
                item?.url ||
                item?.image_url ||
                item?.file ||
                item?.path ||
                "";

            if (image) {
                images.push(normalizeImageUrl(String(image)));
            }
        });
    }

    return Array.from(new Set(images.filter(Boolean)));
}

export default function ListingImageGallery({
    listing,
}: ListingImageGalleryProps) {
    const images = getImages(listing);
    const [activeIndex, setActiveIndex] = useState(0);

    const activeImage = images[activeIndex];

    function previousImage() {
        setActiveIndex((current) =>
            current === 0 ? images.length - 1 : current - 1
        );
    }

    function nextImage() {
        setActiveIndex((current) =>
            current === images.length - 1 ? 0 : current + 1
        );
    }

    if (images.length === 0) {
        return (
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="flex h-[420px] items-center justify-center bg-slate-200 text-slate-500">
                    No image available
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="relative flex h-[420px] items-center justify-center bg-slate-200">
                <img
                    src={activeImage}
                    alt={listing?.title || "Listing image"}
                    className="h-full w-full object-cover"
                />

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={previousImage}
                            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-slate-900 shadow hover:bg-white"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-slate-900 shadow hover:bg-white"
                            aria-label="Next image"
                        >
                            ›
                        </button>

                        <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 md:grid-cols-6">
                    {images.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={
                                activeIndex === index
                                    ? "h-20 overflow-hidden rounded-xl border-2 border-orange-500"
                                    : "h-20 overflow-hidden rounded-xl border bg-slate-100 hover:border-orange-300"
                            }
                        >
                            <img
                                src={image}
                                alt={`Listing thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}