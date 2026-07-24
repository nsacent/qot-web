"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    faArrowLeft,
    faCircleCheck,
    faHouse,
    faRightFromBracket,
    faShieldHalved,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import UserAvatar from "@/components/account/UserAvatar";
import { getCurrentUser, logoutUser } from "@/lib/sessionClient";
import {
    accountNavigationSections,
    getAccountPageTitle,
} from "@/components/account/accountNavigation";

type AccountContextValue = {
    user: any;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function isNavigationItemActive(pathname: string, href: string) {
    if (href === "/account") return pathname === href;
    if (!href.startsWith("/account")) return pathname === href;

    return pathname === href || pathname.startsWith(`${href}/`);
}

export function useAccountShell() {
    const value = useContext(AccountContext);

    if (!value) {
        throw new Error("useAccountShell must be used inside AccountShell.");
    }

    return value;
}

export default function AccountShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function refreshUser() {
        try {
            const currentUser = getUserObject(await getCurrentUser());
            setUser(currentUser);
            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
        } catch {
            window.location.href = `/login?next=${encodeURIComponent(pathname || "/account")}`;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        getCurrentUser()
            .then((data) => {
                if (!active) return;

                const currentUser = getUserObject(data);
                setUser(currentUser);
                localStorage.setItem("qot_user", JSON.stringify(currentUser));
                localStorage.removeItem("qot_access_token");
                localStorage.removeItem("qot_refresh_token");
            })
            .catch(() => {
                if (!active) return;
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname || "/account")}`;
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        function syncLocalUser() {
            try {
                const localUser = JSON.parse(localStorage.getItem("qot_user") || "null");
                if (localUser) setUser(localUser);
            } catch {
                // Ignore malformed legacy local data.
            }
        }

        window.addEventListener("storage", syncLocalUser);
        window.addEventListener("qot_session_updated", syncLocalUser);

        return () => {
            window.removeEventListener("storage", syncLocalUser);
            window.removeEventListener("qot_session_updated", syncLocalUser);
        };
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } catch {
            // Local account state is still cleared below.
        }

        localStorage.removeItem("qot_user");
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");
        window.dispatchEvent(new Event("storage"));
        window.location.href = "/";
    }

    const contextValue = { user, refreshUser, logout: handleLogout };

    if (loading || !user) {
        return (
            <div className="rounded-[28px] bg-white py-20 shadow-sm ring-1 ring-black/5">
                <QotLoader />
            </div>
        );
    }

    const phoneVerified =
        user?.phone_verified === true || Boolean(user?.phone_verified_at);
    const pageTitle = getAccountPageTitle(pathname);
    const isOverview = pathname === "/account";

    return (
        <AccountContext.Provider value={contextValue}>
            <div className="mx-auto grid max-w-[1440px] items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
                <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/5 lg:block">
                    <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3 transition hover:bg-orange-50"
                    >
                        <UserAvatar
                            user={user}
                            className="h-14 w-14 rounded-[18px] bg-orange-500 text-xl text-white"
                        />
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-950">
                                {user?.full_name || "QOT Member"}
                            </span>
                            <span className="mt-1 block truncate text-[11px] font-bold text-slate-500">
                                {user?.phone || user?.email || "My QOT account"}
                            </span>
                        </span>
                    </Link>

                    <Link
                        href={phoneVerified ? "/account/verification" : "/account/verification?next=/account"}
                        className={`mt-3 flex items-center gap-2.5 rounded-[18px] px-3 py-2.5 text-xs font-black ${
                            phoneVerified
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700 ring-1 ring-red-100"
                        }`}
                    >
                        <FontAwesomeIcon
                            icon={phoneVerified ? faCircleCheck : faShieldHalved}
                            className="h-4 w-4"
                        />
                        {phoneVerified ? "Phone verified" : "Verify your phone"}
                    </Link>

                    <nav className="mt-5 space-y-5" aria-label="Account navigation">
                        <Link
                            href="/account"
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition ${
                                pathname === "/account"
                                    ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.20)]"
                                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                        >
                            <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
                            Overview
                        </Link>

                        {accountNavigationSections.map((section) => (
                            <div key={section.label}>
                                <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                    {section.label}
                                </p>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const active = isNavigationItemActive(pathname, item.href);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-black transition ${
                                                    active
                                                        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                                }`}
                                            >
                                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                                    active ? "bg-white text-orange-600" : "bg-slate-50 text-slate-400"
                                                }`}>
                                                    <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                                {active && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                        Log out
                    </button>
                </aside>

                <div className="min-w-0">
                    {!isOverview && (
                        <div className="mb-3 flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-black/5 lg:hidden">
                            <Link
                                href="/account"
                                aria-label="Back to My Account"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-600">
                                    My Account
                                </p>
                                <h1 className="truncate text-base font-black text-slate-950">
                                    {pageTitle}
                                </h1>
                            </div>
                            <Link
                                href="/account"
                                aria-label="Account overview"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    )}

                    <div className="min-w-0">{children}</div>
                </div>
            </div>
        </AccountContext.Provider>
    );
}
