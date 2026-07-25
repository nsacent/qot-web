"use client";

import {
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faCropSimple,
    faRotateRight,
    faRotateLeft,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type CropRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type StageSize = { width: number; height: number };
type CropHandle = "move" | "nw" | "ne" | "sw" | "se";

type PhotoCropModalProps = {
    open: boolean;
    sourceUrl: string;
    sourceName?: string;
    title?: string;
    isSaving?: boolean;
    onCancel: () => void;
    onConfirm: (file: File) => void | Promise<void>;
};

const CROP_RATIO = 4 / 3;
const MIN_CROP_WIDTH = 96;

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(Math.max(value, minimum), maximum);
}

function getRotatedSize(image: HTMLImageElement, rotation: number) {
    const sideways = Math.abs(rotation % 180) === 90;
    return {
        width: sideways ? image.naturalHeight : image.naturalWidth,
        height: sideways ? image.naturalWidth : image.naturalHeight,
    };
}

function getImageBounds(
    image: HTMLImageElement,
    stage: StageSize,
    rotation: number,
) {
    const rotated = getRotatedSize(image, rotation);
    const scale = Math.min(
        (stage.width * 0.94) / rotated.width,
        (stage.height * 0.94) / rotated.height,
    );
    const width = rotated.width * scale;
    const height = rotated.height * scale;

    return {
        x: (stage.width - width) / 2,
        y: (stage.height - height) / 2,
        width,
        height,
        scale,
    };
}

function getInitialCrop(
    image: HTMLImageElement,
    stage: StageSize,
    rotation: number,
): CropRect {
    const bounds = getImageBounds(image, stage, rotation);
    const maximumWidth = Math.min(bounds.width, bounds.height * CROP_RATIO);
    const width = maximumWidth * 0.88;
    const height = width / CROP_RATIO;

    return {
        x: bounds.x + ((bounds.width - width) / 2),
        y: bounds.y + ((bounds.height - height) / 2),
        width,
        height,
    };
}

function drawPreview(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    stage: StageSize,
    rotation: number,
) {
    const bounds = getImageBounds(image, stage, rotation);

    context.save();
    context.fillStyle = "#020617";
    context.fillRect(0, 0, stage.width, stage.height);
    context.translate(stage.width / 2, stage.height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(bounds.scale, bounds.scale);
    context.drawImage(
        image,
        -(image.naturalWidth / 2),
        -(image.naturalHeight / 2),
        image.naturalWidth,
        image.naturalHeight,
    );
    context.restore();
}

function canvasToFile(canvas: HTMLCanvasElement, sourceName: string) {
    return new Promise<File>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("The cropped photo could not be created."));
                    return;
                }

                const baseName = sourceName.replace(/\.[^.]+$/, "") || "qot-photo";
                resolve(new File([blob], `${baseName}-cropped.jpg`, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                }));
            },
            "image/jpeg",
            0.92,
        );
    });
}

