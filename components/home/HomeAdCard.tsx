import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@/lib/faIcons";
import HomeAdFavoriteButton from "@/components/home/HomeAdFavoriteButton";
import ListingCardImage from "@/components/listings/ListingCardImage";

type HomeAdCardProps = {
    ad: any;
    favoriteIds?: Set<string>;
};

function formatPrice(value: any, currency = "UGX") {
    if (!value) return "Price on request";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return `${currency} ${value}`;
    }

    if (numberValue <= 0) return "Price on request";

    return `${currency} ${numberValue.toLocaleString()}`;
}

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.uuid || "";
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

function getAdCategories(ad: any) {
    const name =
        ad?.category?.name ||
        ad?.subcategory?.name ||
        ad?.subcategory_name ||
        ad?.category_name ||
        "Marketplace";

    const parent =
        ad?.category?.parent?.name ||
        ad?.category?.parent_name ||
        ad?.subcategory?.parent?.name ||
        ad?.category_parent_name ||
        ad?.parent_category_name ||
        "";

    return {
        name,
        parent:
            parent && parent.toLowerCase() !== name.toLowerCase()
                ? parent
                : "",
    };
}

function isVerifiedSeller(ad: any) {
    return Boolean(
        ad?.seller?.is_verified ||
        ad?.seller?.verified ||
        ad?.seller_is_verified ||
        ad?.is_seller_verified
    );
}

function isGoodText(value: any) {
    if (value === null || value === undefined) return false;

    const text = String(value).trim();

    if (!text) return false;

    if (/^\d+$/.test(text)) return false;

    return true;
}

function getLocationName(value: any) {
    if (!value) return "";

    if (typeof value === "object") {
        return (
            value?.name ||
            value?.title ||
            value?.city ||
            value?.district ||
            value?.region ||
            ""
        );
    }

    if (isGoodText(value)) return String(value).trim();

    return "";
}

function getAdLocation(ad: any) {
    const city = getLocationName(
        ad?.city_name ||
        ad?.city?.name ||
        ad?.city ||
        ad?.location?.city_name ||
        ad?.location?.city
    );

    const region = getLocationName(
        ad?.region_name ||
        ad?.district_name ||
        ad?.region?.name ||
        ad?.district?.name ||
        ad?.region ||
        ad?.district ||
        ad?.location?.region_name ||
        ad?.location?.district_name ||
        ad?.location?.region ||
        ad?.location?.district
    );

    const location = getLocationName(
        ad?.location_name ||
        ad?.location_text ||
        ad?.address_text ||
        ad?.address
    );

    if (city && region) return `${city}, ${region}`;
    if (city) return city;
    if (region) return region;
    if (location) return location;

    return "Uganda";
}

function formatDate(value: any) {
    if (!value) return "Recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently";

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export default function HomeAdCard({ ad, favoriteIds }: HomeAdCardProps) {
    const id = getAdId(ad);
    const title = getAdTitle(ad);
    const category = getAdCategories(ad);
    const href = id ? `/listings/${id}` : "/listings";

    const date =
        ad?.updated_at ||
        ad?.created_at ||
        ad?.published_at ||
        ad?.date_posted;

    const isFavorited = favoriteIds?.has(String(id)) === true;

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.14)] hover:ring-orange-200">
            <a
                href={href}
                aria-label={`View ${title}`}
                className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
            />

            <div className="relative aspect-[6/5] overflow-hidden bg-slate-100">
                <ListingCardImage
                    listing={ad}
                    title={title}
                    className="h-full"
                />

                {id && (
                    <HomeAdFavoriteButton
                        adId={id}
                        initiallyFavorited={isFavorited}
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
                <div className="flex min-w-0 items-center justify-between gap-2">
                    <nav
                        aria-label="Listing category"
                        className="flex min-w-0 items-center gap-1 truncate text-[9px] font-extrabold uppercase tracking-[0.1em] text-orange-600 sm:text-[10px]"
                    >
                        {category.parent && (
                            <>
                                <a
                                    href={`/listings?category=${encodeURIComponent(category.parent)}`}
                                    className="relative z-20 truncate hover:text-orange-700 hover:underline"
                                >
                                    {category.parent}
                                </a>
                                <span aria-hidden="true" className="shrink-0 text-orange-400">
                                    ›
                                </span>
                            </>
                        )}

                        <a
                            href={`/listings?category=${encodeURIComponent(category.name)}`}
                            className="relative z-20 truncate hover:text-orange-700 hover:underline"
                        >
                            {category.name}
                        </a>
                    </nav>

                    {isVerifiedSeller(ad) && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verified
                        </span>
                    )}
                </div>

                <h3 className="mt-1 truncate text-xs font-extrabold leading-[17px] text-slate-950 transition group-hover:text-orange-600 sm:text-[13px]">
                    {title}
                </h3>

                <p className="mt-0.5 text-sm font-black tracking-[-0.02em] text-slate-950 sm:text-[15px]">
                    {formatPrice(ad?.price, ad?.currency)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            className="h-2.5 w-2.5 shrink-0 text-orange-500"
                        />
                        <span className="truncate">{getAdLocation(ad)}</span>
                    </span>

                    <span className="shrink-0 text-slate-400">{formatDate(date)}</span>
                </div>
            </div>
        </article>
    );
}
