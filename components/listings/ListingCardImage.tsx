import ListingPhotoCountBadge from "@/components/listings/ListingPhotoCountBadge";
import { getPrimaryListingImage } from "@/lib/listingImages";

type ListingCardImageProps = {
    listing: any;
    title?: string;
    href?: string;
    className?: string;
    priority?: boolean;
};

export default function ListingCardImage({
    listing,
    title = "Ad image",
    href = "#",
    className = "",
    priority = false,
}: ListingCardImageProps) {
    const image = getPrimaryListingImage(listing);

    return (
        <div
            className={`relative aspect-[4/3] overflow-hidden bg-slate-100 ${className}`}
        >
            <div className="block h-full">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : "auto"}
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-300">
                        QOT
                    </div>
                )}
            </div>

            <ListingPhotoCountBadge
                listing={listing}
                className="absolute bottom-3 left-3"
            />
        </div>
    );
}
