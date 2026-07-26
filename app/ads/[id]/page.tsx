import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/QotMarketplaceNav";
import { apiGet } from "@/lib/api";
import RecentlyViewedTracker from "@/components/listings/RecentlyViewedTracker";
import SimilarListings from "@/components/listings/SimilarListings";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";
import BuyerSafetyCard from "@/components/listings/BuyerSafetyCard";
import AdSellerCard from "@/components/sellers/AdSellerCard";
import { formatDateTime, formatRelativeTime } from "@/lib/dateTime";
import { backendJson, getAccessToken } from "@/lib/authCookies";
import { getOrderedListingImages, getPrimaryListingSocialImage } from "@/lib/listingImages";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

const SITE_URL = "https://qot.ug";

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

function getCategorySlug(listing: any) {
    return listing?.category?.slug || listing?.category_slug || listing?.category?.id || listing?.category || "";
}

function getCategoryBreadcrumb(listing: any) {
    const category = getCategoryName(listing);
    const parent =
        listing?.category?.parent?.name ||
        listing?.category?.parent_name ||
        listing?.category_parent_name ||
        "";

    return parent && parent !== category ? `${parent} › ${category}` : category;
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

function getListingFromPayload(payload: any) {
    return payload?.listing || payload?.data || payload || null;
}

function getShareDescription(listing: any) {
    const description = String(listing?.description || "")
        .replace(/\s+/g, " ")
        .trim();
    const price = formatPrice(listing?.price, listing?.currency || "UGX");
    const location = getLocation(listing);
    const summary = [price, location, description].filter(Boolean).join(" · ");

    return summary.length > 160 ? `${summary.slice(0, 159).trimEnd()}…` : summary;
}

function getListingAttribute(listing: any, key: string) {
    const attribute = Array.isArray(listing?.attributes)
        ? listing.attributes.find((item: any) => String(item?.filter_key || item?.key || "").toLowerCase() === key)
        : null;
    return attribute?.display_value ?? attribute?.value_text ?? attribute?.value_number ?? "";
}

function getConditionSchemaUrl(condition: any) {
    const value = String(condition || "").toLowerCase();
    if (value === "new") return "https://schema.org/NewCondition";
    if (value === "refurbished") return "https://schema.org/RefurbishedCondition";
    return "https://schema.org/UsedCondition";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const canonicalUrl = `${SITE_URL}/ads/${encodeURIComponent(id)}`;
    const listingPayload = await apiGet(`/listings/${encodeURIComponent(id)}/`).catch(
        () => null
    );
    const listing = getListingFromPayload(listingPayload);

    if (!listing) {
        return {
            title: "Ad unavailable",
            description: "This QOT ad is no longer available.",
            alternates: { canonical: canonicalUrl },
            robots: { index: false, follow: false },
        };
    }

    const adName = String(listing?.title || "QOT ad").trim();
    const price = formatPrice(listing?.price, listing?.currency || "UGX");
    const location = getLocation(listing);
    const rawTitle = `${adName} – ${price} in ${location}`;
    const shareTitle = rawTitle.length > 68
        ? `${rawTitle.slice(0, 67).trimEnd()}…`
        : rawTitle;
    const shareDescription = getShareDescription(listing);
    const coverImage = getPrimaryListingSocialImage(listing);
    const images = coverImage
        ? [{ url: coverImage, alt: adName }]
        : undefined;

    return {
        title: shareTitle,
        description: shareDescription,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        openGraph: {
            title: shareTitle,
            description: shareDescription,
            url: canonicalUrl,
            siteName: "QOT",
            locale: "en_UG",
            type: "website",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: shareTitle,
            description: shareDescription,
            images: coverImage ? [coverImage] : undefined,
        },
    };
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
    listing = getListingFromPayload(listingPayload);

    if (!listing) notFound();

    const sellerId = getSellerId(listing);
    const sellerProfile = sellerId
        ? await apiGet(`/sellers/${sellerId}/`).catch(() => null)
        : null;
    const sellerName =
        sellerProfile?.business_name ||
        sellerProfile?.full_name ||
        getSellerName(listing);
    const location = getLocation(listing);
    const categoryName = getCategoryBreadcrumb(listing);
    const statusLabel = cleanLabel(listing?.status, "Available");
    const conditionLabel = cleanLabel(listing?.condition);
    const isNegotiable = Boolean(
        listing?.is_negotiable ?? listing?.negotiable
    );
    const postedValue =
        listing?.created_at || listing?.published_at || listing?.date_posted
    const postedDate = formatRelativeTime(postedValue);
    const listingStatus = String(listing?.status || "").toLowerCase();
    const isPublicListing = listingStatus === "active";
    const isRejected = ["rejected", "declined"].includes(listingStatus);
    const rejectionReason = String(
        listing?.rejection_reason ||
        listing?.moderation_reason ||
        listing?.review_note ||
        listing?.admin_note ||
        ""
    ).trim();
    const canonicalUrl = `${SITE_URL}/ads/${encodeURIComponent(id)}`;
    const categorySlug = getCategorySlug(listing);
    const listingImages = getOrderedListingImages(listing);
    const schemaImages = Array.from(new Set(
        listingImages.flatMap((image: any) => [image.url, image.cardUrl, image.socialUrl]).filter(Boolean)
    ));
    const priceValue = Number(String(listing?.price || "").replace(/[^\d.]/g, ""));
    const sellerSchema = {
        "@type": sellerProfile?.business_name ? "Organization" : "Person",
        name: sellerName,
        url: sellerId ? `${SITE_URL}/sellers/${sellerId}` : undefined,
    };
    const offerSchema = {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: listing?.currency || "UGX",
        price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : undefined,
        availability: isPublicListing
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: getConditionSchemaUrl(listing?.condition),
        priceValidUntil: listing?.expires_at
            ? String(listing.expires_at).slice(0, 10)
            : undefined,
        seller: sellerSchema,
        areaServed: { "@type": "Country", name: "Uganda" },
    };
    const categoryType = getCategoryName(listing).toLowerCase();
    const commonSchema = {
        "@context": "https://schema.org",
        "@id": `${canonicalUrl}#ad`,
        name: listing?.title,
        description: String(listing?.description || "").trim(),
        url: canonicalUrl,
        image: schemaImages,
        dateCreated: listing?.created_at,
        dateModified: listing?.updated_at,
    };
    let adSchema: Record<string, any>;
    if (categoryType.includes("job")) {
        adSchema = {
            ...commonSchema,
            "@type": "JobPosting",
            title: listing?.title,
            datePosted: listing?.created_at,
            validThrough: listing?.expires_at || undefined,
            hiringOrganization: sellerSchema,
            jobLocation: {
                "@type": "Place",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: location,
                    addressCountry: "UG",
                },
            },
        };
    } else if (categoryType.includes("service")) {
        adSchema = {
            ...commonSchema,
            "@type": "Service",
            provider: sellerSchema,
            areaServed: location,
            offers: offerSchema,
        };
    } else if (categoryType.includes("property") || categoryType.includes("real estate")) {
        adSchema = {
            ...commonSchema,
            "@type": "RealEstateListing",
            offers: offerSchema,
        };
    } else {
        const brand = getListingAttribute(listing, "brand");
        adSchema = {
            ...commonSchema,
            "@type": "Product",
            sku: `QOT-${listing.id}`,
            category: categoryName,
            brand: brand ? { "@type": "Brand", name: String(brand) } : undefined,
            offers: offerSchema,
        };
    }
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Ads", item: `${SITE_URL}/ads` },
            ...(categorySlug ? [{
                "@type": "ListItem",
                position: 3,
                name: categoryName,
                item: `${SITE_URL}/ads?category=${encodeURIComponent(categorySlug)}`,
            }] : []),
            {
                "@type": "ListItem",
                position: categorySlug ? 4 : 3,
                name: listing?.title,
                item: canonicalUrl,
            },
        ],
    };

    return (
        <>
        {isPublicListing && (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(adSchema).replace(/</g, "\\u003c") }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
            </>
        )}
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            {isPublicListing && <RecentlyViewedTracker listing={listing} />}

            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar categories={categories} cities={cities} />

                <section className="py-2 sm:py-6">
                    <Link
                        href="/ads"
                        className="hidden rounded-2xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm ring-1 ring-black/5 hover:bg-orange-50 sm:inline-flex"
                    >
                        ← Back to Ads
                    </Link>

                    {!isPublicListing && (
                        <div className={`mt-4 flex flex-col gap-3 rounded-[22px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                            isRejected
                                ? "border-red-200 bg-red-50"
                                : "border-amber-200 bg-amber-50"
                        }`}>
                            <div>
                                <p className={`text-sm font-black ${isRejected ? "text-red-900" : "text-amber-900"}`}>
                                    This ad is {statusLabel.toLowerCase()}
                                </p>
                                <p className={`mt-1 text-xs font-semibold leading-5 ${isRejected ? "text-red-700" : "text-amber-700"}`}>
                                    Only you and QOT administrators can view this page until the ad is approved.
                                </p>
                            </div>
                            <Link
                                href={`/account/my-ads/${id}`}
                                className={`inline-flex h-10 shrink-0 items-center justify-center rounded-[14px] bg-white px-4 text-xs font-black ring-1 ${
                                    isRejected
                                        ? "text-red-800 ring-red-200 hover:bg-red-100"
                                        : "text-amber-800 ring-amber-200 hover:bg-amber-100"
                                }`}
                            >
                                Manage Ad
                            </Link>
                        </div>
                    )}

                    {isRejected && (
                        <div className="mt-4 rounded-[24px] border border-red-200 bg-white p-5 shadow-[0_12px_30px_rgba(127,29,29,0.08)] sm:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-lg font-black text-red-600">
                                    !
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-500">
                                        Why your ad was rejected
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-red-900">
                                        {rejectionReason || "A specific moderation reason was not included. Review QOT posting rules or contact support before resubmitting this ad."}
                                    </p>
                                    <Link
                                        href={`/account/my-ads/${id}/edit`}
                                        className="mt-4 inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
                                    >
                                        Edit and resubmit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-2 grid gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-[1fr_0.42fr]">
                        <div className="-mx-4 overflow-hidden bg-white shadow-none sm:mx-0 sm:rounded-[34px] sm:p-7 sm:shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:ring-1 sm:ring-black/5">
                            <ListingImageCarousel
                                listing={listing}
                                title={listing?.title || "Ad image"}
                            />

                            <div className="px-4 pb-4 sm:px-0 sm:pb-0">
                            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-7 sm:gap-2">
                                <span className="max-w-full truncate rounded-[7px] bg-orange-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-orange-600 sm:rounded-full sm:px-3 sm:text-xs">
                                    {categoryName}
                                </span>

                                {(listing?.is_featured ||
                                    listing?.featured ||
                                    listing?.featured_until) && (
                                        <span className="rounded-[7px] bg-orange-500 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white sm:rounded-full sm:px-3 sm:text-xs">
                                            Featured
                                        </span>
                                    )}

                                {(listing?.seller?.is_verified || listing?.seller?.verified) && (
                                    <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700 sm:inline-flex">
                                        Verified Seller
                                    </span>
                                )}

                                <span className="rounded-[7px] bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-700 sm:rounded-full sm:px-3 sm:text-xs">
                                    {statusLabel}
                                </span>
                            </div>

                            <h1 className="mt-3 text-xl font-black leading-6 tracking-tight text-slate-950 sm:mt-5 sm:text-3xl sm:leading-tight md:text-5xl">
                                {listing?.title || "Untitled ad"}
                            </h1>

                            <div className="mt-2 flex min-w-0 flex-nowrap items-center gap-2.5 sm:mt-4">
                                <p className="min-w-0 truncate whitespace-nowrap text-2xl font-black tracking-tight text-orange-600 sm:text-3xl md:text-4xl">
                                    {formatPrice(listing?.price, listing?.currency || "UGX")}
                                </p>
                                {isNegotiable && (
                                    <span className="shrink-0 rounded-[7px] bg-orange-50 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-100 sm:rounded-full sm:px-2.5 sm:text-[10px]">
                                        Negotiable
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-6 sm:gap-3">
                                <div className="min-w-0 rounded-[12px] bg-slate-50 p-2.5 sm:rounded-3xl sm:p-4">
                                    <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-xs">
                                        Location
                                    </p>
                                    <p className="mt-1 truncate text-[10px] font-black text-slate-800 sm:text-sm">
                                        {location}
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-[12px] bg-slate-50 p-2.5 sm:rounded-3xl sm:p-4">
                                    <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-xs">
                                        Condition
                                    </p>
                                    <p className="mt-1 truncate text-[10px] font-black text-slate-800 sm:text-sm">
                                        {conditionLabel}
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-[12px] bg-slate-50 p-2.5 sm:rounded-3xl sm:p-4">
                                    <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-xs">
                                        Posted
                                    </p>
                                    <p
                                        className="mt-1 truncate text-[10px] font-black text-slate-800 sm:text-sm"
                                        title={formatDateTime(postedValue)}
                                    >
                                        {postedDate}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[14px] bg-slate-50 p-3 sm:mt-8 sm:rounded-[28px] sm:p-5">
                                <h2 className="text-sm font-black text-slate-950 sm:text-lg">
                                    Description
                                </h2>

                                <p className="mt-2 whitespace-pre-line text-[13px] font-semibold leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                                    {listing?.description || "No description provided."}
                                </p>
                            </div>

                            {Array.isArray(listing?.attributes) &&
                                listing.attributes.length > 0 && (
                                    <div className="mt-3 rounded-[14px] bg-slate-50 p-3 sm:mt-6 sm:rounded-[28px] sm:p-5">
                                        <h2 className="text-sm font-black text-slate-950 sm:text-lg">
                                            Product Details
                                        </h2>

                                        <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                                            {listing.attributes.map((item: any) => {
                                                const label =
                                                    item?.filter_name ||
                                                    item?.name ||
                                                    item?.key ||
                                                    "Detail";

                                                const value =
                                                    item?.display_value ??
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
                                                        className="min-w-0 rounded-[10px] bg-white px-2.5 py-2 ring-1 ring-black/5 sm:rounded-2xl sm:px-4 sm:py-3"
                                                    >
                                                        <p className="truncate text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-xs">
                                                            {label}
                                                        </p>

                                                        <p className="mt-1 break-words text-[11px] font-black text-slate-800 sm:text-sm">
                                                            {String(value)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-3 sm:space-y-6">
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
        </>
    );
}
