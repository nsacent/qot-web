export type PhotoDimensions = {
    width: number;
    height: number;
};

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
