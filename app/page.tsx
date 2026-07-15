import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import HomeHero from "@/components/home/HomeHero";
import HomeFloatingSearch from "@/components/home/HomeFloatingSearch";
import HomeCategoryScroller from "@/components/home/HomeCategoryScroller";
import HomeLatestAds from "@/components/home/HomeLatestAds";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.qot.ug/api/v1";

const fallbackCategories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Vehicles", slug: "vehicles" },
  { name: "Property", slug: "property" },
  { name: "Fashion", slug: "fashion" },
  { name: "Furniture", slug: "furniture" },
  { name: "Jobs", slug: "jobs" },
  { name: "Services", slug: "services" },
  { name: "Mobile Phones", slug: "phones" },
  { name: "Pets", slug: "pets" },
  { name: "More", slug: "" },
];

function buildApiUrl(path: string) {
  const base = API_BASE.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
}

async function safeApiGet(path: string) {
  try {
    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
    });

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    console.log("Homepage API error:", error);
    return null;
  }
}

function getArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.listings)) return data.listings;
  if (Array.isArray(data?.featured)) return data.featured;
  if (Array.isArray(data?.latest)) return data.latest;

  return [];
}

async function fetchCities() {
  try {
    const firstResponse = await fetch(`${API_BASE}/locations/cities/?page_size=50`, {
      cache: "no-store",
    });

    if (!firstResponse.ok) return [];

    const firstData = await firstResponse.json();

    let cities = Array.isArray(firstData)
      ? firstData
      : Array.isArray(firstData?.results)
        ? firstData.results
        : [];

    let nextUrl = firstData?.next;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        cache: "no-store",
      });

      if (!response.ok) break;

      const data = await response.json();

      const nextCities = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      cities = [...cities, ...nextCities];
      nextUrl = data?.next;
    }

    return cities;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categoriesData, adsData] = await Promise.all([
    safeApiGet("/categories/"),
    safeApiGet("/listings/?sort=newest&page_size=24"),
  ]);

  const apiCategories = getArray(categoriesData);

  const categories =
    apiCategories.length > 0 ? apiCategories.slice(0, 10) : fallbackCategories;

  const latestAds = getArray(adsData).slice(0, 24);
  const cities = await fetchCities();


  return (
    <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
        <QotMarketplaceNav categories={categories} cities={cities} />
        <HomeHero latestAds={latestAds} />

        <HomeFloatingSearch categories={categories} cities={cities} />
        <HomeCategoryScroller categories={categories} />

        <HomeLatestAds ads={latestAds} />
      </div>
      <QotMarketplaceFooter />
    </main>
  );
}