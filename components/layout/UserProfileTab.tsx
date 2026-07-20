"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { isAdminOrModerator } from "@/lib/auth";
import { getCurrentUser, logoutUser } from "@/lib/sessionClient";

type CurrentUser = {
    id?: number;
    full_name?: string | null;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_admin?: boolean;
    is_moderator?: boolean;
    staff?: boolean;
    superuser?: boolean;
};

const accountLinks = [
    {
        href: "/account",
        label: "My Account",
        description: "Profile overview",
        icon: faUserRegular,
    },
    {
        href: "/account/dashboard",
        label: "Dashboard",
        description: "Seller activity",
        icon: faStore,
    },
    {
        href: "/my-ads",
        label: "My Ads",
        description: "Manage listings",
        icon: faList,
    },
    {
        href: "/account/saved",
        label: "Saved Ads",
        description: "Your favourites",
        icon: faHeartRegular,
    },
    {
        href: "/account/messages",
        label: "Messages",
        description: "Buyer conversations",
        icon: faEnvelope,
    },
    {
        href: "/account/settings",
        label: "Settings",
        description: "Account preferences",
        icon: faGear,
    },
];

function getUserDisplayName(user: CurrentUser) {
    return (
        user.full_name ||
        user.name ||
        user.username ||
        user.phone ||
        user.email ||
        "My Account"
    );
}

function getInitials(user: CurrentUser) {
    const initials = getUserDisplayName(user)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    return initials || "Q";
}

function getRoleLabel(user: CurrentUser) {
    const role = String(user.role || "").toLowerCase();

    if (user.is_superuser || role === "admin") return "Administrator";
    if (role === "moderator") return "Moderator";
    return "QOT member";
}

export default function UserProfileTab() {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState<CurrentUser | null>(null);

    async function loadUser() {
        try {
            const data = await getCurrentUser();
            setUser(data as CurrentUser);
        } catch {
            setUser(null);
            setOpen(false);
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadUser();

        function handleDocumentClick(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        window.addEventListener("focus", loadUser);
        window.addEventListener("qot_session_updated", loadUser);
        document.addEventListener("mousedown", handleDocumentClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("focus", loadUser);
            window.removeEventListener("qot_session_updated", loadUser);
            document.removeEventListener("mousedown", handleDocumentClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } catch {
            // The server session may already be gone; continue to the homepage.
        }

        window.dispatchEvent(new Event("qot_session_updated"));
        window.location.href = "/";
    }

    if (checking) {
        return (
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
        );
    }

    if (!user) {
        return (
            <div className="hidden items-center gap-2 sm:flex">
                <Link
                    href="/login"
                    className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:bg-orange-50 hover:text-orange-600"
                >
                    Login
                </Link>

                <Link
                    href="/register"
                    className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600"
                >
                    Register
                </Link>
            </div>
        );
    }

    const hasAdminAccess = isAdminOrModerator(user);
    const displayName = getUserDisplayName(user);
    const contact = user.email || user.phone || "Signed in to QOT";

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className={`group flex h-11 items-center gap-2 rounded-[16px] border px-1.5 pr-2 transition md:pl-1.5 md:pr-3 ${
                    open
                        ? "border-orange-200 bg-orange-50 text-orange-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:bg-orange-50"
                }`}
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-orange-400 to-orange-600 text-[11px] font-black text-white shadow-sm shadow-orange-200">
                    {getInitials(user)}
                </span>

                <span className="hidden max-w-28 text-left xl:block">
                    <span className="block truncate text-[11px] font-black leading-4">
                        {displayName}
                    </span>
                    <span className="block truncate text-[9px] font-bold text-slate-400">
                        {getRoleLabel(user)}
                    </span>
                </span>

                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`hidden h-2.5 w-2.5 text-slate-400 transition md:block ${
                        open ? "rotate-180 text-orange-500" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[min(350px,calc(100vw-24px))] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] ring-1 ring-slate-900/5"
                >
                    <div className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white">
                        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-orange-500/25 blur-2xl" />
                        <div className="relative flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-black shadow-lg shadow-orange-950/30">
                                {getInitials(user)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black">
                                    {displayName}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
                                    {contact}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-orange-200">
                                {getRoleLabel(user)}
                            </span>
                        </div>
                    </div>

                    <div className="p-3">
                        {hasAdminAccess && (
                            <Link
                                href="/admin"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="mb-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-white shadow-lg shadow-orange-100 transition hover:from-orange-600 hover:to-orange-700"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-xs font-black">Admin Panel</span>
                                        <span className="mt-0.5 block text-[9px] font-bold text-orange-100">
                                            Manage the marketplace
                                        </span>
                                    </span>
                                </span>
                                <span aria-hidden="true" className="text-lg">→</span>
                            </Link>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            {accountLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-orange-100 hover:bg-orange-50"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition group-hover:text-orange-600">
                                        <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="mt-2.5 block text-[11px] font-black text-slate-800 group-hover:text-orange-700">
                                        {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-[9px] font-semibold text-slate-400">
                                        {item.description}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-[9px] font-bold text-slate-400">
                            Secure cookie session
                        </p>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black text-red-600 transition hover:bg-red-50"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
