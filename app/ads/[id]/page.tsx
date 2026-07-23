import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import { apiGet } from "@/lib/api";
import RecentlyViewedTracker from "@/components/listings/RecentlyViewedTracker";
import SimilarListings from "@/components/listings/SimilarListings";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import BuyerSafetyCard from "@/components/listings/BuyerSafetyCard";
import AdSellerCard from "@/components/sellers/AdSellerCard";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import { backendJson, getAccessToken } from "@/lib/authCookies";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

async function getCities() {
    let path = "/locations/cities/?page_size=50";
    const cities: any[] = [];

    for (let i = 0; i < 6 && path; i++) {
        const data = await apiGet(path).catch(() => null);
        cities.push(...getArray(data));

        if (!data?.next) break;

        if (String(data.next).startsWith("http")) {
            const url = new URL(data.next);
            path = `${url.pathname}${url.search}`.replace("/api/v1", "");
        } else {
            path = data.next;
        }
    }

    return cities;
}

function formatPrice(value: any, currency = "UGX") {
    if (value === null || value === undefined || value === "") {
        return "Contact seller";
    }

    const number = Number(String(value).replace(/[^\d.]/g, ""));

    if (!Number.isFinite(number) || number <= 0) {
        return "Contact seller";
    }

    return `${currency} ${new Intl.NumberFormat("en-UG").format(number)}`;
}

function getSellerId(listing: any) {
    return (
        listing?.seller?.id ||
        (typeof listing?.seller === "number" || typeof listing?.seller === "string"
            ? listing.seller
            : "") ||
        listing?.seller_id ||
        listing?.user?.id ||
        listing?.user_id ||
        ""
    );
}

function getSellerName(listing: any) {
    return (
        listing?.seller?.full_name ||
        listing?.seller?.name ||
        listing?.seller?.username ||
        listing?.seller_name ||
        "Seller"
    );
}

function getLocation(listing: any) {
    const city =
        listing?.city?.name ||
        listing?.city_name ||
        listing?.location?.city_name ||
        listing?.location?.city;

    const region =
        listing?.region?.name ||
        listing?.region_name ||
        listing?.district_name ||
        listing?.location?.region_name ||
        listing?.location?.district_name;

    const location =
        listing?.location_name ||
        listing?.location_text ||
        listing?.address ||
        listing?.location;

    if (city && region) return `${city}, ${region}`;
    if (city) return city;
    if (region) return region;
    if (location) return location;

    return "Uganda";
}

function getCategoryName(listing: any) {
    return listing?.category?.name || listing?.category_name || "Ad";
}

