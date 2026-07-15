import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@/lib/faIcons";

type Category = {
    id?: string | number;
    name?: string;
    slug?: string;
    children?: Category[];
};

type City = {
    id?: string | number;
    name?: string;
    slug?: string;
    region?: string | number;
    region_name?: string;
};

type HomeFloatingSearchProps = {
    categories?: Category[];
    cities?: City[];
};

function getCategoryName(category: Category) {
    return category?.name || "Category";
}

function getCategorySlug(category: Category) {
    return (
        category?.slug ||
        category?.name?.toLowerCase().replaceAll(" ", "-") ||
        ""
    );
}

function getCityName(city: City) {
    return city?.name || "Location";
}

function getCitySlug(city: City) {
    return city?.slug || city?.name?.toLowerCase().replaceAll(" ", "-") || "";
}

function CategoryOptions({ categories = [] }: { categories?: Category[] }) {
    return (
        <>
            <option value="">All Categories</option>

            {categories.map((category) => {
                const children = Array.isArray(category.children)
                    ? category.children
                    : [];

                if (children.length > 0) {
                    return (
                        <optgroup
                            key={category.id || category.slug || category.name}
                            label={getCategoryName(category)}
                        >
                            <option value={getCategorySlug(category)}>
                                All {getCategoryName(category)}
                            </option>

                            {children.map((child) => (
                                <option
                                    key={child.id || child.slug || child.name}
                                    value={getCategorySlug(child)}
                                >
                                    {getCategoryName(child)}
                                </option>
                            ))}
                        </optgroup>
                    );
                }

                return (
                    <option
                        key={category.id || category.slug || category.name}
                        value={getCategorySlug(category)}
                    >
                        {getCategoryName(category)}
                    </option>
                );
            })}
        </>
    );
}

export default function HomeFloatingSearch({
    categories = [],
    cities = [],
}: HomeFloatingSearchProps) {
    return (
        <section className="relative z-10 mx-auto -mt-8 hidden max-w-[1180px] px-4 md:block">
            <form
                action="/listings"
                method="GET"
                className="grid gap-3 rounded-[28px] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-black/5 md:grid-cols-[1.5fr_1fr_1fr_auto]"
            >
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="h-4 w-4 text-slate-400"
                    />

                    <input
                        name="q"
                        type="search"
                        placeholder="What are you looking for?"
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </label>

                <select
                    name="city"
                    defaultValue=""
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 focus:ring-orange-200"
                >
                    <option value="">All Locations</option>

                    {cities.map((city) => (
                        <option key={city.id || city.slug || city.name} value={getCitySlug(city)}>
                            {getCityName(city)}
                            {city.region_name ? `, ${city.region_name}` : ""}
                        </option>
                    ))}
                </select>

                <select
                    name="category"
                    defaultValue=""
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 focus:ring-orange-200"
                >
                    <CategoryOptions categories={categories} />
                </select>

                <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-7 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600"
                >
                    Search Ads
                </button>
            </form>
        </section>
    );
}