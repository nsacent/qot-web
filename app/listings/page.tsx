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

type ListingsPageProps = {
    searchParams: Promise<{
        q?: string;
        search?: string;
        category?: string;
        city?: string;
        region?: string;
        min_price?: string;
        max_price?: string;
        condition?: string;
        sort?: string;
        brand?: string;
        ram?: string;
        bedrooms?: string;
        page?: string;
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
    if (params.brand) query.set("brand", params.brand);
    if (params.ram) query.set("ram", params.ram);
    if (params.bedrooms) query.set("bedrooms", params.bedrooms);

    if (params.page && params.page !== "1") {
        query.set("page", params.page);
    }

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
        params.brand,
        params.ram,
        params.bedrooms,
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

                <section className="pt-6">
                    <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-white sm:p-8 lg:p-10">
                            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/20 blur-xl" />
                            <div className="absolute -bottom-20 left-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />

                            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-100 ring-1 ring-white/10">
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            className="h-3.5 w-3.5"
                                        />
                                        Browse Ads
                                    </span>

                                    <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight md:text-5xl">
                                        {searchTerm
                                            ? `Search results for “${searchTerm}”`
                                            : "Find trusted ads around Uganda"}
                                    </h1>

                                    <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/70 md:text-base">
                                        {searchTerm
                                            ? "Showing adverts that match your search and selected filters."
                                            : "Browse cars, electronics, property, jobs, services, and more from QOT sellers."}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SaveSearchButton />

                                    <a
                                        href="/saved-searches"
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-white/10 px-5 text-sm font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                                    >
                                        <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />
                                        Saved Searches
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 bg-white p-5 sm:p-7">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                    <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-950">
                                        Filter ads
                                    </h2>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Narrow results by category, location, price, and condition.
                                    </p>
                                </div>
                            </div>

                            <ListingFilters
                                categories={categories}
                                regions={regions}
                                cities={cities}
                            />

                            {hasFilters && (
                                <a
                                    href="/listings"
                                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[16px] bg-orange-50 px-4 text-sm font-black text-orange-600 hover:bg-orange-100"
                                >
                                    <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                                    Clear all filters
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <section className="py-8">
                    <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-wide text-orange-600">
                                Marketplace Results
                            </p>

                            <h2 className="mt-1 text-2xl font-black text-slate-950">
                                {resultCount.toLocaleString()} ad{resultCount === 1 ? "" : "s"} found
                            </h2>
                        </div>

                        {hasFilters && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 shadow-sm ring-1 ring-black/5">
                                <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
                                Filters applied
                            </span>
                        )}
                    </div>

                    {listings.length > 0 ? (
                        <ListingsGridClient listings={listings} />
                    ) : (
                        <div className="rounded-[34px] bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faStore} className="h-7 w-7" />
                            </div>

                            <h2 className="mt-5 text-2xl font-black text-slate-950">
                                No ads found
                            </h2>

                            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                                Try changing your search words, removing some filters, or
                                browsing all adverts again.
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
                            brand: params.brand,
                            ram: params.ram,
                            bedrooms: params.bedrooms,
                        }}
                    />
                </section>

            </div>
        </main>
    );
}