"use client";

import { useRouter } from "next/navigation";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
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
    faExpand,
    faFileLines,
    faLayerGroup,
    faLocationDot,
    faMoneyBillWave,
    faPenToSquare,
    faShieldHalved,
    faSliders,
    faTag,
    faTrash,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
    CategoryPickerModal,
    LocationPickerModal,
} from "@/components/listings/MarketplacePickerModals";
import AdPreviewPanel from "@/components/listings/AdPreviewPanel";
import AdActionModal from "@/components/listings/AdActionModal";
import PhotoViewerModal from "@/components/listings/PhotoViewerModal";
import { fetchAllProxyPages } from "@/lib/marketplaceCatalog";
import {
    getCategoryFilterDisplayValue,
    getCategoryFilterOptionLabel,
    getCategoryFilterOptionValue,
    normalizeCategoryFilterValue,
} from "@/lib/categoryFilterValues";
import { findLowResolutionPhoto } from "@/lib/photoValidation";
import {
    getCategoryPhotoRequirements,
    getPhotoRequirementText,
} from "@/lib/categoryPhotoRequirements";
import { uploadFormWithProgress } from "@/lib/uploadWithProgress";

type CategoryFilterField = {
    id: number | string;
    key: string;
    label: string;
    type: string;
    placeholder: string;
    options: any[];
};

type DraftPhoto = {
    id: number;
    name: string;
    url: string;
};

