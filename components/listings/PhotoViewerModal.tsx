"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faRotateLeft,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type PhotoViewerModalProps = {
    open: boolean;
    imageUrl: string;
    title?: string;
    onClose: () => void;
};

export default function PhotoViewerModal({
    open,
    imageUrl,
    title = "Photo preview",
    onClose,
}: PhotoViewerModalProps) {
    const [zoom, setZoom] = useState(1);
    const closeRef = useRef(onClose);

    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;

        setZoom(1);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") closeRef.current();
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [imageUrl, open]);

    if (!open || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950/95 text-white" role="dialog" aria-modal="true" aria-label={title}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">Photo viewer</p>
                    <h2 className="mt-1 truncate text-sm font-black sm:text-base">{title}</h2>
                </div>
                <button type="button" onClick={onClose} aria-label="Close photo viewer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
                <img
                    src={imageUrl}
                    alt={title}
                    draggable={false}
                    className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
                    style={{ transform: `scale(${zoom})` }}
                />
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-slate-950/90 px-4 py-3">
                <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} disabled={zoom <= 1} aria-label="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-35">
                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="h-4 w-4" />
                </button>
                <span className="min-w-16 text-center text-xs font-black">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} disabled={zoom >= 3} aria-label="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-35">
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom" className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 transition hover:bg-orange-600">
                    <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
