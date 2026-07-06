type HeroSectionProps = {
    categories?: any[];
    regions?: any[];
};

export default function HeroSection({
    categories = [],
    regions = [],
}: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden bg-white">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-slate-100 shadow-sm">
                    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="relative z-10 px-6 py-12 md:px-10 lg:py-16">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm">
                                <span>🇺🇬</span>
                                Uganda’s trusted marketplace
                            </div>

                            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                                Buy, Sell & Discover in{" "}
                                <span className="text-orange-600">Uganda</span>
                            </h1>

                            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                                QOT connects buyers and sellers across Uganda. Find great deals,
                                post adverts, chat safely, and sell faster.
                            </p>

                            <form
                                action="/listings"
                                className="mt-8 rounded-2xl bg-white p-3 shadow-xl shadow-orange-100/70"
                            >
                                <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_140px]">
                                    <input
                                        name="q"
                                        placeholder="What are you looking for?"
                                        className="rounded-xl border px-4 py-4 outline-none focus:border-orange-500"
                                    />

                                    <select
                                        name="category"
                                        className="rounded-xl border px-4 py-4 outline-none focus:border-orange-500"
                                        defaultValue=""
                                    >
                                        <option value="">All categories</option>
                                        {categories.slice(0, 20).map((category: any) => (
                                            <option
                                                key={category.id || category.slug}
                                                value={category.slug || category.id}
                                            >
                                                {category.name || category.title}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="region"
                                        className="rounded-xl border px-4 py-4 outline-none focus:border-orange-500"
                                        defaultValue=""
                                    >
                                        <option value="">All Uganda</option>
                                        {regions.slice(0, 20).map((region: any) => (
                                            <option
                                                key={region.id || region.slug}
                                                value={region.slug || region.id}
                                            >
                                                {region.name || region.title}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        className="rounded-xl bg-orange-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-bold text-slate-700">Popular:</span>

                                {[
                                    "Phones",
                                    "Cars",
                                    "Houses",
                                    "Land",
                                    "Jobs",
                                    "Electronics",
                                ].map((item) => (
                                    <a
                                        key={item}
                                        href={`/listings?q=${encodeURIComponent(item)}`}
                                        className="rounded-full bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm hover:bg-orange-50 hover:text-orange-700"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                                    <p className="text-2xl font-black text-slate-950">100%</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-600">
                                        Free to browse
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                                    <p className="text-2xl font-black text-slate-950">24/7</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-600">
                                        Buyer access
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                                    <p className="text-2xl font-black text-slate-950">UG</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-600">
                                        Local marketplace
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-orange-100 to-slate-200" />

                            <div className="absolute bottom-0 left-1/2 h-[90%] w-[80%] -translate-x-1/2 rounded-t-[12rem] bg-orange-500/15 blur-2xl" />

                            <div className="absolute right-8 top-12 w-64 rounded-3xl bg-white/90 p-5 shadow-2xl backdrop-blur">
                                <p className="text-sm font-bold text-slate-500">
                                    Trending Now
                                </p>

                                <div className="mt-4 grid gap-4">
                                    <div>
                                        <p className="font-bold text-slate-950">iPhone Deals</p>
                                        <p className="text-sm font-bold text-orange-600">
                                            From UGX 1,650,000
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-950">Cars in Kampala</p>
                                        <p className="text-sm font-bold text-orange-600">
                                            Fresh listings today
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-950">Rental Houses</p>
                                        <p className="text-sm font-bold text-orange-600">
                                            Browse by location
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-8 right-8 rounded-3xl bg-white/90 p-5 shadow-2xl backdrop-blur">
                                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
                                    Sell faster on QOT
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-slate-950">
                                    Post your advert today
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Reach buyers across Uganda in minutes.
                                </p>

                                <a
                                    href="/post-ad"
                                    className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                                >
                                    Post Ad
                                </a>
                            </div>

                            <div className="absolute left-12 top-24 hidden rounded-3xl bg-white/80 p-4 shadow-xl backdrop-blur md:block">
                                <p className="text-sm font-bold text-slate-500">
                                    Active adverts
                                </p>
                                <p className="mt-1 text-3xl font-black text-slate-950">
                                    25,000+
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}