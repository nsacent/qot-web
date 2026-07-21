"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCheck,
    faLayerGroup,
    faLocationDot,
    faMagnifyingGlass,
    faMap,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type PickerCategory = {
    value: string;
    label: string;
    children: PickerCategory[];
};

type PickerCity = {
    value: string;
    label: string;
    regionKey: string;
    regionName: string;
};

type RegionGroup = {
    key: string;
    name: string;
    cities: PickerCity[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : null;
}

function optionValue(value: unknown, valueMode: "id" | "slug" = "id") {
    if (["string", "number", "boolean"].includes(typeof value)) {
        return String(value);
    }

    const record = asRecord(value);
    return String(
        (valueMode === "slug" ? record?.slug : record?.id) ||
        record?.value ||
        record?.id ||
        record?.slug ||
        ""
    );
}

function optionLabel(value: unknown) {
    if (["string", "number", "boolean"].includes(typeof value)) {
        return String(value);
    }

    const record = asRecord(value);
    return String(
        record?.name || record?.title || record?.label || record?.value || "Unnamed"
    );
}

function childrenOf(value: unknown): unknown[] {
    const record = asRecord(value);
    if (!record) return [];

    for (const key of [
        "children",
        "subcategories",
        "sub_categories",
        "child_categories",
    ]) {
        if (Array.isArray(record[key])) return record[key] as unknown[];
    }

    return [];
}

function normalizeCategory(
    value: unknown,
    valueMode: "id" | "slug"
): PickerCategory | null {
    const normalizedValue = optionValue(value, valueMode);
    const label = optionLabel(value);
    if (!normalizedValue || !label) return null;

    return {
        value: normalizedValue,
        label,
        children: childrenOf(value)
            .map((child) => normalizeCategory(child, valueMode))
            .filter((category): category is PickerCategory => Boolean(category)),
    };
}

function normalizeCity(value: unknown, valueMode: "id" | "slug"): PickerCity | null {
    const record = asRecord(value);
    const normalizedValue = optionValue(value, valueMode);
    const label = optionLabel(value);
    if (!record || !normalizedValue || !label) return null;

    const regionRecord = asRecord(record.region);
    const regionName = String(
        regionRecord?.name || record.region_name || record.region || "Other locations"
    );
    const regionKey = String(
        regionRecord?.id || record.region || regionName.toLowerCase().replace(/\s+/g, "-")
    );

    return { value: normalizedValue, label, regionKey, regionName };
}

function categoryContainsSelection(category: PickerCategory, selectedValue: string) {
    return (
        category.value === selectedValue ||
        category.children.some((child) => child.value === selectedValue)
    );
}

function PickerModalShell({
    open,
    eyebrow,
    title,
    description,
    search,
    setSearch,
    searchPlaceholder,
    icon,
    onClose,
    children,
}: {
    open: boolean;
    eyebrow: string;
    title: string;
    description: string;
    search: string;
    setSearch: (value: string) => void;
    searchPlaceholder: string;
    icon: typeof faLayerGroup;
    onClose: () => void;
    children: ReactNode;
}) {
    useEffect(() => {
        if (!open) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        const previousOverflow = document.body.style.overflow;
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5">
            <button
                type="button"
                aria-label="Close picker"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="marketplace-picker-title"
                className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_30px_110px_rgba(15,23,42,0.35)] ring-1 ring-white/60 sm:max-h-[86vh] sm:rounded-[34px]"
            >
                <header className="relative overflow-hidden bg-slate-950 px-5 pb-5 pt-5 text-white sm:px-7 sm:pb-6 sm:pt-6">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
                    <div className="relative flex items-start gap-4">
                        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-950/30 sm:flex">
                            <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                                {eyebrow}
                            </p>
                            <h2 id="marketplace-picker-title" className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                                {title}
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-400 sm:text-sm">
                                {description}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close picker"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20"
                        >
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        </button>
                    </div>

                    <label className="relative mt-5 block">
                        <span className="sr-only">Search</span>
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={searchPlaceholder}
                            autoFocus
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white pl-11 pr-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/20"
                        />
                    </label>
                </header>

                <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            </div>
        </div>,
        document.body
    );
}

export function CategoryPickerModal({
    open,
    onClose,
    categories,
    selectedValue,
    search,
    setSearch,
    onSelect,
    valueMode = "id",
    onSelectAll,
    allLabel = "All categories",
}: {
    open: boolean;
    onClose: () => void;
    categories: unknown[];
    selectedValue: string;
    search: string;
    setSearch: (value: string) => void;
    onSelect: (value: string) => void;
    valueMode?: "id" | "slug";
    onSelectAll?: () => void;
    allLabel?: string;
}) {
    const [activeParentValue, setActiveParentValue] = useState("");
    const normalizedCategories = useMemo(
        () => categories
            .map((category) => normalizeCategory(category, valueMode))
            .filter((category): category is PickerCategory => Boolean(category)),
        [categories, valueMode]
    );
    const normalizedSearch = search.trim().toLowerCase();
    const filteredCategories = normalizedCategories
        .map((category) => {
            const parentMatches = category.label.toLowerCase().includes(normalizedSearch);
            const matchingChildren = category.children.filter((child) =>
                child.label.toLowerCase().includes(normalizedSearch)
            );

            if (!normalizedSearch || parentMatches) return category;
            if (matchingChildren.length) {
                return { ...category, children: matchingChildren };
            }
            return null;
        })
        .filter((category): category is PickerCategory => Boolean(category));
    const selectedParent = filteredCategories.find((category) =>
        categoryContainsSelection(category, selectedValue)
    );
    const activeParent =
        filteredCategories.find((category) => category.value === activeParentValue) ||
        selectedParent ||
        filteredCategories[0];

    function close() {
        setSearch("");
        onClose();
    }

    function select(value: string) {
        onSelect(value);
        close();
    }

    return (
        <PickerModalShell
            open={open}
            eyebrow="Marketplace classification"
            title="Choose a category"
            description="Start with a department, then choose the most accurate category for this listing."
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search categories or departments…"
            icon={faLayerGroup}
            onClose={close}
        >
            {filteredCategories.length === 0 ? (
                <EmptyPickerState
                    title="No category found"
                    description="Try a shorter or more general search term."
                    icon={faLayerGroup}
                />
            ) : (
                <div className="grid min-h-0 md:h-[54vh] md:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="max-h-44 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3 md:max-h-full md:overflow-x-hidden md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
                        <p className="mb-3 hidden px-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 md:block">
                            Departments
                        </p>
                        <div className="flex gap-2 md:grid">
                            {onSelectAll && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectAll();
                                        close();
                                    }}
                                    className={`flex min-w-52 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition md:min-w-0 ${
                                        !selectedValue
                                            ? "bg-orange-500 text-white shadow-lg"
                                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-orange-600"
                                    }`}
                                >
                                    <span>
                                        <span className="block text-xs font-black">{allLabel}</span>
                                        <span className={`mt-0.5 block text-[10px] font-semibold ${!selectedValue ? "text-white/70" : "text-slate-400"}`}>
                                            Browse every department
                                        </span>
                                    </span>
                                    {!selectedValue && <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />}
                                </button>
                            )}
                            {filteredCategories.map((category) => {
                                const active = activeParent?.value === category.value;
                                const hasSelection = categoryContainsSelection(
                                    category,
                                    selectedValue
                                );

                                return (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => setActiveParentValue(category.value)}
                                        className={`flex min-w-52 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition md:min-w-0 ${
                                            active
                                                ? "bg-slate-950 text-white shadow-lg"
                                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:border-orange-200 hover:text-orange-600"
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-black">
                                                {category.label}
                                            </span>
                                            <span className={`mt-0.5 block text-[10px] font-semibold ${active ? "text-slate-400" : "text-slate-400"}`}>
                                                {category.children.length} subcategor{category.children.length === 1 ? "y" : "ies"}
                                            </span>
                                        </span>
                                        {hasSelection && (
                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-orange-400" : "bg-orange-500"}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <main className="max-h-[54vh] min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                        {activeParent && (
                            <>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600">
                                            Choose within
                                        </p>
                                        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                                            {activeParent.label}
                                        </h3>
                                    </div>
                                    <p className="hidden text-xs font-semibold text-slate-400 sm:block">
                                        {activeParent.children.length + 1} choices
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <PickerChoice
                                        title={`All in ${activeParent.label}`}
                                        description="Use the main department"
                                        selected={activeParent.value === selectedValue}
                                        icon={faLayerGroup}
                                        onClick={() => select(activeParent.value)}
                                    />
                                    {activeParent.children.map((child) => (
                                        <PickerChoice
                                            key={child.value}
                                            title={child.label}
                                            description={activeParent.label}
                                            selected={child.value === selectedValue}
                                            icon={faArrowRight}
                                            onClick={() => select(child.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            )}
        </PickerModalShell>
    );
}

export function LocationPickerModal({
    open,
    onClose,
    cities,
    selectedValue,
    search,
    setSearch,
    onSelect,
    valueMode = "id",
    selectedRegionValue = "",
    onSelectRegion,
    onSelectAll,
    allLabel = "All Uganda",
}: {
    open: boolean;
    onClose: () => void;
    cities: unknown[];
    selectedValue: string;
    search: string;
    setSearch: (value: string) => void;
    onSelect: (value: string) => void;
    valueMode?: "id" | "slug";
    selectedRegionValue?: string;
    onSelectRegion?: (value: string) => void;
    onSelectAll?: () => void;
    allLabel?: string;
}) {
    const [activeRegionKey, setActiveRegionKey] = useState("");
    const regionGroups = useMemo(() => {
        const groups = new Map<string, RegionGroup>();

        cities
            .map((city) => normalizeCity(city, valueMode))
            .filter((city): city is PickerCity => Boolean(city))
            .forEach((city) => {
                const current = groups.get(city.regionKey) || {
                    key: city.regionKey,
                    name: city.regionName,
                    cities: [],
                };
                current.cities.push(city);
                groups.set(city.regionKey, current);
            });

        return Array.from(groups.values()).sort((first, second) =>
            first.name.localeCompare(second.name)
        );
    }, [cities, valueMode]);
    const normalizedSearch = search.trim().toLowerCase();
    const filteredGroups = regionGroups
        .map((group) => {
            const regionMatches = group.name.toLowerCase().includes(normalizedSearch);
            const matchingCities = group.cities.filter((city) =>
                city.label.toLowerCase().includes(normalizedSearch)
            );

            if (!normalizedSearch || regionMatches) return group;
            if (matchingCities.length) return { ...group, cities: matchingCities };
            return null;
        })
        .filter((group): group is RegionGroup => Boolean(group));
    const selectedRegion = filteredGroups.find((group) =>
        group.cities.some((city) => city.value === selectedValue)
    );
    const selectedRegionGroup = filteredGroups.find(
        (group) =>
            group.name.toLowerCase().replace(/\s+/g, "-") === selectedRegionValue
    );
    const activeRegion =
        filteredGroups.find((group) => group.key === activeRegionKey) ||
        selectedRegion ||
        selectedRegionGroup ||
        filteredGroups[0];

    function close() {
        setSearch("");
        onClose();
    }

    function select(value: string) {
        onSelect(value);
        close();
    }

    return (
        <PickerModalShell
            open={open}
            eyebrow="Uganda marketplace coverage"
            title="Choose a region and city"
            description="Select the region first, then choose the city where the item is available."
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search a city or region…"
            icon={faMap}
            onClose={close}
        >
            {filteredGroups.length === 0 ? (
                <EmptyPickerState
                    title="No location found"
                    description="Check the spelling or search for a nearby region."
                    icon={faLocationDot}
                />
            ) : (
                <div className="grid min-h-0 md:h-[54vh] md:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="max-h-44 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3 md:max-h-full md:overflow-x-hidden md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
                        <p className="mb-3 hidden px-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 md:block">
                            Regions
                        </p>
                        <div className="flex gap-2 md:grid">
                            {onSelectAll && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectAll();
                                        close();
                                    }}
                                    className={`flex min-w-52 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition md:min-w-0 ${
                                        !selectedValue && !selectedRegionValue
                                            ? "bg-orange-500 text-white shadow-lg"
                                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-orange-600"
                                    }`}
                                >
                                    <span>
                                        <span className="block text-xs font-black">{allLabel}</span>
                                        <span className={`mt-0.5 block text-[10px] font-semibold ${!selectedValue && !selectedRegionValue ? "text-white/70" : "text-slate-400"}`}>
                                            Search the whole country
                                        </span>
                                    </span>
                                    {!selectedValue && !selectedRegionValue && <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />}
                                </button>
                            )}
                            {filteredGroups.map((group) => {
                                const active = activeRegion?.key === group.key;
                                const hasSelection = group.cities.some(
                                    (city) => city.value === selectedValue
                                ) || group.name.toLowerCase().replace(/\s+/g, "-") === selectedRegionValue;

                                return (
                                    <button
                                        key={group.key}
                                        type="button"
                                        onClick={() => setActiveRegionKey(group.key)}
                                        className={`flex min-w-52 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition md:min-w-0 ${
                                            active
                                                ? "bg-slate-950 text-white shadow-lg"
                                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-orange-600"
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-black">{group.name}</span>
                                            <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">
                                                {group.cities.length} cit{group.cities.length === 1 ? "y" : "ies"}
                                            </span>
                                        </span>
                                        {hasSelection && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <main className="max-h-[54vh] min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                        {activeRegion && (
                            <>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600">Cities in</p>
                                        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">{activeRegion.name}</h3>
                                    </div>
                                    <p className="hidden text-xs font-semibold text-slate-400 sm:block">
                                        {activeRegion.cities.length} available
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {onSelectRegion && (
                                        <PickerChoice
                                            title={`All in ${activeRegion.name}`}
                                            description="Use the whole region"
                                            selected={selectedRegionValue === activeRegion.name.toLowerCase().replace(/\s+/g, "-") && !selectedValue}
                                            icon={faMap}
                                            onClick={() => {
                                                onSelectRegion(activeRegion.name.toLowerCase().replace(/\s+/g, "-"));
                                                close();
                                            }}
                                        />
                                    )}
                                    {activeRegion.cities.map((city) => (
                                        <PickerChoice
                                            key={city.value}
                                            title={city.label}
                                            description={city.regionName}
                                            selected={city.value === selectedValue}
                                            icon={faLocationDot}
                                            onClick={() => select(city.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            )}
        </PickerModalShell>
    );
}

function PickerChoice({
    title,
    description,
    selected,
    icon,
    onClick,
}: {
    title: string;
    description: string;
    selected: boolean;
    icon: typeof faLayerGroup;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex min-h-20 items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                selected
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-100 ring-1 ring-orange-500"
                    : "bg-white text-slate-800 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:ring-orange-300 hover:shadow-md"
            }`}
        >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-white/15 text-white" : "bg-orange-50 text-orange-600"}`}>
                <FontAwesomeIcon icon={selected ? faCheck : icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-black">{title}</span>
                <span className={`mt-0.5 block truncate text-[10px] font-semibold ${selected ? "text-white/70" : "text-slate-400"}`}>
                    {selected ? "Currently selected" : description}
                </span>
            </span>
        </button>
    );
}

function EmptyPickerState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: typeof faLayerGroup;
}) {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
        </div>
    );
}
