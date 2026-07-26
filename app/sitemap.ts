import type { MetadataRoute } from "next";

const SITE_URL = "https://qot.ug";
const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.qot.ug/api/v1"
).replace(/\/$/, "");

export const revalidate = 3600;

function getArray(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

async function fetchPages(path: string, maximumPages = 100) {
    const items: any[] = [];
    let nextUrl = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

    for (let page = 0; page < maximumPages && nextUrl; page += 1) {
        try {
            const response = await fetch(nextUrl, {
                next: { revalidate: 3600 },
            });
            if (!response.ok) break;
            const payload = await response.json();
            items.push(...getArray(payload));
            nextUrl = payload?.next || "";
        } catch {
            break;
        }
    }

    return items;
}

function flattenCategories(categories: any[]): any[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(Array.isArray(category?.children) ? category.children : []),
    ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [listings, categoryPayload, sellers] = await Promise.all([
        fetchPages("/listings/?page_size=100&sort=newest"),
        fetch(`${API_BASE}/categories/`, { next: { revalidate: 3600 } })
            .then((response) => response.ok ? response.json() : [])
            .catch(() => []),
        fetchPages("/sellers/?page_size=100"),
    ]);

    const categories = flattenCategories(getArray(categoryPayload));
    const staticPages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/ads`, changeFrequency: "hourly", priority: 0.9 },
        { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/sellers`, changeFrequency: "daily", priority: 0.7 },
        { url: `${SITE_URL}/safety/report`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ];

    const categoryPages: MetadataRoute.Sitemap = categories
        .filter((category) => category?.slug && Number(category?.listings_count || 0) > 0)
        .map((category) => ({
            url: `${SITE_URL}/ads?category=${encodeURIComponent(category.slug)}`,
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));

    const adPages: MetadataRoute.Sitemap = listings
        .filter((listing) => listing?.id && String(listing?.status || "active") === "active")
        .map((listing) => ({
            url: `${SITE_URL}/ads/${listing.id}`,
            lastModified: listing.updated_at || listing.created_at,
            changeFrequency: "weekly" as const,
            priority: listing.is_featured ? 0.9 : 0.8,
        }));

    const sellerPages: MetadataRoute.Sitemap = sellers
        .filter((seller) => seller?.id)
        .map((seller) => ({
            url: `${SITE_URL}/sellers/${seller.id}`,
            lastModified: seller.updated_at || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));

    return [...staticPages, ...categoryPages, ...adPages, ...sellerPages];
}
