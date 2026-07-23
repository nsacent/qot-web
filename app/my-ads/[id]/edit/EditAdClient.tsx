"use client";

import {
    Suspense,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowRight,
    faBullhorn,
    faCamera,
    faChevronDown,
    faCircleCheck,
    faFileLines,
    faLayerGroup,
    faLock,
    faLocationDot,
    faMoneyBillWave,
    faPenToSquare,
    faShieldHalved,
    faSliders,
    faTag,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import QotLoader from "@/components/common/QotLoader";
import AdPreviewPanel from "@/components/listings/AdPreviewPanel";
import { getCurrentUser } from "@/lib/sessionClient";
import { LocationPickerModal } from "@/components/listings/MarketplacePickerModals";
import { fetchAllProxyPages } from "@/lib/marketplaceCatalog";
import { getOrderedListingImages } from "@/lib/listingImages";
import {
    getCategoryFilterDisplayValue,
    getCategoryFilterOptionLabel,
    getCategoryFilterOptionValue,
    normalizeCategoryFilterValue,
} from "@/lib/categoryFilterValues";

type CategoryFilterField = {
    id: number | string;
    key: string;
    label: string;
    type: string;
    placeholder: string;
    options: any[];
};

type ExistingImage = {
    id: string;
    url: string;
    isPrimary: boolean;
};

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.filters)) return data.filters;
    if (Array.isArray(data?.fields)) return data.fields;
    return [];
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

function flattenCategories(items: any[]): any[] {
    return items.flatMap((item) => [
        item,
        ...flattenCategories(getCategoryChildren(item)),
    ]);
}

function getOptionValue(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);
    return String(item?.id || item?.value || item?.slug || "");
}

function getOptionLabel(item: any) {
    if (["string", "number", "boolean"].includes(typeof item)) return String(item);
    return item?.name || item?.title || item?.label || item?.value || "Unnamed";
}

function getCategoryFilterLookup(item: any, fallback: string) {
    return String(item?.slug || item?.id || item?.value || fallback || "");
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

function normalizeListing(data: any) {
    return data?.listing || data?.data || data;
}

function getValue(value: any) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function getApiErrorMessage(data: any, fallback: string) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;

    for (const value of Object.values(data || {})) {
        if (Array.isArray(value) && value[0]) return String(value[0]);
        if (typeof value === "string") return value;
    }

    return fallback;
}

function getAttributeValues(listing: any) {
    const attributes = Array.isArray(listing?.attributes) ? listing.attributes : [];

    return Object.fromEntries(
        attributes
            .map((attribute: any) => {
                const key = String(
                    attribute?.filter_key ||
                    attribute?.key ||
                    attribute?.category_filter_id ||
                    ""
                );
                const value =
                    attribute?.value_text ??
                    attribute?.value_number ??
                    (attribute?.value_boolean === true
                        ? "true"
                        : attribute?.value_boolean === false
                            ? "false"
                            : "");

                return key ? [key, String(value ?? "")] : null;
            })
            .filter(Boolean) as [string, string][]
    );
}

function formatPrice(value: string) {
    const amount = Number(value);
    if (!value || !Number.isFinite(amount)) return "Contact seller";
    return `UGX ${amount.toLocaleString("en-UG")}`;
}

