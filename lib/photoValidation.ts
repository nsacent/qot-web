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
    "image/x-heic",
    "image/x-heif",
];
export const PHOTO_INPUT_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence,image/x-heic,image/x-heif,.jpg,.jpeg,.png,.webp,.heic,.heics,.heif,.heifs,.hif";
export const CAMERA_PHOTO_ACCEPT = "image/*,.heic,.heics,.heif,.heifs,.hif";

const SUPPORTED_PHOTO_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "heic",
    "heics",
    "heif",
    "heifs",
    "hif",
];
const HEIF_PHOTO_TYPES = [
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
    "image/x-heic",
    "image/x-heif",
];
const HEIF_PHOTO_EXTENSIONS = ["heic", "heics", "heif", "heifs", "hif"];
// Match the API's retained source resolution and avoid a full-size 48MP canvas
// on iPhones. Smaller photos are never enlarged.
const MAX_CONVERTED_PHOTO_EDGE = 2560;

function photoExtension(file: File) {
    return file.name.split(".").pop()?.toLowerCase() || "";
}

export function isHeifPhoto(file: File) {
    const type = file.type.toLowerCase();
    const extension = photoExtension(file);

    return HEIF_PHOTO_TYPES.includes(type) || HEIF_PHOTO_EXTENSIONS.includes(extension);
}

function jpegFile(blob: Blob, original: File) {
    if (!blob.size || blob.type !== "image/jpeg") {
        throw new Error("The photo could not be converted to JPEG.");
    }
    const baseName = original.name.replace(/\.[^.]+$/, "") || "iphone-photo";
    return new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: original.lastModified,
    });
}

async function convertPhotoWithBrowser(file: File) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const canvas = document.createElement("canvas");
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("This browser cannot decode the photo."));
            timer = setTimeout(() => reject(new Error("Photo decoding timed out.")), 15000);
            image.src = url;
        });

        if (!image.naturalWidth || !image.naturalHeight) {
            throw new Error("The photo has no readable dimensions.");
        }

        const scale = Math.min(1, MAX_CONVERTED_PHOTO_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Image conversion is unavailable.");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const jpeg = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("The photo could not be converted."));
            }, "image/jpeg", 0.86);
        });
        return jpegFile(jpeg, file);
    } finally {
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        image.src = "";
        URL.revokeObjectURL(url);
        canvas.width = 0;
        canvas.height = 0;
    }
}

export async function preparePhotoForUpload(file: File) {
    if (!isHeifPhoto(file)) return file;

    // Safari supports iPhone HEIF variants natively. Prefer its decoder over
    // the older JS decoder, which cannot read some HDR/depth-image variants.
    try {
        return await convertPhotoWithBrowser(file);
    } catch {
        // Browsers without native HEIF support can still use the JS decoder.
    }

    try {
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.86,
        });
        const jpeg = Array.isArray(converted) ? converted[0] : converted;

        if (!jpeg) throw new Error("No image was produced.");

        return jpegFile(jpeg, file);
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
        return `${file.name} is not a supported photo. Use JPEG/JPG, HEIC, HEIF/HIF, PNG, or WEBP.`;
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
