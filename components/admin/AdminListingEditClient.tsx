"use client";

import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowRight,
    faCircleCheck,
    faEye,
    faFloppyDisk,
    faLocationDot,
    faPenToSquare,
    faShieldHalved,
    faStore,
    faTag,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPatch } from "@/lib/apiClient";
import {
    CategoryPickerModal,
    LocationPickerModal,
} from "@/components/listings/MarketplacePickerModals";
import { fetchAllProxyPages } from "@/lib/marketplaceCatalog";
import { normalizeCategoryFilterValue } from "@/lib/categoryFilterValues";
import {
    AdminErrorState,
    AdminLoadingState,
} from "@/components/admin/AdminUi";
import InlineError from "@/components/forms/InlineError";

type ListingAttribute = {
    id: number;
    category_filter_id: number;
    filter_name: string;
    filter_key: string;
    filter_type: string;
    value_text: string | null;
    value_number: string | number | null;
    value_boolean: boolean | null;
};

type AdminListing = {
    id: number;
    title: string;
    seller: number;
    seller_name: string;
    status: string;
    category: number;
    category_name: string;
    city: number;
    city_name: string;
    description: string;
    price: string | number;
    currency: string;
    condition: string;
    is_negotiable: boolean;
    attributes: ListingAttribute[];
};

type Category = {
    id: number;
    name: string;
    slug: string;
    parentName?: string;
    children?: Category[];
};

type City = {
    id: number;
    name: string;
    region_name?: string;
};

type FilterOption = {
    id: string;
    label: string;
    value: string;
};

type CategoryFilter = {
    id: number;
    name: string;
    key: string;
    filter_type: string;
    is_required: boolean;
    options: FilterOption[];
};

type ListingForm = {
    title: string;
    description: string;
    price: string;
    currency: string;
    category: string;
    city: string;
    condition: string;
    isNegotiable: boolean;
};

const emptyForm: ListingForm = {
    title: "",
    description: "",
    price: "",
    currency: "UGX",
    category: "",
    city: "",
    condition: "used",
    isNegotiable: false,
};

const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50";

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : null;
}

function getArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];

    for (const key of ["results", "data", "categories", "cities", "filters"]) {
        if (Array.isArray(record[key])) return record[key] as unknown[];
    }

    return [];
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

function formatLabel(value: string) {
    return String(value || "unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeCategory(value: unknown, parentName?: string): Category | null {
    const record = asRecord(value);
    if (!record) return null;

    const id = Number(record.id);
    const name = String(record.name || "");
    const slug = String(record.slug || "");
    if (!id || !name || !slug) return null;

    const children = getArray(record.children)
        .map((child) => normalizeCategory(child, name))
        .filter((child): child is Category => Boolean(child));

    return { id, name, slug, parentName, children };
}

function flattenCategories(categories: Category[]): Category[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(category.children || []),
    ]);
}

function normalizeCity(value: unknown): City | null {
    const record = asRecord(value);
    if (!record) return null;
    const id = Number(record.id);
    const name = String(record.name || "");
    if (!id || !name) return null;

    return {
        id,
        name,
        region_name: record.region_name ? String(record.region_name) : undefined,
    };
}

function normalizeFilter(value: unknown): CategoryFilter | null {
    const record = asRecord(value);
    if (!record) return null;
    const id = Number(record.id);
    const name = String(record.name || "");
    const key = String(record.key || "");
    if (!id || !name || !key) return null;

    const options = getArray(record.options)
        .map((option) => {
            const optionRecord = asRecord(option);
            if (!optionRecord) return null;
            const label = String(optionRecord.label || "");
            const optionValue = String(optionRecord.value || "");
            const id = String(optionRecord.id || "");
            return label && optionValue ? { id, label, value: optionValue } : null;
        })
        .filter((option): option is FilterOption => Boolean(option));

    return {
        id,
        name,
        key,
        filter_type: String(record.filter_type || "text"),
        is_required: Boolean(record.is_required),
        options,
    };
}

