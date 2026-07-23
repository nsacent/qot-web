"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faEye,
    faImages,
    faLocationDot,
    faShieldHalved,
    faTag,
} from "@fortawesome/free-solid-svg-icons";
import ListingImageCarousel from "@/components/listings/ListingImageCarousel";

export type AdPreviewDetail = {
    label: string;
    value: string;
};

type AdPreviewPanelProps = {
    images: Array<{ id?: string | number; url: string; isPrimary?: boolean }>;
    title: string;
    price: string;
    category: string;
    location: string;
    condition: string;
    description: string;
    isNegotiable?: boolean;
    details?: AdPreviewDetail[];
    mode?: "create" | "edit";
};

function cleanLabel(value: string) {
    if (!value) return "Not specified";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdPreviewPanel({
    images,
    title,
    price,
    category,
    location,
    condition,
    description,
    isNegotiable = false,
    details = [],
    mode = "create",
}: AdPreviewPanelProps) {
    const previewListing = useMemo(
        () => ({
            id: `preview-${mode}`,
            images: images.map((image, index) => ({
                id: image.id || `preview-${index}`,
                image: image.url,
                is_primary: image.isPrimary || (!images.some((item) => item.isPrimary) && index === 0),
            })),
        }),
        [images, mode]
    );

    const visibleDetails = details.filter((detail) => detail.value);

    return (
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
            <header className="flex flex-col gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                            Buyer preview
                        </p>
                        <h2 className="mt-0.5 text-lg font-black text-slate-950">
                            This is how your ad will appear
                        </h2>
                    </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Preview only · not live
                </span>
            </header>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
                <div className="min-w-0 border-b border-slate-100 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                    <ListingImageCarousel
                        listing={previewListing}
                        title={title || "Ad photo"}
                    />

                    <div className="mt-6 rounded-[22px] bg-slate-50 p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-orange-500 ring-1 ring-slate-100">
                                <FontAwesomeIcon icon={faImages} className="h-3.5 w-3.5" />
                            </div>
                            <h3 className="text-base font-black text-slate-950">Description</h3>
                        </div>
                        <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                            {description || "No description provided."}
                        </p>
                    </div>

                    {visibleDetails.length > 0 && (
                        <div className="mt-5">
                            <h3 className="text-sm font-black text-slate-950">Ad details</h3>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {visibleDetails.map((detail) => (
                                    <div
                                        key={`${detail.label}-${detail.value}`}
                                        className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                            {detail.label}
                                        </p>
                                        <p className="mt-1 break-words text-sm font-black text-slate-800">
                                            {detail.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="p-5 sm:p-6">
                    <div className="lg:sticky lg:top-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-orange-600 ring-1 ring-orange-100">
                                {category || "Category"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-green-700 ring-1 ring-green-100">
                                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                                Available
                            </span>
                        </div>

                        <h3 className="mt-5 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                            {title || "Untitled ad"}
                        </h3>
                        <p className="mt-4 text-2xl font-black text-orange-600 sm:text-3xl">
                            {price}
                        </p>

                        {isNegotiable && (
                            <p className="mt-1 text-xs font-black uppercase tracking-wide text-green-700">
                                Price is negotiable
                            </p>
                        )}

                        <div className="mt-6 space-y-2.5">
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-500 ring-1 ring-slate-100">
                                    <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Location</p>
                                    <p className="truncate text-sm font-black text-slate-800">{location || "Uganda"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-500 ring-1 ring-slate-100">
                                    <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Condition</p>
                                    <p className="text-sm font-black text-slate-800">{cleanLabel(condition)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-2">
                            <div className="flex h-12 items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-white opacity-90">
                                Call seller
                            </div>
                            <div className="flex h-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white opacity-90">
                                Message
                            </div>
                        </div>
                        <p className="mt-2 text-center text-[10px] font-bold text-slate-400">
                            Buyer contact buttons shown for preview
                        </p>

                        <div className="mt-6 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-green-800">
                            <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0" />
                            <p className="text-xs font-bold leading-5">
                                QOT safety tips and seller information will appear on the public ad page.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
