"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type ListingFiltersProps = {
    categories?: any[];
    regions?: any[];
    cities?: any[];
};

function getInitialValue(searchParams: URLSearchParams, key: string) {
    return searchParams.get(key) || "";
}

export default function ListingFilters({
    categories = [],
    regions = [],
    cities = [],
}: ListingFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(getInitialValue(searchParams, "q"));
    const [category, setCategory] = useState(
        getInitialValue(searchParams, "category")
    );
    const [region, setRegion] = useState(getInitialValue(searchParams, "region"));
    const [city, setCity] = useState(getInitialValue(searchParams, "city"));
    const [minPrice, setMinPrice] = useState(
        getInitialValue(searchParams, "min_price")
    );
    const [maxPrice, setMaxPrice] = useState(
        getInitialValue(searchParams, "max_price")
    );
    const [condition, setCondition] = useState(
        getInitialValue(searchParams, "condition")
    );
    const [sort, setSort] = useState(getInitialValue(searchParams, "sort"));
    const [brand, setBrand] = useState(getInitialValue(searchParams, "brand"));
    const [ram, setRam] = useState(getInitialValue(searchParams, "ram"));
    const [bedrooms, setBedrooms] = useState(
        getInitialValue(searchParams, "bedrooms")
    );

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const params = new URLSearchParams();

        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        if (region) params.set("region", region);
        if (city) params.set("city", city);
        if (minPrice) params.set("min_price", minPrice);
        if (maxPrice) params.set("max_price", maxPrice);
        if (condition) params.set("condition", condition);
        if (sort) params.set("sort", sort);
        if (brand.trim()) params.set("brand", brand.trim());
        if (ram.trim()) params.set("ram", ram.trim());
        if (bedrooms) params.set("bedrooms", bedrooms);

        const queryString = params.toString();

        router.push(queryString ? `/listings?${queryString}` : "/listings");
    }

    function clearFilters() {
        router.push("/listings");
    }

    return (
        <form
            onSubmit={applyFilters}
            className="rounded-2xl border bg-white p-5 shadow-sm"
        >
            <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">Filter Listings</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Narrow adverts by keyword, location, price, condition, and category
                    details.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Keyword
                    </label>

                    <input
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        placeholder="Search Toyota, iPhone, house..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                    </label>

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">All categories</option>

                        {categories.map((item: any) => (
                            <option key={item.id || item.slug} value={item.slug || item.id}>
                                {item.name || item.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Sort
                    </label>

                    <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Default</option>
                        <option value="newest">Newest</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="popular">Popular</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Region
                    </label>

                    <select
                        value={region}
                        onChange={(event) => setRegion(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">All regions</option>

                        {regions.map((item: any) => (
                            <option key={item.id || item.slug} value={item.slug || item.id}>
                                {item.name || item.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        City
                    </label>

                    <select
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">All cities</option>

                        {cities.map((item: any) => (
                            <option key={item.id || item.slug} value={item.slug || item.id}>
                                {item.name || item.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Min Price
                    </label>

                    <input
                        type="number"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        placeholder="10000000"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Max Price
                    </label>

                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="30000000"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Condition
                    </label>

                    <select
                        value={condition}
                        onChange={(event) => setCondition(event.target.value)}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    >
                        <option value="">Any condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Brand
                    </label>

                    <input
                        value={brand}
                        onChange={(event) => setBrand(event.target.value)}
                        placeholder="Toyota, Apple, HP..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        RAM
                    </label>

                    <input
                        value={ram}
                        onChange={(event) => setRam(event.target.value)}
                        placeholder="16GB"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Bedrooms
                    </label>

                    <input
                        type="number"
                        value={bedrooms}
                        onChange={(event) => setBedrooms(event.target.value)}
                        placeholder="2"
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                >
                    Apply Filters
                </button>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                >
                    Clear Filters
                </button>
            </div>
        </form>
    );
}