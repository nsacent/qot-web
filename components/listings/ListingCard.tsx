import FavoriteButton from "@/components/listings/FavoriteButton";

type ListingCardProps = {
    listing: any;
};

function formatPrice(price: any) {
    if (!price) return "Contact seller";

    return `UGX ${Number(price).toLocaleString()}`;
}

function formatDate(dateValue: string) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-UG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ListingCard({ listing }: ListingCardProps) {
    const image =
        listing.primary_image ||
        listing.image ||
        listing.cover_image ||
        listing.images?.[0]?.image ||
        listing.images?.[0]?.url;

    const isFeatured =
        listing.is_featured ||
        listing.featured ||
        Boolean(listing.featured_until);

    const isVerifiedSeller =
        listing.seller?.is_verified ||
        listing.seller?.verified ||
        listing.is_seller_verified;

    const sellerId =
        listing.seller?.id ||
        listing.seller_id ||
        listing.user?.id ||
        listing.user_id;

    const sellerName =
        listing.seller?.full_name ||
        listing.seller?.name ||
        listing.seller?.username ||
        listing.seller_name ||
        "Seller";

    return (
        <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
            <div className="relative">
                <a href={`/ads/${listing.id}`} className="block">
                    <div className="relative flex h-52 items-center justify-center bg-slate-200 text-slate-500">
                        {image ? (
                            <img
                                src={image}
                                alt={listing.title || "Ad image"}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <span>No image</span>
                        )}

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            {isFeatured && (
                                <span className="rounded-lg bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-sm">
                                    Featured
                                </span>
                            )}

                            {isVerifiedSeller && (
                                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                                    Verified
                                </span>
                            )}
                        </div>

                        {listing.status && listing.status !== "active" && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold uppercase text-white">
                                {listing.status}
                            </span>
                        )}
                    </div>
                </a>

                <FavoriteButton listingId={listing.id} overlay />
            </div>

            <div className="p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {listing.category?.name || listing.category_name || "Ad"}
                </p>

                <a href={`/ads/${listing.id}`}>
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 hover:text-orange-600">
                        {listing.title || "Untitled ad"}
                    </h3>
                </a>

                <p className="mt-2 text-sm text-slate-500">
                    {listing.city?.name || listing.location || "Uganda"}
                </p>

                {sellerId && (
                    <a
                        href={`/sellers/${sellerId}`}
                        className="mt-2 inline-block text-sm font-semibold text-slate-700 hover:text-orange-600"
                    >
                        Seller: {sellerName}
                    </a>
                )}

                <p className="mt-4 text-xl font-bold text-orange-600">
                    {formatPrice(listing.price)}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {listing.views_count !== undefined && (
                        <span>{listing.views_count} views</span>
                    )}

                    {listing.favorites_count !== undefined && (
                        <span>{listing.favorites_count} saves</span>
                    )}

                    {listing.created_at && <span>{formatDate(listing.created_at)}</span>}
                </div>

                <div className="mt-5">
                    <a
                        href={`/ads/${listing.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-orange-600"
                    >
                        View details →
                    </a>
                </div>
            </div>
        </article>
    );
}
