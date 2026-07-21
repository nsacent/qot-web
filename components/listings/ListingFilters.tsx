"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CategoryPickerModal,
    LocationPickerModal,
} from "@/components/listings/MarketplacePickerModals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faCheck,
    faFilter,
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

type CategoryFilterField = {
    key: string;
    label: string;
    type: string;
    placeholder: string;
    options: any[];
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

async function clientApiGet(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        credentials: "include",
        cache: "no-store",
    });

    const text = await response.text();

    let data: any = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            data?.error ||
            "Failed to load data"
        );
    }

    return data;
}

function getOptionValue(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);

    return String(item?.slug || item?.id || item?.value || "");
}

function getOptionLabel(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);

    return item?.name || item?.title || item?.label || "Unnamed";
}

const RESERVED_CATEGORY_FILTER_KEYS = new Set([
    "category",
    "region",
    "city",
    "condition",
    "is_negotiable",
    "negotiable",
    "min_price",
    "max_price",
    "price",
]);

function isCategorySpecificFilter(field: CategoryFilterField) {
    return !RESERVED_CATEGORY_FILTER_KEYS.has(field.key);
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

function flattenCategories(categories: any[]): any[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(getCategoryChildren(category)),
    ]);
}

function getParentCategoryValue(categories: any[], selectedCategory: string) {
    if (!selectedCategory) return "";

    const parent = categories.find((category) => {
        if (getOptionValue(category) === String(selectedCategory)) return true;

        return flattenCategories(getCategoryChildren(category)).some(
            (child) => getOptionValue(child) === String(selectedCategory)
        );
    });

    return parent ? getOptionValue(parent) : "";
}

function getCategoryFilterItems(payload: any): any[] {
    if (Array.isArray(payload)) return payload;

    const candidates = [
        payload?.filters,
        payload?.fields,
        payload?.filter_fields,
        payload?.results,
        payload?.data,
        payload?.data?.filters,
        payload?.data?.fields,
        payload?.data?.filter_fields,
        payload?.data?.results,
    ];

    return candidates.find(Array.isArray) || [];
}

function getFilterOptions(field: any): any[] {
    const options =
        field?.options ||
        field?.choices ||
        field?.values ||
        field?.allowed_values ||
        [];

    if (Array.isArray(options)) return options;

    if (typeof options === "string") {
        return options
            .split("|")
            .map((option) => option.trim())
            .filter(Boolean);
    }

    if (options && typeof options === "object") {
        return Object.entries(options).map(([value, label]) => ({ value, label }));
    }

    return [];
}

function normalizeCategoryFilter(field: any, index: number): CategoryFilterField | null {
    if (field?.active === false || field?.is_active === false || field?.filterable === false) {
        return null;
    }

    const key = String(
        field?.slug ||
        field?.key ||
        field?.field_slug ||
        field?.parameter ||
        field?.name ||
        field?.code ||
        ""
    ).trim();

    if (!key) return null;

    return {
        key,
        label: String(
            field?.label ||
            field?.display_name ||
            field?.title ||
            field?.name ||
            `Filter ${index + 1}`
        ),
        type: String(
            field?.input_type || field?.field_type || field?.type || "text"
        ).toLowerCase(),
        placeholder: String(field?.placeholder || ""),
        options: getFilterOptions(field),
    };
}

function cleanCompareValue(value: any) {
    if (value === undefined || value === null || value === "") return "";

    return String(value).trim().toLowerCase();
}

function uniqueCleanValues(values: any[]) {
    return Array.from(new Set(values.map(cleanCompareValue).filter(Boolean)));
}

