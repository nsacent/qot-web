import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@/lib/faIcons";
import HomeAdFavoriteButton from "@/components/home/HomeAdFavoriteButton";

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

    return `${currency} ${numberValue.toLocaleString()}`;
}

function getAdImage(ad: any) {
    return (
        ad?.image ||
        ad?.image_url ||
        ad?.thumbnail ||
        ad?.primary_image?.image ||
        ad?.primary_image?.url ||
        ad?.images?.[0]?.image ||
        ad?.images?.[0]?.url ||
        ""
    );
}

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.uuid || "";
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
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
    const image = getAdImage(ad);
    const title = getAdTitle(ad);

    const date =
        ad?.updated_at ||
        ad?.created_at ||
        ad?.published_at ||
        ad?.date_posted;

    const isFavorited = favoriteIds?.has(String(id)) === true;

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <a href={id ? `/listings/${id}` : "/listings"} className="block h-full">
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

                <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                    New
                </span>

                {id && (
                    <HomeAdFavoriteButton
                        adId={id}
                        initiallyFavorited={isFavorited}
                    />
                )}
            </div>

            <a href={id ? `/listings/${id}` : "/listings"} className="block p-4">
                <h3 className="line-clamp-1 text-[15px] font-black text-slate-950 group-hover:text-orange-600">
                    {title}
                </h3>

                <p className="mt-1 text-[15px] font-black text-orange-600">
                    {formatPrice(ad?.price, ad?.currency)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            className="h-3.5 w-3.5 shrink-0 text-orange-500"
                        />
                        <span className="line-clamp-1">{getAdLocation(ad)}</span>
                    </span>

                    <span className="shrink-0">{formatDate(date)}</span>
                </div>
            </a>
        </article>
    );
}