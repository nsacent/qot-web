"use client";

import { useRouter } from "next/navigation";
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowRight,
    faBullhorn,
    faCamera,
    faCheck,
    faChevronDown,
    faCircleCheck,
    faFileLines,
    faLayerGroup,
    faLocationDot,
    faMoneyBillWave,
    faPenToSquare,
    faShieldHalved,
    faSliders,
    faTag,
} from "@fortawesome/free-solid-svg-icons";

type CategoryFilterField = {
    id: number | string;
    key: string;
    label: string;
    type: string;
    placeholder: string;
    options: any[];
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data?.cities)) return data.cities;
    if (Array.isArray(data?.filters)) return data.filters;
    if (Array.isArray(data?.fields)) return data.fields;
    return [];
}

function getOptionValue(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);
    return String(item?.id || item?.value || item?.slug || "");
}

function getOptionLabel(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);
    return item?.name || item?.title || item?.label || item?.value || "Unnamed";
}

function getCategoryChildren(item: any) {
    const children =
        item?.children ||
        item?.subcategories ||
        item?.sub_categories ||
        item?.child_categories ||
        [];

    return Array.isArray(children) ? children : [];
}

function flattenCategories(categories: any[]): any[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(getCategoryChildren(category)),
    ]);
}

function getCategoryFilterLookup(item: any, fallback: string) {
    return String(item?.slug || item?.id || item?.value || fallback || "");
}

async function clientApiGet(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        credentials: "include",
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.message || data?.error || "Failed to load data."
        );
    }

    return data;
}

