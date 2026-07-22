"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faClock,
    faEnvelope,
    faLock,
    faMobileScreen,
    faRightFromBracket,
    faShieldHalved,
    faStar,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import SellerDashboardClient from "@/components/dashboard/SellerDashboardClient";
import SellerAnalyticsClient from "@/components/dashboard/SellerAnalyticsClient";
import SellerRenewalsClient from "@/components/dashboard/SellerRenewalsClient";
import SavedAdsClient from "@/app/account/saved/SavedAdsClient";
import MyListingsClient from "@/app/my-ads/MyListingsClient";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";
import ProfileSettingsClient from "@/components/account/ProfileSettingsClient";
import {
    getCurrentUser,
    logoutUser,
} from "@/lib/sessionClient";

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function AccountForm() {
    const [activeTab, setActiveTab] = useState<
        "profile" | "dashboard" | "analytics" | "renewals" | "saved" | "ads" | "settings"
    >("profile");
    const [checkingSession, setCheckingSession] = useState(true);

    const [user, setUser] = useState<any>(null);

    async function loadUser() {
        try {
            const data = await getCurrentUser();
            const currentUser = getUserObject(data);

            setUser(currentUser);

            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
        } catch {
            window.location.href = "/login?next=/account";
            return;
        } finally {
            setCheckingSession(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        function refreshLocalUser() {
            try {
                const localUser = JSON.parse(localStorage.getItem("qot_user") || "null");
                if (localUser) setUser(localUser);
            } catch {
                // Ignore malformed legacy local data.
            }
        }

        window.addEventListener("storage", refreshLocalUser);
        return () => window.removeEventListener("storage", refreshLocalUser);
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

    if (checkingSession) {
        return <QotLoader />;
    }

    const isPhoneVerified =
        user?.phone_verified === true || Boolean(user?.phone_verified_at);
    const isEmailVerified =
        user?.email_verified === true || Boolean(user?.email_verified_at);

    const accountTabs = [
        { id: "profile" as const, label: "Profile Details" },
        { id: "dashboard" as const, label: "Dashboard" },
        { id: "analytics" as const, label: "Analytics" },
        { id: "renewals" as const, label: "Renewals" },
        { id: "saved" as const, label: "Saved Ads" },
        { id: "ads" as const, label: "My Ads" },
        { id: "settings" as const, label: "Account Settings" },
    ];

    const accountToolLinks = [
        {
            href: "/account/recently-viewed",
            label: "Recently Viewed",
            description: "Ads you opened recently",
            icon: faClock,
        },
        {
            href: "/account/my-reviews",
            label: "My Reviews",
            description: "Reviews you submitted",
            icon: faStar,
        },
        {
            href: "/account/reset-password",
            label: "Reset Password",
            description: "Secure your account",
            icon: faLock,
        },
    ];

    return (
        <section className="text-slate-950">
            <div className="mx-auto max-w-[1500px]">
                <div className="mx-auto grid max-w-[1400px] items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="flex min-h-[560px] flex-col rounded-[34px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:min-h-[620px] lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-160px)] lg:overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] bg-orange-500 text-3xl font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.25)]">
                                {user?.profile?.avatar ? (
                                    <img src={user.profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    (user?.full_name || user?.email || user?.phone || "Q")
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-black text-slate-950">
                                    {user?.full_name || "QOT Member"}
                                </h1>

                                <p className="mt-1 truncate text-sm font-bold text-slate-500">
                                    {user?.email || user?.phone}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                            {isPhoneVerified ? (
                                <div className="flex items-center gap-3 text-green-700">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                                        <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <p className="text-sm font-black">Phone verified</p>
                                        <p className="text-xs font-semibold text-green-700/80">
                                            {user?.phone || "Your number is confirmed."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-orange-700">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100">
                                            <FontAwesomeIcon
                                                icon={user?.phone ? faMobileScreen : faShieldHalved}
                                                className="h-5 w-5"
                                            />
                                        </span>

                                        <div>
                                            <p className="text-sm font-black">Phone not verified</p>
                                            <p className="text-xs font-semibold text-orange-700/80">
                                                {user?.phone
                                                    ? "Confirm your number with an SMS code."
                                                    : "Add a phone number to your profile first."}
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={
                                            user?.phone
                                                ? "/account/verification?next=/account"
                                                : "/account"
                                        }
                                        className="block rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        {user?.phone ? "Verify Phone" : "Add Phone Number"}
                                    </a>
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isEmailVerified ? "bg-green-100 text-green-700" : "bg-white text-slate-500"}`}>
                                    <FontAwesomeIcon
                                        icon={isEmailVerified ? faCircleCheck : faEnvelope}
                                        className="h-4 w-4"
                                    />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-slate-800">
                                        {isEmailVerified ? "Email verified" : "Email not verified"}
                                    </p>
                                    <p className="truncate text-[11px] font-semibold text-slate-500">
                                        {user?.email || "No email address added"}
                                    </p>
                                </div>

                                {!isEmailVerified && user?.email && (
                                    <a
                                        href="/account/verification?channel=email&next=/account"
                                        className="text-[11px] font-black text-orange-600 hover:text-orange-700"
                                    >
                                        Verify
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="grid gap-2">
                                    {accountTabs.map((tab) => {
                                        const active = activeTab === tab.id;

                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${active
                                                    ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                                                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 border-t border-slate-100 pt-5">
                                    <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        More account tools
                                    </p>

                                    <div className="mt-3 grid gap-2">
                                        {accountToolLinks.map((item) => (
                                            <a
                                                key={item.href}
                                                href={item.href}
                                                className="group flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 transition hover:bg-orange-50"
                                            >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition group-hover:text-orange-600 group-hover:ring-orange-200">
                                                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                                </span>

                                                <span className="min-w-0">
                                                    <span className="block text-sm font-black text-slate-800 transition group-hover:text-orange-600">
                                                        {item.label}
                                                    </span>
                                                    <span className="block truncate text-[11px] font-semibold text-slate-500">
                                                        {item.description}
                                                    </span>
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </aside>

                    {activeTab === "profile" ? (
                        <ProfileSettingsClient />
                    ) : (
                        <div className="min-w-0">
                            {activeTab === "dashboard" && <SellerDashboardClient />}
                            {activeTab === "analytics" && <SellerAnalyticsClient />}
                            {activeTab === "renewals" && <SellerRenewalsClient />}
                            {activeTab === "saved" && <SavedAdsClient />}
                            {activeTab === "ads" && <MyListingsClient />}
                            {activeTab === "settings" && <NotificationPreferencesClient />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function AccountClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <AccountForm />
        </Suspense>
    );
}
