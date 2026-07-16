"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faBed,
    faChevronDown,
    faFilter,
    faLayerGroup,
    faLaptop,
    faLocationDot,
    faMagnifyingGlass,
    faMoneyBillWave,
    faRotateLeft,
    faSliders,
    faTag,
} from "@fortawesome/free-solid-svg-icons";

type ListingFiltersProps = {
    categories?: any[];
    regions?: any[];
    cities?: any[];
};

type FieldShellProps = {
    label: string;
    icon: any;
    children: ReactNode;
    wide?: boolean;
};

function getInitialValue(searchParams: URLSearchParams, key: string) {
    return searchParams.get(key) || "";
}

function getOptionValue(item: any) {
    return String(item?.slug || item?.id || item?.value || "");
}

function getOptionLabel(item: any) {
    return item?.name || item?.title || item?.label || "Unnamed";
}

function itemMatchesRegion(city: any, region: string) {
    if (!region) return true;

    const cityRegionValues = [
        city?.region?.slug,
        city?.region?.id,
        city?.region_slug,
        city?.region_id,
        city?.district?.slug,
        city?.district?.id,
    ]
        .filter(Boolean)
        .map((value) => String(value));

    return cityRegionValues.includes(String(region));
}

function FieldShell({ label, icon, children, wide = false }: FieldShellProps) {
    return (
        <div className={wide ? "lg:col-span-2" : ""}>
            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-orange-500" />
                {label}
            </label>

            {children}
        </div>
    );
}

const inputClass =
    "h-12 w-full rounded-[18px] border-0 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200";

const selectClass =
    "h-12 w-full appearance-none rounded-[18px] border-0 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-2 focus:ring-orange-200";

function SelectWrap({ children }: { children: ReactNode }) {
    return (
        <div className="relative">
            {children}
            <FontAwesomeIcon
                icon={faChevronDown}
                className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
        </div>
    );
}

