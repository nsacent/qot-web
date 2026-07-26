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
        <section
            id="similar-ads"
            className="-mx-4 mt-3 scroll-mt-24 bg-white p-4 sm:mx-0 sm:mt-8 sm:rounded-[34px] sm:p-7 sm:shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:ring-1 sm:ring-black/5"
        >
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-orange-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-orange-600 ring-1 ring-orange-100 sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-xs">
                            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
                            Similar ads
                        </span>

                        <span className="hidden items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100 sm:inline-flex">
                            <FontAwesomeIcon icon={faLayerGroup} className="h-3.5 w-3.5" />
                            {categoryName}
                        </span>

                        <span className="hidden items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100 sm:inline-flex">
                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                            {cityName}
                        </span>
                    </div>

                    <h2 className="mt-2 text-lg font-black tracking-tight text-slate-950 sm:mt-3 sm:text-2xl md:mt-4 md:text-3xl">
                        You may also like
                    </h2>

                    <p className="mt-1.5 hidden max-w-2xl text-sm font-bold leading-6 text-slate-500 sm:block">
                        More ads related to this ad, based on category and location.
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-400 sm:hidden">
                        Swipe to explore similar ads
                    </p>
                </div>

                <a
                    href={buildMoreLink(category, city)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[15px] bg-slate-950 px-3.5 text-xs font-black text-white transition hover:bg-orange-600 sm:h-11 sm:rounded-[18px] sm:px-5 sm:text-sm"
                >
                    <span className="hidden sm:inline">View more</span>
                    <span className="sm:hidden">All ads</span>
                    <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </a>
            </div>

            <SimilarListingsClient listings={similarListings} />
        </section>
    );
}
