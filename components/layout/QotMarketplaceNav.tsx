import UserProfileTab from "@/components/layout/UserProfileTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faChevronDown,
    faEnvelope,
    faHeartRegular,
    faMagnifyingGlass,
    faPlus,
} from "@/lib/faIcons";

type Category = {
    id?: string | number;
    name?: string;
    slug?: string;
    children?: Category[];
};

type QotMarketplaceNavProps = {
    categories?: Category[];
};

function getCategoryName(category: Category) {
    return category?.name || "Category";
}

function getCategorySlug(category: Category) {
    return category?.slug || category?.name?.toLowerCase().replaceAll(" ", "-") || "";
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

export default function QotMarketplaceNav({
    categories = [],
}: QotMarketplaceNavProps) {
    return (
        <header className="sticky top-3 z-40 mb-4 rounded-[26px] border border-white/70 bg-white/95 px-3 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur md:px-5">
            <div className="flex items-center gap-2 md:gap-4">
                {/* Logo */}
                <a href="/" className="flex shrink-0 items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-sm md:h-11 md:w-11">
                        Q
                    </span>

                    <span className="hidden text-2xl font-black tracking-tight text-slate-950 sm:inline">
                        QOT
                    </span>
                </a>

                {/* Desktop location/category button */}
                <button className="hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 hover:bg-orange-50 hover:text-orange-600 lg:flex">
                    Uganda
                    <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                </button>

                {/* Search - mobile and desktop in one line */}
                <form
                    action="/listings"
                    method="GET"
                    className="flex min-w-0 flex-1 items-center rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200 md:max-w-xl md:px-4 md:py-3"
                >
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="mr-2 h-4 w-4 shrink-0 text-slate-400"
                    />

                    <input
                        name="q"
                        type="search"
                        placeholder="Search ads..."
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <select
                        name="category"
                        className="ml-2 hidden max-w-[160px] bg-transparent text-sm font-black text-slate-600 outline-none lg:block"
                        defaultValue=""
                    >
                        <CategoryOptions categories={categories} />
                    </select>
                </form>

                {/* Desktop links */}
                <nav className="hidden items-center gap-5 text-sm font-black text-slate-900 md:flex">
                    <a href="/messages" className="hover:text-orange-600">
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                            Messages
                        </span>
                    </a>

                    <a href="/saved" className="hover:text-orange-600">
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faHeartRegular} className="h-4 w-4" />
                            Favorites
                        </span>
                    </a>
                </nav>

                {/* Notification bell - mobile and desktop */}
                <a
                    href="/notifications"
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 hover:bg-orange-50 hover:text-orange-600 md:h-11 md:w-11"
                    aria-label="Notifications"
                >
                    <FontAwesomeIcon icon={faBell} className="h-5 w-5" />

                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
                </a>

                {/* Desktop post ad only */}
                <a
                    href="/post-ad"
                    className="hidden shrink-0 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600 md:inline-flex"
                >
                    <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                        Post Ad
                    </span>
                </a>

                {/* Desktop profile only */}
                <div className="hidden md:block">
                    <UserProfileTab />
                </div>
            </div>
        </header>
    );
}