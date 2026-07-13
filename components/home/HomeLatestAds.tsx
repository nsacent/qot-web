type HomeLatestAdsProps = {
    ads?: any[];
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

    // Avoid showing database IDs like 1, 2, 3 as location
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

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function HomeAdCard({ ad }: { ad: any }) {
    const id = getAdId(ad);
    const image = getAdImage(ad);
    const title = getAdTitle(ad);

    const date =
        ad?.updated_at ||
        ad?.created_at ||
        ad?.published_at ||
        ad?.date_posted;

    return (
        <a
            href={id ? `/listings/${id}` : "/listings"}
            className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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

                <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                    New
                </span>

                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-black text-slate-700 shadow-sm">
                    ♡
                </span>
            </div>

            <div className="p-4">
                <h3 className="line-clamp-1 text-[15px] font-black text-slate-950">
                    {title}
                </h3>

                <p className="mt-1 text-[15px] font-black text-orange-600">
                    {formatPrice(ad?.price, ad?.currency)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                    <span className="line-clamp-1">{getAdLocation(ad)}</span>
                    <span className="shrink-0">{formatDate(date)}</span>
                </div>
            </div>
        </a>
    );
}

export default function HomeLatestAds({ ads = [] }: HomeLatestAdsProps) {
    return (
        <section className="mx-auto max-w-[1390px] px-2 pb-5 pt-2">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
                    <span className="rounded-lg bg-orange-500 px-2 py-1 text-sm text-white">
                        ★
                    </span>
                    Latest Ads
                </h2>

                <a
                    href="/listings?sort=newest"
                    className="rounded-xl px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50"
                >
                    View all →
                </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                {ads.length > 0 ? (
                    ads.map((ad) => (
                        <HomeAdCard key={getAdId(ad) || getAdTitle(ad)} ad={ad} />
                    ))
                ) : (
                    <div className="col-span-full rounded-3xl border border-dashed bg-white p-10 text-center">
                        <p className="text-lg font-black text-slate-950">
                            No latest ads yet.
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            New ads will appear here once sellers post.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}