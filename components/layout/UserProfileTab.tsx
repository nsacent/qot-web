"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faEnvelope,
    faGear,
    faHeartRegular,
    faList,
    faRightFromBracket,
    faShieldHalved,
    faStore,
    faUserRegular,
} from "@/lib/faIcons";
import { getCurrentUser, logoutUser } from "@/lib/sessionClient";

function getUserDisplayName(user: any) {
    return (
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.phone ||
        user?.email ||
        "My Account"
    );
}

function getInitial(user: any) {
    return getUserDisplayName(user).charAt(0).toUpperCase();
}

export default function UserProfileTab() {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState<any>(null);

    async function loadUser() {
        try {
            const data = await getCurrentUser();

            setUser(data);
            localStorage.setItem("qot_user", JSON.stringify(data));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
        } catch {
            setUser(null);
            localStorage.removeItem("qot_user");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        setMounted(true);
        loadUser();

        window.addEventListener("focus", loadUser);
        window.addEventListener("storage", loadUser);

        return () => {
            window.removeEventListener("focus", loadUser);
            window.removeEventListener("storage", loadUser);
        };
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } catch {
            // continue clearing local state
        }

        localStorage.removeItem("qot_user");
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");

        window.dispatchEvent(new Event("storage"));
        window.location.href = "/";
    }

    if (!mounted || checking) {
        return (
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
        );
    }

    if (!user) {
        return (
            <div className="hidden items-center gap-2 sm:flex">
                <a
                    href="/login"
                    className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                >
                    Login
                </a>

                <a
                    href="/register"
                    className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white hover:bg-orange-600"
                >
                    Register
                </a>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-2 rounded-2xl bg-slate-50 px-2 py-2 text-sm font-black text-slate-900 hover:bg-orange-50 hover:text-orange-600 md:px-3"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white md:h-10 md:w-10">
                    {getInitial(user)}
                </span>



                <FontAwesomeIcon icon={faChevronDown} className="hidden h-3 w-3 md:block" />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)] ring-1 ring-black/5">
                    <div className="border-b border-slate-100 p-4">
                        <p className="truncate text-sm font-black text-slate-950">
                            {getUserDisplayName(user)}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {user?.email || user?.phone || "QOT member"}
                        </p>
                    </div>

                    <div className="p-2">
                        <a
                            href="/account"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faUserRegular} className="h-4 w-4" />
                            My Profile
                        </a>

                        <a
                            href="/my-ads"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                            My Ads
                        </a>

                        <a
                            href="/seller/dashboard"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faStore} className="h-4 w-4" />
                            Seller Dashboard
                        </a>

                        <a
                            href="/saved"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faHeartRegular} className="h-4 w-4" />
                            Saved Ads
                        </a>

                        <a
                            href="/messages"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                            Messages
                        </a>

                        <a
                            href="/account/verification"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                            Verification
                        </a>

                        <a
                            href="/account/settings"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
                            Settings
                        </a>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}