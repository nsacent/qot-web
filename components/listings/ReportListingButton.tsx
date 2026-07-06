"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";

type ReportListingButtonProps = {
    listingId: number | string;
};

const REPORT_REASONS = [
    { label: "Scam or fraud", value: "scam" },
    { label: "Fake item", value: "fake" },
    { label: "Duplicate advert", value: "duplicate" },
    { label: "Wrong category", value: "wrong_category" },
    { label: "Offensive content", value: "offensive" },
    { label: "Already sold", value: "sold" },
    { label: "Other issue", value: "other" },
];

export default function ReportListingButton({
    listingId,
}: ReportListingButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("scam");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    async function submitReport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setSuccess("");

        try {
            await apiPost(`/listings/${listingId}/report/`, {
                reason,
                description,
            });

            setSuccess("Report submitted successfully. Thank you for helping keep QOT safe.");
            setDescription("");

            setTimeout(() => {
                setOpen(false);
                setSuccess("");
            }, 1800);
        } catch (error: any) {
            alert(error.message || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
            >
                Report Advert
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-bold text-red-800">Report this advert</h3>
                    <p className="mt-1 text-sm text-red-700">
                        Tell us what looks wrong with this listing.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-red-700 hover:bg-red-100"
                >
                    ✕
                </button>
            </div>

            {success ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                    {success}
                </div>
            ) : (
                <form onSubmit={submitReport} className="mt-4 space-y-3">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-red-800">
                            Reason
                        </label>

                        <select
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-red-500"
                        >
                            {REPORT_REASONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-red-800">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Explain the issue briefly..."
                            rows={4}
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-red-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </form>
            )}
        </div>
    );
}