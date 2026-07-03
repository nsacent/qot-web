"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type ReportListingButtonProps = {
    listingId: number | string;
};

export default function ReportListingButton({
    listingId,
}: ReportListingButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("fraud");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);

    async function submitReport() {
        const token = localStorage.getItem("qot_access_token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/listings/${listingId}/report/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason,
                        details,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    "Failed to submit report."
                );
            }

            alert(data?.detail || "Advert reported successfully.");
            setOpen(false);
            setDetails("");
            setReason("fraud");
        } catch (error: any) {
            alert(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
                Report this advert
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Report this advert
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Help us keep QOT safe by reporting suspicious or misleading
                                    adverts.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full border px-3 py-1 text-sm font-bold hover:bg-slate-50"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-5">
                            <label className="text-sm font-semibold text-slate-700">
                                Reason
                            </label>

                            <select
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                            >
                                <option value="fraud">Fraud or scam</option>
                                <option value="wrong_category">Wrong category</option>
                                <option value="fake_item">Fake item</option>
                                <option value="offensive">Offensive content</option>
                                <option value="duplicate">Duplicate advert</option>
                                <option value="sold_unavailable">
                                    Item sold or unavailable
                                </option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-semibold text-slate-700">
                                Details
                            </label>

                            <textarea
                                value={details}
                                onChange={(event) => setDetails(event.target.value)}
                                rows={4}
                                placeholder="Briefly explain the issue..."
                                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={submitReport}
                                disabled={loading}
                                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {loading ? "Submitting..." : "Submit Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}