export default function ListingFilters({
    categories = [],
    regions = [],
    cities = [],
}: ListingFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(getInitialValue(searchParams, "q"));
    const [category, setCategory] = useState(
        getInitialValue(searchParams, "category")
    );
    const [region, setRegion] = useState(getInitialValue(searchParams, "region"));
    const [city, setCity] = useState(getInitialValue(searchParams, "city"));
    const [minPrice, setMinPrice] = useState(
        getInitialValue(searchParams, "min_price")
    );
    const [maxPrice, setMaxPrice] = useState(
        getInitialValue(searchParams, "max_price")
    );
    const [condition, setCondition] = useState(
        getInitialValue(searchParams, "condition")
    );
    const [sort, setSort] = useState(getInitialValue(searchParams, "sort"));
    const [brand, setBrand] = useState(getInitialValue(searchParams, "brand"));
    const [ram, setRam] = useState(getInitialValue(searchParams, "ram"));
    const [bedrooms, setBedrooms] = useState(
        getInitialValue(searchParams, "bedrooms")
    );

    useEffect(() => {
        setQ(getInitialValue(searchParams, "q"));
        setCategory(getInitialValue(searchParams, "category"));
        setRegion(getInitialValue(searchParams, "region"));
        setCity(getInitialValue(searchParams, "city"));
        setMinPrice(getInitialValue(searchParams, "min_price"));
        setMaxPrice(getInitialValue(searchParams, "max_price"));
        setCondition(getInitialValue(searchParams, "condition"));
        setSort(getInitialValue(searchParams, "sort"));
        setBrand(getInitialValue(searchParams, "brand"));
        setRam(getInitialValue(searchParams, "ram"));
        setBedrooms(getInitialValue(searchParams, "bedrooms"));
    }, [searchParams]);

    const filteredCities = useMemo(() => {
        return cities.filter((item) => itemMatchesRegion(item, region));
    }, [cities, region]);

    const activeFilterCount = [
        q,
        category,
        region,
        city,
        minPrice,
        maxPrice,
        condition,
        sort,
        brand,
        ram,
        bedrooms,
    ].filter((value) => String(value || "").trim()).length;

    const showMoreFilters =
        minPrice || maxPrice || condition || brand || ram || bedrooms;

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const params = new URLSearchParams();

        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        if (region) params.set("region", region);
        if (city) params.set("city", city);
        if (minPrice) params.set("min_price", minPrice);
        if (maxPrice) params.set("max_price", maxPrice);
        if (condition) params.set("condition", condition);
        if (sort) params.set("sort", sort);
        if (brand.trim()) params.set("brand", brand.trim());
        if (ram.trim()) params.set("ram", ram.trim());
        if (bedrooms) params.set("bedrooms", bedrooms);

        const queryString = params.toString();

        router.push(queryString ? `/listings?${queryString}` : "/listings");
    }

    function clearFilters() {
        setQ("");
        setCategory("");
        setRegion("");
        setCity("");
        setMinPrice("");
        setMaxPrice("");
        setCondition("");
        setSort("");
        setBrand("");
        setRam("");
        setBedrooms("");

        router.push("/listings");
    }

    function handleRegionChange(value: string) {
        setRegion(value);

        if (city) {
            const stillValid = cities.some(
                (item) => getOptionValue(item) === city && itemMatchesRegion(item, value)
            );

            if (!stillValid) {
                setCity("");
            }
        }
    }

    return (
        <form onSubmit={applyFilters} className="rounded-[34px] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
                            Filter ads
                        </span>

                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                                {activeFilterCount} active
                            </span>
                        )}
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                        Search by keyword, location, price, condition, and item details.
                    </p>
                </div>

                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-[16px] bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>

            <div className="pt-5">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FieldShell label="Keyword" icon={faMagnifyingGlass} wide>
                        <input
                            value={q}
                            onChange={(event) => setQ(event.target.value)}
                            placeholder="Search Toyota, iPhone, house..."
                            className={inputClass}
                        />
                    </FieldShell>

                    <FieldShell label="Category" icon={faLayerGroup}>
                        <SelectWrap>
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className={selectClass}
                            >
                                <option value="">All categories</option>

                                {categories.map((item: any, index: number) => {
                                    const value = getOptionValue(item);

                                    return (
                                        <option key={value || index} value={value}>
                                            {getOptionLabel(item)}
                                        </option>
                                    );
                                })}
                            </select>
                        </SelectWrap>
                    </FieldShell>

                    <FieldShell label="Sort" icon={faSliders}>
                        <SelectWrap>
                            <select
                                value={sort}
                                onChange={(event) => setSort(event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Default</option>
                                <option value="newest">Newest</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="popular">Popular</option>
                            </select>
                        </SelectWrap>
                    </FieldShell>

                    <FieldShell label="Region" icon={faLocationDot}>
                        <SelectWrap>
                            <select
                                value={region}
                                onChange={(event) => handleRegionChange(event.target.value)}
                                className={selectClass}
                            >
                                <option value="">All regions</option>

                                {regions.map((item: any, index: number) => {
                                    const value = getOptionValue(item);

                                    return (
                                        <option key={value || index} value={value}>
                                            {getOptionLabel(item)}
                                        </option>
                                    );
                                })}
                            </select>
                        </SelectWrap>
                    </FieldShell>

                    <FieldShell label="City" icon={faLocationDot}>
                        <SelectWrap>
                            <select
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                className={selectClass}
                            >
                                <option value="">All cities</option>

                                {filteredCities.map((item: any, index: number) => {
                                    const value = getOptionValue(item);

                                    return (
                                        <option key={value || index} value={value}>
                                            {getOptionLabel(item)}
                                        </option>
                                    );
                                })}
                            </select>
                        </SelectWrap>
                    </FieldShell>

                    <FieldShell label="Min Price" icon={faMoneyBillWave}>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(event) => setMinPrice(event.target.value)}
                            placeholder="100000"
                            className={inputClass}
                        />
                    </FieldShell>

                    <FieldShell label="Max Price" icon={faMoneyBillWave}>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(event) => setMaxPrice(event.target.value)}
                            placeholder="3000000"
                            className={inputClass}
                        />
                    </FieldShell>
                </div>

                <details
                    className="mt-4 rounded-[24px] bg-slate-50 ring-1 ring-slate-100"
                    open={Boolean(showMoreFilters)}
                >
                    <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-700 hover:text-orange-600 [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                            More filters
                        </span>

                        <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                    </summary>

                    <div className="grid gap-4 border-t border-white p-4 md:grid-cols-2 lg:grid-cols-4">
                        <FieldShell label="Condition" icon={faTag}>
                            <SelectWrap>
                                <select
                                    value={condition}
                                    onChange={(event) => setCondition(event.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Any condition</option>
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                    <option value="refurbished">Refurbished</option>
                                </select>
                            </SelectWrap>
                        </FieldShell>

                        <FieldShell label="Brand" icon={faTag}>
                            <input
                                value={brand}
                                onChange={(event) => setBrand(event.target.value)}
                                placeholder="Toyota, Apple, HP..."
                                className={inputClass}
                            />
                        </FieldShell>

                        <FieldShell label="RAM" icon={faLaptop}>
                            <input
                                value={ram}
                                onChange={(event) => setRam(event.target.value)}
                                placeholder="16GB"
                                className={inputClass}
                            />
                        </FieldShell>

                        <FieldShell label="Bedrooms" icon={faBed}>
                            <input
                                type="number"
                                value={bedrooms}
                                onChange={(event) => setBedrooms(event.target.value)}
                                placeholder="2"
                                className={inputClass}
                            />
                        </FieldShell>
                    </div>
                </details>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                    >
                        Apply Filters
                        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-5 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                        Clear Filters
                    </button>
                </div>
            </div>
        </form>
    );
}