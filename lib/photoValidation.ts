export type PhotoDimensions = {
    width: number;
    height: number;
};

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const SUPPORTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    if (!SUPPORTED_PHOTO_TYPES.includes(file.type)) {
        return `${file.name} is not a supported photo. Use JPG, PNG, or WEBP.`;
    }

    if (file.size > MAX_PHOTO_BYTES) {
        return `${file.name} is larger than the 8MB limit.`;
    }

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
