export function getCropSourceUrl(sourceUrl: string) {
    if (!sourceUrl || sourceUrl.startsWith("blob:") || sourceUrl.startsWith("data:")) {
        return sourceUrl;
    }

    return `/api/image-source?src=${encodeURIComponent(sourceUrl)}`;
}
