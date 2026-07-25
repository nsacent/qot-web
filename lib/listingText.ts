const INVISIBLE_FORMATTING = /[\u200B-\u200D\u2060\uFEFF]/g;

export function normalizeListingText(value: string) {
    return String(value || "")
        .normalize("NFKC")
        .replace(INVISIBLE_FORMATTING, "");
}
