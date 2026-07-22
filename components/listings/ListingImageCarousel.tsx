"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrderedListingImages } from "@/lib/listingImages";

type ListingImageCarouselProps = {
    listing: any;
    title?: string;
    className?: string;
};

export default function ListingImageCarousel({
    listing,
    title = "Ad image",
    className = "",
}: ListingImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const images = useMemo(() => {
        const orderedImages = getOrderedListingImages(listing);

        const uniqueImages = orderedImages.filter((image: any, index: number) => {
            return (
                image?.url &&
                orderedImages.findIndex((item: any) => item?.url === image?.url) === index
            );
        });

        return uniqueImages;
    }, [listing]);

    const activeImage = images[activeIndex];

    useEffect(() => {
        setActiveIndex(0);
    }, [listing?.id, images.length]);

    useEffect(() => {
        function handleKeydown(event: KeyboardEvent) {
            if (!images.length) return;

            if (event.key === "Escape") {
                setIsPreviewOpen(false);
            }

            if (event.key === "ArrowLeft") {
                goPrevious();
            }

            if (event.key === "ArrowRight") {
                goNext();
            }
        }

        window.addEventListener("keydown", handleKeydown);

        return () => window.removeEventListener("keydown", handleKeydown);
    }, [images.length, activeIndex]);

    function goPrevious() {
        setActiveIndex((current) => {
            if (!images.length) return 0;
            return current === 0 ? images.length - 1 : current - 1;
        });
    }

    function goNext() {
        setActiveIndex((current) => {
            if (!images.length) return 0;
            return current === images.length - 1 ? 0 : current + 1;
        });
    }

    if (!images.length) {
        return (
            <div
                className={`flex aspect-[16/10] w-full items-center justify-center rounded-[28px] bg-slate-100 text-3xl font-black text-slate-300 ${className}`}
            >
                QOT
            </div>
        );
    }

    return (
        <>
            <div className={className}>
                <div className="relative overflow-hidden rounded-[28px] bg-slate-100">
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="block w-full"
                        title="Open image preview"
                    >
                        <img
                            src={activeImage.url}
                            alt={title}
                            className="aspect-[16/10] w-full object-cover"
                        />
                    </button>

                    {activeIndex === 0 && (
                        <span className="absolute left-4 top-4 rounded-full bg-green-500 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow">
                            Main Image
                        </span>
                    )}

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={goPrevious}
                                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-slate-800 shadow hover:bg-white"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                onClick={goNext}
                                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-slate-800 shadow hover:bg-white"
                                aria-label="Next image"
                            >
                                ›
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white">
                                {activeIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                        {images.slice(0, 12).map((image: any, index: number) => (
                            <button
                                key={`${image.url}-${index}`}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`relative overflow-hidden rounded-2xl bg-slate-100 ring-2 transition ${activeIndex === index
                                    ? "ring-orange-500"
                                    : "ring-transparent hover:ring-orange-200"
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    className="aspect-square w-full object-cover"
                                />

                                {index === 0 && (
                                    <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
                                        Main
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(false)}
                        className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-900"
                    >
                        Close
                    </button>

                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goPrevious}
                            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-black text-slate-900"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                    )}

                    <img
                        src={activeImage.url}
                        alt={title}
                        className="max-h-[86vh] max-w-[92vw] rounded-3xl object-contain"
                    />

                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-black text-slate-900"
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
