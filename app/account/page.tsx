import AccountClient from "@/app/account/AccountClient";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";

export const dynamic = "force-dynamic";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

async function apiGet(path: string) {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

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

export default async function AccountPage() {
    const [categoriesData, cities] = await Promise.all([
        apiGet("/categories/"),
        getCities(),
    ]);

    const categories = getArray(categoriesData);

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav categories={categories} cities={cities} />

                <div className="py-6">
                    <AccountClient />
                </div>
            </div>
        </main>
    );
}