"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowsUpDownLeftRight,
    faCropSimple,
    faMagnifyingGlassPlus,
    faRotateLeft,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type PhotoCrop = {
    x: number;
    y: number;
    zoom: number;
};

type PhotoCropModalProps = {
    open: boolean;
    sourceUrl: string;
    title?: string;
    initialCrop?: PhotoCrop;
    isSaving?: boolean;
    onCancel: () => void;
    onConfirm: (crop: PhotoCrop) => void | Promise<void>;
};

const DEFAULT_CROP: PhotoCrop = { x: 0.5, y: 0.5, zoom: 1 };

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(Math.max(value, minimum), maximum);
}

export default function PhotoCropModal({
    open,
    sourceUrl,
    title = "Position your photo",
    initialCrop = DEFAULT_CROP,
    isSaving = false,
    onCancel,
    onConfirm,
}: PhotoCropModalProps) {
    const [crop, setCrop] = useState<PhotoCrop>(initialCrop);
    const dragStart = useRef<{
        pointerX: number;
        pointerY: number;
        cropX: number;
        cropY: number;
    } | null>(null);

    useEffect(() => {
        if (!open) return;

        setCrop({
            x: clamp(initialCrop.x, 0, 1),
            y: clamp(initialCrop.y, 0, 1),
            zoom: clamp(initialCrop.zoom, 1, 2.5),
        });
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [initialCrop.x, initialCrop.y, initialCrop.zoom, open, sourceUrl]);

    if (!open || !sourceUrl) return null;

    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
        if (isSaving) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            cropX: crop.x,
            cropY: crop.y,
        };
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        if (!dragStart.current || isSaving) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const horizontalChange = (event.clientX - dragStart.current.pointerX) / bounds.width;
        const verticalChange = (event.clientY - dragStart.current.pointerY) / bounds.height;

        setCrop((current) => ({
            ...current,
            x: clamp(dragStart.current!.cropX - (horizontalChange / current.zoom), 0, 1),
            y: clamp(dragStart.current!.cropY - (verticalChange / current.zoom), 0, 1),
        }));
    }

    function stopDragging(event: PointerEvent<HTMLDivElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragStart.current = null;
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-crop-title"
        >
            <div className="flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[30px]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Photo quality
                        </p>
                        <h2 id="photo-crop-title" className="mt-1 truncate text-xl font-black text-slate-950">
                            {title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        aria-label="Close photo crop"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-5 sm:px-6">
                    <div
                        className="relative mx-auto aspect-[4/3] w-full max-w-2xl touch-none cursor-move overflow-hidden rounded-[24px] bg-slate-950 ring-1 ring-black/10"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={stopDragging}
                        onPointerCancel={stopDragging}
                    >
                        <img
                            src={sourceUrl}
                            alt="Photo crop preview"
                            draggable={false}
                            className="pointer-events-none h-full w-full select-none object-cover transition-transform duration-75"
                            style={{
                                objectPosition: `${crop.x * 100}% ${crop.y * 100}%`,
                                transform: `scale(${crop.zoom})`,
                                transformOrigin: `${crop.x * 100}% ${crop.y * 100}%`,
                            }}
                        />
                        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <span key={index} className="border border-white/20" />
                            ))}
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur">
                                <FontAwesomeIcon icon={faArrowsUpDownLeftRight} className="h-3 w-3" />
                                Drag to position
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[20px] bg-slate-50 p-4 ring-1 ring-slate-100">
                        <label className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-orange-500 ring-1 ring-slate-200">
                                <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between text-xs font-black text-slate-700">
                                    <span>Zoom</span>
                                    <span>{crop.zoom.toFixed(1)}×</span>
                                </span>
                                <input
                                    type="range"
                                    min="1"
                                    max="2.5"
                                    step="0.05"
                                    value={crop.zoom}
                                    onChange={(event) => setCrop((current) => ({
                                        ...current,
                                        zoom: Number(event.target.value),
                                    }))}
                                    disabled={isSaving}
                                    className="mt-2 w-full accent-orange-500"
                                />
                            </span>
                        </label>
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-orange-50 px-4 py-3 text-xs font-semibold leading-5 text-orange-900 ring-1 ring-orange-100">
                        <FontAwesomeIcon icon={faCropSimple} className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        QOT will create an optimized 4:3 marketplace image and a separate WhatsApp preview while keeping the complete photo for the full viewer.
                    </div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:justify-end sm:px-6">
                    <button
                        type="button"
                        onClick={() => setCrop(DEFAULT_CROP)}
                        disabled={isSaving}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(crop)}
                        disabled={isSaving}
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60 sm:flex-none"
                    >
                        <FontAwesomeIcon icon={faCropSimple} className="h-4 w-4" />
                        {isSaving ? "Optimizing..." : "Use this crop"}
                    </button>
                </div>
            </div>
        </div>
    );
}
