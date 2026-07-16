"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBed,
    faChevronDown,
    faCheck,
    faFilter,
    faLaptop,
    faLayerGroup,
    faLocationDot,
    faMagnifyingGlass,
    faMoneyBillWave,
    faRotateLeft,
    faSliders,
    faTag,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type ListingFiltersProps = {
    categories?: any[];
    regions?: any[];
    cities?: any[];
};

type FieldProps = {
    label: string;
    icon: any;
    children: ReactNode;
};

type PickerModalProps = {
    open: boolean;
    title: string;
    subtitle: string;
    icon: any;
    onClose: () => void;
    children: ReactNode;
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

function getCategoryChildren(item: any) {
    const children =
        item?.children ||
        item?.subcategories ||
        item?.sub_categories ||
        item?.child_categories ||
        item?.categories ||
        [];

    return Array.isArray(children) ? children : [];
}

function itemMatchesSearch(item: any, search: string) {
    if (!search.trim()) return true;

    return getOptionLabel(item).toLowerCase().includes(search.trim().toLowerCase());
}

function buildCategoryGroups(categories: any[], search: string) {
    return categories
        .map((parent) => {
            const children = getCategoryChildren(parent);
            const parentMatches = itemMatchesSearch(parent, search);
            const matchingChildren = children.filter((child: any) =>
                itemMatchesSearch(child, search)
            );

            if (!parentMatches && matchingChildren.length === 0) return null;

            return {
                parent,
                children: parentMatches ? children : matchingChildren,
            };
        })
        .filter(Boolean);
}

function cleanCompareValue(value: any) {
    if (value === undefined || value === null || value === "") return "";

    return String(value).trim().toLowerCase();
}

function uniqueCleanValues(values: any[]) {
    return Array.from(new Set(values.map(cleanCompareValue).filter(Boolean)));
}

function getRegionCompareValues(regionItem: any, selectedRegion: string) {
    if (!selectedRegion) return [];

    const matchedRegion = regionItem.find((item: any) => {
        const values = uniqueCleanValues([
            item?.id,
            item?.slug,
            item?.value,
            item?.name,
            item?.title,
        ]);

        return values.includes(cleanCompareValue(selectedRegion));
    });

    return uniqueCleanValues([
        selectedRegion,
        matchedRegion?.id,
        matchedRegion?.slug,
        matchedRegion?.value,
        matchedRegion?.name,
        matchedRegion?.title,
    ]);
}

function getCityRegionCompareValues(city: any) {
    return uniqueCleanValues([
        city?.region,
        city?.region?.id,
        city?.region?.slug,
        city?.region?.value,
        city?.region?.name,
        city?.region?.title,

        city?.region_id,
        city?.region_slug,
        city?.region_name,

        city?.district,
        city?.district?.id,
        city?.district?.slug,
        city?.district?.name,
        city?.district_id,
        city?.district_slug,
        city?.district_name,
    ]);
}

function itemMatchesRegion(city: any, region: string, regions: any[]) {
    if (!region) return true;

    const selectedRegionValues = getRegionCompareValues(regions, region);
    const cityRegionValues = getCityRegionCompareValues(city);

    if (cityRegionValues.length === 0) return true;

    return cityRegionValues.some((value) => selectedRegionValues.includes(value));
}





function Field({ label, icon, children }: FieldProps) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-orange-500" />
                {label}
            </label>

            {children}
        </div>
    );
}

const inputClass =
    "h-11 w-full rounded-[16px] border-0 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200";

const selectClass =
    "h-11 w-full appearance-none rounded-[16px] border-0 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-2 focus:ring-orange-200";

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

function PickerModal({
    open,
    title,
    subtitle,
    icon,
    onClose,
    children,
}: PickerModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            <div className="relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                    <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-950">{title}</h2>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
}

