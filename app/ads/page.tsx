import Navbar from "@/components/layout/QotMarketplaceNav";
import { apiGet, getArray } from "@/lib/api";
import ListingFilters from "@/components/listings/ListingFilters";
import MobileListingFilters from "@/components/listings/MobileListingFilters";
import ListingsResultsToolbar from "@/components/listings/ListingsResultsToolbar";
import Pagination from "@/components/listings/Pagination";
import SaveSearchButton from "@/components/listings/SaveSearchButton";
import ListingsGridClient from "@/components/listings/ListingsGridClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const dynamicFilterKeys = [
    "brand",
    "model",
    "processor",
    "ram",
    "storage",
    "storage_type",
    "screen_size",
    "graphics",
    "operating_system",
    "touch_screen",
    "network",
    "sim",
    "battery_health",
    "display_type",
    "resolution",
    "smart_tv",
    "connectivity",

    "make",
    "year",
    "mileage",
    "fuel",
    "transmission",
    "engine_size",
    "body_type",
    "drive",
    "color",

    "property_type",
    "purpose",
    "bedrooms",
    "bathrooms",
    "furnished",
    "parking",
    "compound",
    "security",
    "water_available",
    "electricity_available",
    "land_size",
    "land_unit",
    "title_status",
    "land_use",
    "road_access",
    "fenced",
    "room_type",
    "self_contained",
    "bathroom_type",
    "floor_area",
    "location_type",

    "appliance_type",
    "capacity",
    "power_source",
    "furniture_type",
    "material",
    "room",

    "gender",
    "item_type",
    "size",

    "job_type",
    "work_mode",
    "experience_level",
    "education_level",
    "salary_type",
    "company",

    "service_type",
    "availability",
    "experience",
    "service_location",

    "breed",
    "age",
    "quantity",
    "vaccinated",

    "subject",
    "author",
    "level",
];


type ListingsPageProps = {
    searchParams: Promise<{
        [key: string]: string | undefined;
        q?: string;
        search?: string;
        category?: string;
        city?: string;
        area?: string;
        region?: string;
        min_price?: string;
        max_price?: string;
        condition?: string;
        sort?: string;
        page?: string;
        status?: string;
        seller?: string;
        is_negotiable?: string;
        negotiable?: string;
        verified_seller?: string;
        posted_within?: string;
    }>;
};

function titleCaseSlug(value: string) {
    return decodeURIComponent(value)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ searchParams }: ListingsPageProps): Promise<Metadata> {
    const params = await searchParams;
    const page = Math.max(1, Number.parseInt(String(params.page || "1"), 10) || 1);
    const category = String(params.category || "").trim();
    const search = String(params.q || params.search || "").trim();
    const indexableKeys = new Set(["category", "page"]);
    const activeKeys = Object.entries(params)
        .filter(([, value]) => value !== undefined && String(value).trim() !== "")
        .map(([key]) => key);
    const hasFacetedNoise = activeKeys.some((key) => !indexableKeys.has(key));
    const shouldIndex = !search && !hasFacetedNoise;

    const canonicalParams = new URLSearchParams();
    if (category) canonicalParams.set("category", category);
    if (page > 1) canonicalParams.set("page", String(page));
    const canonicalPath = canonicalParams.size
        ? `/ads?${canonicalParams.toString()}`
        : "/ads";

    const categoryName = category ? titleCaseSlug(category) : "All Categories";
    const title = search
        ? `Search results for “${search}”`
        : category
            ? `${categoryName} for Sale in Uganda${page > 1 ? ` – Page ${page}` : ""}`
            : `Buy & Sell in Uganda${page > 1 ? ` – Page ${page}` : ""}`;
    const description = category
        ? `Browse new and used ${categoryName.toLowerCase()} for sale across Uganda. Contact sellers directly and post ads for free on QOT.`
        : "Browse cars, phones, property, electronics, fashion, services and more for sale across Uganda on QOT.";

    return {
        title,
        description,
        alternates: { canonical: canonicalPath },
        robots: shouldIndex
            ? { index: true, follow: true }
            : { index: false, follow: true },
        openGraph: {
            title,
            description,
            url: `https://qot.ug${canonicalPath}`,
            type: "website",
        },
    };
}

