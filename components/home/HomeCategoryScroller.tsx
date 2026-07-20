import Link from "next/link";
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

const categoryVisuals = [
    {
        panel: "from-orange-50 to-amber-50",
        icon: "from-orange-500 to-amber-500 text-white shadow-orange-200/80",
        accent: "text-orange-600",
        ring: "group-hover:ring-orange-200",
        glow: "bg-orange-300/25",
    },
    {
        panel: "from-blue-50 to-cyan-50",
        icon: "from-blue-600 to-cyan-500 text-white shadow-blue-200/80",
        accent: "text-blue-600",
        ring: "group-hover:ring-blue-200",
        glow: "bg-cyan-300/25",
    },
    {
        panel: "from-emerald-50 to-teal-50",
        icon: "from-emerald-600 to-teal-500 text-white shadow-emerald-200/80",
        accent: "text-emerald-600",
        ring: "group-hover:ring-emerald-200",
        glow: "bg-emerald-300/25",
    },
    {
        panel: "from-violet-50 to-purple-50",
        icon: "from-violet-600 to-purple-500 text-white shadow-violet-200/80",
        accent: "text-violet-600",
        ring: "group-hover:ring-violet-200",
        glow: "bg-violet-300/25",
    },
    {
        panel: "from-rose-50 to-pink-50",
        icon: "from-rose-500 to-pink-500 text-white shadow-rose-200/80",
        accent: "text-rose-600",
        ring: "group-hover:ring-rose-200",
        glow: "bg-rose-300/25",
    },
    {
        panel: "from-amber-50 to-yellow-50",
        icon: "from-amber-500 to-yellow-500 text-white shadow-amber-200/80",
        accent: "text-amber-700",
        ring: "group-hover:ring-amber-200",
        glow: "bg-amber-300/25",
    },
];

function getCategoryName(category: any) {
    if (typeof category === "string") return category;

    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();

    return category?.slug || category?.id || "";
}

function getCategoryAdCount(category: any) {
    const count = Number(category?.listings_count);

    return Number.isFinite(count) ? count : null;
}

function normalizeKey(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCategoryIcon(category: any) {
    const text = normalizeKey(
        `${getCategoryName(category)} ${String(getCategorySlug(category) || "")}`
    );

    if (text.includes("phone") || text.includes("tablet") || text.includes("mobile")) {
        return faMobileScreen;
    }

    if (
        text.includes("electronic") ||
        text.includes("computer") ||
        text.includes("laptop") ||
        text.includes("gaming")
    ) {
        return faLaptop;
    }

    if (
        text.includes("vehicle") ||
        text.includes("car") ||
        text.includes("motor") ||
        text.includes("truck")
    ) {
        return faCar;
    }

    if (
        text.includes("property") ||
        text.includes("house") ||
        text.includes("land") ||
        text.includes("apartment")
    ) {
        return faHouse;
    }

    if (
        text.includes("fashion") ||
        text.includes("cloth") ||
        text.includes("shoe") ||
        text.includes("wear")
    ) {
        return faShirt;
    }

    if (
        text.includes("furniture") ||
        text.includes("home") ||
        text.includes("garden") ||
        text.includes("sofa")
    ) {
        return faCouch;
    }

    if (text.includes("job")) return faBriefcase;

    if (
        text.includes("service") ||
        text.includes("repair") ||
        text.includes("clean")
    ) {
        return faWrench;
    }

    if (
        text.includes("farm") ||
        text.includes("agric") ||
        text.includes("tool")
    ) {
        return faToolbox;
    }

    if (text.includes("pet") || text.includes("animal")) return faPaw;

    return faStore;
}

export default function HomeCategoryScroller({
    categories = [],
}: HomeCategoryScrollerProps) {
    return (
        <section className="mx-auto mt-5 max-w-[1390px] overflow-hidden rounded-[30px] bg-gradient-to-br from-white via-white to-orange-50/70 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-black/5 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                        Explore the marketplace
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Browse Categories
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Find what you need in just a few taps.
                    </p>
                </div>

                <Link
                    href="/categories"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-[14px] bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:bg-orange-500 sm:text-sm"
                >
                    View all
                    <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
            </div>

            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
                {categories.map((category, index) => {
                    const name = getCategoryName(category);
                    const slug = getCategorySlug(category);
                    const icon = getCategoryIcon(category);
                    const adCount = getCategoryAdCount(category);
                    const visual = categoryVisuals[index % categoryVisuals.length];

                    return (
                        <Link
                            key={slug || name}
                            href={slug ? `/listings?category=${encodeURIComponent(String(slug))}` : "/categories"}
                            className={`group relative min-h-[152px] min-w-[142px] snap-start overflow-hidden rounded-[23px] bg-gradient-to-br ${visual.panel} p-px transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)] sm:min-w-[154px]`}
                        >
                            <span className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${visual.glow} blur-2xl transition duration-500 group-hover:scale-125`} />

                            <span className={`relative flex h-full min-h-[150px] flex-col rounded-[22px] bg-white/88 p-3.5 ring-1 ring-black/5 backdrop-blur transition ${visual.ring} sm:p-4`}>
                                <span className="flex items-start justify-between gap-2">
                                    <span className={`flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br shadow-[0_10px_22px] transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-105 ${visual.icon}`}>
                                        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                                    </span>

                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black shadow-sm ring-1 ring-black/5 transition group-hover:translate-x-0.5 ${visual.accent}`}>
                                        →
                                    </span>
                                </span>

                                <span className="mt-4 line-clamp-2 text-sm font-black leading-5 text-slate-950 transition group-hover:text-orange-600">
                                    {name}
                                </span>

                                <span className="mt-auto pt-2 text-[10px] font-black uppercase tracking-[0.11em] text-slate-400">
                                    {adCount !== null
                                        ? `${adCount.toLocaleString()} active ${adCount === 1 ? "ad" : "ads"}`
                                        : "Explore adverts"}
                                </span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
