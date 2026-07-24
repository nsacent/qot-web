"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

type AdActionModalProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    loading?: boolean;
    destructive?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function AdActionModal({
    open,
    title,
    description,
    confirmLabel,
    loading = false,
    destructive = false,
    error = "",
    onClose,
    onConfirm,
}: AdActionModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ad-action-modal-title"
            onPointerDown={(event) => {
                if (event.target === event.currentTarget && !loading) onClose();
            }}
        >
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${destructive ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                        <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5" />
                    </span>
                    <button type="button" onClick={onClose} disabled={loading} aria-label="Close confirmation" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50">
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                    </button>
                </div>

                <h2 id="ad-action-modal-title" className="mt-5 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>

                {error && (
                    <div role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                        {error}
                    </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="h-12 rounded-[16px] bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={loading} className={`h-12 rounded-[16px] px-4 text-sm font-black text-white transition disabled:opacity-60 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}>
                        {loading ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
