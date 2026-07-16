"use client";

import ListingImageCarousel from "@/components/listings/ListingImageCarousel";

type ListingImageGalleryProps = {
    listing: any;
};

export default function ListingImageGallery({ listing }: ListingImageGalleryProps) {
    return (
        <ListingImageCarousel
            listing={listing}
            title={listing?.title || "Listing image"}
        />
    );
}