"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function PostAdForm() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [condition, setCondition] = useState("used");

    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const [showPreview, setShowPreview] = useState(false);
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
        const selected = categories.find(
            (item: any) => String(item.id) === String(category)
        );

        return selected?.name || selected?.title || "Not selected";
    }

    function getSelectedCityName() {
        const selected = cities.find((item: any) => String(item.id) === String(city));

        return selected?.name || selected?.title || "Not selected";
    }

    function formatPrice() {
        if (!price) return "Contact seller";

        return `UGX ${Number(price).toLocaleString()}`;
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

    function handlePreview(event: React.FormEvent<HTMLFormElement>) {
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

        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            router.push("/login?next=/post-ad");
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

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to post advert."
                );
            }

            const createdListingId = getCreatedListingId(data);

            if (createdListingId) {
                router.push(`/my-ads/${createdListingId}/edit?images=1`);
                return;
            }

            router.push("/my-ads");
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setShowPreview(false);
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

    if (showPreview) {
        return (
            <section className="space-y-6">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Advert Preview
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        Review before posting
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Confirm that all details are correct before submitting your advert.
                    </p>
                </div>

                <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="bg-slate-950 p-6 text-white">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                            Preview
                        </p>

                        <h3 className="mt-2 text-3xl font-black">{title}</h3>

                        <p className="mt-3 text-2xl font-bold text-orange-300">
                            {formatPrice()}
                        </p>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-500">Category</p>
                            <p className="mt-1 font-bold text-slate-900">
                                {getSelectedCategoryName()}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-500">City</p>
                            <p className="mt-1 font-bold text-slate-900">
                                {getSelectedCityName()}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-500">Condition</p>
                            <p className="mt-1 font-bold capitalize text-slate-900">
                                {condition}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-500">Price</p>
                            <p className="mt-1 font-bold text-slate-900">{formatPrice()}</p>
                        </div>
                    </div>

                    <div className="border-t p-6">
                        <p className="text-sm font-semibold text-slate-500">Description</p>

                        <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
                            {description}
                        </p>
                    </div>
                </article>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
                    <p className="font-bold">Images come after posting.</p>

                    <p className="mt-1 text-sm">
                        After submitting, you will be redirected to the edit page where you
                        can upload images and choose the primary image.
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
                        className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                        Back to Edit
                    </button>

                    <button
                        type="button"
                        onClick={submitAdvert}
                        disabled={loading}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? "Submitting advert..." : "Submit Advert"}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <form onSubmit={handlePreview} className="space-y-6">
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

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
                <p className="font-bold">You will preview before posting.</p>

                <p className="mt-1">
                    First review your advert details. After submitting, you will upload
                    advert images on the edit page.
                </p>
            </div>

            <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
                Preview Advert
            </button>
        </form>
    );
}