async function getFileFingerprint(file: File) {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const inputClass =
    "w-full rounded-[16px] border-0 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-200";

const selectClass =
    "w-full appearance-none rounded-[16px] border-0 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-200";

function EditAdForm({ id }: { id: string }) {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [ad, setAd] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilterField[]>([]);
    const [categoryFilterValues, setCategoryFilterValues] = useState<Record<string, string>>({});

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("used");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");
    const [isNegotiable, setIsNegotiable] = useState(false);

    const [newImages, setNewImages] = useState<File[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");
    const pendingAttributeValues = useRef<Record<string, string>>({});

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
    const selectedCategory = useMemo(
        () => flatCategories.find((item: any) => String(getOptionValue(item)) === category),
        [flatCategories, category]
    );
    const selectedCity = useMemo(
        () => cities.find((item: any) => String(getOptionValue(item)) === city),
        [cities, city]
    );

    const existingImages = useMemo<ExistingImage[]>(() => {
        return getOrderedListingImages(ad)
            .map((image: any) => ({
                id: String(image.id || ""),
                url: String(image.url || ""),
                isPrimary: image.isPrimary === true,
            }))
            .filter((image: ExistingImage) => image.url)
            .filter((image: ExistingImage) => !deletedImageIds.includes(image.id));
    }, [ad, deletedImageIds]);

    const newImagePreviews = useMemo(
        () => newImages.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        })),
        [newImages]
    );

    useEffect(() => {
        return () => {
            newImagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
        };
    }, [newImagePreviews]);

    const totalPhotos = existingImages.length + newImagePreviews.length;
    const allPreviewImages = [
        ...existingImages.map((image) => ({ ...image, name: "Existing ad photo" })),
        ...newImagePreviews.map((image) => ({ ...image, id: "", isPrimary: false })),
    ];

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = `/login?next=/my-ads/${id}/edit`;
        }
    }

    async function loadCategoriesAndCities() {
        const [categoriesResponse, allCities] = await Promise.all([
            fetch("/api/proxy/categories/", {
                credentials: "include",
                cache: "no-store",
            }),
            fetchAllProxyPages("/locations/cities/?page_size=50"),
        ]);
        const categoriesData = await categoriesResponse.json().catch(() => ({}));

        if (!categoriesResponse.ok) {
            throw new Error("Failed to load marketplace categories.");
        }

        setCategories(getArray(categoriesData));
        setCities(allCities);
    }

    async function loadAd(showLoader = true) {
        if (showLoader) setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/proxy/seller/listings/${id}/`, {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}/edit`;
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (response.status === 403 || response.status === 404) {
                throw new Error("Access denied. This ad does not belong to your account.");
            }

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to load ad.");
            }

            const listing = normalizeListing(data);
            const restoredAttributes = getAttributeValues(listing);

            pendingAttributeValues.current = restoredAttributes;
            setAd(listing);
            setTitle(getValue(listing?.title));
            setPrice(getValue(listing?.price));
            setCondition(getValue(listing?.condition) || "used");
            setCategory(getValue(listing?.category?.id || listing?.category_id || listing?.category));
            setCity(getValue(listing?.city?.id || listing?.city_id || listing?.city));
            setDescription(getValue(listing?.description));
            setIsNegotiable(Boolean(listing?.is_negotiable || listing?.negotiable));
            setCategoryFilterValues(restoredAttributes);
        } catch (requestError: any) {
            setError(requestError.message || "Failed to load ad.");
            setAd(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (!checkingSession) {
            Promise.all([loadCategoriesAndCities(), loadAd()]).catch((requestError) => {
                setError(requestError?.message || "Failed to load the edit form.");
                setLoading(false);
            });
        }
    }, [checkingSession]);

    useEffect(() => {
        if (!category) {
            setCategoryFilters([]);
            setCategoryFilterValues({});
            return;
        }

        let isActive = true;

        async function loadCategoryFilters() {
            setFiltersLoading(true);

            try {
                const lookup = getCategoryFilterLookup(selectedCategory, category);
                const response = await fetch(
                    `/api/proxy/categories/${encodeURIComponent(lookup)}/filters/`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                );
                const payload = await response.json().catch(() => ({}));

                if (!response.ok) throw new Error("Failed to load category details.");

                const normalized = getCategoryFilterItems(payload)
                    .map(normalizeCategoryFilter)
                    .filter((field): field is CategoryFilterField => Boolean(field));

                if (!isActive) return;

                const restoredValues = pendingAttributeValues.current;
                setCategoryFilters(normalized);
                setCategoryFilterValues(
                    Object.fromEntries(
                        normalized.map((field) => [
                            field.key,
                            normalizeCategoryFilterValue(
                                field.options,
                                restoredValues[field.key]
                            ),
                        ])
                    )
                );
                pendingAttributeValues.current = {};
            } catch {
                if (isActive) {
                    setCategoryFilters([]);
                    setCategoryFilterValues({});
                }
            } finally {
                if (isActive) setFiltersLoading(false);
            }
        }

        loadCategoryFilters();

        return () => {
            isActive = false;
        };
    }, [category, selectedCategory]);

    function selectCityValue(value: string) {
        setCity(value);
        setLocationSearch("");
        setLocationModalOpen(false);
    }

    function updateCategoryFilter(key: string, value: string) {
        setCategoryFilterValues((current) => ({ ...current, [key]: value }));
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

    async function handleAddImages(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (!files.length) return;

        const invalidType = files.find(
            (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        );
        if (invalidType) {
            setError("Photos must be JPG, JPEG, PNG, or WEBP files.");
            return;
        }

        const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
        if (oversized) {
            setError(`${oversized.name} is larger than the 5MB limit.`);
            return;
        }

        if (totalPhotos + files.length > 10) {
            setError("An ad can have a maximum of 10 photos.");
            return;
        }

        try {
            const currentHashes = new Set(await Promise.all(newImages.map(getFileFingerprint)));
            const incomingHashes = await Promise.all(files.map(getFileFingerprint));
            const seenHashes = new Set(currentHashes);
            const duplicateIndex = incomingHashes.findIndex((hash) => {
                if (seenHashes.has(hash)) return true;
                seenHashes.add(hash);
                return false;
            });

            if (duplicateIndex >= 0) {
                setError(`${files[duplicateIndex].name} is already selected. Choose a different photo.`);
                return;
            }
        } catch {
            // The API performs the authoritative duplicate check during upload.
        }

        setError("");
        setMessage("");
        setNewImages((current) => [...current, ...files]);
    }

    function removeNewImage(index: number) {
        setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
        setMessage("Photo removed from the pending changes.");
    }

    function removeExistingImage(imageId: string) {
        if (!imageId) return;

        setDeletedImageIds((current) =>
            current.includes(imageId) ? current : [...current, imageId]
        );
        setMessage("Photo will be removed when you save the changes.");
    }

    async function uploadNewImages() {
        for (const file of newImages) {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(`/api/proxy/listings/${id}/images/`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(getApiErrorMessage(data, `Failed to upload ${file.name}.`));
            }
        }
    }

    async function deleteRemovedImages() {
        for (const imageId of deletedImageIds) {
            const response = await fetch(`/api/proxy/listings/${id}/images/${imageId}/`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok && response.status !== 204 && response.status !== 404) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.detail || data?.message || "Failed to remove image.");
            }
        }
    }

    async function setPrimaryImage(imageId: string) {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/proxy/listings/${id}/images/${imageId}/set-primary/`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );
            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}/edit`;
                return;
            }

            if (!response.ok) {
                throw new Error(getApiErrorMessage(data, "Failed to set cover photo."));
            }

            setAd((current: any) => {
                if (!current) return current;

                const images = Array.isArray(current.images)
                    ? current.images.map((image: any) => ({
                        ...image,
                        is_primary: String(image?.id) === String(imageId),
                    }))
                    : current.images;

                return {
                    ...current,
                    images,
                    primary_image_id: imageId,
                };
            });
            setMessage("Cover photo updated without changing your unsaved details.");
        } catch (requestError: any) {
            setError(requestError.message || "Failed to set cover photo.");
        } finally {
            setSaving(false);
        }
    }

    function validateForm() {
        if (!title.trim()) return "Please enter an ad title.";
        if (!description.trim()) return "Please enter an ad description.";
        if (!price || Number(price) <= 0) return "Please enter a valid price.";
        if (!category) return "Please select a category.";
        if (!city) return "Please select a location.";
        if (!condition) return "Please select the item condition.";
        if (totalPhotos < 1) return "Keep or add at least one photo for this ad.";
        if (totalPhotos > 10) return "An ad can have a maximum of 10 photos.";
        return "";
    }

    function handlePreview(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setMessage("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setShowPreview(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function saveChanges() {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setShowPreview(false);
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/proxy/listings/${id}/`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    price,
                    description: description.trim(),
                    condition,
                    city,
                    is_negotiable: isNegotiable,
                    attributes: buildAttributes(),
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(getApiErrorMessage(data, "Failed to save ad details."));
            }

            await deleteRemovedImages();
            await uploadNewImages();

            setNewImages([]);
            setDeletedImageIds([]);
            await loadAd(false);
            setShowPreview(false);
            setMessage("Ad updated successfully and sent for review.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (requestError: any) {
            setError(requestError.message || "Failed to save ad.");
        } finally {
            setSaving(false);
        }
    }

    if (checkingSession || loading) return <QotLoader />;

    if (error && !ad) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-black">Ad unavailable</h2>
                <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
                <a href="/my-ads" className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">
                    Back to My Ads
                </a>
            </div>
        );
    }

    if (showPreview) {
        return (
            <section className="space-y-5">
                {error && <ErrorBox message={error} />}

                <AdPreviewPanel
                    mode="edit"
                    images={allPreviewImages}
                    title={title}
                    price={formatPrice(price)}
                    category={selectedCategory ? getOptionLabel(selectedCategory) : "Category"}
                    location={selectedCity ? getOptionLabel(selectedCity) : "Uganda"}
                    condition={condition}
                    description={description}
                    isNegotiable={isNegotiable}
                    details={categoryFilters.flatMap((field) => {
                        const value = categoryFilterValues[field.key];
                        if (!value) return [];

                        return [{
                            label: field.label,
                            value: isBooleanType(field.type)
                                ? value === "true" ? "Yes" : "No"
                                : getCategoryFilterDisplayValue(field.options, value),
                        }];
                    })}
                />

                <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center">
                    <button type="button" onClick={() => setShowPreview(false)} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-5 text-sm font-black text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        Edit details
                    </button>

                    <div className="hidden min-w-0 flex-1 px-2 sm:block">
                        <p className="text-sm font-black text-slate-900">Ready to save these changes?</p>
                        <p className="truncate text-xs font-semibold text-slate-500">The updated ad will be sent for review.</p>
                    </div>

                    <button type="button" onClick={saveChanges} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50">
                        {saving ? "Saving changes..." : "Save Changes"}
                        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <form onSubmit={handlePreview} className="grid gap-4 lg:grid-cols-2">
            {error && <ErrorBox message={error} />}

            {message && (
                <div className="order-0 flex items-center gap-3 rounded-[16px] bg-green-50 px-4 py-3 text-sm font-black text-green-700 ring-1 ring-green-100 lg:col-span-2">
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />
                    {message}
                </div>
            )}

            <FormCard className="order-1" icon={faCamera} eyebrow="Step 1" title="Manage photos" description={`${totalPhotos} of 10 photos · choose a clear cover image.`}>
                <div className="rounded-[18px] border-2 border-dashed border-orange-200 bg-orange-50/70 p-3 transition hover:border-orange-300 hover:bg-orange-50">
                    <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 text-left">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-black text-slate-900">Add more photos</span>
                            <span className="mt-0.5 block text-xs font-semibold text-slate-500">JPG, PNG or WEBP · 5MB maximum each</span>
                        </span>
                        <span className="hidden rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white sm:inline-flex">Choose</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleAddImages} className="sr-only" />
                    </label>

                    {totalPhotos > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-orange-200/70 pt-3 sm:grid-cols-4">
                            {existingImages.map((image, index) => (
                                <div key={image.id || image.url} className="group relative aspect-[4/3] overflow-hidden rounded-[12px] bg-slate-100 ring-1 ring-slate-200">
                                    <img src={image.url} alt={`Current ad photo ${index + 1}`} className="h-full w-full object-cover" />
                                    {image.isPrimary ? (
                                        <span className="absolute left-1.5 top-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">Cover</span>
                                    ) : (
                                        <button type="button" onClick={() => setPrimaryImage(image.id)} disabled={saving} className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-1 text-[8px] font-black uppercase text-orange-600 shadow-sm disabled:opacity-50">Set cover</button>
                                    )}
                                    <button type="button" onClick={() => removeExistingImage(image.id)} disabled={saving} aria-label="Remove existing photo" className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/80 text-white transition hover:bg-red-600 disabled:opacity-50">
                                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}

                            {newImagePreviews.map((image, index) => (
                                <div key={`${image.name}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-slate-100 ring-1 ring-orange-200">
                                    <img src={image.url} alt={`New photo ${index + 1}`} className="h-full w-full object-cover" />
                                    <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">New</span>
                                    <button type="button" onClick={() => removeNewImage(index)} aria-label={`Remove ${image.name}`} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/80 text-white transition hover:bg-red-600">
                                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FormCard>

            <FormCard className="order-2" icon={faPenToSquare} eyebrow="Step 2" title="What are you selling?" description="Keep the title clear and update the important details.">
                <Field label="Ad title" icon={faBullhorn}>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: HP EliteBook Core i5" className={inputClass} required />
                </Field>
                <Field label="Description" icon={faFileLines}>
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the item, condition and useful features..." rows={4} className={inputClass} required />
                </Field>
            </FormCard>

            <FormCard className="order-3" icon={faMoneyBillWave} eyebrow="Step 3" title="Price and condition" description="Keep your price competitive and condition accurate.">
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Price" icon={faMoneyBillWave}>
                        <input type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Example: 850000" className={inputClass} required />
                        <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                            <span className="text-sm font-black text-slate-800">Negotiable price</span>
                            <input type="checkbox" checked={isNegotiable} onChange={(event) => setIsNegotiable(event.target.checked)} className="h-5 w-5 shrink-0 accent-orange-500" />
                        </label>
                    </Field>
                    <Field label="Condition" icon={faTag}>
                        <SelectWrap>
                            <select value={condition} onChange={(event) => setCondition(event.target.value)} className={selectClass}>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                            </select>
                        </SelectWrap>
                    </Field>
                </div>
            </FormCard>

            <FormCard className="order-4" icon={faLayerGroup} eyebrow="Step 4" title="Category and location" description="The original category stays locked; you can update where the ad appears.">
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Category" icon={faLayerGroup}>
                        <div className="flex w-full items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-200">
                            <span>
                                <span className="block text-sm font-black text-slate-900">{selectedCategory ? getOptionLabel(selectedCategory) : "Current category"}</span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">Category cannot be changed after posting</span>
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200"><FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5" /></span>
                        </div>
                    </Field>
                    <Field label="Location" icon={faLocationDot}>
                        <button type="button" onClick={() => setLocationModalOpen(true)} className="flex w-full items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3 text-left ring-1 ring-slate-200 transition hover:bg-orange-50 hover:ring-orange-100">
                            <span>
                                <span className="block text-sm font-black text-slate-900">{selectedCity ? getOptionLabel(selectedCity) : "Select city"}</span>
                                {selectedCity?.region_name && <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{selectedCity.region_name}</span>}
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600"><FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" /></span>
                        </button>
                    </Field>
                </div>
            </FormCard>

            {category && (
                <FormCard className="order-5 lg:col-span-2" icon={faSliders} eyebrow="Step 5" title="Category details" description="Update only the useful specifications for this category.">
                    {filtersLoading ? (
                        <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">Loading category details...</div>
                    ) : categoryFilters.length > 0 ? (
                        <div className="grid gap-5 md:grid-cols-2">
                            {categoryFilters.map((field) => {
                                const value = categoryFilterValues[field.key] || "";
                                const hasOptions = field.options.length > 0;

                                if (isBooleanType(field.type)) {
                                    return (
                                        <label key={field.key} className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                                            <span className="text-sm font-black text-slate-800">{field.label}</span>
                                            <input type="checkbox" checked={value === "true"} onChange={(event) => updateCategoryFilter(field.key, event.target.checked ? "true" : "")} className="h-5 w-5 shrink-0 accent-orange-500" />
                                        </label>
                                    );
                                }

                                return (
                                    <Field key={field.key} label={field.label} icon={faSliders}>
                                        {hasOptions ? (
                                            <SelectWrap>
                                                <select value={value} onChange={(event) => updateCategoryFilter(field.key, event.target.value)} className={selectClass}>
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {field.options.map((option, index) => (
                                                        <option key={getCategoryFilterOptionValue(option) || index} value={getCategoryFilterOptionValue(option)}>{getCategoryFilterOptionLabel(option)}</option>
                                                    ))}
                                                </select>
                                            </SelectWrap>
                                        ) : (
                                            <input type={isNumberType(field.type) ? "number" : "text"} value={value} onChange={(event) => updateCategoryFilter(field.key, event.target.value)} placeholder={field.placeholder || field.label} className={inputClass} />
                                        )}
                                    </Field>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">No extra details are required for this category.</div>
                    )}
                </FormCard>
            )}

            <div className="order-6 flex items-center gap-3 rounded-[16px] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-800 lg:col-span-2">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                Saving content changes sends the ad back for review. Cover-photo changes are applied immediately.
            </div>

            <div className="order-7 grid gap-3 sm:grid-cols-[auto_1fr] lg:col-span-2">
                <a href={`/my-ads/${id}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                    Cancel
                </a>
                <button type="submit" disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-50">
                    Preview Changes
                    <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </button>
            </div>

            <LocationPickerModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} cities={cities} selectedValue={city} search={locationSearch} setSearch={setLocationSearch} onSelect={selectCityValue} />
        </form>
    );
}

function FormCard({
    className = "",
    icon,
    eyebrow,
    title,
    description,
    children,
}: {
    className?: string;
    icon: any;
    eyebrow: string;
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <section className={`rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5 ${className}`}>
            <div className="mb-4 flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-orange-50 text-orange-600"><FontAwesomeIcon icon={icon} className="h-4 w-4" /></span>
                <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.15em] text-orange-600">{eyebrow}</span>
                    <span className="mt-0.5 block text-lg font-black text-slate-950">{title}</span>
                    <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">{description}</span>
                </span>
            </div>
            {children && <div className="space-y-4">{children}</div>}
        </section>
    );
}

function Field({ label, icon, children }: { label: string; icon: any; children: ReactNode }) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700"><FontAwesomeIcon icon={icon} className="h-4 w-4 text-orange-500" />{label}</label>
            {children}
        </div>
    );
}

function SelectWrap({ children }: { children: ReactNode }) {
    return (
        <div className="relative">
            {children}
            <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="order-0 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 lg:col-span-2">{message}</div>
    );
}

export default function EditAdClient({ id }: { id: string }) {
    return (
        <Suspense fallback={<QotLoader />}>
            <EditAdForm id={id} />
        </Suspense>
    );
}
