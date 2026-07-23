"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import QotLogo from "@/components/brand/QotLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faBars,
    faChartPie,
    faCreditCard,
    faDatabase,
    faFlag,
    faListCheck,
    faRightFromBracket,
    faShieldHalved,
    faUsers,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
    clearAuthStorage,
    getUserDisplayName,
    getUserRole,
    isAdminOrModerator,
} from "@/lib/auth";
import UserAvatar from "@/components/account/UserAvatar";

const links = [
    {
        label: "Overview",
        description: "Platform health",
        href: "/admin",
        icon: faChartPie,
        adminOnly: false,
    },
    {
        label: "Ads",
        description: "Review adverts",
        href: "/admin/ads",
        icon: faListCheck,
        adminOnly: false,
    },
    {
        label: "Reports",
        description: "Moderation queue",
        href: "/admin/reports",
        icon: faFlag,
        adminOnly: false,
    },
    {
        label: "Users",
        description: "Manage accounts",
        href: "/admin/users",
        icon: faUsers,
        adminOnly: false,
    },
    {
        label: "Payments",
        description: "Revenue records",
        href: "/admin/payments",
        icon: faCreditCard,
        adminOnly: false,
    },
    {
        label: "Backups",
        description: "Protect platform data",
        href: "/admin/backups",
        icon: faDatabase,
        adminOnly: true,
    },
];

type AdminShellProps = {
    children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: AdminShellProps) {
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [accessError, setAccessError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkAccess() {
            try {
                const response = await fetch("/api/proxy/auth/me/", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (response.status === 401) {
                    const nextUrl = encodeURIComponent(
                        window.location.pathname + window.location.search
                    );
                    window.location.href = `/login?next=${nextUrl}`;
                    return;
                }

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data?.detail || data?.message || "Unable to verify admin access."
                    );
                }

                const currentUser = data?.user || data?.data || data;

                if (!isAdminOrModerator(currentUser)) {
                    if (!cancelled) {
                        setAccessError(
                            "This workspace is only available to QOT administrators and moderators."
                        );
                    }
                    return;
                }

                if (!cancelled) setUser(currentUser);
            } catch (error: any) {
                if (!cancelled) {
                    setAccessError(error?.message || "Unable to verify admin access.");
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        }

        checkAccess();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    async function logout() {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        }).catch(() => null);

        window.location.href = "/";
    }

    async function switchToAdminLogin() {
        setChecking(true);

        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        }).catch(() => null);

        clearAuthStorage();

        const nextUrl = encodeURIComponent(pathname || "/admin");
        window.location.replace(`/login?next=${nextUrl}`);
    }

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5">
                <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6" />
                    </div>
                    <h1 className="mt-5 text-xl font-black text-slate-950">
                        Opening admin workspace
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Securely checking your QOT permissions…
                    </p>
                    <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-12">
                <div className="w-full max-w-lg rounded-[30px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 sm:p-10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-500">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7" />
                    </div>
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-red-500">
                        Restricted area
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                        Admin access required
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
                        {accessError}
                    </p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        <a
                            href="/"
                            className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to marketplace
                        </a>
                        <button
                            type="button"
                            onClick={switchToAdminLogin}
                            className="rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                        >
                            Sign in as admin
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const name = getUserDisplayName(user);
    const role = getUserRole(user) || "staff";
    const canManageBackups =
        role === "admin" || user?.is_superuser === true || user?.superuser === true;
    const visibleLinks = links.filter((link) => !link.adminOnly || canManageBackups);
    const activeLink = visibleLinks.find((link) => isActivePath(pathname, link.href));

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-2">
                <a href="/admin" aria-label="QOT Admin home" className="flex min-w-0 items-center gap-3">
                    <QotLogo markOnly className="h-11 w-11 shrink-0 text-orange-500" />
                    <span className="min-w-0">
                        <span className="block truncate text-lg font-black tracking-tight text-white">
                            Admin
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Control centre
                        </span>
                    </span>
                </a>

                <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close admin menu"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white lg:hidden"
                >
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </button>
            </div>

            <nav className="mt-8 grid gap-2" aria-label="Admin navigation">
                {visibleLinks.map((link) => {
                    const active = isActivePath(pathname, link.href);

                    return (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                active
                                    ? "bg-white text-slate-950 shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    active
                                        ? "bg-orange-50 text-orange-600"
                                        : "bg-white/5 text-slate-400 group-hover:text-white"
                                }`}
                            >
                                <FontAwesomeIcon icon={link.icon} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-black">{link.label}</span>
                                <span
                                    className={`block truncate text-[11px] font-semibold ${
                                        active ? "text-slate-500" : "text-slate-500"
                                    }`}
                                >
                                    {link.description}
                                </span>
                            </span>
                        </a>
                    );
                })}
            </nav>

            <div className="mt-auto pt-8">
                <div className="rounded-[22px] bg-white/7 p-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            user={user}
                            name={name}
                            className="h-10 w-10 rounded-xl bg-orange-500 text-sm text-white"
                        />
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-white">
                                {name}
                            </span>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {role}
                            </span>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-black text-slate-200 transition hover:bg-white/15 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
            {menuOpen && (
                <button
                    type="button"
                    aria-label="Close admin navigation"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[285px] bg-slate-950 p-5 transition-transform duration-300 lg:translate-x-0 ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebar}
            </aside>

            <div className="lg:pl-[285px]">
                <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f8fc]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMenuOpen(true)}
                                aria-label="Open admin navigation"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm lg:hidden"
                            >
                                <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                            </button>
                            <div className="min-w-0">
                                <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                                    QOT administration
                                </p>
                                <h1 className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                    {activeLink?.label || "Admin workspace"}
                                </h1>
                            </div>
                        </div>

                        <a
                            href="/"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-orange-600"
                        >
                            <span className="hidden sm:inline">Open marketplace</span>
                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                                className="h-3.5 w-3.5"
                            />
                        </a>
                    </div>
                </header>

                <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
