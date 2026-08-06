import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import { faEye, faLocationDot } from "@/lib/faIcons";
import HomeAdFavoriteButton from "@/components/home/HomeAdFavoriteButton";
import ListingCardImage from "@/components/listings/ListingCardImage";

type HomeAdCardProps = {
    ad: any;
    favoriteIds?: Set<string>;
    featured?: boolean;
    displayMode?: "grid" | "list";
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

function isVerifiedSeller(ad: any) {
    return Boolean(
        ad?.seller?.is_verified ||
        ad?.seller?.verified ||
        ad?.seller_is_verified ||
        ad?.is_seller_verified
    );
}

function isFeaturedAd(ad: any) {
    if (ad?.is_featured === true || ad?.featured === true) return true;

    if (!ad?.featured_until) return false;

    const featuredUntil = new Date(ad.featured_until);

    return !Number.isNaN(featuredUntil.getTime()) && featuredUntil.getTime() > Date.now();
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

    const area = getLocationName(
        ad?.area_name ||
        ad?.area?.name ||
        ad?.area ||
        ad?.location?.area_name ||
        ad?.location?.area
    );

    const location = getLocationName(
        ad?.location_name ||
        ad?.location_text ||
        ad?.address_text ||
        ad?.address
    );

    const locality = area || city;

    if (region && locality) return `${region} · ${locality}`;
    if (locality) return locality;
    if (region) return region;
    if (location) return location;

    return "Uganda";
}

function getViewCount(ad: any) {
    const value = Number(
        ad?.views_count ?? ad?.view_count ?? ad?.views ?? ad?.total_views ?? 0
    );

    return Number.isFinite(value) && value > 0 ? value : 0;
}

export default function HomeAdCard({
    ad,
    favoriteIds,
    featured,
    displayMode = "grid",
}: HomeAdCardProps) {
    const id = getAdId(ad);
    const title = getAdTitle(ad);
    const href = id ? `/ads/${id}` : "/ads";

    const date =
        ad?.created_at ||
        ad?.published_at ||
        ad?.date_posted ||
        ad?.updated_at;

    const isFavorited = favoriteIds?.has(String(id)) === true;
    const showFeatured = featured ?? isFeaturedAd(ad);
    const viewCount = getViewCount(ad);
    const isList = displayMode === "list";

    return (
        <article className={`group relative flex overflow-hidden rounded-[12px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.14)] hover:ring-orange-200 ${isList ? "h-[132px] flex-row md:h-full md:flex-col" : "h-full flex-col"}`}>
            <a
                href={href}
                aria-label={`View ${title}`}
                className="absolute inset-0 z-10 rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
            />

            <div className={`relative shrink-0 overflow-hidden bg-slate-100 ${isList ? "w-[38%] md:aspect-[25/17] md:w-full" : "aspect-[25/17] w-full"}`}>
                <ListingCardImage
                    listing={ad}
                    title={title}
                    fill
                />

                {showFeatured && (
                    <span className="absolute left-3 top-3 z-20 rounded-lg bg-orange-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-[0_4px_12px_rgba(15,23,42,0.18)]">
                        Featured
                    </span>
                )}

                {id && (
                    <HomeAdFavoriteButton
                        adId={id}
                        initiallyFavorited={isFavorited}
                    />
                )}
            </div>

            <div className={`flex min-w-0 flex-1 flex-col ${isList ? "px-3 py-2.5 md:px-3 md:pb-3 md:pt-2.5" : "px-3 pb-3 pt-2.5"}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                    <h3 className="min-w-0 flex-1 truncate text-xs font-extrabold leading-[17px] text-slate-950 transition group-hover:text-orange-600 sm:text-[13px]">
                        {title}
                    </h3>
                    {isVerifiedSeller(ad) && (
                        <span className={`shrink-0 items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-emerald-600 ${isList ? "hidden md:inline-flex" : "inline-flex"}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verified
                        </span>
                    )}
                </div>

                <div className="mt-0.5 flex min-w-0 flex-nowrap items-center gap-1">
                    <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[13px] font-black tracking-[-0.025em] text-orange-600 sm:text-[15px]">
                        {formatPrice(ad?.price, ad?.currency)}
                    </p>
                    {Boolean(ad?.is_negotiable ?? ad?.negotiable) && (
                        <span className="shrink-0 rounded-[5px] bg-orange-50 px-1 py-px text-[6px] font-extrabold uppercase tracking-wide text-orange-700 ring-1 ring-orange-100 sm:rounded-full sm:px-1.5 sm:text-[8px]">
                            <span className="sm:hidden">Neg.</span>
                            <span className="hidden sm:inline">Negotiable</span>
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            className="h-2.5 w-2.5 shrink-0 text-orange-500"
                        />
                        <span className="truncate">{getAdLocation(ad)}</span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2 text-slate-400">
                        <span className="inline-flex items-center gap-1" title={`${viewCount.toLocaleString()} views`}>
                            <FontAwesomeIcon icon={faEye} className="h-2.5 w-2.5" />
                            {viewCount.toLocaleString()}
                        </span>
                        <span title={formatDateTime(date)}>{formatRelativeTime(date)}</span>
                    </span>
                </div>
            </div>
        </article>
    );
}
