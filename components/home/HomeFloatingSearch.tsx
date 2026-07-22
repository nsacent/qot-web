"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCar,
    faChevronDown,
    faCouch,
    faHeartRegular,
    faHouse,
    faLaptop,
    faLocationDot,
    faMagnifyingGlass,
    faMobileScreen,
    faPaw,
    faShirt,
    faStore,
    faTag,
    faToolbox,
    faWrench,
} from "@/lib/faIcons";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

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

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

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

function getListingId(ad: any) {
    return ad?.id || ad?.slug || ad?.uuid || "";
}

function getListingTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

function getListingPrice(ad: any) {
    const price = ad?.price || ad?.amount || ad?.selling_price;

    if (!price) return "Price not set";

    return `UGX ${Number(price).toLocaleString()}`;
}

function getListingImage(ad: any) {
    return (
        ad?.cover_image ||
        ad?.image ||
        ad?.thumbnail ||
        ad?.main_image ||
        ad?.images?.[0]?.image ||
        ad?.images?.[0]?.url ||
        ""
    );
}

function getListingLocation(ad: any) {
    return (
        ad?.city_name ||
        ad?.location_name ||
        ad?.city?.name ||
        ad?.location?.name ||
        ad?.address ||
        "Uganda"
    );
}

function getCategoryIcon(category: Category) {
    const text = `${category?.name || ""} ${category?.slug || ""}`.toLowerCase();

    if (text.includes("phone") || text.includes("tablet")) return faMobileScreen;

    if (
        text.includes("computer") ||
        text.includes("laptop") ||
        text.includes("electronics") ||
        text.includes("printer") ||
        text.includes("gaming")
    ) {
        return faLaptop;
    }

    if (
        text.includes("vehicle") ||
        text.includes("car") ||
        text.includes("motor") ||
        text.includes("truck") ||
        text.includes("bus")
    ) {
        return faCar;
    }

    if (
        text.includes("property") ||
        text.includes("house") ||
        text.includes("land") ||
        text.includes("apartment") ||
        text.includes("rental")
    ) {
        return faHouse;
    }

    if (
        text.includes("fashion") ||
        text.includes("clothing") ||
        text.includes("shoes") ||
        text.includes("wear") ||
        text.includes("bags")
    ) {
        return faShirt;
    }

    if (
        text.includes("furniture") ||
        text.includes("home") ||
        text.includes("sofa") ||
        text.includes("bed") ||
        text.includes("kitchen")
    ) {
        return faCouch;
    }

    if (text.includes("job")) return faBriefcase;

    if (
        text.includes("service") ||
        text.includes("repair") ||
        text.includes("cleaning") ||
        text.includes("construction")
    ) {
        return faWrench;
    }

    if (
        text.includes("agriculture") ||
        text.includes("farm") ||
        text.includes("tools")
    ) {
        return faToolbox;
    }

    if (text.includes("pet") || text.includes("dog") || text.includes("cat")) {
        return faPaw;
    }

    if (text.includes("health") || text.includes("beauty")) return faHeartRegular;

    return faStore;
}

