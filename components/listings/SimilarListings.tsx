import ListingCard from "@/components/listings/ListingCard";
import { apiGet, getArray } from "@/lib/api";

type SimilarListingsProps = {
    listing: any;
};

function getCategorySlug(listing: any) {
    return (
        listing?.category?.slug ||
        listing?.category_slug ||
        listing?.category?.id ||
        ""
    );
}

function getCitySlug(listing: any) {
    return (
        listing?.city?.slug ||
        listing?.city_slug ||
        listing?.city?.id ||
        ""
    );
}

export default async function SimilarListings({
    listing,
}: SimilarListingsProps) {
    const category = getCategorySlug(listing);
    const city = getCitySlug(listing);

    let similarListings: any[] = [];

    try {
        const query = new URLSearchParams();

        if (category) query.set("category", category);
        if (city) query.set("city", city);

        const endpoint = query.toString()
            ? `/listings/?${query.toString()}`
            : "/listings/";

        const data = await apiGet(endpoint);
        similarListings = getArray(data)
            .filter((item: any) => String(item.id) !== String(listing.id))
            .slice(0, 6);
    } catch (error) {
        console.error("Similar listings API error:", error);
    }

    if (similarListings.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-7xl px-6 pb-12">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Similar Listings
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        You may also like
                    </h2>
                </div>

                <a
                    href={
                        category
                            ? `/listings?category=${category}`
                            : city
                                ? `/listings?city=${city}`
                                : "/listings"
                    }
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    View more →
                </a>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarListings.map((item: any) => (
                    <ListingCard key={item.id || item.slug} listing={item} />
                ))}
            </div>
        </section>
    );
}