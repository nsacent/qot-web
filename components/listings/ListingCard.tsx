type ListingCardProps = {
    listing: any;
};

export default function ListingCard({ listing }: ListingCardProps) {
    const image =
        listing.primary_image ||
        listing.image ||
        listing.cover_image ||
        listing.images?.[0]?.image ||
        listing.images?.[0]?.url;

    return (
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-52 items-center justify-center bg-slate-200 text-slate-500">
                {image ? (
                    <img
                        src={image}
                        alt={listing.title || "Listing image"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span>No image</span>
                )}
            </div>

            <div className="p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {listing.category?.name || listing.category_name || "Listing"}
                </p>

                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {listing.title || "Untitled listing"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    {listing.city?.name || listing.location || "Uganda"}
                </p>

                <p className="mt-4 text-xl font-bold text-orange-600">
                    {listing.price
                        ? `UGX ${Number(listing.price).toLocaleString()}`
                        : "Contact seller"}
                </p>

                <a
                    href={`/listings/${listing.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-slate-900 hover:text-orange-600"
                >
                    View details →
                </a>
            </div>
        </article>
    );
}