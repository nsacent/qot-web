export type PhotoDimensions = {
    width: number;
    height: number;
};

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const SUPPORTED_PHOTO_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
];
export const PHOTO_INPUT_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";
export const CAMERA_PHOTO_ACCEPT = "image/*,.heic,.heif";

const SUPPORTED_PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
const HEIF_PHOTO_TYPES = [
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
];

function photoExtension(file: File) {
    return file.name.split(".").pop()?.toLowerCase() || "";
}

export function isHeifPhoto(file: File) {
    const type = file.type.toLowerCase();
    const extension = photoExtension(file);

    return HEIF_PHOTO_TYPES.includes(type) || extension === "heic" || extension === "heif";
}

export async function preparePhotoForUpload(file: File) {
    if (!isHeifPhoto(file)) return file;

    try {
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.86,
        });
        const jpeg = Array.isArray(converted) ? converted[0] : converted;

        if (!jpeg) throw new Error("No image was produced.");

        const baseName = file.name.replace(/\.(heic|heif)$/i, "") || "iphone-photo";
        return new File([jpeg], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: file.lastModified || Date.now(),
        });
    } catch {
        // Some iPhone Safari versions cannot run the browser HEIF decoder.
        // Keep the original so the API can decode and optimize it instead.
        return file;
    }
}

export function getPhotoDimensions(file: File): Promise<PhotoDimensions> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read photo dimensions."));
        };
        image.src = url;
    });
}

export async function findLowResolutionPhoto(files: File[]) {
    for (const file of files) {
        const { width, height } = await getPhotoDimensions(file);

        if (Math.min(width, height) < 450 || Math.max(width, height) < 600) {
            return file;
        }
    }

    return null;
}

export async function getPhotoValidationError(file: File) {
    const type = file.type.toLowerCase();
    const extension = photoExtension(file);
    if (!SUPPORTED_PHOTO_TYPES.includes(type) && !SUPPORTED_PHOTO_EXTENSIONS.includes(extension)) {
        return `${file.name} is not a supported photo. Use JPEG/JPG, HEIC, HEIF, PNG, or WEBP.`;
    }

    if (file.size > MAX_PHOTO_BYTES) {
        return `${file.name} is larger than the 8MB limit.`;
    }

    // When browser-side HEIF conversion is unavailable, defer dimension
    // validation to the API, which has a native HEIF decoder.
    if (isHeifPhoto(file)) return "";

    try {
        const { width, height } = await getPhotoDimensions(file);

        if (Math.min(width, height) < 450 || Math.max(width, height) < 600) {
            return `${file.name} is too small. Use a photo of at least 600 × 450 pixels.`;
        }
    } catch {
        return `${file.name} could not be read as a photo.`;
    }

    return "";
}

export async function getPhotoFingerprint(file: File) {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());

    return Array.from(
        new Uint8Array(digest),
        (byte) => byte.toString(16).padStart(2, "0")
    ).join("");
}
