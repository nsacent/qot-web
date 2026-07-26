import CategoriesExplorerClient from "@/components/categories/CategoriesExplorerClient";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import { apiGet, getArray } from "@/lib/api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Browse Categories",
    description: "Browse cars, phones, property, electronics, fashion, services and more for sale across Uganda on QOT.",
    alternates: { canonical: "/categories" },
    openGraph: {
        title: "Browse Marketplace Categories in Uganda",
        description: "Find new and used items, property and services across every QOT Uganda category.",
        url: "https://qot.ug/categories",
    },
};

function flattenCategories(categories: any[]): any[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(Array.isArray(category?.children) ? category.children : []),
    ]);
}

export default async function CategoriesPage() {
    let categories: any[] = [];

    try {
        const data = await apiGet("/categories/");
        categories = getArray(data);
    } catch (error) {
        console.error("Categories API error:", error);
    }

    const categoryItems = flattenCategories(categories).filter((category) => category?.slug);
    const categorySchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "QOT Uganda marketplace categories",
        numberOfItems: categoryItems.length,
        itemListElement: categoryItems.map((category, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: category.name,
            url: `https://qot.ug/ads?category=${encodeURIComponent(category.slug)}`,
        })),
    };

    return (
        <>
        {categoryItems.length > 0 && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema).replace(/</g, "\\u003c") }} />
        )}
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-3 py-2 md:px-6 md:py-4">
                <QotMarketplaceNav categories={categories} />
                <CategoriesExplorerClient categories={categories} />
            </div>

            <QotMarketplaceFooter />
        </main>
        </>
    );
}
