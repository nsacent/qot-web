import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.qot.ug/api/v1";

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

function formatPrice(value: any, currency = "UGX") {
  if (!value) return "Price on request";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return `${currency} ${value}`;
  }

  return `${currency} ${numberValue.toLocaleString()}`;
}

function getListingImage(listing: any) {
  return (
    listing?.image ||
    listing?.image_url ||
    listing?.thumbnail ||
    listing?.primary_image?.image ||
    listing?.primary_image?.url ||
    listing?.images?.[0]?.image ||
    listing?.images?.[0]?.url ||
    ""
  );
}

function getListingId(listing: any) {
  return listing?.id || listing?.listing_id || listing?.uuid || "";
}

function getListingTitle(listing: any) {
  return listing?.title || listing?.name || "Untitled advert";
}

function isGoodText(value: any) {
  if (value === null || value === undefined) return false;

  const text = String(value).trim();

  if (!text) return false;

  if (/^\d+$/.test(text)) return false;

  return true;
}

function getLocationName(value: any) {
  if (!value) return "";

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.title ||
      value?.city ||
      value?.district ||
      value?.region ||
      ""
    );
  }

  if (isGoodText(value)) return String(value).trim();

  return "";
}

function getLocation(listing: any) {
  const city = getLocationName(
    listing?.city_name ||
    listing?.city?.name ||
    listing?.city ||
    listing?.location?.city_name ||
    listing?.location?.city
  );

  const region = getLocationName(
    listing?.region_name ||
    listing?.district_name ||
    listing?.region?.name ||
    listing?.district?.name ||
    listing?.region ||
    listing?.district ||
    listing?.location?.region_name ||
    listing?.location?.district_name ||
    listing?.location?.region ||
    listing?.location?.district
  );

  const location = getLocationName(
    listing?.location_name ||
    listing?.location_text ||
    listing?.address_text ||
    listing?.address
  );

  if (city && region) return `${city}, ${region}`;
  if (city) return city;
  if (region) return region;
  if (location) return location;

  return "Uganda";
}

function formatDate(value: any) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getCategoryName(category: any) {
  if (typeof category === "string") return category;

  return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
  if (typeof category === "string") return category.toLowerCase();

  return category?.slug || category?.id || "";
}

const fallbackCategories = [
  { name: "Electronics", slug: "electronics", icon: "🖥️" },
  { name: "Vehicles", slug: "vehicles", icon: "🚗" },
  { name: "Property", slug: "property", icon: "🏠" },
  { name: "Fashion", slug: "fashion", icon: "🛍️" },
  { name: "Home & Garden", slug: "home-garden", icon: "🪑" },
  { name: "Jobs", slug: "jobs", icon: "💼" },
  { name: "Services", slug: "services", icon: "🛠️" },
  { name: "Mobile Phones", slug: "phones", icon: "📱" },
  { name: "Pets", slug: "pets", icon: "🐾" },
  { name: "More", slug: "", icon: "•••" },
];

function getCategoryIcon(category: any, index: number) {
  return category?.icon || fallbackCategories[index]?.icon || "📦";
}

function FeaturedListingCard({ listing }: { listing: any }) {
  const id = getListingId(listing);
  const image = getListingImage(listing);
  const title = getListingTitle(listing);

  const date =
    listing?.updated_at ||
    listing?.created_at ||
    listing?.published_at ||
    listing?.date_posted;

  return (
    <a
      href={id ? `/listings/${id}` : "/listings"}
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-300">
            QOT
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
          Featured
        </span>

        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-black text-slate-700 shadow-sm">
          ♡
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-[15px] font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-[15px] font-black text-orange-600">
          {formatPrice(listing?.price, listing?.currency)}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span className="line-clamp-1">📍 {getLocation(listing)}</span>
          <span className="shrink-0">{formatDate(date)}</span>
        </div>
      </div>
    </a>
  );
}

