"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faFlag,
    faPaperPlane,
    faShieldHalved,
    faTriangleExclamation,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { REPORT_REASONS } from "@/lib/reportReasons";

type ReportListingButtonProps = {
    listingId: string | number;
    listing?: any;
    compact?: boolean;
};

async function checkIfOwner(listingId: string | number) {
    try {
        const response = await fetch(`/api/proxy/seller/listings/${listingId}/`, {
            credentials: "include",
            cache: "no-store",
        });

        return response.ok;
    } catch {
        return false;
    }
}

async function readApiError(response: Response) {
    const text = await response.text();

    if (!text) return "Something went wrong. Please try again.";

    try {
        const data = JSON.parse(text);

        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        const firstKey = Object.keys(data || {})[0];
        const firstValue = firstKey ? data[firstKey] : "";

        if (Array.isArray(firstValue)) return firstValue[0];
        if (typeof firstValue === "string") return firstValue;

        return "Something went wrong. Please try again.";
    } catch {
        return text;
    }
}

export default function ReportListingButton({
    listingId,
    compact = false,
}: ReportListingButtonProps) {
    const [mounted, setMounted] = useState(false);
    const [checkingOwner, setCheckingOwner] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("scam");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let mountedCheck = true;

        async function runCheck() {
            setCheckingOwner(true);

            const ownsListing = await checkIfOwner(listingId);

            if (!mountedCheck) return;

            setIsOwner(ownsListing);
            setCheckingOwner(false);
        }

        runCheck();

        return () => {
            mountedCheck = false;
        };
    }, [listingId]);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [open]);

    function closeModal() {
        if (loading) return;

        setOpen(false);
        setError("");
        setSuccess("");
    }

    async function submitReport(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!description.trim()) {
            setError("Please describe the problem with this advert.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/proxy/listings/${listingId}/report/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason,
                    description: description.trim(),
                }),
            });

            if (response.status === 401) {
                window.location.href = `/login?next=/ads/${listingId}`;
                return;
            }

            if (!response.ok) {
                throw new Error(await readApiError(response));
            }

            setSuccess("Report submitted successfully. QOT will review this advert.");
            setDescription("");
            setReason("scam");
        } catch (error: any) {
            setError(error?.message || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    }

    if (checkingOwner || isOwner) return null;

    const buttonClass = compact
        ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
        : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-red-50 px-4 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100";

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={buttonClass}
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600 ring-1 ring-red-100">
                    <FontAwesomeIcon icon={faFlag} className="h-3.5 w-3.5" />
                </span>

                Report Ad
            </button>
            {mounted && open
                ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
                        <div
                            className="absolute inset-0"
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        <div className="relative w-full max-w-lg overflow-hidden rounded-[34px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                        <FontAwesomeIcon icon={faFlag} className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-slate-950">
                                            Report this ad
                                        </h2>
                                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                            Tell QOT what looks suspicious, fake, or misleading.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </button>
                            </div>

                            {success ? (
                                <div className="p-6">
                                    <div className="rounded-[26px] bg-green-50 p-5 text-center ring-1 ring-green-100">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
                                            <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                                        </div>

                                        <p className="mt-4 text-lg font-black text-slate-950">
                                            Report received
                                        </p>

                                        <p className="mt-2 text-sm font-bold leading-6 text-green-700">
                                            {success}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitReport} className="p-6">
                                    <div className="rounded-[24px] bg-red-50 p-4 ring-1 ring-red-100">
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-600">
                                                <FontAwesomeIcon
                                                    icon={faTriangleExclamation}
                                                    className="h-4 w-4"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-black text-slate-950">
                                                    Help keep QOT safe
                                                </p>
                                                <p className="mt-1 text-sm font-bold leading-6 text-red-700">
                                                    Do not report an ad just because the price is high.
                                                    Report only suspicious or misleading adverts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-black text-slate-800">
                                            Reason
                                        </label>

                                        <select
                                            value={reason}
                                            onChange={(event) => setReason(event.target.value)}
                                            className="h-12 w-full rounded-[18px] border-0 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-red-200"
                                        >
                                            {REPORT_REASONS.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-black text-slate-800">
                                            Description
                                        </label>

                                        <textarea
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            rows={5}
                                            placeholder="Explain the issue clearly..."
                                            className="w-full resize-none rounded-[18px] border-0 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-red-200"
                                        />
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-red-600 px-4 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                                        >
                                            <FontAwesomeIcon
                                                icon={loading ? faShieldHalved : faPaperPlane}
                                                className="h-4 w-4"
                                            />
                                            {loading ? "Submitting..." : "Submit Report"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>,
                    document.body
                )
                : null}
        </>
    );
}
