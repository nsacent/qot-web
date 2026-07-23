import ListingPhotoCountBadge from "@/components/listings/ListingPhotoCountBadge";
import { getPrimaryListingImage } from "@/lib/listingImages";

type ListingCardImageProps = {
    listing: any;
    title?: string;
    href?: string;
    className?: string;
    priority?: boolean;
    fill?: boolean;
};

export default function ListingCardImage({
    listing,
    title = "Ad image",
    className = "",
    priority = false,
    fill = false,
}: ListingCardImageProps) {
    const image = getPrimaryListingImage(listing);

    return (
        <div
            className={`relative overflow-hidden bg-slate-100 ${fill ? "h-full w-full" : "aspect-[4/3] w-full"} ${className}`}
        >
            <div className="block h-full w-full">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : "auto"}
                        decoding="async"
                        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
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
