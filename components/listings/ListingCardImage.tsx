import ListingPhotoCountBadge from "@/components/listings/ListingPhotoCountBadge";
import { getPrimaryListingImage } from "@/lib/listingImages";

type ListingCardImageProps = {
    listing: any;
    title?: string;
    href?: string;
    showNewBadge?: boolean;
    className?: string;
};

export default function ListingCardImage({
    listing,
    title = "Listing image",
    href = "#",
    showNewBadge = false,
    className = "",
}: ListingCardImageProps) {
    const image = getPrimaryListingImage(listing);

    return (
        <div
            className={`relative aspect-[4/3] overflow-hidden bg-slate-100 ${className}`}
        >
            <a href={href} className="block h-full">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-300">
                        QOT
                    </div>
                )}
            </a>

            {showNewBadge && (
                <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                    New
                </span>
            )}

            <ListingPhotoCountBadge
                listing={listing}
                className="absolute bottom-3 left-3"
            />
        </div>
    );
}