function buildListingsQuery(params: any) {
    const query = new URLSearchParams();

    const searchTerm = params.q || params.search || "";

    query.set("page_size", "16");

    if (searchTerm) query.set("q", searchTerm);
    if (params.category) query.set("category", params.category);
    if (params.city) query.set("city", params.city);
    if (params.area) query.set("area", params.area);
    if (params.region) query.set("region", params.region);
    if (params.min_price) query.set("min_price", params.min_price);
    if (params.max_price) query.set("max_price", params.max_price);
    if (params.condition) query.set("condition", params.condition);
    if (params.sort) query.set("sort", params.sort);
    if (params.is_negotiable) {
        query.set("is_negotiable", params.is_negotiable);
    }
    if (params.negotiable) {
        query.set("is_negotiable", params.negotiable);
    }
    if (params.verified_seller) query.set("verified_seller", params.verified_seller);
    if (params.posted_within) query.set("posted_within", params.posted_within);
    if (params.brand) query.set("brand", params.brand);
    if (params.ram) query.set("ram", params.ram);
    if (params.bedrooms) query.set("bedrooms", params.bedrooms);

    if (params.page && params.page !== "1") {
        query.set("page", params.page);
    }

    if (params.status) query.set("status", params.status);
    if (params.seller) query.set("seller", params.seller);

    if (params.is_negotiable) {
        query.set("is_negotiable", params.is_negotiable);
    }

    if (params.negotiable) {
        query.set("is_negotiable", params.negotiable);
    }

    dynamicFilterKeys.forEach((key) => {
        [key, `${key}_min`, `${key}_max`].forEach((parameter) => {
            const value = params[parameter];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                query.set(parameter, String(value).trim());
            }
        });
    });

    return query;
}

