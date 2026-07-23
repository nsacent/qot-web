import EditAdClient from "@/app/my-ads/[id]/edit/EditAdClient";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

export const dynamic = "force-dynamic";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

async function apiGet(path: string) {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            cache: "no-store",
        });

        if (!response.ok) return null;

        return await response.json();
    } catch {
        return null;
    }
}

function getArray(data: any) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

async function getCities() {
    let path = "/locations/cities/?page_size=50";
    const cities: any[] = [];

    for (let i = 0; i < 6 && path; i++) {
        const data = await apiGet(path);
        cities.push(...getArray(data));

        if (!data?.next) break;

        if (String(data.next).startsWith("http")) {
            const url = new URL(data.next);
            path = `${url.pathname}${url.search}`.replace("/api/v1", "");
        } else {
            path = data.next;
        }
    }

    return cities;
}

export default async function EditMyAdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const [categoriesData, cities] = await Promise.all([
        apiGet("/categories/"),
        getCities(),
    ]);

    const categories = getArray(categoriesData);

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav categories={categories} cities={cities} />
                <section className="mx-auto max-w-6xl py-5 sm:py-6">
                    <div className="mb-4 px-1 sm:flex sm:items-end sm:justify-between sm:gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                                Manage your advert
                            </p>
                            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                                Edit Ad
                            </h1>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-500 sm:mt-0">
                            Start with photos, update the essentials, then preview.
                        </p>
                    </div>
                    <EditAdClient id={id} />
                </section>
            </div>
        </main>
    );
}