type UploadingPhoto = {
    key: string;
    file: File;
    url: string;
    progress: number;
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

async function clientApiPostForm(path: string, payload: FormData) {
    const response = await fetch(`/api/proxy${path}`, {
        method: "POST",
        credentials: "include",
        body: payload,
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401 || response.status === 403) {
        throw new Error("__AUTH__");
    }

    if (!response.ok) {
        const fieldError = data?.image || data?.images;
        throw new Error(
            data?.detail ||
            data?.message ||
            data?.error ||
            (Array.isArray(fieldError) ? fieldError[0] : fieldError) ||
            "Failed to submit advert."
        );
    }

    return data;
}

async function clientApiPut(path: string, payload: any) {
    const response = await fetch(`/api/proxy${path}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401 || response.status === 403) {
        throw new Error("__AUTH__");
    }

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || data?.error || "Failed to save draft.");
    }

    return data;
}

async function clientApiDelete(path: string) {
    const response = await fetch(`/api/proxy${path}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (response.status === 404) return;

    if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Failed to remove uploaded photo.");
    }
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
    const [photos, setPhotos] = useState<DraftPhoto[]>([]);
    const [photosUploading, setPhotosUploading] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilterField[]>([]);
    const [categoryFilterValues, setCategoryFilterValues] = useState<Record<string, string>>({});

    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [error, setError] = useState("");
    const [draftReady, setDraftReady] = useState(false);
    const [draftSaving, setDraftSaving] = useState(false);
    const [draftMessage, setDraftMessage] = useState("");
    const [clearDraftOpen, setClearDraftOpen] = useState(false);
    const [clearDraftLoading, setClearDraftLoading] = useState(false);
    const [clearDraftError, setClearDraftError] = useState("");
    const [draggedPhotoId, setDraggedPhotoId] = useState<number | null>(null);
    const [dragOverPhotoId, setDragOverPhotoId] = useState<number | null>(null);
    const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
    const [viewerPhoto, setViewerPhoto] = useState<{ url: string; name: string } | null>(null);
    const pendingDraftFilterValues = useRef<Record<string, string>>({});

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);



    const selectedCategory = useMemo(() => {
        return flatCategories.find(
            (item) => String(getOptionValue(item)) === String(category)
        );
    }, [flatCategories, category]);

    const selectedCity = useMemo(() => {
        return cities.find(
            (item: any) => String(getOptionValue(item)) === String(city)
        );
    }, [cities, city]);
    const photoRequirements = useMemo(
        () => getCategoryPhotoRequirements(selectedCategory),
        [selectedCategory],
    );

    const stagedPhotoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);

    useEffect(() => {
        async function loadFormData() {
            try {
                const [categoriesData, citiesData, userData, draftPayload] = await Promise.all([
                    clientApiGet("/categories/"),
                    fetchAllProxyPages("/locations/cities/?page_size=50"),
                    clientApiGet("/auth/me/"),
                    clientApiGet("/listings/draft/"),
                ]);

                setCategories(getArray(categoriesData));
                setCities(citiesData);

                const draft = draftPayload?.draft;
                const draftData = draft?.data || {};
                const currentUser = userData?.user || userData?.data || userData;

                if (draft) {
                    setTitle(String(draftData.title || ""));
                    setDescription(String(draftData.description || ""));
                    setPrice(String(draftData.price || ""));
                    setCategory(String(draftData.category || ""));
                    setCity(String(draftData.city || ""));
                    setCondition(String(draftData.condition || "used"));
                    setIsNegotiable(draftData.is_negotiable === true);
                    pendingDraftFilterValues.current = Object.fromEntries(
                        Object.entries(draftData.category_filter_values || {}).map(
                            ([key, value]) => [key, String(value || "")]
                        )
                    );
                    setPhotos(
                        getArray(draft.staged_images).map((photo: any) => ({
                            id: Number(photo.id),
                            name: String(photo.image_url || "draft-photo").split("/").pop() || "draft-photo",
                            url: photo.card_image_url || photo.image_url,
                        }))
                    );
                    setDraftMessage("Your saved draft has been restored.");
                } else if (currentUser?.profile?.default_city) {
                    setCity(String(currentUser.profile.default_city));
                }
            } catch (err) {
                console.error("Failed to load form data:", err);
                setError("Failed to load form data. Please refresh the page.");
            } finally {
                setDraftReady(true);
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
                    Object.fromEntries(
                        normalized.map((field) => [
                            field.key,
                            normalizeCategoryFilterValue(
                                field.options,
                                pendingDraftFilterValues.current[field.key]
                            ),
                        ])
                    )
                );
                pendingDraftFilterValues.current = {};
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

    function getDraftPayload(photoIds = stagedPhotoIds) {
        return {
            data: {
                title,
                description,
                price,
                category,
                city,
                condition,
                is_negotiable: isNegotiable,
                category_filter_values: categoryFilterValues,
            },
            staged_image_ids: photoIds,
        };
    }

    async function saveDraft() {
        const hasContent = Boolean(
            title.trim() || description.trim() || price || category || photos.length
        );

        if (!hasContent) {
            setError("Add at least one detail before saving a draft.");
            return;
        }

        setDraftSaving(true);
        setError("");

        try {
            await clientApiPut("/listings/draft/", getDraftPayload());
            setDraftMessage("Draft saved. You can safely come back to it later.");
        } catch (err: any) {
            if (err?.message === "__AUTH__") {
                router.push("/login?next=/post-ad");
                return;
            }
            setError(err.message || "Failed to save draft.");
        } finally {
            setDraftSaving(false);
        }
    }

    async function clearDraft() {
        setDraftReady(false);
        setClearDraftLoading(true);
        setClearDraftError("");

        try {
            const response = await fetch("/api/proxy/listings/draft/", {
                method: "DELETE",
                credentials: "include",
            });
            const data = response.status === 204
                ? {}
                : await response.json().catch(() => ({}));

            if (response.status === 401) {
                router.push("/login?next=/post-ad");
                return;
            }
            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to clear draft.");
            }

            setTitle("");
            setDescription("");
            setPrice("");
            setCategory("");
            setCity("");
            setCondition("used");
            setIsNegotiable(false);
            setPhotos([]);
            setCategoryFilters([]);
            setCategoryFilterValues({});
            pendingDraftFilterValues.current = {};
            setUploadProgress("");
            setError("");
            setDraftMessage("Draft cleared. You can start a fresh ad.");
            setClearDraftOpen(false);
        } catch (err: any) {
            setClearDraftError(err.message || "Failed to clear draft.");
        } finally {
            setDraftReady(true);
            setClearDraftLoading(false);
        }
    }

    useEffect(() => {
        const hasContent = Boolean(
            title.trim() || description.trim() || price || category || photos.length
        );

        if (!draftReady || !hasContent || photosUploading || loading) return;

        const payload = {
            data: {
                title,
                description,
                price,
                category,
                city,
                condition,
                is_negotiable: isNegotiable,
                category_filter_values: categoryFilterValues,
            },
            staged_image_ids: stagedPhotoIds,
        };

        const timeout = window.setTimeout(async () => {
            try {
                await clientApiPut("/listings/draft/", payload);
                setDraftMessage("Draft saved automatically.");
            } catch (err: any) {
                if (err?.message !== "__AUTH__") {
                    setError(err.message || "Failed to save draft.");
                }
            }
        }, 1200);

        return () => window.clearTimeout(timeout);
    }, [
        category,
        categoryFilterValues,
        city,
        condition,
        description,
        draftReady,
        isNegotiable,
        loading,
        photos.length,
        photosUploading,
        price,
        stagedPhotoIds,
        title,
    ]);

    function validateForm() {
        if (!title.trim()) return "Please enter advert title.";
        if (!description.trim()) return "Please enter advert description.";
        if (!price) return "Please enter advert price.";
        if (!category) return "Please select category.";
        if (!city) return "Please select city.";
        if (!condition) return "Please select condition.";
        if (photos.length < photoRequirements.minimum) {
            return `${getSelectedCategoryName()} requires at least ${photoRequirements.minimum} photos.`;
        }
        if (photos.length > photoRequirements.maximum) {
            return `${getSelectedCategoryName()} allows a maximum of ${photoRequirements.maximum} photos.`;
        }
        if (photosUploading) return "Please wait for your photos to finish uploading.";
        return "";
    }

    function selectCategoryValue(value: string) {
        setCategory(value);
        setCategorySearch("");
        setCategoryModalOpen(false);
    }

    function selectCityValue(value: string) {
        setCity(value);
        setLocationSearch("");
        setLocationModalOpen(false);
    }

    async function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";

        if (!selectedFiles.length) return;
        if (!category) {
            setError("Choose a category before adding photos so QOT can apply the correct photo limit.");
            return;
        }

        const invalidType = selectedFiles.find(
            (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        );

        if (invalidType) {
            setError("Photos must be JPG, JPEG, PNG, or WEBP files.");
            return;
        }

        const oversized = selectedFiles.find((file) => file.size > 8 * 1024 * 1024);

        if (oversized) {
            setError(`${oversized.name} is larger than the 8MB limit.`);
            return;
        }

        if (photos.length + selectedFiles.length > photoRequirements.maximum) {
            setError(
                `${getSelectedCategoryName()} allows a maximum of ${photoRequirements.maximum} photos.`
            );
            return;
        }

        try {
            const lowResolutionPhoto = await findLowResolutionPhoto(selectedFiles);
            if (lowResolutionPhoto) {
                setError(`${lowResolutionPhoto.name} is too small. Use a photo of at least 600 × 450 pixels.`);
                return;
            }
        } catch {
            setError("One of the selected files could not be read as a photo.");
            return;
        }

        setError("");
        setPhotosUploading(true);
        const pendingPhotos = selectedFiles.map((file, index) => ({
            key: `${Date.now()}-${index}-${file.name}`,
            file,
            url: URL.createObjectURL(file),
            progress: 0,
        }));
        setUploadingPhotos(pendingPhotos);

        try {
            for (const [index, pendingPhoto] of pendingPhotos.entries()) {
                const { file } = pendingPhoto;
                setUploadProgress(`Optimizing photo ${index + 1} of ${selectedFiles.length}...`);
                const formData = new FormData();
                formData.append("image", file);
                const data = await uploadFormWithProgress(
                    "/listings/images/stage/",
                    formData,
                    (progress) => setUploadingPhotos((current) => current.map((item) => (
                        item.key === pendingPhoto.key ? { ...item, progress } : item
                    ))),
                );

                setPhotos((current) => [...current, {
                    id: Number(data.id),
                    name: file.name,
                    url: data.card_image_url || data.image_url || "",
                }]);
                setUploadingPhotos((current) => current.filter((item) => item.key !== pendingPhoto.key));
                URL.revokeObjectURL(pendingPhoto.url);
            }
            setUploadProgress("Photos optimized automatically. Continue filling in the advert details.");
        } catch (err: any) {
            if (err.message === "__AUTH__") {
                window.location.href = "/login?next=/post-ad";
                return;
            }
            setError(err.message || "Failed to upload and optimize the photo.");
            setUploadProgress("Photo upload failed. Please try again.");
        } finally {
            pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
            setUploadingPhotos([]);
            setPhotosUploading(false);
        }
    }

    async function removePhoto(index: number) {
        const stagedId = photos[index]?.id;

        if (stagedId) {
            try {
                await clientApiDelete(`/listings/images/stage/${stagedId}/`);
            } catch (err: any) {
                setError(err.message || "Failed to remove uploaded photo.");
                return;
            }
        }

        const remainingPhotos = photos.filter((_, itemIndex) => itemIndex !== index);
        setPhotos(remainingPhotos);

        if (remainingPhotos.length === 0) {
            setUploadProgress("");
        }
    }

    function movePhoto(sourceId: number, targetIndex: number) {
        setPhotos((current) => {
            const sourceIndex = current.findIndex((photo) => photo.id === sourceId);

            if (
                sourceIndex < 0 ||
                targetIndex < 0 ||
                targetIndex >= current.length ||
                sourceIndex === targetIndex
            ) {
                return current;
            }

            const reordered = [...current];
            const [movedPhoto] = reordered.splice(sourceIndex, 1);
            reordered.splice(targetIndex, 0, movedPhoto);
            return reordered;
        });

        setUploadProgress(
            targetIndex === 0
                ? "Main photo updated. This photo will appear first on your ad."
                : "Photo order updated."
        );
    }

    function handlePhotoDragStart(event: DragEvent<HTMLDivElement>, photoId: number) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(photoId));
        setDraggedPhotoId(photoId);
    }

    function handlePhotoDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
        event.preventDefault();
        const transferredId = Number(event.dataTransfer.getData("text/plain"));
        const sourceId = Number.isFinite(transferredId) && transferredId > 0
            ? transferredId
            : draggedPhotoId;

        if (sourceId) movePhoto(sourceId, targetIndex);

        setDraggedPhotoId(null);
        setDragOverPhotoId(null);
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
        setUploadProgress("");

        try {
            setUploadProgress("Saving advert details...");

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("currency", "UGX");
            formData.append("category", category);
            formData.append("city", city);
            formData.append("condition", condition);
            formData.append("is_negotiable", String(isNegotiable));
            formData.append("attributes", JSON.stringify(buildAttributes()));
            formData.append("staged_image_ids", JSON.stringify(stagedPhotoIds));

            const data = await clientApiPostForm("/listings/", formData);
            const listingId = String(getCreatedListingId(data));

            if (!listingId) {
                throw new Error("Advert was created, but its ad ID was not returned.");
            }

            setDraftReady(false);
            await clientApiDelete("/listings/draft/").catch(() => undefined);
            setUploadProgress("Advert submitted successfully.");
            router.push(`/account/my-ads/${listingId}`);
        } catch (err: any) {
            if (err?.message === "__AUTH__") {
                router.push("/login?next=/post-ad");
                return;
            }

            setError(err.message || "Something went wrong.");
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

                <AdPreviewPanel
                    mode="create"
                    images={photos.map((photo, index) => ({
                        id: photo.id,
                        url: photo.url,
                        isPrimary: index === 0,
                    }))}
                    title={title}
                    price={formatPrice(price)}
                    category={getSelectedCategoryName()}
                    location={getSelectedCityName()}
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

                {uploadProgress && (
                    <div className="rounded-[18px] bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                        {uploadProgress}
                    </div>
                )}

                <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => {
                            setShowPreview(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-5 text-sm font-black text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        Edit details
                    </button>

                    <div className="hidden min-w-0 flex-1 px-2 sm:block">
                        <p className="text-sm font-black text-slate-900">Ready to publish?</p>
                        <p className="truncate text-xs font-semibold text-slate-500">
                            {photos.length} photo{photos.length === 1 ? "" : "s"} · Review complete
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={submitAdvert}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? uploadProgress || "Publishing ad..." : "Publish Ad"}
                        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <form onSubmit={handlePreview} className="grid gap-4 lg:grid-cols-2">
            {error && <ErrorBox message={error} />}

            {draftMessage && (
                <div className="order-0 flex items-center gap-3 rounded-[16px] bg-green-50 px-4 py-3 text-sm font-black text-green-700 ring-1 ring-green-100 lg:col-span-2">
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />
                    {draftMessage}
                </div>
            )}

            <FormCard
                className="order-2"
                icon={faCamera}
                eyebrow="Step 2"
                title="Add photos"
                description={category
                    ? `${getPhotoRequirementText(getSelectedCategoryName(), photoRequirements)} Your first photo is the cover.`
                    : "Choose a category in Step 1 to unlock photos and see the correct limit."
                }
            >
                <div className={`rounded-[18px] border-2 border-dashed p-3 transition ${category
                    ? "border-orange-200 bg-orange-50/70 hover:border-orange-300 hover:bg-orange-50"
                    : "border-slate-200 bg-slate-50"
                }`}>
                    <label className={`flex min-h-20 items-center gap-3 rounded-[14px] px-2 py-2 text-left ${category ? "cursor-pointer" : "cursor-not-allowed opacity-65"}`}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-orange-600 ring-1 ring-orange-100">
                            <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-black text-slate-900">
                                {!category
                                    ? "Choose a category first"
                                    : photosUploading
                                        ? "Uploading photos..."
                                        : "Tap to add photos"}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                                JPG, PNG or WEBP · 8MB maximum each · optimized automatically
                            </span>
                        </span>
                        <span className="hidden rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white sm:inline-flex">
                            Choose
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handlePhotoSelection}
                            disabled={photosUploading || !category}
                            className="sr-only"
                        />
                    </label>

                    {(photos.length > 0 || uploadingPhotos.length > 0) && (
                        <div className="mt-3 border-t border-orange-200/70 pt-3">
                            <p className="mb-2.5 text-[10px] font-bold leading-4 text-slate-500">
                                Drag photos to reorder them. The first photo is your main cover.
                            </p>

                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        draggable={!photosUploading}
                                        onDragStart={(event) => handlePhotoDragStart(event, photo.id)}
                                        onDragEnter={() => setDragOverPhotoId(photo.id)}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            event.dataTransfer.dropEffect = "move";
                                        }}
                                        onDrop={(event) => handlePhotoDrop(event, index)}
                                        onDragEnd={() => {
                                            setDraggedPhotoId(null);
                                            setDragOverPhotoId(null);
                                        }}
                                        title="Drag to reorder this photo"
                                        className={`group relative aspect-[4/3] cursor-grab overflow-hidden rounded-[12px] bg-slate-100 ring-1 transition active:cursor-grabbing ${draggedPhotoId === photo.id
                                            ? "scale-95 opacity-50 ring-orange-300"
                                            : dragOverPhotoId === photo.id
                                                ? "ring-2 ring-orange-500"
                                                : "ring-slate-200"
                                        }`}
                                    >
                                        <img
                                            src={photo.url}
                                            alt={`Selected photo ${index + 1}`}
                                            className="pointer-events-none h-full w-full object-cover"
                                        />

                                        {index === 0 ? (
                                            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-sm">
                                                Main photo
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => movePhoto(photo.id, 0)}
                                                disabled={photosUploading}
                                                className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-1 text-[8px] font-black uppercase text-orange-600 shadow-sm transition hover:bg-orange-500 hover:text-white disabled:opacity-50"
                                            >
                                                Make cover
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setViewerPhoto({ url: photo.url, name: photo.name })}
                                            aria-label={`View ${photo.name} full screen`}
                                            title="View photo"
                                            className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-orange-500 hover:text-white"
                                        >
                                            <FontAwesomeIcon icon={faExpand} className="h-3 w-3" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            disabled={photosUploading}
                                            aria-label={`Remove ${photo.name}`}
                                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/80 text-white transition hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" />
                                        </button>
                                    </div>
                                ))}

                                {uploadingPhotos.map((photo) => (
                                    <div key={photo.key} className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-slate-900 ring-1 ring-orange-200">
                                        <img src={photo.url} alt={`Uploading ${photo.file.name}`} className="h-full w-full scale-105 object-cover blur-md" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/35 text-white">
                                            <span className="text-lg font-black">{photo.progress}%</span>
                                            <span className="mt-0.5 text-[8px] font-black uppercase tracking-wider">Uploading</span>
                                        </div>
                                        <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-white/25">
                                            <div className="h-full rounded-full bg-orange-500 transition-[width] duration-150" style={{ width: `${photo.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {category && (
                                <div className={`mt-3 rounded-xl px-3 py-2 text-[10px] font-black ring-1 ${photos.length >= photoRequirements.minimum && photos.length <= photoRequirements.maximum
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                    : "bg-amber-50 text-amber-700 ring-amber-100"
                                }`}>
                                    {photos.length} uploaded · {getPhotoRequirementText(getSelectedCategoryName(), photoRequirements)}
                                </div>
                            )}
                        </div>
                    )}

                    {uploadProgress && !showPreview && (
                        <div className={`mt-3 rounded-[12px] px-3 py-2 text-xs font-black ring-1 ${photosUploading
                            ? "bg-blue-50 text-blue-700 ring-blue-100"
                            : "bg-green-50 text-green-700 ring-green-100"
                        }`}>
                            {uploadProgress}
                        </div>
                    )}
                </div>
            </FormCard>

            <FormCard
                className="order-3"
                icon={faPenToSquare}
                eyebrow="Step 3"
                title="What are you selling?"
                description="Add a short title and the important details."
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
                        rows={4}
                        className={inputClass}
                        required
                    />
                </Field>
            </FormCard>

            <FormCard
                className="order-4"
                icon={faMoneyBillWave}
                eyebrow="Step 4"
                title="Price and condition"
                description="Set the price and item condition."
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
                            </select>
                        </SelectWrap>
                    </Field>
                </div>
            </FormCard>

            <FormCard
                className="order-1"
                icon={faLayerGroup}
                eyebrow="Step 1"
                title="Choose category and location"
                description="Choose the category first so QOT can apply the right photo requirement."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Category" icon={faLayerGroup}>
                        <button
                            type="button"
                            onClick={() => setCategoryModalOpen(true)}
                            className="flex w-full items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3 text-left ring-1 ring-slate-200 transition hover:bg-orange-50 hover:ring-orange-100"
                        >
                            <span>
                                <span className="block text-sm font-black text-slate-900">
                                    {selectedCategory ? getOptionLabel(selectedCategory) : "Select category"}
                                </span>
                            </span>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faLayerGroup} className="h-4 w-4" />
                            </span>
                        </button>
                    </Field>

                    <Field label="Location" icon={faLocationDot}>
                        <button
                            type="button"
                            onClick={() => setLocationModalOpen(true)}
                            className="flex w-full items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3 text-left ring-1 ring-slate-200 transition hover:bg-orange-50 hover:ring-orange-100"
                        >
                            <span>
                                <span className="block text-sm font-black text-slate-900">
                                    {selectedCity ? getOptionLabel(selectedCity) : "Select city"}
                                </span>
                            </span>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                            </span>
                        </button>
                    </Field>
                </div>

                <CategoryPickerModal
                    open={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    categories={categories}
                    selectedValue={category}
                    search={categorySearch}
                    setSearch={setCategorySearch}
                    onSelect={selectCategoryValue}
                />

                <LocationPickerModal
                    open={locationModalOpen}
                    onClose={() => setLocationModalOpen(false)}
                    cities={cities}
                    selectedValue={city}
                    search={locationSearch}
                    setSearch={setLocationSearch}
                    onSelect={selectCityValue}
                />
            </FormCard>

            {category && (
                <FormCard
                    className="order-5 lg:col-span-2"
                    icon={faSliders}
                    eyebrow="Step 5"
                    title="Category details"
                    description="Add only the details that apply to this category."
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
                                                            key={getCategoryFilterOptionValue(option) || index}
                                                            value={getCategoryFilterOptionValue(option)}
                                                        >
                                                            {getCategoryFilterOptionLabel(option)}
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

            <div className="order-6 flex items-center gap-2 rounded-[16px] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-800 lg:col-span-2">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                You&apos;ll preview everything before the advert goes live.
            </div>

            <div className="order-7 grid gap-3 sm:grid-cols-[auto_auto_1fr] lg:col-span-2">
                <button
                    type="button"
                    onClick={() => {
                        setClearDraftError("");
                        setClearDraftOpen(true);
                    }}
                    disabled={draftSaving || photosUploading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-red-50 px-5 text-sm font-black text-red-600 ring-1 ring-red-100 hover:bg-red-100 disabled:opacity-60"
                >
                    <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                    Clear Draft
                </button>
                <button
                    type="button"
                    onClick={saveDraft}
                    disabled={draftSaving || photosUploading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                >
                    <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-orange-500" />
                    {draftSaving ? "Saving draft..." : "Save Draft"}
                </button>
                <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600"
                >
                    Preview Advert
                    <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </button>
            </div>

            <PhotoViewerModal
                open={Boolean(viewerPhoto)}
                imageUrl={viewerPhoto?.url || ""}
                title={viewerPhoto?.name || "Ad photo"}
                onClose={() => setViewerPhoto(null)}
            />
            <AdActionModal
                open={clearDraftOpen}
                title="Clear this draft?"
                description="All unfinished details and staged photos will be permanently removed so you can start again."
                confirmLabel="Clear draft"
                destructive
                loading={clearDraftLoading}
                error={clearDraftError}
                onClose={() => {
                    if (clearDraftLoading) return;
                    setClearDraftOpen(false);
                    setClearDraftError("");
                }}
                onConfirm={clearDraft}
            />
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-orange-50 text-orange-600">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </div>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-600">
                        {eyebrow}
                    </p>
                    <h2 className="mt-0.5 text-lg font-black text-slate-950">{title}</h2>
                    <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children && <div className="space-y-4">{children}</div>}
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

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="rounded-[16px] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 lg:col-span-2">
            {message}
        </div>
    );
}
