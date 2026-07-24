const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function getImageUrl(value: any) {
    const image = value?.image_url || value?.image || value?.url || value;

    if (!image) return "";

    if (String(image).startsWith("http")) return String(image);
    if (String(image).startsWith("/")) return `${API_ORIGIN}${image}`;

    return String(image);
}

export function getImageId(value: any) {
    return value?.id || value?.pk || value?.image_id || "";
}

export function getListingPrimaryUrl(ad: any) {
    const image =
        ad?.primary_image?.image ||
        ad?.primary_image?.url ||
        ad?.primary_image ||
        ad?.cover_image ||
        ad?.thumbnail ||
        ad?.image_url ||
        ad?.image ||
        ad?.main_image ||
        ad?.featured_image ||
        ad?.photo ||
        ad?.picture ||
        ad?.first_image;

    return getImageUrl(image);
}

export function getImageIsPrimary(item: any) {
    const value =
        item?.is_primary ??
        item?.primary ??
        item?.is_main ??
        item?.is_cover ??
        item?.is_featured;

    return value === true || value === "true" || value === 1 || value === "1";
}

export function getOrderedListingImages(ad: any) {
    const rawImages = ad?.images || ad?.photos || ad?.gallery || [];
    const primaryUrl = getListingPrimaryUrl(ad);
    const primaryId =
        ad?.primary_image?.id ||
        ad?.primary_image_id ||
        ad?.cover_image_id ||
        ad?.main_image_id ||
        "";

    let images: any[] = [];

    if (Array.isArray(rawImages)) {
        images = rawImages
            .map((item: any, index: number) => {
                const id = String(getImageId(item) || "");
                const url = getImageUrl(item);

                return {
                    id,
                    url,
                    cardUrl: getImageUrl(item?.card_image_url || item?.card_image || url),
                    socialUrl: getImageUrl(
                        item?.social_image_url || item?.social_image || item?.card_image_url || url
                    ),
                    index,
                    backendSaysPrimary: getImageIsPrimary(item),
                    matchesPrimaryId: Boolean(primaryId && id && String(primaryId) === id),
                    matchesPrimaryUrl: Boolean(primaryUrl && url && primaryUrl === url),
                };
            })
            .filter((item: any) => item.url);
    }

    if (primaryUrl && !images.some((item) => item.url === primaryUrl)) {
        images.unshift({
            id: String(primaryId || ""),
            url: primaryUrl,
            cardUrl: primaryUrl,
            socialUrl: primaryUrl,
            index: -1,
            backendSaysPrimary: false,
            matchesPrimaryId: true,
            matchesPrimaryUrl: true,
        });
    }

    if (!images.length) return [];

    let primaryIndex = images.findIndex((item) => item.matchesPrimaryId);

    if (primaryIndex < 0) {
        primaryIndex = images.findIndex((item) => item.backendSaysPrimary);
    }

    if (primaryIndex < 0) {
        primaryIndex = images.findIndex((item) => item.matchesPrimaryUrl);
    }

    if (primaryIndex < 0) {
        primaryIndex = 0;
    }

    const primaryImage = images[primaryIndex];
    const otherImages = images.filter((_, index) => index !== primaryIndex);

    return [
        {
            ...primaryImage,
            isPrimary: true,
        },
        ...otherImages.map((item) => ({
            ...item,
            isPrimary: false,
        })),
    ];
}

export function getPrimaryListingImage(ad: any) {
    return getOrderedListingImages(ad)[0]?.url || "";
}

export function getPrimaryListingSocialImage(ad: any) {
    const primaryImage = getOrderedListingImages(ad)[0];
    return primaryImage?.socialUrl || primaryImage?.cardUrl || primaryImage?.url || "";
}

export function getListingImageCount(ad: any) {
    const possibleCount =
        ad?.image_count ??
        ad?.images_count ??
        ad?.photo_count ??
        ad?.photos_count ??
        ad?.gallery_count ??
        ad?.media_count ??
        ad?.total_images ??
        ad?.total_photos ??
        ad?.images_total ??
        ad?.photos_total;

    const numberCount = Number(possibleCount);

    if (Number.isFinite(numberCount) && numberCount > 0) {
        return numberCount;
    }

    const rawImages = ad?.images || ad?.photos || ad?.gallery || [];

    if (Array.isArray(rawImages) && rawImages.length > 0) {
        return rawImages.filter(Boolean).length;
    }

    const orderedImages = getOrderedListingImages(ad);

    if (orderedImages.length > 0) {
        return orderedImages.length;
    }

    const fallbackImages = [
        ad?.primary_image,
        ad?.cover_image,
        ad?.thumbnail,
        ad?.image_url,
        ad?.image,
        ad?.main_image,
        ad?.featured_image,
    ].filter(Boolean);

    return fallbackImages.length ? 1 : 0;
}
