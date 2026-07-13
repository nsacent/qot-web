"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faGear,
    faHeartRegular,
    faList,
    faRightFromBracket,
    faShieldHalved,
    faStore,
    faUserRegular,
    faEnvelope,
} from "@/lib/faIcons";
import { useEffect, useRef, useState } from "react";
import { getStoredUser, getUserDisplayName } from "@/lib/auth";

function getInitials(name: string) {
    if (!name) return "U";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getAvatar(user: any) {
    return (
        user?.avatar ||
        user?.photo ||
        user?.profile_photo ||
        user?.profile?.avatar ||
        user?.profile?.photo ||
        ""
    );
}

function logout() {
    try {
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");
        localStorage.removeItem("qot_user");

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    } catch { }

    window.location.href = "/login";
}

export default function UserProfileTab() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setUser(getStoredUser());
        setMounted(true);

        function handleStorage() {
            setUser(getStoredUser());
        }

        function handleClickOutside(event: MouseEvent) {
            if (!menuRef.current) return;

            if (!menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        window.addEventListener("storage", handleStorage);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("storage", handleStorage);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-2xl bg-slate-100" />
        );
    }

    if (!user) {
        return (
            <div className="hidden items-center gap-2 sm:flex">
                <a
                    href="/login"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                >
                    Login
                </a>

                <a
                    href="/register"
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
                >
                    Register
                </a>
            </div>
        );
    }

    const name = getUserDisplayName(user);
    const avatar = getAvatar(user);
    const initials = getInitials(name);

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex items-center gap-1 rounded-2xl bg-slate-50 px-1.5 py-1.5 hover:bg-slate-100 md:gap-2 md:px-2 md:py-2"
            >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-xs font-black text-orange-600 md:h-10 md:w-10 md:text-sm">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>

                <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-slate-500" />
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                    <div className="border-b border-slate-100 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-black text-orange-600">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-950">
                                    {name}
                                </p>

                                <p className="truncate text-xs font-semibold text-slate-500">
                                    {user?.email || user?.phone || "QOT account"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid p-2 text-sm font-bold text-slate-800">
                        <a
                            href="/account"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faUserRegular} className="h-4 w-4" />
                            My Profile
                        </a>

                        <a
                            href="/my-listings"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faList} className="h-4 w-4" />
                            My Ads
                        </a>

                        <a
                            href="/seller/dashboard"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faStore} className="h-4 w-4" />
                            Seller Dashboard
                        </a>

                        <a
                            href="/saved"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faHeartRegular} className="h-4 w-4" />
                            Saved Ads
                        </a>

                        <a
                            href="/messages"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                            Messages
                        </a>

                        <a
                            href="/account/verification"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                            Verification
                        </a>

                        <a
                            href="/account/activity"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
                            Activity History
                        </a>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50"
                        >
                            <span className="inline-flex items-center gap-3">
                                <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                                Logout
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}