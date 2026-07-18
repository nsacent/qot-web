import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import { apiGet, getArray } from "@/lib/api";
import ListingFilters from "@/components/listings/ListingFilters";
import Pagination from "@/components/listings/Pagination";
import SaveSearchButton from "@/components/listings/SaveSearchButton";
import ListingsGridClient from "@/components/listings/ListingsGridClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faFilter,
    faMagnifyingGlass,
    faRotateLeft,
    faStore,
} from "@fortawesome/free-solid-svg-icons";

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
    }>;
};

function hasValue(value: any) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

function buildListingsQuery(params: any) {
    const query = new URLSearchParams();

    const searchTerm = params.q || params.search || "";

    query.set("page_size", "16");

    if (searchTerm) query.set("q", searchTerm);
    if (params.category) query.set("category", params.category);
    if (params.city) query.set("city", params.city);
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
        const value = params[key];

        if (value !== undefined && value !== null && String(value).trim() !== "") {
            query.set(key, String(value).trim());
        }
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

    const searchTerm = params.q || params.search || "";
    const query = buildListingsQuery(params);

    const endpoint = query.toString()
        ? `/listings/?${query.toString()}`
        : "/listings/?page_size=16";

    const filterValues = [
        searchTerm,
        params.category,
        params.city,
        params.region,
        params.min_price,
        params.max_price,
        params.condition,
        params.sort,
        params.status,
        params.seller,
        params.is_negotiable || params.negotiable,
        ...dynamicFilterKeys.map((key) => params[key]),
    ];

    const hasFilters = filterValues.some(hasValue);

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

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar categories={categories} cities={cities} />

                <section className="py-8">
                    <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-24">
                                <ListingFilters
                                    categories={categories}
                                    regions={regions}
                                    cities={cities}
                                />
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <details className="mb-5 rounded-[28px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 lg:hidden">
                                <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-5 text-sm font-black text-slate-800 [&::-webkit-details-marker]:hidden">
                                    <span>Filters</span>
                                    <span className="text-orange-600">Open</span>
                                </summary>

                                <div className="border-t border-slate-100 p-4">
                                    <ListingFilters
                                        categories={categories}
                                        regions={regions}
                                        cities={cities}
                                    />
                                </div>
                            </details>

                            <div className="mb-6 flex flex-col justify-between gap-3 rounded-[28px] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:flex-row md:items-center">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-wide text-orange-600">
                                        Marketplace Results
                                    </p>

                                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                                        {resultCount.toLocaleString()} ad{resultCount === 1 ? "" : "s"} found
                                    </h2>
                                </div>

                                {hasFilters && (
                                    <span className="inline-flex w-fit items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-600 ring-1 ring-orange-100">
                                        Filters applied
                                    </span>
                                )}
                            </div>

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
                                        href="/listings"
                                        className="mt-6 inline-flex h-11 items-center justify-center rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        Browse all ads
                                    </a>
                                </div>
                            )}

                            <Pagination
                                currentPage={Number(params.page || 1)}
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
                                    ...Object.fromEntries(
                                        dynamicFilterKeys
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
    );
}