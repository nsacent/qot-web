import CategoriesExplorerClient from "@/components/categories/CategoriesExplorerClient";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import { apiGet, getArray } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    let categories: any[] = [];

    try {
        const data = await apiGet("/categories/");
        categories = getArray(data);
    } catch (error) {
        console.error("Categories API error:", error);
    }

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-3 py-2 md:px-6 md:py-4">
                <QotMarketplaceNav categories={categories} />
                <CategoriesExplorerClient categories={categories} />
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
