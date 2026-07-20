"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faCircleExclamation,
    faShieldHalved,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type AdminModalField = {
    key: string;
    label: string;
    type?: "text" | "number" | "textarea";
    placeholder?: string;
    helper?: string;
    required?: boolean;
    min?: number;
    max?: number;
};

export default function AdminActionModal({
    title,
    description,
    confirmLabel,
    tone = "orange",
    fields = [],
    values = {},
    error = "",
    loading = false,
    onChange,
    onConfirm,
    onClose,
}: {
    title: string;
    description: string;
    confirmLabel: string;
    tone?: "orange" | "green" | "red";
    fields?: AdminModalField[];
    values?: Record<string, string>;
    error?: string;
    loading?: boolean;
    onChange?: (key: string, value: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !loading) onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [loading, onClose]);

    const tones = {
        orange: {
            icon: "bg-orange-50 text-orange-600",
            button: "bg-orange-500 hover:bg-orange-600 shadow-orange-100",
        },
        green: {
            icon: "bg-emerald-50 text-emerald-600",
            button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
        },
        red: {
            icon: "bg-red-50 text-red-600",
            button: "bg-red-600 hover:bg-red-700 shadow-red-100",
        },
    };

    const activeTone = tones[tone];
    const modalIcon = tone === "green" ? faCircleCheck : tone === "red" ? faCircleExclamation : faShieldHalved;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
            <button
                type="button"
                aria-label="Close dialog"
                onClick={loading ? undefined : onClose}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-modal-title"
                className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.30)] ring-1 ring-white/70"
            >
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeTone.icon}`}>
                            <FontAwesomeIcon icon={modalIcon} className="h-5 w-5" />
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close dialog"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <h2 id="admin-modal-title" className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {description}
                    </p>

                    {fields.length > 0 && (
                        <div className="mt-5 grid gap-4">
                            {fields.map((field, index) => (
                                <label key={field.key} className="block">
                                    <span className="mb-2 block text-xs font-black text-slate-700">
                                        {field.label}
                                        {field.required && <span className="ml-1 text-red-500">*</span>}
                                    </span>

                                    {field.type === "textarea" ? (
                                        <textarea
                                            value={values[field.key] || ""}
                                            onChange={(event) => onChange?.(field.key, event.target.value)}
                                            placeholder={field.placeholder}
                                            rows={4}
                                            autoFocus={index === 0}
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                                        />
                                    ) : (
                                        <input
                                            type={field.type || "text"}
                                            value={values[field.key] || ""}
                                            onChange={(event) => onChange?.(field.key, event.target.value)}
                                            placeholder={field.placeholder}
                                            min={field.min}
                                            max={field.max}
                                            autoFocus={index === 0}
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                                        />
                                    )}

                                    {field.helper && (
                                        <span className="mt-1.5 block text-[11px] font-semibold text-slate-400">
                                            {field.helper}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
                            <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:px-7 sm:py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-2xl px-4 py-3 text-xs font-black text-white shadow-lg transition disabled:cursor-wait disabled:opacity-60 ${activeTone.button}`}
                    >
                        {loading ? "Please wait…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
