import Navbar from "@/components/layout/Navbar";
import { apiGet, getArray } from "@/lib/api";
import HomeCategoryMegaSection from "@/components/categories/HomeCategoryMegaSection";
import TrustSafetySection from "@/components/home/TrustSafetySection";
import QuickSearchCards from "@/components/home/QuickSearchCards";

export default async function HomePage() {
  let categories: any[] = [];
  let listings: any[] = [];
  let allCategories: any[] = [];

  try {
    const homeData = await apiGet("/home/");

    categories = getArray(
      homeData?.popular_categories || homeData?.categories || []
    );

    listings = getArray(
      homeData?.featured_listings ||
      homeData?.latest_listings ||
      homeData?.listings ||
      homeData
    );
  } catch (error) {
    console.error("Homepage API error:", error);
  }

  try {
    const categoriesData = await apiGet("/categories/");
    allCategories = getArray(categoriesData);
  } catch (error) {
    console.error("Categories API error:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">
            QOT Uganda
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Buy and sell faster with trusted local classifieds.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Find phones, laptops, cars, property, jobs, services, and more from sellers around Uganda.
          </p>

          <form
            action="/listings"
            className="mt-8 flex max-w-2xl overflow-hidden rounded-2xl bg-white p-2"
          >
            <input
              name="q"
              placeholder="Search for phones, laptops, cars..."
              className="flex-1 px-4 py-3 text-slate-900 outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <HomeCategoryMegaSection
        categories={allCategories.length > 0 ? allCategories : categories}
      />

      <QuickSearchCards />
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-bold">Latest Listings</h2>

        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 9).map((listing: any, index: number) => (
              <article
                key={listing.id || listing.slug || index}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="flex h-48 items-center justify-center bg-slate-200 text-slate-500">
                  {listing.primary_image || listing.image ? (
                    <img
                      src={listing.primary_image || listing.image}
                      alt={listing.title || "Listing image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-semibold">
                    {listing.title || "Untitled listing"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {listing.city?.name || listing.location || "Uganda"}
                  </p>

                  <p className="mt-4 text-xl font-bold text-orange-600">
                    {listing.price
                      ? `UGX ${Number(listing.price).toLocaleString()}`
                      : "Contact seller"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">
            No listings found yet.
          </div>
        )}
      </section>
      <TrustSafetySection />
    </main>
  );
}