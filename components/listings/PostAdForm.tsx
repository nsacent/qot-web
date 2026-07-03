"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function PostAdForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [condition, setCondition] = useState("used");
    const [images, setImages] = useState<File[]>([]);

    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFormData() {
            try {
                const [categoriesResponse, citiesResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/categories/`),
                    fetch(`${API_BASE_URL}/locations/cities/`),
                ]);

                const categoriesData = await categoriesResponse.json();
                const citiesData = await citiesResponse.json();

                setCategories(
                    Array.isArray(categoriesData)
                        ? categoriesData
                        : categoriesData.results || categoriesData.data || []
                );

                setCities(
                    Array.isArray(citiesData)
                        ? citiesData
                        : citiesData.results || citiesData.data || []
                );
            } catch (err) {
                console.error("Failed to load form data:", err);
            } finally {
                setPageLoading(false);
            }
        }

        loadFormData();
    }, []);

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || []);

        if (selectedFiles.length > 6) {
            setError("You can upload a maximum of 6 images.");
            return;
        }

        setImages(selectedFiles);
    }

    async function uploadImages(listingId: number | string, token: string) {
        if (images.length === 0) return;

        for (const image of images) {
            const formData = new FormData();
            formData.append("image", image);

            const response = await fetch(
                `${API_BASE_URL}/listings/${listingId}/images/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Listing was created, but image upload failed."
                );
            }
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    category,
                    city,
                    condition,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to post advert."
                );
            }

            const listingId = data?.id || data?.data?.id;

            if (listingId) {
                await uploadImages(listingId, token);
                window.location.href = `/listings/${listingId}`;
            } else {
                window.location.href = "/listings";
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading form...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Advert Title
                </label>
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Example: HP EliteBook Core i5"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the item, condition, features, and location..."
                    rows={6}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Price
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="Example: 850000"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Condition
                    </label>
                    <select
                        value={condition}
                        onChange={(event) => setCondition(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map((item: any) => (
                            <option key={item.id || item.slug} value={item.id}>
                                {item.name || item.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        City
                    </label>
                    <select
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        required
                    >
                        <option value="">Select city</option>
                        {cities.map((item: any) => (
                            <option key={item.id || item.slug} value={item.id}>
                                {item.name || item.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Upload Images
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-2 text-sm text-slate-500">
                    You can upload up to 6 images.
                </p>

                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-xl border bg-slate-100"
                            >
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index + 1}`}
                                    className="h-32 w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Posting advert..." : "Post Advert"}
            </button>
        </form>
    );
}