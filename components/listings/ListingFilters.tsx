"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faChevronDown,
    faClock,
    faFilter,
    faLayerGroup,
    faLocationDot,
    faMoneyBillWave,
    faRotateLeft,
    faSliders,
    faTag,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
    CategoryPickerModal,
    LocationPickerModal,
} from "@/components/listings/MarketplacePickerModals";

type CategoryField = {
    key: string;
    label: string;
    type: string;
    options: Array<{ value: string; label: string }>;
};

type Facets = {
    total_count?: number;
    price_presets?: Array<{
        label: string;
        min_price: number | null;
        max_price: number | null;
        count: number;
    }>;
    condition_counts?: Record<string, number>;
    cities?: Array<{
        city_id: number;
        city__slug: string;
        count: number;
    }>;
    filters?: Record<string, { options?: Array<{ value: string; label: string; count: number }> }>;
};

type Props = {
    categories?: any[];
    regions?: any[];
    cities?: any[];
    variant?: "desktop" | "mobile";
    resultCount?: number;
    onClose?: () => void;
    initialCategoryFilters?: any[];
    initialFacets?: Facets;
};

const CORE_KEYS = [
    "category", "region", "city", "min_price", "max_price", "condition",
    "is_negotiable", "verified_seller", "posted_within",
];
const MULTI_FIELDS = new Set(["brand", "make", "model", "property_type", "item_type"]);
const MIN_ONLY_FIELDS = new Set(["bedrooms", "bathrooms"]);
const MAX_ONLY_FIELDS = new Set(["mileage", "age"]);

function apiGet(path: string) {
    return fetch(`/api/proxy${path}`, { credentials: "include", cache: "no-store" })
        .then(async (response) => {
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.detail || "Unable to load filters");
            return data;
        });
}

function valueOf(item: any) {
    return String(item?.slug || item?.id || item?.value || "");
}

function labelOf(item: any) {
    return String(item?.name || item?.label || item?.title || item?.value || "Unnamed");
}

function childrenOf(item: any): any[] {
    return item?.children || item?.subcategories || item?.sub_categories || [];
}

function flattenCategories(categories: any[]): any[] {
    return categories.flatMap((category) => [category, ...flattenCategories(childrenOf(category))]);
}

function normalizeField(field: any): CategoryField | null {
    if (field?.is_searchable === false || field?.is_active === false) return null;
    const key = String(field?.key || field?.slug || field?.name || "").trim();
    if (!key || CORE_KEYS.includes(key)) return null;
    const rawOptions = Array.isArray(field?.options) ? field.options : [];
    return {
        key,
        label: String(field?.label || field?.display_name || field?.name || key),
        type: String(field?.filter_type || field?.input_type || field?.type || "text").toLowerCase(),
        options: rawOptions.map((option: any) => ({
            value: typeof option === "string" ? option : String(option?.value || option?.slug || option?.id || ""),
            label: typeof option === "string" ? option : String(option?.label || option?.name || option?.value || ""),
        })).filter((option: any) => option.value),
    };
}

function getFields(payload: any): CategoryField[] {
    const items = Array.isArray(payload) ? payload : payload?.results || payload?.filters || [];
    return items.map(normalizeField).filter(Boolean) as CategoryField[];
}

function digits(value: string) {
    return value.replace(/[^0-9]/g, "");
}

function formatMoneyInput(value: string) {
    const clean = digits(value);
    return clean ? Number(clean).toLocaleString("en-UG") : "";
}

function split(value: string) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toggleCsv(current: string, value: string) {
    const values = split(current);
    return values.includes(value)
        ? values.filter((item) => item !== value).join(",")
        : [...values, value].join(",");
}

const inputClass = "h-11 w-full rounded-2xl border-0 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-300";

