import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCar,
    faCouch,
    faHouse,
    faLaptop,
    faMobileScreen,
    faPaw,
    faShirt,
    faStore,
    faToolbox,
    faWrench,
} from "@/lib/faIcons";

type HomeCategoryScrollerProps = {
    categories?: any[];
};

const categoryIcons: Record<string, any> = {
    electronics: faLaptop,
    laptop: faLaptop,
    laptops: faLaptop,
    computer: faLaptop,
    computers: faLaptop,
    phone: faMobileScreen,
    phones: faMobileScreen,
    mobile: faMobileScreen,
    mobiles: faMobileScreen,
    vehicle: faCar,
    vehicles: faCar,
    car: faCar,
    cars: faCar,
    property: faHouse,
    house: faHouse,
    houses: faHouse,
    land: faHouse,
    realestate: faHouse,
    "real-estate": faHouse,
    fashion: faShirt,
    clothes: faShirt,
    clothing: faShirt,
    furniture: faCouch,
    "home-garden": faCouch,
    home: faCouch,
    jobs: faBriefcase,
    job: faBriefcase,
    services: faWrench,
    service: faWrench,
    pets: faPaw,
    pet: faPaw,
    tools: faToolbox,
};

function getCategoryName(category: any) {
    if (typeof category === "string") return category;

    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();

    return category?.slug || category?.id || "";
}

function normalizeKey(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replaceAll("&", "")
        .replaceAll(" ", "-")
        .replaceAll("_", "-");
}

function getCategoryIcon(category: any) {
    const name = getCategoryName(category);
    const slug = String(getCategorySlug(category) || "");

    const slugKey = normalizeKey(slug);
    const nameKey = normalizeKey(name);

    return categoryIcons[slugKey] || categoryIcons[nameKey] || faStore;
}

export default function HomeCategoryScroller({
    categories = [],
}: HomeCategoryScrollerProps) {
    return (
        <section className="mx-auto max-w-[1390px] px-2 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-slate-950">
                        Browse Categories
                    </h2>

                    <p className="text-xs font-semibold text-slate-500">
                        Swipe or scroll to explore ads.
                    </p>
                </div>

                <a
                    href="/categories"
                    className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm hover:bg-orange-50"
                >
                    View all →
                </a>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
                {categories.map((category) => {
                    const name = getCategoryName(category);
                    const slug = getCategorySlug(category);
                    const icon = getCategoryIcon(category);

                    return (
                        <a
                            key={slug || name}
                            href={slug ? `/listings?category=${slug}` : "/categories"}
                            className="flex min-w-[112px] shrink-0 flex-col items-center rounded-2xl bg-white px-4 py-4 text-center shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)]"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                            </div>

                            <p className="mt-3 line-clamp-1 text-xs font-black text-slate-950">
                                {name}
                            </p>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}