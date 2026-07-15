"use client";

import { useEffect, useState } from "react";
import ListingImageManager from "@/components/dashboard/ListingImageManager";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type EditListingFormProps = {
    listingId: string;
};

export default function EditListingForm({ listingId }: EditListingFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("used");
    const [status, setStatus] = useState("active");

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadListing() {
            const token = localStorage.getItem("qot_access_token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/listings/${listingId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.detail ||
                        data?.message ||
                        data?.error ||
                        "Failed to load listing."
                    );
                }

                setTitle(data.title || "");
                setDescription(data.description || "");
                setPrice(data.price || "");
                setCondition(data.condition || "used");
                setStatus(data.status || "active");
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            } finally {
                setPageLoading(false);
            }
        }

        loadListing();
    }, [listingId]);

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
            const response = await fetch(`${API_BASE_URL}/listings/${listingId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    condition,
                    status,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Failed to update listing."
                );
            }

            window.location.href = "/my-ads";
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading listing...
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
                    rows={6}
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Price
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
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

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>


                <a
                    href="/my-ads"
                    className="rounded-xl border px-6 py-3 text-center font-semibold hover:bg-slate-50"
                >
                    Cancel
                </a>
            </div>
        </form>
    );
}