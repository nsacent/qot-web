import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@/lib/faIcons";
import { getListingImageCount } from "@/lib/listingImages";

type ListingPhotoCountBadgeProps = {
    listing: any;
    showWhenSingle?: boolean;
    className?: string;
};

export default function ListingPhotoCountBadge({
    listing,
    showWhenSingle = false,
    className = "",
}: ListingPhotoCountBadgeProps) {
    const imageCount = getListingImageCount(listing);

    if (!showWhenSingle && imageCount <= 1) return null;
    if (imageCount <= 0) return null;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black text-white backdrop-blur ${className}`}
        >
            <span>{imageCount}</span>
            <FontAwesomeIcon icon={faCamera} className="h-3 w-3" />
        </span>
    );
}