async function getCities() {
    let path = "/locations/cities/?page_size=100";
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

async function getRegions() {
    let path = "/locations/regions/?page_size=100";
    const regions: any[] = [];

    for (let i = 0; i < 6 && path; i++) {
        const data = await apiGet(path).catch(() => null);

        regions.push(...getArray(data));

        if (!data?.next) break;

        if (String(data.next).startsWith("http")) {
            const url = new URL(data.next);
            path = `${url.pathname}${url.search}`.replace("/api/v1", "");
        } else {
            path = data.next;
        }
    }

    return regions;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
    const params = await searchParams;

    let listings: any[] = [];
    let totalCount: number | undefined = undefined;
    let hasNext = false;
    let hasPrevious = false;

    let categories: any[] = [];
    let regions: any[] = [];
    let cities: any[] = [];
    let initialCategoryFilters: any[] = [];
    let initialFacets: any = {};

    const searchTerm = params.q || params.search || "";
    const query = buildListingsQuery(params);

    const endpoint = query.toString()
        ? `/listings/?${query.toString()}`
        : "/listings/?page_size=16";

    try {
        const [categoriesData, regionsData, citiesData] = await Promise.allSettled([
            apiGet("/categories/"),
            getRegions(),
            getCities(),
        ]);

        if (categoriesData.status === "fulfilled") {
            categories = getArray(categoriesData.value);
        }

        if (regionsData.status === "fulfilled") {
            regions = regionsData.value;
        }

        if (citiesData.status === "fulfilled") {
            cities = citiesData.value;
        }
    } catch (error) {
        console.error("Filters API error:", error);
    }

    if (params.category) {
        const categoryFilterData = await apiGet(
            `/categories/${encodeURIComponent(params.category)}/filters/`
        ).catch(() => null);
        initialCategoryFilters = getArray(categoryFilterData);
    }

    const facetQuery = buildListingsQuery(params);
    facetQuery.delete("page");
    facetQuery.delete("page_size");
    facetQuery.delete("sort");
    initialFacets = await apiGet(
        `/listings/facets/?${facetQuery.toString()}`
    ).catch(() => ({}));

    try {
        const data = await apiGet(endpoint);

        listings = getArray(data);
        totalCount = typeof data?.count === "number" ? data.count : undefined;
        hasNext = Boolean(data?.next);
        hasPrevious = Boolean(data?.previous);
    } catch (error: any) {
        console.error("Listings API error:", error?.message || error);

        listings = [];
        totalCount = 0;
        hasNext = false;
        hasPrevious = Number(params.page || 1) > 1;
    }

    const resultCount =
        typeof totalCount === "number" ? totalCount : listings.length;
    const currentPage = Math.max(1, Number(params.page || 1));
    const listingListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: params.category
            ? `${titleCaseSlug(params.category)} ads in Uganda`
            : "Marketplace ads in Uganda",
        numberOfItems: listings.length,
        itemListElement: listings.map((listing, index) => ({
            "@type": "ListItem",
            position: ((currentPage - 1) * 16) + index + 1,
            name: listing?.title,
            url: `https://qot.ug/ads/${listing?.id}`,
            image: listing?.primary_image || undefined,
        })),
    };

    return (
        <>
        {listings.length > 0 && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingListSchema).replace(/</g, "\\u003c") }} />
        )}
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-3 py-2 md:px-6 md:py-4">
                <Navbar categories={categories} cities={cities} />

                <section className="py-3 md:py-8">
                    <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-24">
                                <ListingFilters
                                    categories={categories}
                                    regions={regions}
                                    cities={cities}
                                    resultCount={resultCount}
                                    initialCategoryFilters={initialCategoryFilters}
                                    initialFacets={initialFacets}
                                />
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <div className="mb-4 lg:hidden">
                                <MobileListingFilters
                                    categories={categories}
                                    regions={regions}
                                    cities={cities}
                                    resultCount={resultCount}
                                    initialCategoryFilters={initialCategoryFilters}
                                    initialFacets={initialFacets}
                                />
                            </div>

                            <ListingsResultsToolbar
                                resultCount={resultCount}
                                categories={categories}
                                cities={cities}
                                action={<SaveSearchButton searchParams={params} />}
                            />

                            {listings.length > 0 ? (
                                <ListingsGridClient listings={listings} />
                            ) : (
                                <div className="rounded-[34px] bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                                    <h2 className="text-2xl font-black text-slate-950">
                                        No ads found
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                                        Try changing your search words, removing some filters, or browsing
                                        all adverts again.
                                    </p>

                                    <a
                                        href="/ads"
                                        className="mt-6 inline-flex h-11 items-center justify-center rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        Browse all ads
                                    </a>
                                </div>
                            )}

                            <Pagination
                                currentPage={currentPage}
                                hasNext={hasNext}
                                hasPrevious={hasPrevious}
                                totalCount={totalCount}
                                searchParams={{
                                    q: searchTerm,
                                    category: params.category,
                                    city: params.city,
                                    region: params.region,
                                    min_price: params.min_price,
                                    max_price: params.max_price,
                                    condition: params.condition,
                                    sort: params.sort,
                                    status: params.status,
                                    seller: params.seller,
                                    is_negotiable: params.is_negotiable || params.negotiable,
                                    verified_seller: params.verified_seller,
                                    posted_within: params.posted_within,
                                    ...Object.fromEntries(
                                        dynamicFilterKeys.flatMap((key) => [key, `${key}_min`, `${key}_max`])
                                            .filter((key) => params[key])
                                            .map((key) => [key, params[key]])
                                    ),
                                }}
                            />
                        </div>
                    </div>
                </section>

            </div>
        </main>
        </>
    );
}