export default function ListingFilters({
    categories = [],
    regions = [],
    cities = [],
}: ListingFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);

    const [categorySearch, setCategorySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

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

    const selectedCategoryLabel = useMemo(() => {
        const found = categories.find(
            (item) => getOptionValue(item) === String(category)
        );

        return found ? getOptionLabel(found) : "All categories";
    }, [categories, category]);

    const selectedRegionLabel = useMemo(() => {
        const found = regions.find((item) => getOptionValue(item) === String(region));

        return found ? getOptionLabel(found) : "All regions";
    }, [regions, region]);

    const selectedCityLabel = useMemo(() => {
        const found = cities.find((item) => getOptionValue(item) === String(city));

        return found ? getOptionLabel(found) : "All cities";
    }, [cities, city]);

    const filteredCategories = useMemo(() => {
        const search = categorySearch.trim().toLowerCase();

        if (!search) return categories;

        return categories.filter((item) =>
            getOptionLabel(item).toLowerCase().includes(search)
        );
    }, [categories, categorySearch]);

    const categoryGroups = useMemo(() => {
        return buildCategoryGroups(categories, categorySearch);
    }, [categories, categorySearch]);

    const filteredCities = useMemo(() => {
        const results = cities.filter((item) => itemMatchesRegion(item, region, regions));

        if (region && results.length === 0) {
            return cities;
        }

        return results;
    }, [cities, region, regions]);

    const searchableCities = useMemo(() => {
        const search = locationSearch.trim().toLowerCase();

        if (!search) return filteredCities;

        return filteredCities.filter((item) =>
            getOptionLabel(item).toLowerCase().includes(search)
        );
    }, [filteredCities, locationSearch]);

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

    function buildParams() {
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

        return params;
    }

    function applyFilters(event?: React.FormEvent<HTMLFormElement>) {
        if (event) event.preventDefault();

        const params = buildParams();
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

    function selectCategory(value: string) {
        setCategory(value);
        setCategoryModalOpen(false);
    }

    function selectRegion(value: string) {
        setRegion(value);

        if (city) {
            const availableCities = cities.filter((item) =>
                itemMatchesRegion(item, value, regions)
            );

            const stillValid =
                availableCities.length === 0 ||
                availableCities.some((item) => getOptionValue(item) === city);
            if (!stillValid) setCity("");
        }
    }

    function selectCity(value: string) {
        setCity(value);
        setLocationModalOpen(false);
    }

    return (
        <>
            <form
                onSubmit={applyFilters}
                className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
            >
                <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    className="h-4 w-4 text-orange-500"
                                />
                                Filters
                            </h2>

                            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                                Refine ads by category, location, price, and details.
                            </p>
                        </div>

                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black uppercase text-orange-600 ring-1 ring-orange-100">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-5 p-5">
                    <Field label="Search" icon={faMagnifyingGlass}>
                        <input
                            value={q}
                            onChange={(event) => setQ(event.target.value)}
                            placeholder="Toyota, iPhone, house..."
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Category" icon={faLayerGroup}>
                        <button
                            type="button"
                            onClick={() => setCategoryModalOpen(true)}
                            className="flex h-11 w-full items-center justify-between rounded-[16px] bg-slate-50 px-4 text-left text-sm font-black text-slate-800 ring-1 ring-slate-100 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <span className="truncate">{selectedCategoryLabel}</span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-3.5 w-3.5 text-slate-400"
                            />
                        </button>
                    </Field>

                    <Field label="Location" icon={faLocationDot}>
                        <button
                            type="button"
                            onClick={() => setLocationModalOpen(true)}
                            className="flex h-11 w-full items-center justify-between rounded-[16px] bg-slate-50 px-4 text-left text-sm font-black text-slate-800 ring-1 ring-slate-100 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <span className="truncate">
                                {city
                                    ? selectedCityLabel
                                    : region
                                        ? selectedRegionLabel
                                        : "All Uganda"}
                            </span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-3.5 w-3.5 text-slate-400"
                            />
                        </button>
                    </Field>

                    <Field label="Sort" icon={faSliders}>
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
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min Price" icon={faMoneyBillWave}>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(event) => setMinPrice(event.target.value)}
                                placeholder="100000"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Max Price" icon={faMoneyBillWave}>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(event) => setMaxPrice(event.target.value)}
                                placeholder="3000000"
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    <details className="rounded-[22px] bg-slate-50 ring-1 ring-slate-100">
                        <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-700 hover:text-orange-600 [&::-webkit-details-marker]:hidden">
                            <span className="inline-flex items-center gap-2">
                                <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                                More filters
                            </span>

                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                        </summary>

                        <div className="space-y-4 border-t border-white p-4">
                            <Field label="Condition" icon={faTag}>
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
                            </Field>

                            <Field label="Brand" icon={faTag}>
                                <input
                                    value={brand}
                                    onChange={(event) => setBrand(event.target.value)}
                                    placeholder="Toyota, Apple, HP..."
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="RAM" icon={faLaptop}>
                                <input
                                    value={ram}
                                    onChange={(event) => setRam(event.target.value)}
                                    placeholder="16GB"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Bedrooms" icon={faBed}>
                                <input
                                    type="number"
                                    value={bedrooms}
                                    onChange={(event) => setBedrooms(event.target.value)}
                                    placeholder="2"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </details>

                    <div className="grid gap-3">
                        <button
                            type="submit"
                            className="inline-flex h-11 items-center justify-center rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                        >
                            Apply Filters
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

            <PickerModal
                open={categoryModalOpen}
                title="Choose category"
                subtitle="Select the category that best matches the ads you want to browse."
                icon={faLayerGroup}
                onClose={() => setCategoryModalOpen(false)}
            >
                <div className="mb-5">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={categorySearch}
                            onChange={(event) => setCategorySearch(event.target.value)}
                            placeholder="Search category..."
                            className="h-12 w-full rounded-[18px] border-0 bg-slate-50 px-4 pl-12 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200"
                        />
                    </div>
                </div>


                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => selectCategory("")}
                        className={`flex h-12 w-full items-center justify-between rounded-[18px] px-4 text-left text-sm font-black transition ${!category
                            ? "bg-orange-500 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                    >
                        All categories
                        {!category && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
                    </button>

                    {categoryGroups.map((group: any, groupIndex: number) => {
                        const parent = group.parent;
                        const children = group.children || [];
                        const parentValue = getOptionValue(parent);
                        const parentActive = String(category) === String(parentValue);

                        return (
                            <div
                                key={parentValue || groupIndex}
                                className="rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100"
                            >
                                <button
                                    type="button"
                                    onClick={() => selectCategory(parentValue)}
                                    className={`flex h-12 w-full items-center justify-between rounded-[18px] px-4 text-left text-sm font-black transition ${parentActive
                                        ? "bg-orange-500 text-white"
                                        : "bg-white text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    <span className="truncate">{getOptionLabel(parent)}</span>

                                    {parentActive ? (
                                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                    ) : (
                                        <span className="text-slate-300">+</span>
                                    )}
                                </button>

                                {children.length > 0 && (
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                        {children.map((child: any, childIndex: number) => {
                                            const childValue = getOptionValue(child);
                                            const childActive = String(category) === String(childValue);

                                            return (
                                                <button
                                                    key={childValue || childIndex}
                                                    type="button"
                                                    onClick={() => selectCategory(childValue)}
                                                    className={`flex h-10 items-center justify-between rounded-[16px] px-3 text-left text-xs font-black transition ${childActive
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                                                        }`}
                                                >
                                                    <span className="truncate">{getOptionLabel(child)}</span>

                                                    {childActive && (
                                                        <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </PickerModal>

            <PickerModal
                open={locationModalOpen}
                title="Choose location"
                subtitle="Select a region first, then choose a city if needed."
                icon={faLocationDot}
                onClose={() => setLocationModalOpen(false)}
            >
                <div className="mb-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Current selection
                    </p>

                    <p className="mt-2 text-sm font-black text-slate-950">
                        {city
                            ? `${selectedCityLabel}, ${selectedRegionLabel}`
                            : region
                                ? selectedRegionLabel
                                : "All Uganda"}
                    </p>
                </div>

                <div className="mb-5">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="pointer-events-none absolute left-5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />

                        <input
                            value={locationSearch}
                            onChange={(event) => setLocationSearch(event.target.value)}
                            placeholder="Search city..."
                            className="h-12 w-full rounded-[18px] border-0 bg-slate-50 px-4 pl-12 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200"
                        />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                            Region
                        </p>

                        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                            <button
                                type="button"
                                onClick={() => {
                                    selectRegion("");
                                    setCity("");
                                }}
                                className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${!region
                                    ? "bg-orange-500 text-white"
                                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                            >
                                All regions
                                {!region && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
                            </button>

                            {regions.map((item: any, index: number) => {
                                const value = getOptionValue(item);
                                const active = String(region) === String(value);

                                return (
                                    <button
                                        key={value || index}
                                        type="button"
                                        onClick={() => selectRegion(value)}
                                        className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${active
                                            ? "bg-orange-500 text-white"
                                            : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                            }`}
                                    >
                                        <span className="truncate">{getOptionLabel(item)}</span>
                                        {active && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                            City
                        </p>

                        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                            <button
                                type="button"
                                onClick={() => selectCity("")}
                                className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${!city
                                    ? "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                            >
                                All cities
                                {!city && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
                            </button>

                            {searchableCities.map((item: any, index: number) => {
                                const value = getOptionValue(item);
                                const active = String(city) === String(value);

                                return (
                                    <button
                                        key={value || index}
                                        type="button"
                                        onClick={() => selectCity(value)}
                                        className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${active
                                            ? "bg-orange-500 text-white"
                                            : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                            }`}
                                    >
                                        <span className="truncate">{getOptionLabel(item)}</span>
                                        {active && <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setLocationModalOpen(false)}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                >
                    Done
                </button>
            </PickerModal>
        </>
    );
}