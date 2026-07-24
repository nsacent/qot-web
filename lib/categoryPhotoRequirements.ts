export type CategoryPhotoRequirements = {
    minimum: number;
    maximum: number;
};

export const DEFAULT_PHOTO_REQUIREMENTS: CategoryPhotoRequirements = {
    minimum: 1,
    maximum: 8,
};

function positiveInteger(value: unknown, fallback: number) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 1) return fallback;
    return Math.floor(number);
}

export function getCategoryPhotoRequirements(category: any): CategoryPhotoRequirements {
    const minimum = positiveInteger(
        category?.minimum_photos ?? category?.min_photos,
        DEFAULT_PHOTO_REQUIREMENTS.minimum,
    );
    const maximum = Math.max(
        minimum,
        positiveInteger(
            category?.maximum_photos ?? category?.max_photos,
            DEFAULT_PHOTO_REQUIREMENTS.maximum,
        ),
    );

    return { minimum, maximum };
}

export function getPhotoRequirementText(
    categoryName: string,
    requirements: CategoryPhotoRequirements,
) {
    const categoryLabel = categoryName || "This category";
    const range = requirements.minimum === requirements.maximum
        ? `${requirements.minimum}`
        : `${requirements.minimum}–${requirements.maximum}`;

    return `${categoryLabel} requires ${range} photos.`;
}