function OptionModal({
    open,
    title,
    children,
    onClose,
}: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm md:items-center md:p-6">
            <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-t-[30px] bg-white shadow-2xl md:rounded-[30px]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-lg font-black text-slate-950">{title}</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[72vh] overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

export default function HomeFloatingSearch({
    categories = [],
    cities = [],
}: HomeFloatingSearchProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );

    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const searchBoxRef = useRef<HTMLFormElement | null>(null);

    const citiesByRegion = useMemo(() => {
        const grouped: Record<string, City[]> = {};

        for (const city of cities) {
            const region = city.region_name || "Other Locations";

            if (!grouped[region]) grouped[region] = [];
            grouped[region].push(city);
        }

        return grouped;
    }, [cities]);

    const regions = useMemo(
        () => Object.keys(citiesByRegion).sort(),
        [citiesByRegion]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const cleanQuery = query.trim();

        if (cleanQuery.length < 2) {
            setSuggestions([]);
            setSearchLoading(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            try {
                setSearchLoading(true);

                const params = new URLSearchParams();
                params.set("q", cleanQuery);
                params.set("page_size", "6");

                if (selectedCity) {
                    params.set("city", getCitySlug(selectedCity));
                }

                if (selectedRegion && !selectedCity) {
                    params.set("region", selectedRegion);
                }

                if (selectedCategory) {
                    params.set("category", getCategorySlug(selectedCategory));
                }

                const response = await fetch(`${API_BASE_URL}/listings/?${params}`, {
                    cache: "no-store",
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setSuggestions([]);
                    return;
                }

                setSuggestions(getArray(data));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query, selectedCity, selectedRegion, selectedCategory]);

    function buildListingUrl() {
        const params = new URLSearchParams();

        if (query.trim()) params.set("q", query.trim());

        if (selectedCity) {
            params.set("city", getCitySlug(selectedCity));
        } else if (selectedRegion) {
            params.set("region", selectedRegion);
        }

        if (selectedCategory) {
            params.set("category", getCategorySlug(selectedCategory));
        }

        const text = params.toString();

        return text ? `/ads?${text}` : "/ads";
    }

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        window.location.href = buildListingUrl();
    }

    function selectCity(city: City | null) {
        setSelectedCity(city);
        setSelectedRegion("");
        setLocationModalOpen(false);
        setShowSuggestions(true);
    }

    function selectRegion(region: string) {
        setSelectedRegion(region);
        setSelectedCity(null);
        setLocationModalOpen(false);
        setShowSuggestions(true);
    }

    function selectCategory(category: Category | null) {
        setSelectedCategory(category);
        setCategoryModalOpen(false);
        setShowSuggestions(true);
    }

    const locationLabel = selectedCity?.name || selectedRegion || "All Uganda";
    const categoryLabel = selectedCategory?.name || "All Categories";

    return (
        <>
            <section className="relative z-10 mx-auto -mt-8 hidden max-w-[1180px] px-4 md:block">
                <form
                    ref={searchBoxRef}
                    onSubmit={submitSearch}
                    className="relative grid gap-3 rounded-[28px] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-black/5 md:grid-cols-[1.5fr_1fr_1fr_auto]"
                >
                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="h-4 w-4 text-slate-400"
                        />

                        <input
                            name="q"
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="What are you looking for?"
                            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => setLocationModalOpen(true)}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                            </span>

                            <span className="truncate">{locationLabel}</span>
                        </span>

                        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategoryModalOpen(true)}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                <FontAwesomeIcon
                                    icon={
                                        selectedCategory
                                            ? getCategoryIcon(selectedCategory)
                                            : faTag
                                    }
                                    className="h-4 w-4"
                                />
                            </span>

                            <span className="truncate">{categoryLabel}</span>
                        </span>

                        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                    </button>

                    <button
                        type="submit"
                        className="rounded-2xl bg-orange-500 px-7 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600"
                    >
                        Search Ads
                    </button>

                    {showSuggestions && (
                        <div className="absolute left-4 right-4 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)] ring-1 ring-black/5">
                            {query.trim().length < 2 ? (
                                <div className="p-5 text-sm font-semibold text-slate-500">
                                    Type at least 2 letters to search ads.
                                </div>
                            ) : searchLoading ? (
                                <div className="p-5 text-sm font-semibold text-slate-500">
                                    Searching ads...
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="max-h-[420px] overflow-y-auto p-2">
                                    {suggestions.map((ad) => {
                                        const id = getListingId(ad);
                                        const image = getListingImage(ad);

                                        return (
                                            <a
                                                key={id || getListingTitle(ad)}
                                                href={`/ads/${id}`}
                                                className="flex gap-3 rounded-2xl p-3 hover:bg-orange-50"
                                            >
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={getListingTitle(ad)}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-black text-slate-950">
                                                        {getListingTitle(ad)}
                                                    </p>

                                                    <p className="mt-1 text-xs font-black text-orange-600">
                                                        {getListingPrice(ad)}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                                                        {getListingLocation(ad)}
                                                    </p>
                                                </div>
                                            </a>
                                        );
                                    })}

                                    <a
                                        href={buildListingUrl()}
                                        className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-black text-orange-600 hover:bg-orange-50"
                                    >
                                        View all matching ads →
                                    </a>
                                </div>
                            ) : (
                                <div className="p-5 text-sm font-semibold text-slate-500">
                                    No matching ads found.
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </section>

            <OptionModal
                open={locationModalOpen}
                title="Choose location"
                onClose={() => setLocationModalOpen(false)}
            >
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => selectCity(null)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-orange-500 px-4 py-3 text-left text-sm font-black text-white hover:bg-orange-600"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                        </span>

                        <span>All Uganda</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {regions.map((region) => (
                        <div key={region}>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-base font-black text-slate-950">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                                    </span>
                                    {region}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() =>
                                        selectRegion(region.toLowerCase().replaceAll(" ", "-"))
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-600 hover:bg-orange-100"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                    All {region}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {(citiesByRegion[region] || []).map((city) => (
                                    <button
                                        key={city.id || city.slug || city.name}
                                        type="button"
                                        onClick={() => selectCity(city)}
                                        className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                            <FontAwesomeIcon
                                                icon={faLocationDot}
                                                className="h-3.5 w-3.5"
                                            />
                                        </span>

                                        <span className="truncate">{getCityName(city)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </OptionModal>

            <OptionModal
                open={categoryModalOpen}
                title="Choose category"
                onClose={() => setCategoryModalOpen(false)}
            >
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => selectCategory(null)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-orange-500 px-4 py-3 text-left text-sm font-black text-white hover:bg-orange-600"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                        </span>

                        <span>All Categories</span>
                    </button>
                </div>

                <div className="space-y-5">
                    {categories.map((category) => {
                        const children = Array.isArray(category.children)
                            ? category.children
                            : [];

                        return (
                            <div key={category.id || category.slug || category.name}>
                                <button
                                    type="button"
                                    onClick={() => selectCategory(category)}
                                    className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-black text-slate-950 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                        <FontAwesomeIcon
                                            icon={getCategoryIcon(category)}
                                            className="h-4 w-4"
                                        />
                                    </span>

                                    <span>All {getCategoryName(category)}</span>
                                </button>

                                {children.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                        {children.map((child) => (
                                            <button
                                                key={child.id || child.slug || child.name}
                                                type="button"
                                                onClick={() => selectCategory(child)}
                                                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                                    <FontAwesomeIcon
                                                        icon={getCategoryIcon(child)}
                                                        className="h-3.5 w-3.5"
                                                    />
                                                </span>

                                                <span className="truncate">
                                                    {getCategoryName(child)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </OptionModal>
        </>
    );
}