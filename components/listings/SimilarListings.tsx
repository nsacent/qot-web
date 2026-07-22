import { apiGet, getArray } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faLayerGroup,
    faLocationDot,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import SimilarListingsClient from "@/components/listings/SimilarListingsClient";

type SimilarListingsProps = {
    listing: any;
};

function getCategorySlug(listing: any) {
    return (
        listing?.category?.slug ||
        listing?.category_slug ||
        listing?.category?.id ||
        listing?.category_id ||
        ""
    );
}

function getCategoryName(listing: any) {
    return listing?.category?.name || listing?.category_name || "Related ads";
}

function getCitySlug(listing: any) {
    return (
        listing?.city?.slug ||
        listing?.city_slug ||
        listing?.city?.id ||
        listing?.city_id ||
        ""
    );
}

function getCityName(listing: any) {
    return (
        listing?.city?.name ||
        listing?.city_name ||
        listing?.location?.city ||
        listing?.location ||
        "Uganda"
    );
}

function buildMoreLink(category: string, city: string) {
    const query = new URLSearchParams();

    if (category) query.set("category", category);
    if (city) query.set("city", city);

    return query.toString() ? `/ads?${query.toString()}` : "/ads";
}

async function fetchSimilarListings(listing: any) {
    const category = getCategorySlug(listing);
    const city = getCitySlug(listing);

    const attempts: string[] = [];

    const categoryAndCity = new URLSearchParams();
    categoryAndCity.set("page_size", "24");
    categoryAndCity.set("sort", "newest");

    if (category) categoryAndCity.set("category", String(category));
    if (city) categoryAndCity.set("city", String(city));

    attempts.push(`/listings/?${categoryAndCity.toString()}`);

    if (category) {
        const categoryOnly = new URLSearchParams();
        categoryOnly.set("page_size", "24");
        categoryOnly.set("sort", "newest");
        categoryOnly.set("category", String(category));
        attempts.push(`/listings/?${categoryOnly.toString()}`);
    }

    if (city) {
        const cityOnly = new URLSearchParams();
        cityOnly.set("page_size", "24");
        cityOnly.set("sort", "newest");
        cityOnly.set("city", String(city));
        attempts.push(`/listings/?${cityOnly.toString()}`);
    }

    attempts.push("/listings/?page_size=24&sort=newest");

    for (const endpoint of attempts) {
        try {
            const data = await apiGet(endpoint);

            const results = getArray(data)
                .filter((item: any) => String(item?.id) !== String(listing?.id))
                .slice(0, 12);

            if (results.length > 0) {
                return results;
            }
        } catch (error) {
            console.error("Similar listings API error:", error);
        }
    }

    return [];
}

export default async function SimilarListings({ listing }: SimilarListingsProps) {
    const category = String(getCategorySlug(listing));
    const city = String(getCitySlug(listing));
    const categoryName = getCategoryName(listing);
    const cityName = getCityName(listing);

    const similarListings = await fetchSimilarListings(listing);

    if (similarListings.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 rounded-[34px] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                            Similar ads
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                            <FontAwesomeIcon icon={faLayerGroup} className="h-3.5 w-3.5" />
                            {categoryName}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                            {cityName}
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                        You may also like
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500">
                        More ads related to this ad, based on category and location.
                    </p>
                </div>

                <a
                    href={buildMoreLink(category, city)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-orange-600"
                >
                    View more
                    <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </a>
            </div>

            <SimilarListingsClient listings={similarListings} />
        </section>
    );
}
