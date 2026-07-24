"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
    faChevronDown,
    faCircleCheck,
    faRightFromBracket,
    faShieldHalved,
} from "@/lib/faIcons";
import UserAvatar from "@/components/account/UserAvatar";
import { useAccountShell } from "@/components/account/AccountShell";
import {
    accountNavigationSections,
    accountQuickActions,
} from "@/components/account/accountNavigation";

function getNumber(...values: any[]) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return Number(value) || 0;
        }
    }

    return 0;
}

function getLocation(user: any) {
    return (
        user?.profile?.default_city_name ||
        user?.profile?.city_name ||
        user?.city_name ||
        user?.city?.name ||
        "Uganda"
    );
}

function getCoverPhoto(user: any) {
    return (
        user?.profile?.cover_photo ||
        user?.cover_photo ||
        user?.profile_cover ||
        ""
    );
}

export default function AccountClient() {
    const { user, logout } = useAccountShell();
    const [dashboard, setDashboard] = useState<any>(null);

    useEffect(() => {
        let active = true;

        fetch("/api/proxy/seller/dashboard/", {
            credentials: "include",
            cache: "no-store",
        })
            .then(async (response) => (
                response.ok ? response.json().catch(() => null) : null
            ))
            .then((data) => {
                if (active) setDashboard(data);
            })
            .catch(() => {
                if (active) setDashboard(null);
            });

        return () => {
            active = false;
        };
    }, []);

    const phoneVerified =
        user?.phone_verified === true || Boolean(user?.phone_verified_at);
    const coverPhoto = getCoverPhoto(user);
    const activeAds = getNumber(
        dashboard?.active_listings,
        dashboard?.active_count,
        dashboard?.summary?.active_listings,
        user?.active_listings_count,
        user?.active_ads_count
    );
    const stats = [
        {
            label: "Followers",
            value: getNumber(user?.followers_count, user?.profile?.followers_count),
        },
        {
            label: "Following",
            value: getNumber(user?.following_count, user?.profile?.following_count),
        },
        {
            label: "Active ads",
            value: activeAds,
        },
    ];

    return (
        <section className="space-y-4 sm:space-y-5">
            {!phoneVerified && (
                <Link
                    href="/account/verification?next=/account"
                    className="flex items-center gap-3 rounded-[22px] bg-red-600 p-4 text-white shadow-[0_14px_30px_rgba(220,38,38,0.24)] transition hover:bg-red-700"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">Verify your phone</span>
                        <span className="mt-0.5 block text-[11px] font-semibold text-red-50">
                            Build buyer trust and unlock all seller tools.
                        </span>
                    </span>
                    <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 shrink-0" />
                </Link>
            )}

            <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                <div className="relative h-28 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-orange-950 sm:h-36 lg:h-44">
                    {coverPhoto && (
                        <img
                            src={coverPhoto}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                </div>

                <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <UserAvatar
                                user={user}
                                className="relative z-10 -mt-9 h-20 w-20 shrink-0 rounded-[24px] border-4 border-white bg-orange-500 text-2xl text-white shadow-lg sm:-mt-11 sm:h-24 sm:w-24 sm:rounded-[28px]"
                            />
                            <div className="min-w-0 pt-3 sm:pt-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl">
                                        {user?.full_name || "QOT Member"}
                                    </h1>
                                    {phoneVerified && (
                                        <FontAwesomeIcon
                                            icon={faCircleCheck}
                                            className="h-4 w-4 shrink-0 text-emerald-500"
                                        />
                                    )}
                                </div>
                                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                                    {getLocation(user)}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/account/profile"
                            className="mt-3 shrink-0 rounded-2xl bg-slate-950 px-3 py-2.5 text-[10px] font-black text-white transition hover:bg-orange-500 sm:mt-4 sm:px-4 sm:text-xs"
                        >
                            Edit profile
                        </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-[20px] bg-slate-50 px-2 py-3 ring-1 ring-slate-100">
                        {stats.map((stat) => (
                            <Link
                                key={stat.label}
                                href={stat.label === "Active ads" ? "/account/my-ads" : "/account/profile"}
                                className="min-w-0 px-2 text-center"
                            >
                                <span className="block text-lg font-black text-slate-950 sm:text-xl">
                                    {stat.value.toLocaleString()}
                                </span>
                                <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-wide text-slate-500 sm:text-[10px]">
                                    {stat.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">
                            Quick access
                        </p>
                        <h2 className="mt-1 text-lg font-black text-slate-950">
                            What would you like to do?
                        </h2>
                    </div>
                    <Link
                        href="/post-ad"
                        className="shrink-0 rounded-2xl bg-orange-50 px-3 py-2 text-[10px] font-black text-orange-600"
                    >
                        Post ad
                    </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {accountQuickActions.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group rounded-[20px] bg-slate-50 p-3.5 ring-1 ring-slate-100 transition hover:bg-orange-50 hover:ring-orange-100"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition group-hover:text-orange-600">
                                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                            </span>
                            <span className="mt-3 block text-sm font-black text-slate-900">
                                {item.label}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
                                {item.description}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="space-y-3 lg:hidden">
                {accountNavigationSections.map((section) => (
                    <details
                        key={section.label}
                        className="group overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/5"
                    >
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-black text-slate-950">
                                    {section.label}
                                </span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                                    {section.items.length} account tools
                                </span>
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-slate-50 text-slate-400 transition group-open:rotate-180 group-open:bg-orange-50 group-open:text-orange-600">
                                <FontAwesomeIcon icon={faChevronDown} className="h-3.5 w-3.5" />
                            </span>
                        </summary>

                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-orange-50"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-slate-50 text-slate-500">
                                        <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-black text-slate-900">
                                            {item.label}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
                                            {item.description}
                                        </span>
                                    </span>
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="h-3.5 w-3.5 shrink-0 text-slate-300"
                                    />
                                </Link>
                            ))}
                        </div>
                    </details>
                ))}

                <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-red-50 px-4 py-3.5 text-sm font-black text-red-600 ring-1 ring-red-100"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                    Log out
                </button>
            </div>

            <div className="hidden items-center justify-between gap-5 overflow-hidden rounded-[26px] bg-slate-950 p-6 text-white lg:flex">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                        Ready to sell?
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                        Reach buyers across Uganda.
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-400">
                        Post your next ad and manage every response from your account.
                    </p>
                </div>
                <Link
                    href="/post-ad"
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white"
                >
                    Post an ad
                    <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}