function Field({ label, icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-orange-500" />
                {label}
            </label>
            {children}
        </div>
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
    return (
        <div className="relative">
            <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
                {children}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

export default function ListingFilters({
    categories = [],
    regions = [],
    cities = [],
    variant = "desktop",
    resultCount = 0,
    onClose,
    initialCategoryFilters = [],
    initialFacets = {},
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromUrl = (key: string) => searchParams.get(key) || "";
    const [category, setCategory] = useState(fromUrl("category"));
    const [region, setRegion] = useState(fromUrl("region"));
    const [city, setCity] = useState(fromUrl("city"));
    const [minPrice, setMinPrice] = useState(fromUrl("min_price"));
    const [maxPrice, setMaxPrice] = useState(fromUrl("max_price"));
    const [condition, setCondition] = useState(fromUrl("condition"));
    const [negotiable, setNegotiable] = useState(fromUrl("is_negotiable") === "true");
    const [verified, setVerified] = useState(fromUrl("verified_seller") === "true");
    const [postedWithin, setPostedWithin] = useState(fromUrl("posted_within"));
    const initialFields = useMemo(() => getFields(initialCategoryFilters), [initialCategoryFilters]);
    const [fields, setFields] = useState<CategoryField[]>(initialFields);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
        const values: Record<string, string> = {};
        initialFields.forEach((field) => {
            if (field.type === "number") {
                values[`${field.key}_min`] = fromUrl(`${field.key}_min`);
                values[`${field.key}_max`] = fromUrl(`${field.key}_max`);
            } else values[field.key] = fromUrl(field.key);
        });
        return values;
    });
    const [loadingFields, setLoadingFields] = useState(false);
    const [facets, setFacets] = useState<Facets>({ total_count: resultCount, ...initialFacets });
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

    const allCategories = useMemo(() => flattenCategories(categories), [categories]);
    const selectedCategory = allCategories.find((item) => valueOf(item) === category);
    const selectedCities = split(city);
    const cityLabel = selectedCities.length > 1
        ? `${selectedCities.length} cities selected`
        : cities.find((item) => valueOf(item) === selectedCities[0])
            ? labelOf(cities.find((item) => valueOf(item) === selectedCities[0]))
            : region
                ? labelOf(regions.find((item) => valueOf(item) === region) || { name: region })
                : "All Uganda";

    useEffect(() => {
        if (!category) {
            setFields([]);
            setFieldValues({});
            return;
        }
        if (category === fromUrl("category") && initialFields.length) {
            setFields(initialFields);
            const values: Record<string, string> = {};
            initialFields.forEach((field) => {
                if (field.type === "number") {
                    values[`${field.key}_min`] = fromUrl(`${field.key}_min`);
                    values[`${field.key}_max`] = fromUrl(`${field.key}_max`);
                } else values[field.key] = fromUrl(field.key);
            });
            setFieldValues(values);
            setLoadingFields(false);
            return;
        }
        let active = true;
        setLoadingFields(true);
        apiGet(`/categories/${encodeURIComponent(category)}/filters`)
            .then((payload) => {
                if (!active) return;
                const nextFields = getFields(payload);
                setFields(nextFields);
                const values: Record<string, string> = {};
                nextFields.forEach((field) => {
                    if (field.type === "number") {
                        values[`${field.key}_min`] = fromUrl(`${field.key}_min`);
                        values[`${field.key}_max`] = fromUrl(`${field.key}_max`);
                    } else {
                        values[field.key] = fromUrl(field.key);
                    }
                });
                setFieldValues(values);
            })
            .finally(() => active && setLoadingFields(false));
        return () => { active = false; };
        // searchParams is intentionally read only when a category is loaded.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, initialFields]);

    function buildParams() {
        const params = new URLSearchParams();
        ["q", "search", "sort", "status", "seller"].forEach((key) => {
            const value = searchParams.get(key);
            if (value) params.set(key, value);
        });
        const setOrDelete = (key: string, value: string) => value ? params.set(key, value) : params.delete(key);
        setOrDelete("category", category);
        setOrDelete("region", region);
        setOrDelete("city", city);
        setOrDelete("min_price", digits(minPrice));
        setOrDelete("max_price", digits(maxPrice));
        setOrDelete("condition", condition);
        setOrDelete("is_negotiable", negotiable ? "true" : "");
        setOrDelete("verified_seller", verified ? "true" : "");
        setOrDelete("posted_within", postedWithin);
        fields.forEach((field) => {
            const keys = field.type === "number" ? [`${field.key}_min`, `${field.key}_max`] : [field.key];
            keys.forEach((key) => setOrDelete(key, fieldValues[key] || ""));
        });
        return params;
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const params = buildParams();
            params.delete("sort");
            params.delete("page");
            apiGet(`/listings/facets?${params.toString()}`)
                .then(setFacets)
                .catch(() => setFacets((current) => ({ ...current, total_count: resultCount })));
        }, 300);
        return () => window.clearTimeout(timer);
        // buildParams deliberately tracks the draft controls below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, region, city, minPrice, maxPrice, condition, negotiable, verified, postedWithin, fieldValues, fields]);

    function apply(event?: React.FormEvent) {
        event?.preventDefault();
        const params = buildParams();
        router.push(params.toString() ? `/ads?${params.toString()}` : "/ads");
        onClose?.();
    }

    function clear() {
        setCategory("");
        setRegion("");
        setCity("");
        setMinPrice("");
        setMaxPrice("");
        setCondition("");
        setNegotiable(false);
        setVerified(false);
        setPostedWithin("");
        setFields([]);
        setFieldValues({});
        const params = new URLSearchParams(searchParams.toString());
        [...CORE_KEYS, "page"].forEach((key) => params.delete(key));
        searchParams.forEach((_, key) => {
            if (!["q", "search", "sort", "status", "seller"].includes(key)) params.delete(key);
        });
        router.push(params.toString() ? `/ads?${params.toString()}` : "/ads");
        onClose?.();
    }

    const activeCount = [
        category, region, city, minPrice, maxPrice, condition,
        negotiable ? "yes" : "", verified ? "yes" : "", postedWithin,
        ...Object.values(fieldValues),
    ].filter(Boolean).length;
    const categoryName = selectedCategory ? labelOf(selectedCategory) : "Category";
    const citiesWithCounts = cities.map((item) => {
        const match = facets.cities?.find((count) => count.city__slug === item.slug || count.city_id === item.id);
        return { ...item, listings_count: match?.count };
    });

    function fieldOptions(field: CategoryField) {
        const facetOptions = facets.filters?.[field.key]?.options;
        return facetOptions?.length ? facetOptions : field.options.map((item) => ({ ...item, count: -1 }));
    }

    function updateField(key: string, value: string) {
        setFieldValues((current) => ({ ...current, [key]: value }));
    }

    return (
        <>
            <form
                onSubmit={apply}
                className={variant === "mobile"
                    ? "flex h-full flex-col bg-white"
                    : "flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5"}
            >
                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                            <FontAwesomeIcon icon={faFilter} className="h-4 w-4 text-orange-500" />
                            Filters
                            {activeCount > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700">{activeCount}</span>}
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Choose only what matters to you.</p>
                    </div>
                    {variant === "mobile" && (
                        <button type="button" onClick={onClose} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        </button>
                    )}
                </header>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 overscroll-contain">
                    <Field label="Category" icon={faLayerGroup}>
                        <button type="button" onClick={() => setCategoryOpen(true)} className={`${inputClass} flex items-center justify-between text-left`}>
                            <span className="truncate">{selectedCategory ? labelOf(selectedCategory) : "All categories"}</span>
                            <span className="flex items-center gap-2 text-xs text-slate-400">
                                {selectedCategory?.listings_count !== undefined && `${selectedCategory.listings_count}`}
                                <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                            </span>
                        </button>
                    </Field>

                    <Field label="Location" icon={faLocationDot}>
                        <button type="button" onClick={() => setLocationOpen(true)} className={`${inputClass} flex items-center justify-between text-left`}>
                            <span className="truncate">{cityLabel}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-slate-400" />
                        </button>
                    </Field>

                    <Field label="Price range" icon={faMoneyBillWave}>
                        {!!facets.price_presets?.length && (
                            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                                {facets.price_presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => {
                                            setMinPrice(preset.min_price ? String(preset.min_price) : "");
                                            setMaxPrice(preset.max_price ? String(preset.max_price) : "");
                                        }}
                                        className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-[10px] font-black text-orange-700 ring-1 ring-orange-100"
                                    >
                                        {preset.label} · {preset.count}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">UGX</span>
                                <input inputMode="numeric" value={formatMoneyInput(minPrice)} onChange={(event) => setMinPrice(digits(event.target.value))} placeholder="Minimum" className={`${inputClass} pl-12`} />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">UGX</span>
                                <input inputMode="numeric" value={formatMoneyInput(maxPrice)} onChange={(event) => setMaxPrice(digits(event.target.value))} placeholder="Maximum" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                    </Field>

                    <Field label="Condition" icon={faTag}>
                        <div className="grid grid-cols-2 gap-2">
                            {[{ value: "new", label: "Brand new" }, { value: "used", label: "Used" }].map((item) => {
                                const selected = split(condition).includes(item.value);
                                const count = facets.condition_counts?.[item.value];
                                return (
                                    <button key={item.value} type="button" onClick={() => setCondition(toggleCsv(condition, item.value))} className={`h-11 rounded-2xl px-3 text-xs font-black ring-1 ${selected ? "bg-orange-500 text-white ring-orange-500" : "bg-slate-50 text-slate-700 ring-slate-200"}`}>
                                        {item.label}{count !== undefined ? ` · ${count}` : ""}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>

                    <Field label="Posted within" icon={faClock}>
                        <Select value={postedWithin} onChange={setPostedWithin}>
                            <option value="">Any time</option>
                            <option value="1">Today</option>
                            <option value="3">Last 3 days</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                        </Select>
                    </Field>

                    <div className="grid gap-2">
                        {[
                            { label: "Negotiable price", value: negotiable, set: setNegotiable, icon: faMoneyBillWave },
                            { label: "Verified sellers only", value: verified, set: setVerified, icon: faCircleCheck },
                        ].map((item) => (
                            <label key={item.label} className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4 text-orange-500" />{item.label}
                                </span>
                                <input type="checkbox" checked={item.value} onChange={(event) => item.set(event.target.checked)} className="h-5 w-5 accent-orange-500" />
                            </label>
                        ))}
                    </div>

                    {category && (
                        <details open className="rounded-[22px] bg-slate-50 ring-1 ring-slate-200">
                            <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-800 [&::-webkit-details-marker]:hidden">
                                <span className="flex items-center gap-2"><FontAwesomeIcon icon={faSliders} className="h-4 w-4 text-orange-500" />{categoryName} details</span>
                                <FontAwesomeIcon icon={faChevronDown} className="h-3.5 w-3 text-slate-400" />
                            </summary>
                            <div className="space-y-5 border-t border-white p-4">
                                {loadingFields && <p className="text-xs font-bold text-slate-500">Loading useful details…</p>}
                                {!loadingFields && fields.length === 0 && <p className="text-xs font-bold text-slate-500">No extra filters are needed for this category.</p>}
                                {fields.map((field) => {
                                    const isNumber = field.type === "number";
                                    const isBoolean = field.type === "boolean";
                                    const options = fieldOptions(field);
                                    const current = fieldValues[field.key] || "";
                                    if (isBoolean) {
                                        return (
                                            <label key={field.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                                <span className="text-sm font-black text-slate-800">{field.label}</span>
                                                <input type="checkbox" checked={current === "true"} onChange={(event) => updateField(field.key, event.target.checked ? "true" : "")} className="h-5 w-5 accent-orange-500" />
                                            </label>
                                        );
                                    }
                                    if (isNumber) {
                                        const minKey = `${field.key}_min`;
                                        const maxKey = `${field.key}_max`;
                                        const showMin = !MAX_ONLY_FIELDS.has(field.key);
                                        const showMax = !MIN_ONLY_FIELDS.has(field.key);
                                        return (
                                            <Field key={field.key} label={field.label} icon={faTag}>
                                                <div className={`grid gap-2 ${showMin && showMax ? "grid-cols-2" : "grid-cols-1"}`}>
                                                    {showMin && <input type="number" value={fieldValues[minKey] || ""} onChange={(event) => updateField(minKey, event.target.value)} placeholder={MIN_ONLY_FIELDS.has(field.key) ? `${field.label} or more` : "Minimum"} className={inputClass} />}
                                                    {showMax && <input type="number" value={fieldValues[maxKey] || ""} onChange={(event) => updateField(maxKey, event.target.value)} placeholder={MAX_ONLY_FIELDS.has(field.key) ? `Maximum ${field.label.toLowerCase()}` : "Maximum"} className={inputClass} />}
                                                </div>
                                            </Field>
                                        );
                                    }
                                    if (MULTI_FIELDS.has(field.key) && options.length) {
                                        const selected = split(current);
                                        const hasInventoryValues = options.some((option) => option.count > 0);
                                        const visible = hasInventoryValues
                                            ? options.filter((option) => option.count !== 0 || selected.includes(option.value))
                                            : options;
                                        return (
                                            <Field key={field.key} label={field.label} icon={faTag}>
                                                <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
                                                    {visible.map((option) => (
                                                        <label key={option.value} className="flex cursor-pointer items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
                                                            <span className="text-xs font-bold text-slate-700">{option.label}</span>
                                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                                                {option.count >= 0 ? option.count : ""}
                                                                <input type="checkbox" checked={selected.includes(option.value)} onChange={() => updateField(field.key, toggleCsv(current, option.value))} className="h-4 w-4 accent-orange-500" />
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </Field>
                                        );
                                    }
                                    return (
                                        <Field key={field.key} label={field.label} icon={faTag}>
                                            {options.length ? (
                                                <Select value={current} onChange={(value) => updateField(field.key, value)}>
                                                    <option value="">Any {field.label.toLowerCase()}</option>
                                                    {(options.some((option) => option.count > 0)
                                                        ? options.filter((option) => option.count !== 0 || option.value === current)
                                                        : options
                                                    ).map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}{option.count >= 0 ? ` (${option.count})` : ""}</option>
                                                    ))}
                                                </Select>
                                            ) : (
                                                <input value={current} onChange={(event) => updateField(field.key, event.target.value)} placeholder={`Any ${field.label.toLowerCase()}`} className={inputClass} />
                                            )}
                                        </Field>
                                    );
                                })}
                            </div>
                        </details>
                    )}
                </div>

                <footer className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <button type="button" onClick={clear} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-xs font-black text-slate-700 hover:bg-slate-200">
                        <FontAwesomeIcon icon={faRotateLeft} className="h-3.5 w-3.5" />Clear all
                    </button>
                    <button type="submit" className="h-12 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-600">
                        {variant === "mobile" ? `Show ${(facets.total_count ?? resultCount).toLocaleString()} ads` : "Apply filters"}
                    </button>
                </footer>
            </form>

            <CategoryPickerModal
                open={categoryOpen}
                onClose={() => setCategoryOpen(false)}
                categories={categories}
                valueMode="slug"
                selectedValue={category}
                search={categorySearch}
                setSearch={setCategorySearch}
                onSelect={(value) => { setCategory(value); setFieldValues({}); }}
                onSelectAll={() => { setCategory(""); setFieldValues({}); }}
            />
            <LocationPickerModal
                open={locationOpen}
                onClose={() => setLocationOpen(false)}
                cities={citiesWithCounts}
                valueMode="slug"
                selectedValue={city}
                selectedRegionValue={region}
                search={locationSearch}
                setSearch={setLocationSearch}
                multiple
                onSelect={(value) => { setRegion(""); setCity(toggleCsv(city, value)); }}
                onSelectRegion={(value) => { setRegion(value); setCity(""); }}
                onSelectAll={() => { setRegion(""); setCity(""); }}
            />
        </>
    );
}
