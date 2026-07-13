"use client";

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
            <div className="hidden h-12 w-12 rounded-2xl bg-slate-100 md:block" />
        );
    }

    if (!user) {
        return (
            <div className="hidden items-center gap-2 md:flex">
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
                className="flex items-center gap-2 rounded-2xl bg-slate-50 px-2 py-2 hover:bg-slate-100"
            >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-black text-orange-600">
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

                <span className="hidden max-w-[110px] truncate text-sm font-black text-slate-900 lg:block">
                    {name}
                </span>

                <span className="text-slate-500">⌄</span>
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
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            My Profile
                        </a>

                        <a
                            href="/my-listings"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            My Ads
                        </a>

                        <a
                            href="/seller/dashboard"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Seller Dashboard
                        </a>

                        <a
                            href="/saved"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Saved Ads
                        </a>

                        <a
                            href="/messages"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Messages
                        </a>

                        <a
                            href="/account/verification"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Verification
                        </a>

                        <a
                            href="/account/activity"
                            className="rounded-2xl px-4 py-3 hover:bg-orange-50 hover:text-orange-600"
                        >
                            Activity History
                        </a>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}