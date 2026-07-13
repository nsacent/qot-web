import UserProfileTab from "@/components/layout/UserProfileTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faHeartRegular,
    faMagnifyingGlass,
    faPlus,
} from "@/lib/faIcons";

type QotMarketplaceNavProps = {
    categories?: any[];
};

function getCategoryName(category: any) {
    if (typeof category === "string") return category;
    return category?.name || category?.title || "Category";
}

function getCategorySlug(category: any) {
    if (typeof category === "string") return category.toLowerCase();
    return category?.slug || category?.id || "";
}

export default function QotMarketplaceNav({
    categories = [],
}: QotMarketplaceNavProps) {
    return (
        <header className="sticky top-0 z-40 mb-4 rounded-[1.5rem] bg-white/95 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur md:rounded-[2rem] md:px-5 md:py-4">
            <div className="flex items-center gap-3">
                <a href="/" className="shrink-0">
                    <div className="text-3xl font-black leading-7 tracking-tight text-orange-600 md:text-4xl md:leading-8">
                        QOT
                    </div>
                    <div className="hidden text-[8px] font-black tracking-tight text-slate-900 sm:block">
                        Quality • Opportunities • Trust
                    </div>
                </a>

                <a
                    href="/listings"
                    className="hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 md:flex"
                >
                    Uganda
                    <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-slate-400" />
                </a>

                <form
                    action="/listings"
                    className="hidden h-12 flex-1 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex"
                >
                    <div className="flex flex-1 items-center gap-3 px-4">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-slate-500" />
                        <input
                            name="q"
                            placeholder="What are you looking for?"
                            className="h-full flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <select
                        name="category"
                        className="h-full border-l border-slate-100 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
                        defaultValue=""
                    >
                        <option value="">All Categories</option>

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
                        className="flex h-full w-14 items-center justify-center bg-orange-500 text-xl font-black text-white hover:bg-orange-600"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                    </button>
                </form>

                <nav className="ml-auto hidden items-center gap-5 text-sm font-black text-slate-900 md:flex">
                    <a href="/messages" className="hover:text-orange-600">
                        Messages
                    </a>

                    <a href="/saved" className="hover:text-orange-600">
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faHeartRegular} className="h-4 w-4" />
                            Favorites
                        </span>
                    </a>
                </nav>

                <a
                    href="/post-ad"
                    className="ml-auto shrink-0 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-orange-600 md:ml-0 md:px-5 md:py-3 md:text-sm"
                >
                    <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                        Post Ad
                    </span>
                </a>

                <UserProfileTab />
            </div>

            <form
                action="/listings"
                className="mt-3 flex h-11 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:hidden"
            >
                <div className="flex flex-1 items-center gap-2 px-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-slate-500" />

                    <input
                        name="q"
                        placeholder="Search ads..."
                        className="h-full flex-1 border-0 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                </div>

                <button
                    type="submit"
                    className="h-full bg-orange-500 px-4 text-xs font-black text-white hover:bg-orange-600"
                >
                    Search
                </button>
            </form>
        </header>
    );
}