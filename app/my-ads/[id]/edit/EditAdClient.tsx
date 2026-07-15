"use client";

import { Suspense, useEffect, useState } from "react";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";

export default function EditAdClientWrapper({ id }: { id: string }) {
    return (
        <Suspense fallback={<QotLoader />}>
            <EditAdClient id={id} />
        </Suspense>
    );
}



function EditAdClient({ id }: { id: string }) {
    const [checkingSession, setCheckingSession] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [ad, setAd] = useState<any>(null);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function checkSession() {
        try {
            await getCurrentUser();
            setCheckingSession(false);
        } catch {
            window.location.href = `/login?next=/my-ads/${id}`;
        }
    }

    async function loadAd() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/proxy/listings/${id}/`, {
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/my-ads/${id}`;
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to load ad.");
            }

            const listing = data?.listing || data?.data || data;

            setAd(listing);
            setTitle(listing?.title || "");
            setPrice(String(listing?.price || ""));
            setDescription(listing?.description || "");
        } catch (err: any) {
            setError(err.message || "Failed to load ad.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (!checkingSession) {
            loadAd();
        }
    }, [checkingSession]);

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
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || "Failed to update ad.");
            }

            await loadAd();
            setMessage("Ad updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to update ad.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this ad? This action cannot be undone."
        );

        if (!confirmed) return;

        setDeleting(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/proxy/listings/${id}/`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok && response.status !== 204) {
                const data = await response.json().catch(async () => {
                    const text = await response.text().catch(() => "");
                    return { detail: text ? "This ad endpoint was not found." : "Failed to load ad." };
                });

                throw new Error(data?.detail || data?.message || "Failed to delete ad.");
            }

            window.location.href = "/my-ads";
        } catch (err: any) {
            setError(err.message || "Failed to delete ad.");
        } finally {
            setDeleting(false);
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
                        Could not load ad
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
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="rounded-[34px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                    <a
                        href="/my-ads"
                        className="text-sm font-black text-orange-600 hover:text-orange-700"
                    >
                        ← Back to My Ads
                    </a>

                    <div className="mt-6 rounded-[28px] bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Current ad
                        </p>

                        <h1 className="mt-2 text-2xl font-black text-slate-950">
                            {ad?.title || "Untitled Ad"}
                        </h1>

                        <p className="mt-2 text-sm font-bold text-slate-500">
                            Status:{" "}
                            <span className="capitalize text-slate-800">
                                {String(ad?.status || ad?.approval_status || "active").replaceAll(
                                    "_",
                                    " "
                                )}
                            </span>
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3">
                        <a
                            href={`/listings/${id}`}
                            className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            View Public Ad
                        </a>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deleting ? "Deleting..." : "Delete Ad"}
                        </button>
                    </div>
                </aside>

                <div className="rounded-[34px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-8">
                    <h2 className="text-3xl font-black text-slate-950">Manage Ad</h2>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                        Update your ad title, price, and description.
                    </p>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="mt-7 space-y-4">
                        <label className="block">
                            <span className="mb-2 block text-sm font-black text-slate-700">
                                Ad title
                            </span>

                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-black text-slate-700">
                                Price
                            </span>

                            <input
                                type="text"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                placeholder="Example: 450000"
                                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200"
                            />
                        </label>

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

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

