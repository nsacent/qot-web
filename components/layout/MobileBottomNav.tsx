"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeartRegular,
    faHouse,
    faList,
    faPlus,
    faUserRegular,
} from "@/lib/faIcons";
import { getStoredUser } from "@/lib/auth";

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
        setUser(getStoredUser());

        function refreshUser() {
            setUser(getStoredUser());
        }

        window.addEventListener("storage", refreshUser);

        return () => {
            window.removeEventListener("storage", refreshUser);
        };
    }, []);

    if (!mounted) return null;

    const accountHref = user ? "/account" : "/login";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-5 items-center text-[11px] font-black">
                <a href="/" className={navClass(pathname === "/")}>
                    <FontAwesomeIcon icon={faHouse} className="h-5 w-5" />
                    Home
                </a>

                <a
                    href="/listings"
                    className={navClass(pathname?.startsWith("/listings"))}
                >
                    <FontAwesomeIcon icon={faList} className="h-5 w-5" />
                    Ads
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

                <a href="/saved" className={navClass(pathname === "/saved")}>
                    <FontAwesomeIcon icon={faHeartRegular} className="h-5 w-5" />
                    Saved
                </a>

                <a
                    href={accountHref}
                    className={navClass(
                        pathname?.startsWith("/account") || pathname?.startsWith("/login")
                    )}
                >
                    <FontAwesomeIcon icon={faUserRegular} className="h-5 w-5" />
                    Profile
                </a>
            </div>
        </nav>
    );
}