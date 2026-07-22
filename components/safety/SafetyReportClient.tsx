"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faFlag,
    faPaperPlane,
    faShieldHalved,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { apiPost } from "@/lib/apiClient";
import { REPORT_REASONS } from "@/lib/reportReasons";

const safetyTips = [
    "Meet sellers in a safe public place.",
    "Inspect the item before you pay.",
    "Avoid sending deposits before seeing the item.",
    "Keep conversations inside QOT whenever possible.",
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

        if (listing) setListingId(listing);
    }, [searchParams]);

    async function submitReport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!listingId.trim()) {
            setError("Please enter the ad ID.");
            return;
        }

        if (!description.trim()) {
            setError("Please describe the problem clearly.");
            return;
        }

        setLoading(true);

        try {
            await apiPost(`/listings/${listingId.trim()}/report/`, {
                reason,
                description: description.trim(),
            });

            setSuccess("Your report has been sent to the QOT moderation team.");
            setDescription("");
            setReason("scam");
        } catch (error: any) {
            setError(error.message || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="py-3 sm:py-6">
            <header className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-5 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
                <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative flex max-w-3xl items-start gap-4 sm:gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-950/30 sm:h-14 sm:w-14">
                        <FontAwesomeIcon icon={faFlag} className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">
                            QOT Safety Centre
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Report a suspicious ad.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                            Tell us what looks unsafe, fake, prohibited, or misleading. Every report helps protect buyers and sellers across Uganda.
                        </p>
                    </div>
                </div>
            </header>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <form
                    onSubmit={submitReport}
                    className="rounded-[34px] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] ring-1 ring-black/5 sm:p-7"
                >
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Report details</h2>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                                Give our moderation team enough detail to investigate.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3.5 text-sm font-bold leading-6 text-red-700 ring-1 ring-red-100">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div role="status" className="mt-5 flex gap-3 rounded-2xl bg-green-50 px-4 py-4 text-green-700 ring-1 ring-green-100">
                            <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-sm font-black">Report received</p>
                                <p className="mt-1 text-xs font-bold leading-5">{success}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <label htmlFor="report-ad-id" className="mb-2 block text-sm font-black text-slate-800">
                            Ad ID
                        </label>
                        <input
                            id="report-ad-id"
                            inputMode="numeric"
                            value={listingId}
                            onChange={(event) => setListingId(event.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="For example: 74"
                            required
                            className="h-12 w-full rounded-2xl border-0 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-red-200"
                        />
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                            The ad ID is the number at the end of its URL, such as <span className="font-black text-slate-700">/ads/74</span>.
                        </p>
                    </div>

                    <fieldset className="mt-6">
                        <legend className="text-sm font-black text-slate-800">What is wrong with this ad?</legend>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {REPORT_REASONS.map((item) => {
                                const selected = reason === item.value;

                                return (
                                    <label
                                        key={item.value}
                                        className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-black transition ring-1 ${selected
                                            ? "bg-red-50 text-red-700 ring-red-200"
                                            : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-orange-50 hover:ring-orange-100"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="report-reason"
                                            value={item.value}
                                            checked={selected}
                                            onChange={() => setReason(item.value)}
                                            className="sr-only"
                                        />
                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ${selected ? "bg-red-600 ring-red-600" : "bg-white ring-slate-300"}`}>
                                            {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                        </span>
                                        {item.label}
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div className="mt-6">
                        <label htmlFor="report-description" className="mb-2 block text-sm font-black text-slate-800">
                            Describe the problem
                        </label>
                        <textarea
                            id="report-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={5}
                            maxLength={1000}
                            placeholder="Explain what you noticed and why the ad may be unsafe..."
                            required
                            className="w-full resize-none rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-900 outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-red-200"
                        />
                        <p className="mt-1 text-right text-[10px] font-bold text-slate-400">
                            {description.length}/1000
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(220,38,38,0.20)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FontAwesomeIcon icon={loading ? faShieldHalved : faPaperPlane} className="h-4 w-4" />
                        {loading ? "Submitting Report..." : "Submit Report"}
                    </button>
                </form>

                <aside className="grid gap-5 lg:sticky lg:top-24">
                    <section className="rounded-[30px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
                        </span>
                        <h2 className="mt-5 text-xl font-black text-slate-950">Stay safe while buying</h2>
                        <ul className="mt-5 grid gap-3">
                            {safetyTips.map((tip) => (
                                <li key={tip} className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mt-1.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">What happens next</p>
                        <h2 className="mt-3 text-xl font-black">We review every report.</h2>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                            QOT may restrict, reject, or remove an ad when it breaks marketplace rules. Honest reports help us act faster.
                        </p>
                        <a
                            href="/ads"
                            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-xs font-black text-slate-950 hover:bg-orange-50"
                        >
                            Return to Ads
                        </a>
                    </section>
                </aside>
            </div>
        </section>
    );
}
