"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faHeartRegular,
    faHouse,
    faPlus,
    faUserRegular,
} from "@/lib/faIcons";
import { getCurrentUser } from "@/lib/sessionClient";
import UserAvatar from "@/components/account/UserAvatar";

const FOCUSED_ROUTES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/account/reset-password",
    "/verification",
];

function shouldHideMobileNav(pathname: string | null) {
    if (!pathname) return false;
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;

    return FOCUSED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

function navClass(active: boolean) {
    return active
        ? "flex flex-col items-center gap-1 text-orange-600"
        : "flex flex-col items-center gap-1 text-slate-500";
}

export default function MobileBottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);

        async function refreshUser() {
            try {
                setUser(await getCurrentUser());
            } catch {
                setUser(null);
            }
        }

        refreshUser();

        window.addEventListener("focus", refreshUser);
        window.addEventListener("qot_session_updated", refreshUser);

        return () => {
            window.removeEventListener("focus", refreshUser);
            window.removeEventListener("qot_session_updated", refreshUser);
        };
    }, []);

    if (!mounted || shouldHideMobileNav(pathname)) return null;

    const accountHref = user ? "/account" : "/login";
    const messagesHref = user ? "/account/messages" : "/login?next=/account/messages";
    const savedHref = user ? "/account/saved" : "/login?next=/account/saved";
    const accountActive = Boolean(
        pathname?.startsWith("/account") &&
        !pathname?.startsWith("/account/messages") &&
        pathname !== "/account/saved"
    );

    return (
        <>
            <div aria-hidden="true" className="h-20 md:hidden" />
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
                <div className="mx-auto grid max-w-md grid-cols-5 items-center text-[11px] font-black">
                    <a href="/" className={navClass(pathname === "/")}>
                        <FontAwesomeIcon icon={faHouse} className="h-5 w-5" />
                        Home
                    </a>

                    <a
                        href={messagesHref}
                        className={navClass(pathname?.startsWith("/account/messages"))}
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                        Messages
                    </a>

                    <a
                        href="/post-ad"
                        className="-mt-6 flex flex-col items-center gap-1 text-orange-600"
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                        </span>
                        <span className="text-[11px] font-black">Post</span>
                    </a>

                    <a href={savedHref} className={navClass(pathname === "/account/saved")}>
                        <FontAwesomeIcon icon={faHeartRegular} className="h-5 w-5" />
                        Saved
                    </a>

                    <a
                        href={accountHref}
                        className={navClass(accountActive)}
                    >
                        {user ? (
                            <UserAvatar
                                user={user}
                                className={`h-6 w-6 rounded-full text-[8px] text-white ${
                                    accountActive ? "bg-orange-500 ring-2 ring-orange-200" : "bg-slate-500"
                                }`}
                            />
                        ) : (
                            <FontAwesomeIcon icon={faUserRegular} className="h-5 w-5" />
                        )}
                        Profile
                    </a>
                </div>
            </nav>
        </>
    );
}
