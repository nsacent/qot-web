const quickSearches = [
    {
        title: "Toyota Cars",
        description: "Browse Toyota cars around Uganda",
        href: "/listings?category=cars&brand=Toyota&condition=used",
        badge: "Cars",
    },
    {
        title: "16GB RAM Laptops",
        description: "Find powerful laptops for work and school",
        href: "/listings?q=laptop&ram=16GB",
        badge: "Computers",
    },
    {
        title: "2-Bedroom Rentals",
        description: "Search rental houses and apartments",
        href: "/listings?bedrooms=2",
        badge: "Property",
    },
    {
        title: "Phones",
        description: "Find phones from trusted sellers",
        href: "/listings?q=phone",
        badge: "Electronics",
    },
    {
        title: "Land",
        description: "Browse land adverts by location",
        href: "/listings?q=land",
        badge: "Real Estate",
    },
    {
        title: "Jobs",
        description: "Discover job and service opportunities",
        href: "/listings?q=jobs",
        badge: "Work",
    },
];

export default function QuickSearchCards() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Quick Searches
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Find popular adverts faster
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Open ready-made searches for common buyer needs.
                    </p>
                </div>

                <a
                    href="/listings"
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    Browse all listings →
                </a>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {quickSearches.map((item) => (
                    <a
                        key={item.title}
                        href={item.href}
                        className="rounded-2xl border bg-white p-6 shadow-sm hover:border-orange-200 hover:bg-orange-50"
                    >
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            {item.badge}
                        </span>

                        <h3 className="mt-4 text-xl font-bold text-slate-900">
                            {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {item.description}
                        </p>

                        <p className="mt-4 text-sm font-semibold text-orange-600">
                            Open search →
                        </p>
                    </a>
                ))}
            </div>
        </section>
    );
}