function attributeFormValues(attributes: ListingAttribute[]) {
    return Object.fromEntries(
        attributes.map((attribute) => {
            let value = attribute.value_text || "";

            if (attribute.value_number !== null && attribute.value_number !== undefined) {
                value = String(attribute.value_number);
            } else if (
                attribute.value_boolean !== null &&
                attribute.value_boolean !== undefined
            ) {
                value = String(attribute.value_boolean);
            }

            return [String(attribute.category_filter_id), value];
        })
    );
}

function formFromListing(listing: AdminListing): ListingForm {
    return {
        title: listing.title || "",
        description: listing.description || "",
        price: String(listing.price || ""),
        currency: listing.currency || "UGX",
        category: String(listing.category || ""),
        city: String(listing.city || ""),
        condition: listing.condition || "used",
        isNegotiable: Boolean(listing.is_negotiable),
    };
}

export default function AdminListingEditClient({
    listingId,
}: {
    listingId: string;
}) {
    const [listing, setListing] = useState<AdminListing | null>(null);
    const [form, setForm] = useState<ListingForm>(emptyForm);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filters, setFilters] = useState<CategoryFilter[]>([]);
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [coreError, setCoreError] = useState("");
    const [marketplaceError, setMarketplaceError] = useState("");
    const [specificationsError, setSpecificationsError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [message, setMessage] = useState("");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");
    const coreSectionRef = useRef<HTMLElement>(null);
    const marketplaceSectionRef = useRef<HTMLElement>(null);
    const specificationsSectionRef = useRef<HTMLElement>(null);

    const flatCategories = useMemo(
        () => flattenCategories(categories),
        [categories]
    );
    const selectedCategory = useMemo(
        () => flatCategories.find((category) => String(category.id) === form.category),
        [flatCategories, form.category]
    );
    const selectedCity = useMemo(
        () => cities.find((city) => String(city.id) === form.city),
        [cities, form.city]
    );

    function revealSection(sectionRef: { readonly current: HTMLElement | null }) {
        window.requestAnimationFrame(() => {
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    async function loadFilters(
        categoryId: string,
        availableCategories: Category[],
        attributes: ListingAttribute[] = []
    ) {
        const category = availableCategories.find(
            (item) => String(item.id) === String(categoryId)
        );

        if (!category) {
            setFilters([]);
            setFilterValues({});
            return;
        }

        setFiltersLoading(true);

        try {
            const data = await apiGet<unknown>(
                `/categories/${encodeURIComponent(category.slug)}/filters/`
            );
            const normalizedFilters = getArray(data)
                .map(normalizeFilter)
                .filter((filter): filter is CategoryFilter => Boolean(filter));
            const existingValues = attributeFormValues(attributes);

            setFilters(normalizedFilters);
            setFilterValues(
                Object.fromEntries(
                    normalizedFilters.map((filter) => [
                        String(filter.id),
                        normalizeCategoryFilterValue(
                            filter.options,
                            existingValues[String(filter.id)]
                        ),
                    ])
                )
            );
        } catch (requestError: unknown) {
            setSpecificationsError(
                errorMessage(requestError, "Failed to load category specifications.")
            );
            setFilters([]);
            setFilterValues({});
        } finally {
            setFiltersLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            apiGet<AdminListing>(`/admin-panel/listings/${listingId}/`),
            apiGet<unknown>("/categories/"),
            fetchAllProxyPages("/locations/cities/?page_size=50"),
        ])
            .then(async ([listingData, categoryData, cityData]) => {
                if (cancelled) return;

                const normalizedCategories = getArray(categoryData)
                    .map((category) => normalizeCategory(category))
                    .filter((category): category is Category => Boolean(category));
                const flattened = flattenCategories(normalizedCategories);
                const normalizedCities = getArray(cityData)
                    .map(normalizeCity)
                    .filter((city): city is City => Boolean(city));

                setListing(listingData);
                setForm(formFromListing(listingData));
                setCategories(normalizedCategories);
                setCities(normalizedCities);
                await loadFilters(
                    String(listingData.category),
                    flattened,
                    listingData.attributes || []
                );
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setError(errorMessage(requestError, "Failed to load the ad editor."));
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [listingId]);

    function updateForm<Key extends keyof ListingForm>(
        key: Key,
        value: ListingForm[Key]
    ) {
        setForm((current) => ({ ...current, [key]: value }));
        setCoreError("");
        setMarketplaceError("");
        setSaveError("");
        setMessage("");
    }

    async function changeCategory(categoryId: string) {
        updateForm("category", categoryId);
        await loadFilters(categoryId, flatCategories);
    }

    function buildAttributes() {
        return filters
            .map((filter) => {
                const value = String(filterValues[String(filter.id)] || "").trim();
                if (!value) return null;

                if (filter.filter_type === "boolean") {
                    return {
                        category_filter_id: filter.id,
                        value_boolean: value === "true",
                    };
                }

                if (filter.filter_type === "number") {
                    return {
                        category_filter_id: filter.id,
                        value_number: value,
                    };
                }

                return {
                    category_filter_id: filter.id,
                    value_text: value,
                };
            })
            .filter((attribute) => attribute !== null);
    }

    function validateForm() {
        if (!form.title.trim()) return "Enter an ad title.";
        if (!form.description.trim()) return "Enter an ad description.";
        if (!form.category) return "Select a category.";
        if (!form.city) return "Select a city.";
        if (!form.condition) return "Select the item condition.";
        if (!form.price || Number(form.price) <= 0) {
            return "Enter a price greater than zero.";
        }

        const missingFilter = filters.find(
            (filter) =>
                filter.is_required &&
                !String(filterValues[String(filter.id)] || "").trim()
        );

        if (missingFilter) return `${missingFilter.name} is required.`;
        return "";
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationError = validateForm();

        if (validationError) {
            setCoreError("");
            setMarketplaceError("");
            setSpecificationsError("");
            setSaveError("");

            if (!form.title.trim() || !form.description.trim()) {
                setCoreError(validationError);
                revealSection(coreSectionRef);
            } else if (
                !form.category ||
                !form.city ||
                !form.condition ||
                !form.price ||
                Number(form.price) <= 0
            ) {
                setMarketplaceError(validationError);
                revealSection(marketplaceSectionRef);
            } else {
                setSpecificationsError(validationError);
                revealSection(specificationsSectionRef);
            }
            return;
        }

        setSaving(true);
        setCoreError("");
        setMarketplaceError("");
        setSpecificationsError("");
        setSaveError("");
        setMessage("");

        try {
            const updated = await apiPatch<AdminListing>(
                `/admin-panel/listings/${listingId}/`,
                {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    price: form.price,
                    currency: form.currency.trim().toUpperCase() || "UGX",
                    category: Number(form.category),
                    city: Number(form.city),
                    condition: form.condition,
                    is_negotiable: form.isNegotiable,
                    attributes: buildAttributes(),
                }
            );

            setListing(updated);
            setForm(formFromListing(updated));
            setMessage("Ad details updated successfully.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (requestError: unknown) {
            setSaveError(errorMessage(requestError, "Failed to update this ad."));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <AdminLoadingState label="Loading ad editor" />;
    }

    if (error && !listing) {
        return <AdminErrorState message={error} />;
    }

    if (!listing) {
        return <AdminErrorState message="This ad could not be found." />;
    }

    if (listing.status === "deleted") {
        return (
            <AdminErrorState message="Deleted ads cannot be edited. Return to the ad detail page to review its moderation history." />
        );
    }

    return (
        <section>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <Link
                        href={`/admin/ads/${listing.id}`}
                        className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                        Back to ad review
                    </Link>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                        Admin content editor
                    </p>
                    <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                        Edit listing #{listing.id}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                        Correct the seller’s ad content while preserving its current moderation status.
                    </p>
                </div>

                <Link
                    href={`/ads/${listing.id}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-orange-600"
                >
                    <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                    Public view
                </Link>
            </div>

            {message && (
                <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />
                    {message}
                </div>
            )}

            {error && (
                <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.65fr)]"
            >
                <div className="space-y-6">
                    <FormSection
                        sectionRef={coreSectionRef}
                        eyebrow="Core content"
                        title="Basic ad details"
                        icon={faPenToSquare}
                    >
                        {coreError && (
                            <InlineError message={coreError} onDismiss={() => setCoreError("")} />
                        )}

                        <label className="block">
                            <FieldLabel label="Ad title" required />
                            <input
                                value={form.title}
                                onChange={(event) => updateForm("title", event.target.value)}
                                maxLength={180}
                                required
                                className={inputClass}
                            />
                            <p className="mt-2 text-right text-[10px] font-bold text-slate-400">
                                {form.title.length}/180
                            </p>
                        </label>

                        <label className="block">
                            <FieldLabel label="Description" required />
                            <textarea
                                value={form.description}
                                onChange={(event) => updateForm("description", event.target.value)}
                                rows={9}
                                required
                                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                            />
                        </label>
                    </FormSection>

                    <FormSection
                        sectionRef={marketplaceSectionRef}
                        eyebrow="Marketplace data"
                        title="Category, location and price"
                        icon={faLocationDot}
                    >
                        {marketplaceError && (
                            <InlineError message={marketplaceError} onDismiss={() => setMarketplaceError("")} />
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel label="Category" required />
                                <button
                                    type="button"
                                    onClick={() => setCategoryModalOpen(true)}
                                    className="group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-50"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                            <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-black text-slate-900">
                                                {selectedCategory?.name || "Choose category"}
                                            </span>
                                            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                                                {selectedCategory?.parentName || "Browse marketplace departments"}
                                            </span>
                                        </span>
                                    </span>
                                    <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                                </button>
                            </div>

                            <div>
                                <FieldLabel label="Region and city" required />
                                <button
                                    type="button"
                                    onClick={() => setLocationModalOpen(true)}
                                    className="group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-50"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-black text-slate-900">
                                                {selectedCity?.name || "Choose city"}
                                            </span>
                                            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                                                {selectedCity?.region_name || "Browse Uganda’s regions"}
                                            </span>
                                        </span>
                                    </span>
                                    <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                                </button>
                            </div>

                            <CategoryPickerModal
                                open={categoryModalOpen}
                                onClose={() => setCategoryModalOpen(false)}
                                categories={categories}
                                selectedValue={form.category}
                                search={categorySearch}
                                setSearch={setCategorySearch}
                                onSelect={(value) => void changeCategory(value)}
                            />

                            <LocationPickerModal
                                open={locationModalOpen}
                                onClose={() => setLocationModalOpen(false)}
                                cities={cities}
                                selectedValue={form.city}
                                search={locationSearch}
                                setSearch={setLocationSearch}
                                onSelect={(value) => updateForm("city", value)}
                            />

                            <label className="block">
                                <FieldLabel label="Price" required />
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(event) => updateForm("price", event.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <FieldLabel label="Currency" required />
                                <input
                                    value={form.currency}
                                    onChange={(event) => updateForm("currency", event.target.value)}
                                    maxLength={10}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="block">
                                <FieldLabel label="Condition" required />
                                <select
                                    value={form.condition}
                                    onChange={(event) => updateForm("condition", event.target.value)}
                                    required
                                    className={inputClass}
                                >
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                </select>
                            </label>

                            <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span>
                                    <span className="block text-xs font-black text-slate-700">Negotiable price</span>
                                    <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">Buyers may make offers</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={form.isNegotiable}
                                    onChange={(event) => updateForm("isNegotiable", event.target.checked)}
                                    className="h-5 w-5 accent-orange-500"
                                />
                            </label>
                        </div>
                    </FormSection>

                    <FormSection
                        sectionRef={specificationsSectionRef}
                        eyebrow="Category data"
                        title="Ad specifications"
                        icon={faTag}
                    >
                        {specificationsError && (
                            <InlineError message={specificationsError} onDismiss={() => setSpecificationsError("")} />
                        )}

                        {filtersLoading ? (
                            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-xs font-bold text-slate-400">
                                Loading category specifications…
                            </div>
                        ) : filters.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs font-semibold text-slate-400">
                                This category has no additional specifications.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filters.map((filter) => (
                                    <CategoryFilterInput
                                        key={filter.id}
                                        filter={filter}
                                        value={filterValues[String(filter.id)] || ""}
                                        onChange={(value) => {
                                            setFilterValues((current) => ({
                                                ...current,
                                                [String(filter.id)]: value,
                                            }));
                                            setSpecificationsError("");
                                            setSaveError("");
                                            setMessage("");
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </FormSection>
                </div>

                <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                    <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
                                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">Protected edit</p>
                                <h2 className="text-lg font-black">Review changes</h2>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                            <SummaryRow label="Seller" value={listing.seller_name || `Seller #${listing.seller}`} />
                            <SummaryRow label="Current status" value={formatLabel(listing.status)} />
                            <SummaryRow label="Category" value={listing.category_name} />
                            <SummaryRow label="Location" value={listing.city_name} />
                        </div>

                        <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
                            Saving changes will not approve, reject, feature, or delete this ad.
                        </p>

                        {saveError && (
                            <InlineError
                                message={saveError}
                                onDismiss={() => setSaveError("")}
                                className="mt-5 text-left"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={saving || filtersLoading}
                            className={`${saveError ? "mt-3" : "mt-5"} inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-xs font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60`}
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} className="h-3.5 w-3.5" />
                            {saving ? "Saving changes…" : "Save ad changes"}
                        </button>
                    </section>

                    <section className="rounded-[26px] border border-orange-200 bg-orange-50 p-5">
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                            <div>
                                <p className="text-xs font-black text-orange-900">Changes may be immediately visible</p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-orange-700">
                                    This listing is currently {formatLabel(listing.status).toLowerCase()}. If it is active, corrected content appears on the marketplace as soon as you save.
                                </p>
                            </div>
                        </div>
                    </section>

                    <Link
                        href={`/admin/users/${listing.seller}`}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faStore} className="h-3.5 w-3.5" />
                        Open seller account
                    </Link>
                </aside>
            </form>
        </section>
    );
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
    return (
        <span className="mb-2 block text-xs font-black text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </span>
    );
}

function FormSection({
    sectionRef,
    eyebrow,
    title,
    icon,
    children,
}: {
    sectionRef?: Ref<HTMLElement>;
    eyebrow: string;
    title: string;
    icon: typeof faPenToSquare;
    children: React.ReactNode;
}) {
    return (
        <section ref={sectionRef} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">{eyebrow}</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </span>
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function CategoryFilterInput({
    filter,
    value,
    onChange,
}: {
    filter: CategoryFilter;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <FieldLabel label={filter.name} required={filter.is_required} />
            {filter.filter_type === "boolean" ? (
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required={filter.is_required}
                    className={inputClass}
                >
                    <option value="">Select an answer</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            ) : filter.options.length > 0 ? (
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required={filter.is_required}
                    className={inputClass}
                >
                    <option value="">Select {filter.name.toLowerCase()}</option>
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={filter.filter_type === "number" ? "number" : "text"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required={filter.is_required}
                    className={inputClass}
                />
            )}
        </label>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <span className="max-w-[60%] text-right text-xs font-black text-white">{value}</span>
        </div>
    );
}