async function clientApiPost(path: string, payload: any) {
    const response = await fetch(`/api/proxy${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401 || response.status === 403) {
        throw new Error("__AUTH__");
    }

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            data?.error ||
            JSON.stringify(data) ||
            "Failed to post advert."
        );
    }

    return data;
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

function normalizeCategoryFilter(field: any): CategoryFilterField | null {
    if (
        field?.active === false ||
        field?.is_active === false ||
        field?.filterable === false ||
        field?.is_filterable === false
    ) {
        return null;
    }

    const id = field?.id || field?.category_filter_id;

    const key = String(
        field?.key ||
        field?.slug ||
        field?.field_slug ||
        field?.parameter ||
        field?.code ||
        field?.name ||
        ""
    ).trim();

    if (!id || !key) return null;

    return {
        id,
        key,
        label: String(
            field?.label || field?.display_name || field?.title || field?.name || key
        ),
        type: String(
            field?.filter_type ||
            field?.input_type ||
            field?.field_type ||
            field?.type ||
            "text"
        ).toLowerCase(),
        placeholder: String(field?.placeholder || ""),
        options: getFilterOptions(field),
    };
}

function isBooleanType(type: string) {
    return ["boolean", "bool", "checkbox", "toggle"].includes(type);
}

function isNumberType(type: string) {
    return ["number", "integer", "decimal", "float"].includes(type);
}

function formatPrice(price: string) {
    if (!price) return "Contact seller";

    const amount = Number(price);
    if (Number.isNaN(amount)) return `UGX ${price}`;

    return `UGX ${amount.toLocaleString()}`;
}

const inputClass =
    "w-full rounded-[16px] border-0 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-200";

const selectClass =
    "w-full appearance-none rounded-[16px] border-0 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-200";

export default function PostAdForm() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [condition, setCondition] = useState("used");
    const [isNegotiable, setIsNegotiable] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilterField[]>([]);
    const [categoryFilterValues, setCategoryFilterValues] = useState<Record<string, string>>({});

    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [error, setError] = useState("");

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

    const selectedCategory = useMemo(() => {
        return flatCategories.find(
            (item) => String(getOptionValue(item)) === String(category)
        );
    }, [flatCategories, category]);

    useEffect(() => {
        async function loadFormData() {
            try {
                const [categoriesData, citiesData] = await Promise.all([
                    clientApiGet("/categories/"),
                    clientApiGet("/locations/cities/?page_size=200"),
                ]);

                setCategories(getArray(categoriesData));
                setCities(getArray(citiesData));
            } catch (err) {
                console.error("Failed to load form data:", err);
                setError("Failed to load form data. Please refresh the page.");
            } finally {
                setPageLoading(false);
            }
        }

        loadFormData();
    }, []);

    useEffect(() => {
        if (!category) {
            setCategoryFilters([]);
            setCategoryFilterValues({});
            return;
        }

        let isActive = true;

        async function loadCategoryFilters() {
            setFiltersLoading(true);
            setCategoryFilters([]);
            setCategoryFilterValues({});

            try {
                const lookup = getCategoryFilterLookup(selectedCategory, category);

                const payload = await clientApiGet(
                    `/categories/${encodeURIComponent(lookup)}/filters/`
                );

                if (!isActive) return;

                const normalized = getCategoryFilterItems(payload)
                    .map(normalizeCategoryFilter)
                    .filter((field): field is CategoryFilterField => Boolean(field));

                setCategoryFilters(normalized);
                setCategoryFilterValues(
                    Object.fromEntries(normalized.map((field) => [field.key, ""]))
                );
            } catch (err) {
                console.error("Failed to load category filters:", err);
                if (isActive) setCategoryFilters([]);
            } finally {
                if (isActive) setFiltersLoading(false);
            }
        }

        loadCategoryFilters();

        return () => {
            isActive = false;
        };
    }, [category, selectedCategory]);

    function getCreatedListingId(data: any) {
        return (
            data?.id ||
            data?.listing?.id ||
            data?.data?.id ||
            data?.data?.listing?.id ||
            data?.result?.id ||
            data?.result?.listing?.id ||
            ""
        );
    }

    function getSelectedCategoryName() {
        return selectedCategory ? getOptionLabel(selectedCategory) : "Not selected";
    }

    function getSelectedCityName() {
        const selected = cities.find(
            (item: any) => String(getOptionValue(item)) === String(city)
        );

        return selected ? getOptionLabel(selected) : "Not selected";
    }

    function updateCategoryFilter(key: string, value: string) {
        setCategoryFilterValues((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function buildAttributes() {
        return categoryFilters
            .map((field) => {
                const value = String(categoryFilterValues[field.key] || "").trim();

                if (!value) return null;

                if (isBooleanType(field.type)) {
                    return {
                        category_filter_id: field.id,
                        value_boolean: value === "true",
                    };
                }

                if (isNumberType(field.type)) {
                    return {
                        category_filter_id: field.id,
                        value_number: value,
                    };
                }

                return {
                    category_filter_id: field.id,
                    value_text: value,
                };
            })
            .filter(Boolean);
    }

    function validateForm() {
        if (!title.trim()) return "Please enter advert title.";
        if (!description.trim()) return "Please enter advert description.";
        if (!price) return "Please enter advert price.";
        if (!category) return "Please select category.";
        if (!city) return "Please select city.";
        if (!condition) return "Please select condition.";

        return "";
    }

    function handlePreview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setShowPreview(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submitAdvert() {
        setLoading(true);
        setError("");

        try {
            const data = await clientApiPost("/listings/", {
                title,
                description,
                price,
                currency: "UGX",
                category,
                city,
                condition,
                is_negotiable: isNegotiable,
                attributes: buildAttributes(),
            });

            const createdListingId = getCreatedListingId(data);

            if (createdListingId) {
                router.push(`/my-ads/${createdListingId}/edit?images=1`);
                return;
            }

            router.push("/my-ads");
        } catch (err: any) {
            if (err?.message === "__AUTH__") {
                router.push("/login?next=/post-ad");
                return;
            }

            setError(err.message || "Something went wrong.");
            setShowPreview(false);
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-slate-600 shadow-sm ring-1 ring-black/5">
                Loading post advert form...
            </div>
        );
    }

    if (showPreview) {
        return (
            <section className="space-y-6">
                {error && <ErrorBox message={error} />}

                <FormCard
                    icon={faCircleCheck}
                    eyebrow="Advert Preview"
                    title="Review before posting"
                    description="Confirm that all details are correct before submitting your advert."
                />

                <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="bg-slate-950 p-6 text-white md:p-8">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-100 ring-1 ring-white/10">
                            <FontAwesomeIcon icon={faBullhorn} className="h-3.5 w-3.5" />
                            Preview
                        </span>

                        <h3 className="mt-4 text-3xl font-black">{title}</h3>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <p className="text-2xl font-black text-orange-300">
                                {formatPrice(price)}
                            </p>

                            {isNegotiable && (
                                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-black uppercase text-green-200 ring-1 ring-green-300/20">
                                    Negotiable
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2">
                        <PreviewBox icon={faLayerGroup} label="Category" value={getSelectedCategoryName()} />
                        <PreviewBox icon={faLocationDot} label="City" value={getSelectedCityName()} />
                        <PreviewBox icon={faTag} label="Condition" value={condition} capitalize />
                        <PreviewBox icon={faMoneyBillWave} label="Price" value={formatPrice(price)} />

                        {categoryFilters.map((field) => {
                            const value = categoryFilterValues[field.key];

                            if (!value) return null;

                            return (
                                <PreviewBox
                                    key={field.key}
                                    icon={faSliders}
                                    label={field.label}
                                    value={
                                        isBooleanType(field.type)
                                            ? value === "true"
                                                ? "Yes"
                                                : "No"
                                            : value
                                    }
                                />
                            );
                        })}
                    </div>

                    <div className="border-t border-slate-100 p-6">
                        <p className="flex items-center gap-2 text-sm font-black text-slate-500">
                            <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-orange-500" />
                            Description
                        </p>

                        <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                            {description}
                        </p>
                    </div>
                </article>

                <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-5 text-orange-800">
                    <p className="flex items-center gap-2 font-black">
                        <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                        Images come after posting.
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                        After submitting, you will be redirected to the edit page where you can upload images and choose the primary image.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => {
                            setShowPreview(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        Back to Edit
                    </button>

                    <button
                        type="button"
                        onClick={submitAdvert}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? "Submitting advert..." : "Submit Advert"}
                        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <form onSubmit={handlePreview} className="space-y-6">
            {error && <ErrorBox message={error} />}

            <FormCard
                icon={faPenToSquare}
                eyebrow="Step 1"
                title="Basic advert details"
                description="Use a clear title and helpful description so buyers understand what you are selling."
            >
                <Field label="Advert Title" icon={faBullhorn}>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Example: HP EliteBook Core i5"
                        className={inputClass}
                        required
                    />
                </Field>

                <Field label="Description" icon={faFileLines}>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe the item, condition, features, and location..."
                        rows={6}
                        className={inputClass}
                        required
                    />
                </Field>
            </FormCard>

            <FormCard
                icon={faMoneyBillWave}
                eyebrow="Step 2"
                title="Price and condition"
                description="Set your price and let buyers know if they can negotiate."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Price" icon={faMoneyBillWave}>
                        <input
                            type="number"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="Example: 850000"
                            className={inputClass}
                            required
                        />

                        <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                            <span>
                                <span className="block text-sm font-black text-slate-800">
                                    Negotiable price
                                </span>
                                <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                                    Tick this if buyers can bargain or make offers.
                                </span>
                            </span>

                            <input
                                type="checkbox"
                                checked={isNegotiable}
                                onChange={(event) => setIsNegotiable(event.target.checked)}
                                className="h-5 w-5 shrink-0 accent-orange-500"
                            />
                        </label>
                    </Field>

                    <Field label="Condition" icon={faTag}>
                        <SelectWrap>
                            <select
                                value={condition}
                                onChange={(event) => setCondition(event.target.value)}
                                className={selectClass}
                            >
                                <option value="new">New</option>
                                <option value="used">Used</option>
                                <option value="refurbished">Refurbished</option>
                            </select>
                        </SelectWrap>
                    </Field>
                </div>
            </FormCard>

            <FormCard
                icon={faLayerGroup}
                eyebrow="Step 3"
                title="Category and location"
                description="Choose the right category and location so buyers can find your advert."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Category" icon={faLayerGroup}>
                        <SelectWrap>
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">Select category</option>

                                {categories.map((parent: any) => (
                                    <optgroup
                                        key={getOptionValue(parent)}
                                        label={getOptionLabel(parent)}
                                    >
                                        <option value={getOptionValue(parent)}>
                                            All in {getOptionLabel(parent)}
                                        </option>

                                        {getCategoryChildren(parent).map((child: any) => (
                                            <option
                                                key={getOptionValue(child)}
                                                value={getOptionValue(child)}
                                            >
                                                {getOptionLabel(child)}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </SelectWrap>
                    </Field>

                    <Field label="City" icon={faLocationDot}>
                        <SelectWrap>
                            <select
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">Select city</option>

                                {cities.map((item: any) => (
                                    <option key={getOptionValue(item)} value={getOptionValue(item)}>
                                        {getOptionLabel(item)}
                                    </option>
                                ))}
                            </select>
                        </SelectWrap>
                    </Field>
                </div>
            </FormCard>

            {category && (
                <FormCard
                    icon={faSliders}
                    eyebrow="Step 4"
                    title="Category details"
                    description="These details change depending on the category you select."
                >
                    {filtersLoading ? (
                        <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                            Loading category details...
                        </div>
                    ) : categoryFilters.length > 0 ? (
                        <div className="grid gap-5 md:grid-cols-2">
                            {categoryFilters.map((field) => {
                                const value = categoryFilterValues[field.key] || "";
                                const hasOptions = field.options.length > 0;

                                if (isBooleanType(field.type)) {
                                    return (
                                        <label
                                            key={field.key}
                                            className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
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
                                    <Field key={field.key} label={field.label} icon={faSliders}>
                                        {hasOptions ? (
                                            <SelectWrap>
                                                <select
                                                    value={value}
                                                    onChange={(event) =>
                                                        updateCategoryFilter(field.key, event.target.value)
                                                    }
                                                    className={selectClass}
                                                >
                                                    <option value="">
                                                        Select {field.label.toLowerCase()}
                                                    </option>

                                                    {field.options.map((option, index) => (
                                                        <option
                                                            key={getOptionValue(option) || index}
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
                                                type={isNumberType(field.type) ? "number" : "text"}
                                                value={value}
                                                onChange={(event) =>
                                                    updateCategoryFilter(field.key, event.target.value)
                                                }
                                                placeholder={field.placeholder || field.label}
                                                className={inputClass}
                                            />
                                        )}
                                    </Field>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                            No extra details required for this category.
                        </div>
                    )}
                </FormCard>
            )}

            <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
                <p className="flex items-center gap-2 font-black">
                    <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                    You will preview before posting.
                </p>

                <p className="mt-1 font-semibold">
                    First review your advert details. After submitting, you will upload advert images on the edit page.
                </p>
            </div>

            <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
            >
                Preview Advert
                <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
            </button>
        </form>
    );
}

function FormCard({
    icon,
    eyebrow,
    title,
    description,
    children,
}: {
    icon: any;
    eyebrow: string;
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:p-6">
            <div className="mb-5 flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children && <div className="space-y-5">{children}</div>}
        </section>
    );
}

function Field({
    label,
    icon,
    children,
}: {
    label: string;
    icon: any;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-orange-500" />
                {label}
            </label>

            {children}
        </div>
    );
}

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

function PreviewBox({
    icon,
    label,
    value,
    capitalize = false,
}: {
    icon: any;
    label: string;
    value: string;
    capitalize?: boolean;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-orange-500" />
                {label}
            </p>

            <p className={`mt-1 font-black text-slate-900 ${capitalize ? "capitalize" : ""}`}>
                {value}
            </p>
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {message}
        </div>
    );
}