export default function PhotoCropModal({
    open,
    sourceUrl,
    sourceName = "qot-photo.jpg",
    title = "Crop photo",
    isSaving = false,
    onCancel,
    onConfirm,
}: PhotoCropModalProps) {
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gestureRef = useRef<{
        handle: CropHandle;
        pointerX: number;
        pointerY: number;
        grabOffsetX: number;
        grabOffsetY: number;
        crop: CropRect;
    } | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
    const [rotation, setRotation] = useState(0);
    const [crop, setCrop] = useState<CropRect | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSaving) onCancel();
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isSaving, onCancel, open]);

    useEffect(() => {
        if (!open || !sourceUrl) return;

        let active = true;
        setImage(null);
        setCrop(null);
        setRotation(0);
        setError("");
        const nextImage = new Image();
        nextImage.crossOrigin = "anonymous";
        nextImage.onload = () => {
            if (active) setImage(nextImage);
        };
        nextImage.onerror = () => {
            if (!active) return;
            setError("This photo could not be opened for cropping. Try uploading it again.");
        };
        nextImage.src = sourceUrl;

        return () => {
            active = false;
        };
    }, [open, sourceUrl]);

    useEffect(() => {
        if (!open || !stageRef.current) return;

        const stage = stageRef.current;
        const updateSize = () => {
            const bounds = stage.getBoundingClientRect();
            setStageSize({ width: bounds.width, height: bounds.height });
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(stage);

        return () => observer.disconnect();
    }, [open]);

    useEffect(() => {
        if (!image || !stageSize.width || !stageSize.height) return;
        setCrop(getInitialCrop(image, stageSize, rotation));
    }, [image, rotation, stageSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image || !stageSize.width || !stageSize.height) return;

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(stageSize.width * pixelRatio);
        canvas.height = Math.round(stageSize.height * pixelRatio);
        const context = canvas.getContext("2d");
        if (!context) return;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, stageSize.width, stageSize.height);
        drawPreview(context, image, stageSize, rotation);
    }, [image, rotation, stageSize]);

    if (!open || !sourceUrl) return null;

    function startGesture(
        event: ReactPointerEvent<HTMLElement>,
        handle: CropHandle,
    ) {
        if (!crop || !image || isSaving) return;
        event.preventDefault();
        event.stopPropagation();
        const stageBounds = stageRef.current?.getBoundingClientRect();
        if (!stageBounds) return;
        const pointerX = event.clientX - stageBounds.left;
        const pointerY = event.clientY - stageBounds.top;
        stageRef.current?.setPointerCapture(event.pointerId);
        gestureRef.current = {
            handle,
            pointerX,
            pointerY,
            grabOffsetX: pointerX - crop.x,
            grabOffsetY: pointerY - crop.y,
            crop: { ...crop },
        };
    }

    function moveGesture(event: ReactPointerEvent<HTMLDivElement>) {
        const gesture = gestureRef.current;
        if (!gesture || !image || !crop || isSaving) return;

        const bounds = getImageBounds(image, stageSize, rotation);
        const stageBounds = stageRef.current?.getBoundingClientRect();
        if (!stageBounds) return;
        const pointerX = event.clientX - stageBounds.left;
        const pointerY = event.clientY - stageBounds.top;

        if (gesture.handle === "move") {
            setCrop({
                ...gesture.crop,
                x: clamp(
                    pointerX - gesture.grabOffsetX,
                    bounds.x,
                    bounds.x + bounds.width - gesture.crop.width,
                ),
                y: clamp(
                    pointerY - gesture.grabOffsetY,
                    bounds.y,
                    bounds.y + bounds.height - gesture.crop.height,
                ),
            });
            return;
        }

        const west = gesture.handle.endsWith("w");
        const north = gesture.handle.startsWith("n");
        const anchorX = west
            ? gesture.crop.x + gesture.crop.width
            : gesture.crop.x;
        const anchorY = north
            ? gesture.crop.y + gesture.crop.height
            : gesture.crop.y;
        const horizontalWidth = Math.abs(pointerX - anchorX);
        const verticalWidth = Math.abs(pointerY - anchorY) * CROP_RATIO;
        const horizontalChange = Math.abs(horizontalWidth - gesture.crop.width);
        const verticalChange = Math.abs(verticalWidth - gesture.crop.width);
        const requestedWidth = horizontalChange >= verticalChange
            ? horizontalWidth
            : verticalWidth;
        const availableWidth = west
            ? anchorX - bounds.x
            : (bounds.x + bounds.width) - anchorX;
        const availableHeight = north
            ? anchorY - bounds.y
            : (bounds.y + bounds.height) - anchorY;
        const maximumWidth = Math.min(availableWidth, availableHeight * CROP_RATIO);
        const minimumWidth = Math.min(MIN_CROP_WIDTH, maximumWidth);
        const width = clamp(requestedWidth, minimumWidth, maximumWidth);
        const height = width / CROP_RATIO;

        setCrop({
            x: west ? anchorX - width : anchorX,
            y: north ? anchorY - height : anchorY,
            width,
            height,
        });
    }

    function endGesture(event: ReactPointerEvent<HTMLDivElement>) {
        gestureRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    function rotatePhoto() {
        if (!image || isSaving) return;
        setRotation((current) => (current + 90) % 360);
    }

    function resetCrop() {
        if (!image) return;
        setRotation(0);
        setCrop(getInitialCrop(image, stageSize, 0));
    }

    async function applyCrop() {
        if (!image || !crop || !stageSize.width || !stageSize.height || isSaving) return;

        try {
            setError("");
            const rotatedSize = getRotatedSize(image, rotation);
            const rotatedImage = document.createElement("canvas");
            rotatedImage.width = rotatedSize.width;
            rotatedImage.height = rotatedSize.height;
            const rotatedContext = rotatedImage.getContext("2d");
            if (!rotatedContext) throw new Error("Your browser could not prepare this photo.");

            rotatedContext.translate(rotatedImage.width / 2, rotatedImage.height / 2);
            rotatedContext.rotate((rotation * Math.PI) / 180);
            rotatedContext.drawImage(
                image,
                -(image.naturalWidth / 2),
                -(image.naturalHeight / 2),
            );

            const imageBounds = getImageBounds(image, stageSize, rotation);
            const sourceX = (crop.x - imageBounds.x) / imageBounds.scale;
            const sourceY = (crop.y - imageBounds.y) / imageBounds.scale;
            const sourceWidth = crop.width / imageBounds.scale;
            const sourceHeight = crop.height / imageBounds.scale;
            const output = document.createElement("canvas");
            output.width = 1600;
            output.height = 1200;
            const outputContext = output.getContext("2d");
            if (!outputContext) throw new Error("Your browser could not prepare this photo.");

            outputContext.drawImage(
                rotatedImage,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                output.width,
                output.height,
            );
            await onConfirm(await canvasToFile(output, sourceName));
        } catch (cropError) {
            setError(cropError instanceof Error
                ? cropError.message
                : "The cropped photo could not be saved.");
        }
    }

    const handles: CropHandle[] = ["nw", "ne", "sw", "se"];

    return (
        <div
            className="fixed inset-0 z-[240] flex bg-slate-950 sm:items-center sm:justify-center sm:bg-slate-950/80 sm:p-5 sm:backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-crop-title"
        >
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950 sm:h-auto sm:max-h-[94dvh] sm:max-w-3xl sm:rounded-[28px] sm:shadow-2xl">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 text-white sm:px-5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        aria-label="Cancel crop"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 px-3 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">Edit photo</p>
                        <h2 id="photo-crop-title" className="truncate text-sm font-black text-white sm:text-base">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={applyCrop}
                        disabled={isSaving || !image || !crop}
                        aria-label="Apply crop"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
                    <div
                        ref={stageRef}
                        className="relative aspect-[4/3] w-full max-w-2xl touch-none select-none overflow-hidden bg-slate-950 sm:rounded-[22px]"
                        onPointerMove={moveGesture}
                        onPointerUp={endGesture}
                        onPointerCancel={endGesture}
                    >
                        <canvas ref={canvasRef} className="h-full w-full" />
                        {crop && image && (
                            <div
                                className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(2,6,23,0.66)]"
                                style={{
                                    left: crop.x,
                                    top: crop.y,
                                    width: crop.width,
                                    height: crop.height,
                                }}
                                onPointerDown={(event) => startGesture(event, "move")}
                            >
                                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                                    {Array.from({ length: 9 }).map((_, index) => (
                                        <span key={index} className="border border-white/30" />
                                    ))}
                                </div>
                                {handles.map((handle) => (
                                    <button
                                        key={handle}
                                        type="button"
                                        aria-label={`Resize crop from ${handle}`}
                                        onPointerDown={(event) => startGesture(event, handle)}
                                        className={`absolute h-7 w-7 touch-none ${
                                            handle === "nw" ? "-left-3.5 -top-3.5 cursor-nwse-resize" :
                                                handle === "ne" ? "-right-3.5 -top-3.5 cursor-nesw-resize" :
                                                    handle === "sw" ? "-bottom-3.5 -left-3.5 cursor-nesw-resize" :
                                                        "-bottom-3.5 -right-3.5 cursor-nwse-resize"
                                        }`}
                                    >
                                        <span className="absolute inset-[7px] rounded-sm border-2 border-orange-400 bg-white shadow" />
                                    </button>
                                ))}
                            </div>
                        )}
                        {!image && !error && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">Opening photo…</div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 border-t border-white/10 bg-slate-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                    {error && (
                        <div className="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-center text-xs font-bold text-red-200 ring-1 ring-red-400/30">
                            {error}
                        </div>
                    )}
                    <p className="mb-3 text-center text-[11px] font-bold text-white/60">
                        Drag the box to position it · Pull a corner to resize
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={resetCrop}
                            disabled={isSaving || !image}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15 disabled:opacity-35"
                        >
                            <FontAwesomeIcon icon={faRotateLeft} className="h-3.5 w-3.5" />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={rotatePhoto}
                            disabled={isSaving || !image}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15 disabled:opacity-35"
                        >
                            <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
                            Rotate
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[14px] bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15 disabled:opacity-35"
                    >
                        Keep original — QOT will optimize it
                    </button>
                    <button
                        type="button"
                        onClick={applyCrop}
                        disabled={isSaving || !image || !crop}
                        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faCropSimple} className="h-4 w-4" />
                        {isSaving ? "Saving crop…" : "Apply crop"}
                    </button>
                </div>
            </div>
        </div>
    );
}
