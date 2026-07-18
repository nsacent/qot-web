"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; import { apiPost } from "@/lib/apiClient";
import { getStoredToken } from "@/lib/auth";

const reasons = [
    {
        value: "scam",
        label: "Scam or fraud",
    },
    {
        value: "fake",
        label: "Fake item or misleading advert",
    },
    {
        value: "wrong_price",
        label: "Wrong or misleading price",
    },
    {
        value: "sold",
        label: "Item already sold",
    },
    {
        value: "suspicious_seller",
        label: "Suspicious seller",
    },
    {
        value: "offensive",
        label: "Offensive or inappropriate content",
    },
    {
        value: "duplicate",
        label: "Duplicate advert",
    },
    {
        value: "other",
        label: "Other issue",
    },
];

export default function SafetyReportClient() {
    const [listingId, setListingId] = useState("");
    const [reason, setReason] = useState("scam");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const searchParams = useSearchParams();

    useEffect(() => {
        const listing = searchParams.get("listing");

        if (listing) {
            setListingId(listing);
        }
    }, [searchParams]);

    async function submitReport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const token = getStoredToken();

        if (!token) {
            window.location.href = "/login?next=/safety/report";
            return;
        }

        if (!listingId.trim()) {
            setError("Please enter the listing ID.");
            return;
        }

        if (!description.trim()) {
            setError("Please describe the problem.");
            return;
        }

        setLoading(true);

        try {
            await apiPost(`/listings/${listingId.trim()}/report/`, {
                reason,
                description,
            });

            setSuccess(
                "Report submitted successfully. The QOT moderation team will review it."
            );

            setListingId("");
            setReason("scam");
            setDescription("");
        } catch (error: any) {
            setError(error.message || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Buyer Safety
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
                    Report a suspicious advert
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Help keep QOT safe by reporting fake adverts, scams, misleading
                    prices, and suspicious seller behaviour.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <form
                    onSubmit={submitReport}
                    className="rounded-2xl border bg-white p-6 shadow-sm md:p-8"
                >
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Listing ID
                        </label>

                        <input
                            value={listingId}
                            onChange={(event) => setListingId(event.target.value)}
                            placeholder="Example: 74"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            You can get the listing ID from the advert page URL, for example:
                            /listings/74.
                        </p>
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Reason
                        </label>

                        <select
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        >
                            {reasons.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Describe the problem
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={6}
                            placeholder="Explain what looks suspicious, fake, misleading, or unsafe..."
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? "Submitting report..." : "Submit Report"}
                    </button>
                </form>

                <aside className="space-y-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Safety Tips
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Stay safe while buying
                        </h2>

                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <li>• Meet sellers in safe public places.</li>
                            <li>• Inspect the item before paying.</li>
                            <li>• Avoid sending money before seeing the item.</li>
                            <li>• Be careful with very cheap prices.</li>
                            <li>• Report sellers who pressure you quickly.</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Quick Actions
                        </p>

                        <div className="mt-4 grid gap-3">
                            <a
                                href="/listings"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Browse Listings
                            </a>

                            <a
                                href="/account/saved"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Saved Adverts
                            </a>

                            <a
                                href="/messages"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Messages
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