export default async function HomePage() {
  const [categoriesData, listingsData] = await Promise.all([
    safeApiGet("/categories/"),
    safeApiGet("/listings/?sort=newest&page_size=8"),
  ]);

  const apiCategories = getArray(categoriesData);
  const categories =
    apiCategories.length > 0 ? apiCategories.slice(0, 10) : fallbackCategories;

  const latestListings = getArray(listingsData).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">


        <QotMarketplaceNav categories={categories} />

        <section className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_12px_45px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(255,103,0,0.12),transparent_26%),linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_48%,rgba(255,237,213,0.55)_100%)]" />

          <div className="relative grid min-h-[300px] gap-6 lg:grid-cols-[1fr_0.9fr]">

            <div className="px-6 py-7 md:px-10 md:py-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-slate-900">
                <span className="rounded-full bg-orange-500 px-1.5 py-1 text-white">
                  ✓
                </span>
                Uganda&apos;s trusted marketplace
              </div>

              <h1 className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-5xl">                Buy. Sell. Connect. All in{" "}
                <span className="relative inline-block text-orange-600">
                  One Place
                  <span className="absolute -bottom-2 left-2 h-1 w-32 rounded-full bg-orange-500" />
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-slate-700">
                Find great deals, sell what you don&apos;t need, and connect
                with trusted buyers and sellers across Uganda.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/listings"
                  className="rounded-2xl bg-orange-500 px-8 py-4 text-center text-sm font-black text-white shadow-sm hover:bg-orange-600"
                >
                  Browse Ads →
                </a>

                <a
                  href="/post-ad"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-black text-slate-950 shadow-sm hover:bg-slate-50"
                >
                  Post Your Ad ✈
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-xs font-black text-slate-800">
                <span>♻️ 100% Free to Use</span>
                <span>🔷 Verified Sellers</span>
                <span>🔒 Safe & Secure</span>
              </div>
            </div>

            <div className="relative hidden overflow-hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-l from-orange-100 to-transparent" />

              <div className="absolute bottom-0 right-0 h-full w-[82%] rounded-l-[5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.96),rgba(251,146,60,0.35)_46%,rgba(249,115,22,0.18)_100%)]" />

              <div className="absolute right-16 top-12 w-72 rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                  🔥 Trending Now <span className="text-slate-400">⌄</span>
                </div>

                {latestListings.slice(0, 3).map((listing) => {
                  const id = getListingId(listing);
                  const image = getListingImage(listing);

                  return (
                    <a
                      key={id || getListingTitle(listing)}
                      href={id ? `/listings/${id}` : "/listings"}
                      className="flex gap-3 border-t border-slate-100 py-3 first:border-t-0"
                    >
                      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {image ? (
                          <img
                            src={image}
                            alt={getListingTitle(listing)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-300">
                            QOT
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-black text-slate-950">
                          {getListingTitle(listing)}
                        </p>
                        <p className="mt-1 text-sm font-black text-orange-600">
                          {formatPrice(listing?.price, listing?.currency)}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-8 max-w-[1180px] px-4">
          <form
            action="/listings"
            className="grid gap-3 rounded-3xl bg-white p-4 shadow-[0_15px_45px_rgba(15,23,42,0.12)] md:grid-cols-[1fr_220px_220px_220px]"
          >
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 px-4">
              <span className="text-xl">⌕</span>
              <input
                name="q"
                placeholder="What are you looking for?"
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              name="city"
              className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none"
              defaultValue=""
            >
              <option value="">📍 All Cities</option>
              <option value="kampala">Kampala</option>
              <option value="wakiso">Wakiso</option>
              <option value="mukono">Mukono</option>
              <option value="mbarara">Mbarara</option>
            </select>

            <select
              name="category"
              className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none"
              defaultValue=""
            >
              <option value="">▦ All Categories</option>
              {categories.map((category) => {
                const name = getCategoryName(category);
                const slug = getCategorySlug(category);

                return (
                  <option key={slug || name} value={slug}>
                    {name}
                  </option>
                );
              })}
            </select>

            <button
              type="submit"
              className="h-14 rounded-2xl bg-orange-500 px-6 text-sm font-black text-white shadow-sm hover:bg-orange-600"
            >
              Search
            </button>
          </form>
        </section>

        <section className="mx-auto max-w-[1390px] px-2 pt-5">
          <div className="flex gap-5 overflow-x-auto pb-4">
            {categories.map((category, index) => {
              const name = getCategoryName(category);
              const slug = getCategorySlug(category);
              const icon = getCategoryIcon(category, index);

              return (
                <a
                  key={slug || name}
                  href={slug ? `/listings?category=${slug}` : "/categories"}
                  className="flex min-w-[110px] shrink-0 flex-col items-center rounded-2xl bg-white px-4 py-4 text-center shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                    {icon}
                  </div>

                  <p className="mt-3 line-clamp-1 text-xs font-black text-slate-950">
                    {name}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1390px] px-2 pb-5 pt-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
              <span className="rounded-lg bg-orange-500 px-2 py-1 text-sm text-white">
                ★
              </span>
              Featured Listings
            </h2>

            <a
              href="/listings"
              className="rounded-xl px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50"
            >
              View all →
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {latestListings.length > 0 ? (
              latestListings.map((listing) => (
                <FeaturedListingCard
                  key={getListingId(listing) || getListingTitle(listing)}
                  listing={listing}
                />
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed bg-white p-10 text-center">
                <p className="text-lg font-black text-slate-950">
                  No featured adverts yet.
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  New adverts will appear here once sellers post.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1390px] px-2 pb-8">
          <div className="grid gap-4 rounded-[2rem] bg-white/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:grid-cols-[220px_1fr_1fr_1fr_1fr]">
            <div className="flex items-center text-2xl font-black text-slate-950">
              Why Choose QOT?
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                🛡️ Trusted Community
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Verified sellers and safer transactions.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">🏷️ Easy & Free</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Post ads for free and start selling fast.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">👥 Wide Reach</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Reach buyers looking for deals.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                🔒 Safe & Secure
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Safety reminders and reporting tools.
              </p>
            </div>
          </div>
        </section>
      </div>
      <QotMarketplaceFooter />
    </main>
  );
}