function cleanLabel(value: any, fallback = "Not specified") {
    if (!value) return fallback;

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getListingForRequest(id: string) {
    const accessToken = await getAccessToken();

    if (accessToken) {
        const authenticatedResult = await backendJson(
            `/listings/${encodeURIComponent(id)}/`,
            {},
            accessToken
        ).catch(() => null);

        if (authenticatedResult?.ok) {
            return authenticatedResult.data;
        }
    }

    return apiGet(`/listings/${encodeURIComponent(id)}/`).catch(() => null);
}

export default async function ListingDetailsPage({ params }: PageProps) {
    const { id } = await params;

    const [categoriesData, cities] = await Promise.all([
        apiGet("/categories/").catch(() => null),
        getCities(),
    ]);

    const categories = getArray(categoriesData);

    let listing: any = null;

    const listingPayload = await getListingForRequest(id);
    listing = listingPayload?.listing || listingPayload?.data || listingPayload;

    if (!listing) {
        return (
            <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
                <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                    <Navbar categories={categories} cities={cities} />

                    <section className="py-10">
                        <div className="mx-auto max-w-3xl rounded-[34px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                            <h1 className="text-2xl font-black text-slate-950">
                                Ad not found
                            </h1>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                This ad may have been removed, expired, or is no longer available.
                            </p>

                            <a
                                href="/ads"
                                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                            >
                                Back to Ads
                            </a>
                        </div>
                    </section>

                    <QotMarketplaceFooter />
                </div>
            </main>
        );
    }

    const sellerId = getSellerId(listing);
    const sellerProfile = sellerId
        ? await apiGet(`/sellers/${sellerId}/`).catch(() => null)
        : null;
    const sellerName =
        sellerProfile?.business_name ||
        sellerProfile?.full_name ||
        getSellerName(listing);
    const location = getLocation(listing);
    const categoryName = getCategoryName(listing);
    const statusLabel = cleanLabel(listing?.status, "Available");
    const conditionLabel = cleanLabel(listing?.condition);
    const postedValue =
        listing?.created_at || listing?.published_at || listing?.date_posted
    const postedDate = formatRelativeTime(postedValue);
    const isPublicListing = String(listing?.status || "").toLowerCase() === "active";

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            {isPublicListing && <RecentlyViewedTracker listing={listing} />}

            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar categories={categories} cities={cities} />

                <section className="py-6">
                    <a
                        href="/ads"
                        className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm ring-1 ring-black/5 hover:bg-orange-50"
                    >
                        ← Back to Ads
                    </a>

                    {!isPublicListing && (
                        <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-black text-amber-900">
                                    This ad is {statusLabel.toLowerCase()}
                                </p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
                                    Only you and QOT administrators can view this page until the ad is approved.
                                </p>
                            </div>
                            <a
                                href={`/my-ads/${id}`}
                                className="inline-flex h-10 shrink-0 items-center justify-center rounded-[14px] bg-white px-4 text-xs font-black text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                            >
                                Manage Ad
                            </a>
                        </div>
                    )}

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.42fr]">
                        <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                            <ListingImageCarousel
                                listing={listing}
                                title={listing?.title || "Ad image"}
                            />

                            <div className="mt-7 flex flex-wrap gap-2">
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-600">
                                    {categoryName}
                                </span>

                                {(listing?.is_featured ||
                                    listing?.featured ||
                                    listing?.featured_until) && (
                                        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                                            Featured
                                        </span>
                                    )}

                                {(listing?.seller?.is_verified || listing?.seller?.verified) && (
                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
                                        Verified Seller
                                    </span>
                                )}

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">
                                    {statusLabel}
                                </span>
                            </div>

                            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                                {listing?.title || "Untitled ad"}
                            </h1>

                            <p className="mt-4 text-3xl font-black text-orange-600 md:text-4xl">
                                {formatPrice(listing?.price, listing?.currency || "UGX")}
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm font-black text-slate-800">
                                        {location}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                        Condition
                                    </p>
                                    <p className="mt-1 text-sm font-black text-slate-800">
                                        {conditionLabel}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                        Posted
                                    </p>
                                    <p
                                        className="mt-1 text-sm font-black text-slate-800"
                                        title={formatDateTime(postedValue)}
                                    >
                                        {postedDate}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 rounded-[28px] bg-slate-50 p-5">
                                <h2 className="text-lg font-black text-slate-950">
                                    Description
                                </h2>

                                <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                                    {listing?.description || "No description provided."}
                                </p>
                            </div>

                            {Array.isArray(listing?.attributes) &&
                                listing.attributes.length > 0 && (
                                    <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
                                        <h2 className="text-lg font-black text-slate-950">
                                            Product Details
                                        </h2>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {listing.attributes.map((item: any) => {
                                                const label =
                                                    item?.filter_name ||
                                                    item?.name ||
                                                    item?.key ||
                                                    "Detail";

                                                const value =
                                                    item?.value_text ??
                                                    item?.value_number ??
                                                    item?.value_boolean ??
                                                    "";

                                                if (
                                                    value === "" ||
                                                    value === null ||
                                                    value === undefined
                                                ) {
                                                    return null;
                                                }

                                                return (
                                                    <div
                                                        key={`${label}-${value}`}
                                                        className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5"
                                                    >
                                                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                                            {label}
                                                        </p>

                                                        <p className="mt-1 text-sm font-black text-slate-800">
                                                            {String(value)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                        </div>

                        <aside className="space-y-6">
                            <BuyerSafetyCard listingId={listing.id} />

                            <AdSellerCard
                                listing={listing}
                                sellerId={sellerId || null}
                                sellerName={sellerName}
                                location={location}
                                sellerProfile={sellerProfile}
                            />
                        </aside>
                    </div>
                </section>

                <div className="mt-2">
                    <SimilarListings listing={listing} />
                </div>

            </div>
        </main>
    );
}
