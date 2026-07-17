import Navbar from "@/components/layout/QotMarketplaceNav";
import CategoryCard from "@/components/categories/CategoryCard";
import { apiGet, getArray } from "@/lib/api";

export default async function CategoriesPage() {
    let categories: any[] = [];

    try {
        const data = await apiGet("/categories/");
        categories = getArray(data);
    } catch (error) {
        console.error("Categories API error:", error);
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">Categories</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        Browse QOT adverts by category and find what you need faster.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                {categories.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {categories.map((category: any) => (
                            <CategoryCard
                                key={category.id || category.slug}
                                category={category}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-white p-8 text-slate-600">
                        No categories found yet.
                    </div>
                )}
            </section>
        </main>
    );
}