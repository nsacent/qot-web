"use client";

import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars } from "@/lib/faIcons";

const EXACT_TITLES: Record<string, string> = {
    "/ads": "Browse Ads",
    "/categories": "Categories",
    "/post-ad": "Post an Ad",
    "/sellers": "Sellers",
    "/saved-searches": "Saved Searches",
    "/safety/report": "Report an Ad",
    "/login": "Login",
    "/register": "Create Account",
    "/forgot-password": "Forgot Password",
    "/reset-password": "Reset Password",
    "/verification": "Verification",
    "/privacy": "Privacy Policy",
    "/terms": "Terms of Service",
    "/account": "My Account",
    "/account/activity": "Activity History",
    "/account/analytics": "Analytics",
    "/account/dashboard": "Dashboard",
    "/account/messages": "Messages",
    "/account/my-ads": "My Ads",
    "/account/my-reviews": "My Reviews",
    "/account/notifications": "Notifications",
    "/account/profile": "Profile Details",
    "/account/recently-viewed": "Recently Viewed",
    "/account/renewals": "Renewals",
    "/account/reset-password": "Password & Security",
    "/account/saved": "Saved",
    "/account/settings": "Preferences",
    "/account/verification": "Verification",
    "/messages": "Messages",
    "/my-reviews": "My Reviews",
    "/notifications": "Notifications",
    "/recently-viewed": "Recently Viewed",
    "/admin": "Admin Overview",
    "/admin/ads": "Manage Ads",
    "/admin/activity": "System Trace",
    "/admin/backups": "Backups",
    "/admin/listings": "Manage Listings",
    "/admin/payments": "Payments",
    "/admin/reports": "Reports",
    "/admin/users": "Manage Users",
};

function getScreenTitle(pathname: string) {
    if (EXACT_TITLES[pathname]) return EXACT_TITLES[pathname];
    if (/^\/ads\/[^/]+$/.test(pathname)) return "Ad Details";
    if (/^\/sellers\/[^/]+$/.test(pathname)) return "Seller Profile";
    if (/^\/account\/messages\/[^/]+$/.test(pathname)) return "Conversation";
    if (/^\/account\/analytics\/[^/]+$/.test(pathname)) return "Ad Analytics";
    if (/^\/account\/my-ads\/[^/]+\/edit$/.test(pathname)) return "Edit Ad";
    if (/^\/account\/my-ads\/[^/]+$/.test(pathname)) return "Manage Ad";
    if (/^\/messages\/[^/]+$/.test(pathname)) return "Conversation";
    if (/^\/admin\/(ads|listings)\/[^/]+\/edit$/.test(pathname)) return "Edit Ad";
    if (/^\/admin\/(ads|listings)\/[^/]+$/.test(pathname)) return "Review Ad";
    if (/^\/admin\/(user|users)\/[^/]+$/.test(pathname)) return "User Details";

    const segment = pathname.split("/").filter(Boolean).at(-1) || "QOT";

    return decodeURIComponent(segment)
        .replaceAll("-", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getBackHref(pathname: string) {
    if (/^\/account\/my-ads\/[^/]+\/edit$/.test(pathname)) {
        return pathname.replace(/\/edit$/, "");
    }

    if (/^\/account\/my-ads\/[^/]+$/.test(pathname)) return "/account/my-ads";
    if (/^\/account\/messages\/[^/]+$/.test(pathname)) return "/account/messages";
    if (/^\/account\/analytics\/[^/]+$/.test(pathname)) return "/account/analytics";
    if (pathname.startsWith("/account/")) return "/account";
    if (/^\/ads\/[^/]+$/.test(pathname)) return "/ads";
    if (/^\/sellers\/[^/]+$/.test(pathname)) return "/sellers";
    if (/^\/messages\/[^/]+$/.test(pathname)) return "/messages";
    if (pathname === "/safety/report") return "/ads";
    if (pathname === "/admin") return "/";
    if (/^\/admin\/(user|users)\/[^/]+$/.test(pathname)) return "/admin/users";
    if (/^\/admin\/(ads|listings)\/[^/]+\/edit$/.test(pathname)) {
        return pathname.replace(/\/edit$/, "");
    }
    if (/^\/admin\/(ads|listings)\/[^/]+$/.test(pathname)) {
        return pathname.split("/").slice(0, -1).join("/");
    }
    if (pathname.startsWith("/admin/")) return "/admin";

    return "/";
}

export default function MobileAppHeader() {
    const pathname = usePathname() || "/";
    const router = useRouter();

    if (pathname === "/") {
        return null;
    }

    const title = getScreenTitle(pathname);
    const backHref = getBackHref(pathname);

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.replace(backHref);
    };

    return (
        <header className="sticky top-0 z-[70] border-b border-slate-200/70 bg-white/90 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_rgba(15,23,42,0.07)] backdrop-blur-xl md:hidden">
            <div className="relative mx-auto flex h-[62px] max-w-screen-md items-center gap-3 px-3">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label={`Back from ${title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition active:scale-95 active:bg-slate-200"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase leading-none tracking-[0.2em] text-orange-600">
                        QOT Uganda
                    </p>
                    <h1 className="mt-1 truncate text-[17px] font-black leading-tight tracking-[-0.02em] text-slate-950">
                        {title}
                    </h1>
                </div>

                {pathname.startsWith("/admin") && (
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new Event("qot_open_admin_menu"))}
                        aria-label="Open admin navigation"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-white shadow-sm transition active:scale-95 active:bg-orange-600"
                    >
                        <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                    </button>
                )}

                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-3 h-0.5 w-10 rounded-full bg-orange-500"
                />
            </div>
        </header>
    );
}