function getRegionCompareValues(regionItems: any[], selectedRegion: string) {
    if (!selectedRegion) return [];

    const matchedRegion = regionItems.find((item: any) => {
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
    const [categoryParent, setCategoryParent] = useState(() =>
        getParentCategoryValue(
            categories,
            getInitialValue(searchParams, "category")
        )
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
    const initialSort = getInitialValue(searchParams, "sort");
    const [dateSort, setDateSort] = useState(
        initialSort === "newest" ? initialSort : ""
    );
    const [priceSort, setPriceSort] = useState(
        initialSort === "price_low" || initialSort === "price_high"
            ? initialSort
            : ""
    );
    const [isNegotiable, setIsNegotiable] = useState(
        getInitialValue(searchParams, "is_negotiable") === "true"
    );
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilterField[]>([]);
    const [categoryFilterValues, setCategoryFilterValues] = useState<
        Record<string, string>
    >({});
    const [categoryFiltersLoading, setCategoryFiltersLoading] = useState(false);
    const [categoryFiltersError, setCategoryFiltersError] = useState("");

    useEffect(() => {
        setQ(getInitialValue(searchParams, "q"));
        setCategory(getInitialValue(searchParams, "category"));
        setRegion(getInitialValue(searchParams, "region"));
        setCity(getInitialValue(searchParams, "city"));
        setMinPrice(getInitialValue(searchParams, "min_price"));
        setMaxPrice(getInitialValue(searchParams, "max_price"));
        setCondition(getInitialValue(searchParams, "condition"));
        const nextSort = getInitialValue(searchParams, "sort");
        setDateSort(nextSort === "newest" ? nextSort : "");
        setPriceSort(
            nextSort === "price_low" || nextSort === "price_high" ? nextSort : ""
        );
        setIsNegotiable(
            getInitialValue(searchParams, "is_negotiable") === "true"
        );
    }, [searchParams]);

    useEffect(() => {
        setCategoryParent(getParentCategoryValue(categories, category));
    }, [categories, category]);

    useEffect(() => {
        if (!category) {
            setCategoryFilters([]);
            setCategoryFilterValues({});
            setCategoryFiltersLoading(false);
            setCategoryFiltersError("");
            return;
        }

        let isActive = true;

        setCategoryFilters([]);
        setCategoryFiltersLoading(true);
        setCategoryFiltersError("");

        async function loadCategoryFilters() {
            try {
                const payload = await clientApiGet(
                    `/categories/${encodeURIComponent(category)}/filters/`
                );

                if (!isActive) return;

                const normalized = getCategoryFilterItems(payload)
                    .map(normalizeCategoryFilter)
                    .filter((field): field is CategoryFilterField => Boolean(field));
                const restoreUrlValues =
                    getInitialValue(searchParams, "category") === category;

                setCategoryFilters(normalized);
                setCategoryFilterValues(
                    Object.fromEntries(
                        normalized.map((field) => [
                            field.key,
                            restoreUrlValues
                                ? getInitialValue(searchParams, field.key)
                                : "",
                        ])
                    )
                );
            } catch (error) {
                if (isActive) {
                    setCategoryFiltersError(
                        error instanceof Error ? error.message : "Unable to load filters"
                    );
                }
            } finally {
                if (isActive) setCategoryFiltersLoading(false);
            }
        }

        loadCategoryFilters();

        return () => {
            isActive = false;
        };
    }, [category, searchParams]);

    const allCategories = useMemo(() => flattenCategories(categories), [categories]);

    const selectedCategoryLabel = useMemo(() => {
        const found = allCategories.find(
            (item) => getOptionValue(item) === String(category)
        );

        return found ? getOptionLabel(found) : "All categories";
    }, [allCategories, category]);

    const selectedRegionLabel = useMemo(() => {
        const found = regions.find((item) => getOptionValue(item) === String(region));

        return found ? getOptionLabel(found) : "All regions";
    }, [regions, region]);

    const selectedCityLabel = useMemo(() => {
        const found = cities.find((item) => getOptionValue(item) === String(city));

        return found ? getOptionLabel(found) : "All cities";
    }, [cities, city]);

    const categoryGroups = useMemo(() => {
        return buildCategoryGroups(categories, categorySearch);
    }, [categories, categorySearch]);

    const activeCategoryGroup = useMemo(() => {
        const selectedGroup = categoryGroups.find(
            (group: any) =>
                getOptionValue(group.parent) === String(categoryParent)
        );

        if (selectedGroup) return selectedGroup;
        if (categorySearch.trim()) return categoryGroups[0] || null;

        return null;
    }, [categoryGroups, categoryParent, categorySearch]);

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
        dateSort || priceSort,
        isNegotiable ? "true" : "",
        ...categoryFilters
            .filter(isCategorySpecificFilter)
            .map((field) => categoryFilterValues[field.key]),
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
        if (dateSort || priceSort) params.set("sort", priceSort || dateSort);
        if (isNegotiable) params.set("is_negotiable", "true");

        categoryFilters.filter(isCategorySpecificFilter).forEach((field) => {
            const value = categoryFilterValues[field.key];
            if (value !== undefined && String(value).trim()) {
                params.set(field.key, String(value).trim());
            }
        });

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
        setDateSort("");
        setPriceSort("");
        setIsNegotiable(false);
        setCategoryFilterValues({});

        router.push("/listings");
    }

    function selectCategory(value: string) {
        if (value !== category) setCategoryFilterValues({});
        setCategory(value);
        setCategoryParent(getParentCategoryValue(categories, value));
        setCategoryModalOpen(false);
    }

    function selectParentCategory(value: string) {
        if (value !== category) setCategoryFilterValues({});
        setCategory(value);
        setCategoryParent(value);
    }

    function selectRegion(value: string) {
        setRegion(value);
        setCity("");
        setLocationSearch("");
    }

    function selectCity(value: string) {
        setCity(value);
        setLocationModalOpen(false);
    }

    function updateCategoryFilter(key: string, value: string) {
        setCategoryFilterValues((current) => ({ ...current, [key]: value }));
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

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Date" icon={faSliders}>
                            <SelectWrap>
                                <select
                                    value={dateSort}
                                    onChange={(event) => {
                                        setDateSort(event.target.value);
                                        if (event.target.value) setPriceSort("");
                                    }}
                                    className={selectClass}
                                >
                                    <option value="">Default</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </SelectWrap>
                        </Field>

                        <Field label="Price" icon={faMoneyBillWave}>
                            <SelectWrap>
                                <select
                                    value={priceSort}
                                    onChange={(event) => {
                                        setPriceSort(event.target.value);
                                        if (event.target.value) setDateSort("");
                                    }}
                                    className={selectClass}
                                >
                                    <option value="">Default</option>
                                    <option value="price_low">Low to High</option>
                                    <option value="price_high">High to Low</option>
                                </select>
                            </SelectWrap>
                        </Field>
                    </div>

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
                            </select>
                        </SelectWrap>
                    </Field>

                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                        <span>
                            <span className="block text-sm font-black text-slate-800">
                                Negotiable price
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                                Show ads where the seller accepts offers.
                            </span>
                        </span>

                        <input
                            type="checkbox"
                            checked={isNegotiable}
                            onChange={(event) => setIsNegotiable(event.target.checked)}
                            className="h-5 w-5 shrink-0 accent-orange-500"
                        />
                    </label>

                    {category && (
                        <details className="rounded-[22px] bg-slate-50 ring-1 ring-slate-100">
                            <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-700 hover:text-orange-600 [&::-webkit-details-marker]:hidden">
                                <span className="inline-flex items-center gap-2">
                                    <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                                    More filters
                                </span>

                                <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                            </summary>

                            <div className="space-y-4 border-t border-white p-4">
                                {categoryFiltersLoading && (
                                    <div className="rounded-[18px] bg-white px-4 py-3 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                                        Loading category filters...
                                    </div>
                                )}

                                {categoryFiltersError && (
                                    <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold text-red-600 ring-1 ring-red-100">
                                        {categoryFiltersError}
                                    </div>
                                )}

                                {!categoryFiltersLoading &&
                                    !categoryFiltersError &&
                                    categoryFilters
                                        .filter(isCategorySpecificFilter)
                                        .map((field) => {
                                            const value = categoryFilterValues[field.key] || "";
                                            const isBoolean = [
                                                "boolean",
                                                "bool",
                                                "checkbox",
                                                "toggle",
                                            ].includes(field.type);
                                            const isNumber = [
                                                "number",
                                                "integer",
                                                "decimal",
                                                "float",
                                            ].includes(field.type);
                                            const hasOptions = field.options.length > 0;

                                            if (isBoolean) {
                                                return (
                                                    <label
                                                        key={field.key}
                                                        className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3 ring-1 ring-slate-100"
                                                    >
                                                        <span className="text-sm font-black text-slate-800">
                                                            {field.label}
                                                        </span>

                                                        <input
                                                            type="checkbox"
                                                            checked={value === "true"}
                                                            onChange={(event) =>
                                                                updateCategoryFilter(
                                                                    field.key,
                                                                    event.target.checked ? "true" : ""
                                                                )
                                                            }
                                                            className="h-5 w-5 shrink-0 accent-orange-500"
                                                        />
                                                    </label>
                                                );
                                            }

                                            return (
                                                <Field key={field.key} label={field.label} icon={faTag}>
                                                    {hasOptions ? (
                                                        <SelectWrap>
                                                            <select
                                                                value={value}
                                                                onChange={(event) =>
                                                                    updateCategoryFilter(
                                                                        field.key,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className={selectClass}
                                                            >
                                                                <option value="">Any {field.label.toLowerCase()}</option>
                                                                {field.options.map((option, optionIndex) => (
                                                                    <option
                                                                        key={getOptionValue(option) || optionIndex}
                                                                        value={
                                                                            typeof option === "string"
                                                                                ? option
                                                                                : getOptionValue(option)
                                                                        }
                                                                    >
                                                                        {typeof option === "string"
                                                                            ? option
                                                                            : getOptionLabel(option)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </SelectWrap>
                                                    ) : (
                                                        <input
                                                            type={isNumber ? "number" : "text"}
                                                            value={value}
                                                            onChange={(event) =>
                                                                updateCategoryFilter(
                                                                    field.key,
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder={field.placeholder || field.label}
                                                            className={inputClass}
                                                        />
                                                    )}
                                                </Field>
                                            );
                                        })}
                            </div>
                        </details>
                    )}

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

            <CategoryPickerModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                categories={categories}
                valueMode="slug"
                selectedValue={category}
                search={categorySearch}
                setSearch={setCategorySearch}
                onSelect={selectCategory}
                onSelectAll={() => selectCategory("")}
            />

            <LocationPickerModal
                open={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                cities={cities}
                valueMode="slug"
                selectedValue={city}
                selectedRegionValue={region}
                search={locationSearch}
                setSearch={setLocationSearch}
                onSelect={selectCity}
                onSelectRegion={selectRegion}
                onSelectAll={() => {
                    selectRegion("");
                    setCity("");
                }}
            />

            <PickerModal
                open={false}
                title="Choose category"
                subtitle="Select the category that best matches the ads you want to browse."
                icon={faLayerGroup}
                onClose={() => setCategoryModalOpen(false)}
            >
                <div className="mb-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Current selection
                    </p>

                    <p className="mt-2 text-sm font-black text-slate-950">
                        {selectedCategoryLabel}
                    </p>
                </div>

                <div className="mb-5">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="pointer-events-none absolute left-5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            value={categorySearch}
                            onChange={(event) => setCategorySearch(event.target.value)}
                            placeholder="Search category..."
                            className="h-12 w-full rounded-[18px] border-0 bg-slate-50 px-4 pl-12 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-200"
                        />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                            Category
                        </p>

                        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                            <button
                                type="button"
                                onClick={() => selectCategory("")}
                                className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${!category
                                    ? "bg-orange-500 text-white"
                                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                            >
                                All categories
                                {!category && (
                                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                )}
                            </button>

                            {categoryGroups.map((group: any, groupIndex: number) => {
                                const parent = group.parent;
                                const parentValue = getOptionValue(parent);
                                const active =
                                    String(categoryParent) === String(parentValue);

                                return (
                                    <button
                                        key={parentValue || groupIndex}
                                        type="button"
                                        onClick={() => selectParentCategory(parentValue)}
                                        className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${active
                                            ? "bg-orange-500 text-white"
                                            : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                            }`}
                                    >
                                        <span className="truncate">
                                            {getOptionLabel(parent)}
                                        </span>

                                        {active && (
                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                className="h-4 w-4"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                            Subcategory
                        </p>

                        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                            {activeCategoryGroup ? (
                                <>
                                    {(() => {
                                        const parent = activeCategoryGroup.parent;
                                        const parentValue = getOptionValue(parent);
                                        const parentActive =
                                            String(category) === String(parentValue);

                                        return (
                                            <button
                                                type="button"
                                                onClick={() => selectCategory(parentValue)}
                                                className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${parentActive
                                                    ? "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                                                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                                    }`}
                                            >
                                                <span className="truncate">
                                                    All in {getOptionLabel(parent)}
                                                </span>

                                                {parentActive && (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        className="h-4 w-4"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })()}

                                    {(activeCategoryGroup.children || []).map(
                                        (child: any, childIndex: number) => {
                                            const childValue = getOptionValue(child);
                                            const active =
                                                String(category) === String(childValue);

                                            return (
                                                <button
                                                    key={childValue || childIndex}
                                                    type="button"
                                                    onClick={() => selectCategory(childValue)}
                                                    className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-sm font-black transition ${active
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                                        }`}
                                                >
                                                    <span className="truncate">
                                                        {getOptionLabel(child)}
                                                    </span>

                                                    {active && (
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                            className="h-4 w-4"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}

                                    {(activeCategoryGroup.children || []).length === 0 && (
                                        <div className="rounded-[18px] bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                                            This category has no subcategories.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-[18px] bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                                    Select a category to view its subcategories.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                >
                    Done
                </button>
            </PickerModal>

            <PickerModal
                open={false}
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
                                <span>All cities in selected region</span>
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
