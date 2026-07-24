"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import SavedAdsClient from "@/app/account/saved/SavedAdsClient";
import SavedSearchesClient from "@/components/listings/SavedSearchesClient";

type SavedTab = "ads" | "searches";

const tabs = [
    {
        value: "ads" as const,
        label: "Saved Ads",
        description: "Your favourites",
        icon: faHeart,
    },
    {
        value: "searches" as const,
        label: "Saved Searches",
        description: "Your saved filters",
        icon: faBookmark,
    },
];

function SavedHubContent() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab: SavedTab = searchParams.get("tab") === "searches" ? "searches" : "ads";

    function selectTab(tab: SavedTab) {
        const params = new URLSearchParams(searchParams.toString());

        if (tab === "searches") {
            params.set("tab", "searches");
        } else {
            params.delete("tab");
        }

        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    }

    return (
        <section className="py-2 sm:py-4">
            <div
                role="tablist"
                aria-label="Saved items"
                className="grid grid-cols-2 gap-2 rounded-[24px] bg-white p-2 shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-controls={`saved-${tab.value}-panel`}
                            onClick={() => selectTab(tab.value)}
                            className={`flex min-w-0 items-center gap-2.5 rounded-[18px] px-3 py-3 text-left transition sm:px-4 ${
                                active
                                    ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                                    : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                            }`}
                        >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] ${
                                active ? "bg-white/18 text-white" : "bg-white text-slate-500 shadow-sm"
                            }`}>
                                <FontAwesomeIcon icon={tab.icon} className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-xs font-black sm:text-sm">
                                    {tab.label}
                                </span>
                                <span className={`mt-0.5 hidden truncate text-[10px] font-semibold sm:block ${
                                    active ? "text-orange-50" : "text-slate-400"
                                }`}>
                                    {tab.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div
                id={`saved-${activeTab}-panel`}
                role="tabpanel"
                className="min-w-0"
            >
                {activeTab === "ads" ? <SavedAdsClient /> : <SavedSearchesClient />}
            </div>
        </section>
    );
}

export default function SavedHubClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <SavedHubContent />
        </Suspense>
    );
}
