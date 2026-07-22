"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import {
    CategoryPickerModal,
    LocationPickerModal,
} from "@/components/listings/MarketplacePickerModals";
import { fetchAllProxyPages } from "@/lib/marketplaceCatalog";
import {
    getUgandanNationalNumber,
    toUgandanPhone,
} from "@/lib/ugandanPhone";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getCategoryChildren(item: any) {
    return Array.isArray(item?.children) ? item.children : [];
}

function flattenCategories(items: any[]): any[] {
    return items.flatMap((item) => [
        item,
        ...flattenCategories(getCategoryChildren(item)),
    ]);
}

function getImageUrl(value: any) {
    const image = value?.image || value?.url || value;

    if (!image) return "";

    if (String(image).startsWith("http")) return String(image);
    if (String(image).startsWith("/")) return `${API_ORIGIN}${image}`;

    return String(image);
}

function getImageId(value: any) {
    return value?.id || value?.pk || value?.image_id || "";
}

function getListingPrimaryUrl(ad: any) {
    const image =
        ad?.primary_image?.image ||
        ad?.primary_image?.url ||
        ad?.cover_image ||
        ad?.thumbnail ||
        ad?.main_image ||
        ad?.featured_image;

    return getImageUrl(image);
}

function getImageIsPrimary(item: any) {
    const value =
        item?.is_primary ??
        item?.primary ??
        item?.is_main ??
        item?.is_cover ??
        item?.is_featured;

    return value === true || value === "true" || value === 1 || value === "1";
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

function EditAdForm({ id }: { id: string }) {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [ad, setAd] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [locationDetails, setLocationDetails] = useState("");
    const [description, setDescription] = useState("");
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [status, setStatus] = useState("");

    const [newImages, setNewImages] = useState<File[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
    const selectedCategory = useMemo(
        () => flatCategories.find((item: any) => String(item?.id) === category),
        [flatCategories, category]
    );
    const selectedCity = useMemo(
        () => cities.find((item: any) => String(item?.id) === city),
        [cities, city]
    );

    const existingImages = useMemo(() => {
        const images = ad?.images || ad?.photos || [];

        if (!Array.isArray(images)) return [];

        const primaryUrl = getListingPrimaryUrl(ad);
        const primaryId =
            ad?.primary_image?.id ||
            ad?.primary_image_id ||
            ad?.cover_image_id ||
            ad?.main_image_id ||
            "";

        const mappedImages = images
            .map((item: any, index: number) => {
                const id = String(getImageId(item) || "");
                const url = getImageUrl(item);

                return {
                    id,
                    url,
                    index,
                    backendSaysPrimary: getImageIsPrimary(item),
                    matchesPrimaryId: Boolean(primaryId && id && String(primaryId) === id),
                    matchesPrimaryUrl: Boolean(primaryUrl && url && primaryUrl === url),
                };
            })
            .filter((item: any) => item.url)
            .filter((item: any) => !deletedImageIds.includes(String(item.id)));

        if (!mappedImages.length) return [];

        let primaryIndex = mappedImages.findIndex((item: any) => item.matchesPrimaryId);

        if (primaryIndex < 0) {
            primaryIndex = mappedImages.findIndex((item: any) => item.backendSaysPrimary);
        }

        if (primaryIndex < 0) {
            primaryIndex = mappedImages.findIndex((item: any) => item.matchesPrimaryUrl);
        }

        if (primaryIndex < 0) {
            primaryIndex = 0;
        }

        return mappedImages.map((item: any, index: number) => ({
            id: item.id,
            url: item.url,
            isPrimary: index === primaryIndex,
        }));
    }, [ad, deletedImageIds]);
    const newImagePreviews = useMemo(() => {
        return newImages.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));
    }, [newImages]);

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

        setCategories(getArray(categoriesData));
        setCities(allCities);
    }


    async function loadAd() {
        setLoading(true);
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

            setAd(listing);

            setTitle(getValue(listing?.title));
            setPrice(getValue(listing?.price || listing?.amount || listing?.selling_price));
            setCondition(getValue(listing?.condition));
            setCategory(
                getValue(listing?.category?.id || listing?.category_id || listing?.category)
            );
            setCity(getValue(listing?.city?.id || listing?.city_id || listing?.city));
            setPhone(toUgandanPhone(getValue(listing?.contact_phone || listing?.phone)));
            setLocationDetails(
                getValue(listing?.location_details || listing?.address || listing?.location)
            );
            setDescription(getValue(listing?.description));
            setIsNegotiable(Boolean(listing?.is_negotiable || listing?.negotiable));
            setStatus(getValue(listing?.status || listing?.approval_status));
        } catch (err: any) {
            setError(err.message || "Failed to load ad.");
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
            loadCategoriesAndCities();
            loadAd();
        }
    }, [checkingSession]);

    function handleAddImages(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files || []);

        if (!files.length) return;

        setNewImages((current) => [...current, ...files]);
        event.target.value = "";
    }

    function removeNewImage(index: number) {
        setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    }

    function removeExistingImage(imageId: string) {
        if (!imageId) return;

        setDeletedImageIds((current) => {
            if (current.includes(String(imageId))) return current;
            return [...current, String(imageId)];
        });
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

            if (!response.ok && response.status !== 204) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data?.detail || data?.message || "Failed to remove image."
                );
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

            const text = await response.text();
            let data: any = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { detail: text };
            }

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}/edit`;
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    `Failed to set primary image. Status: ${response.status}`
                );
            }

            await loadAd();
            setMessage("Primary image updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to set primary image.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/proxy/listings/${id}/`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    price,
                    description: description.trim(),
                    condition,
                    category,
                    city,
                    contact_phone: phone.trim(),
                    location_details: locationDetails.trim(),
                    is_negotiable: isNegotiable,
                    ...(status ? { status } : {}),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to save ad details.");
            }

            await deleteRemovedImages();
            await uploadNewImages();

            setNewImages([]);
            setDeletedImageIds([]);

            await loadAd();

            setMessage("Ad updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to save ad.");
        } finally {
            setSaving(false);
        }
    }

    if (checkingSession || loading) {
        return <QotLoader />;
    }

    if (error && !ad) {
        return (
            <section className="py-6">
                <div className="rounded-[34px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                    <h1 className="text-2xl font-black text-slate-950">
                        Access denied
                    </h1>

                    <p className="mt-2 text-sm font-bold text-red-600">{error}</p>

                    <a
                        href="/my-ads"
                        className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                    >
                        Back to My Ads
                    </a>
                </div>
            </section>
        );
    }

    return (
        <section className="py-6 text-slate-950">
            <form
                onSubmit={handleSave}
                className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"
            >
                <aside className="h-fit rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-6">
                    <a
                        href={`/my-ads/${id}`}
                        className="text-sm font-black text-orange-600 hover:text-orange-700"
                    >
                        ← Back to Ad
                    </a>

                    <h1 className="mt-6 text-2xl font-black text-slate-950">
                        Edit Ad
                    </h1>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        Update your ad details, category, location, pricing, and images.
                    </p>

                    {error && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                            {message}
                        </div>
                    )}

                    <div className="mt-6 grid gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <a
                            href={`/ads/${id}`}
                            className="rounded-2xl bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            View Public Page
                        </a>
                    </div>
                </aside>

                <div className="space-y-6">
                    <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                        <h2 className="text-xl font-black text-slate-950">
                            Basic details
                        </h2>

                        <div className="mt-5 grid gap-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Ad title
                                </span>

                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <span className="mb-2 block text-sm font-black text-slate-700">
                                        Category
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setCategoryModalOpen(true)}
                                        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900 ring-1 ring-slate-100 transition hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <span>
                                            <span className="block">{selectedCategory?.name || "Select category"}</span>
                                            <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">Browse departments and subcategories</span>
                                        </span>
                                        <span aria-hidden="true">→</span>
                                    </button>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-black text-slate-700">
                                        Condition
                                    </span>

                                    <select
                                        value={condition}
                                        onChange={(event) => setCondition(event.target.value)}
                                        className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                                    >
                                        <option value="">Select condition</option>
                                        <option value="new">New</option>
                                        <option value="used">Used</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Description
                                </span>

                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    rows={8}
                                    className="w-full resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                        <h2 className="text-xl font-black text-slate-950">
                            Price and location
                        </h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Price
                                </span>

                                <input
                                    value={price}
                                    onChange={(event) => setPrice(event.target.value)}
                                    placeholder="Example: 450000"
                                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                                />
                            </label>

                            <div>
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Region and city
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setLocationModalOpen(true)}
                                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900 ring-1 ring-slate-100 transition hover:bg-orange-50 hover:text-orange-600"
                                >
                                    <span>
                                        <span className="block">{selectedCity?.name || "Select city"}</span>
                                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{selectedCity?.region_name || "Browse Uganda’s regions"}</span>
                                    </span>
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Contact phone
                                </span>

                                <span className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <span className="border-r border-slate-200 pr-3 text-sm font-black text-slate-700">+256</span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={getUgandanNationalNumber(phone)}
                                        onChange={(event) => setPhone(toUgandanPhone(event.target.value))}
                                        placeholder="700 000 001"
                                        pattern="[0-9]{9}"
                                        maxLength={16}
                                        className="min-w-0 flex-1 bg-transparent pl-3 text-sm font-bold text-slate-900 outline-none"
                                    />
                                </span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Specific location
                                </span>

                                <input
                                    value={locationDetails}
                                    onChange={(event) => setLocationDetails(event.target.value)}
                                    placeholder="Example: Banda, near the mosque"
                                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                                />
                            </label>
                        </div>

                        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={isNegotiable}
                                onChange={(event) => setIsNegotiable(event.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-orange-500"
                            />

                            <span className="text-sm font-black text-slate-700">
                                Price is negotiable
                            </span>
                        </label>
                    </div>

                    <div className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-7">
                        <h2 className="text-xl font-black text-slate-950">Images</h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Add new images or remove existing images from this ad.
                        </p>

                        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center hover:bg-orange-100">
                            <span className="text-sm font-black text-orange-600">
                                Click to upload images
                            </span>

                            <span className="mt-1 text-xs font-semibold text-orange-700/70">
                                JPG, PNG, or WEBP
                            </span>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleAddImages}
                                className="hidden"
                            />
                        </label>

                        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {existingImages.map((image: any) => (
                                    <div
                                        key={image.id || image.url}
                                        className="relative overflow-hidden rounded-2xl bg-slate-100"
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="aspect-square w-full object-cover"
                                        />

                                        {image.id && (
                                            <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                                                {image.isPrimary ? (
                                                    <span className="rounded-full bg-green-500 px-3 py-1 text-[11px] font-black text-white shadow">
                                                        Main Image
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryImage(String(image.id))}
                                                        disabled={saving}
                                                        className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-orange-600 shadow hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Set Main
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(String(image.id))}
                                                    disabled={saving}
                                                    className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-black text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {newImagePreviews.map((image, index) => (
                                    <div
                                        key={`${image.name}-${index}`}
                                        className="relative overflow-hidden rounded-2xl bg-slate-100"
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="aspect-square w-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black text-white"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            <CategoryPickerModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                categories={categories}
                selectedValue={category}
                search={categorySearch}
                setSearch={setCategorySearch}
                onSelect={setCategory}
            />

            <LocationPickerModal
                open={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                cities={cities}
                selectedValue={city}
                search={locationSearch}
                setSearch={setLocationSearch}
                onSelect={setCity}
            />
        </section>
    );
}

export default function EditAdClient({ id }: { id: string }) {
    return (
        <Suspense fallback={<QotLoader />}>
            <EditAdForm id={id} />
        </Suspense>
    );
}
