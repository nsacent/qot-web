type HomeAdCardProps = {
    listing: any;
};

function formatPrice(value: any, currency = "UGX") {
    if (!value) return "Price on request";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return `${currency} ${value}`;
    }

    return `${currency} ${numberValue.toLocaleString()}`;
}

function getListingImage(listing: any) {
    return (
        listing?.image ||
        listing?.image_url ||
        listing?.thumbnail ||
        listing?.primary_image?.image ||
        listing?.primary_image?.url ||
        listing?.images?.[0]?.image ||
        listing?.images?.[0]?.url ||
        ""
    );
}

function getListingId(listing: any) {
    return listing?.id || listing?.listing_id || listing?.uuid || "";
}

function getListingTitle(listing: any) {
    return listing?.title || listing?.name || "Untitled advert";
}

function isGoodLocationValue(value: any) {
    if (value === null || value === undefined) return false;

    const text = String(value).trim();

    if (!text) return false;

    // Do not show database IDs like 1, 2, 3
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

    if (isGoodLocationValue(value)) {
        return String(value).trim();
    }

    return "";
}

function getLocation(listing: any) {
    const city = getLocationName(
        listing?.city_name ||
        listing?.city?.name ||
        listing?.city ||
        listing?.location?.city_name ||
        listing?.location?.city
    );

    const region = getLocationName(
        listing?.region_name ||
        listing?.district_name ||
        listing?.region?.name ||
        listing?.district?.name ||
        listing?.region ||
        listing?.district ||
        listing?.location?.region_name ||
        listing?.location?.district_name ||
        listing?.location?.region ||
        listing?.location?.district
    );

    const location = getLocationName(
        listing?.location_name ||
        listing?.location_text ||
        listing?.address_text ||
        listing?.address
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

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export default function HomeAdCard({ listing }: HomeAdCardProps) {
    const id = getListingId(listing);
    const image = getListingImage(listing);
    const title = getListingTitle(listing);

    const href = id ? `/listings/${id}` : "/listings";

    const date =
        listing?.updated_at ||
        listing?.created_at ||
        listing?.published_at ||
        listing?.date_posted;

    const condition = listing?.condition || listing?.status || "";

    return (
        <a
            href={href}
            className="group block overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
            <div className="relative aspect-[4/3] bg-slate-100">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl font-black text-slate-300">
                        QOT
                    </div>
                )}

                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-black text-slate-800 shadow-sm">
                    ♡
                </div>

                {condition && (
                    <div className="absolute left-2 top-2 rounded-sm bg-white px-2 py-1 text-[11px] font-extrabold uppercase text-slate-700 shadow-sm">
                        {String(condition).replaceAll("_", " ")}
                    </div>
                )}
            </div>

            <div className="flex min-h-[132px] flex-col p-3">
                <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-5 text-slate-900 group-hover:text-orange-600">
                    {title}
                </h3>

                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <span className="text-orange-500">📍</span>
                    <span className="line-clamp-1">{getLocation(listing)}</span>
                </div>

                <p className="mt-1 text-xs font-medium text-slate-400">
                    Posted {formatDate(date)}
                </p>

                <div className="mt-auto pt-3">
                    <p className="text-lg font-black leading-6 text-slate-950">
                        {formatPrice(listing?.price, listing?.currency)}
                    </p>
                </div>
            </div>
        </a>
    );
}