"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getUserDisplayName } from "@/lib/auth";
import { getCurrentUser } from "@/lib/sessionClient";
import {
    faBell,
    faBullhorn,
    faCircleCheck,
    faClock,
    faEnvelope,
    faShieldHalved,
    faUser,
} from "@/lib/faIcons";

const STORAGE_KEY = "qot_notification_preferences";

const defaultPreferences = {
    verification: true,
    messages: true,
    listing_approvals: true,
    listing_rejections: true,
    reports: true,
    renewals: true,
    marketing: false,
};

const preferenceItems = [
    {
        key: "verification",
        title: "Verification OTP",
        description: "Receive email OTPs for account verification.",
        icon: faShieldHalved,
        iconTone: "bg-violet-100 text-violet-600",
    },
    {
        key: "messages",
        title: "Chat Messages",
        description: "Receive alerts when buyers or sellers message you.",
        icon: faEnvelope,
        iconTone: "bg-blue-100 text-blue-600",
    },
    {
        key: "listing_approvals",
        title: "Listing Approvals",
        description: "Know when your advert has been approved.",
        icon: faCircleCheck,
        iconTone: "bg-green-100 text-green-600",
    },
    {
        key: "listing_rejections",
        title: "Listing Rejections",
        description: "Know when your advert has been rejected and why.",
        icon: faBell,
        iconTone: "bg-red-100 text-red-600",
    },
    {
        key: "reports",
        title: "Reports and Moderation",
        description: "Receive alerts about reported or moderated adverts.",
        icon: faShieldHalved,
        iconTone: "bg-amber-100 text-amber-600",
    },
    {
        key: "renewals",
        title: "Renewal Reminders",
        description: "Receive reminders when adverts need renewal.",
        icon: faClock,
        iconTone: "bg-orange-100 text-orange-600",
    },
    {
        key: "marketing",
        title: "Marketing and Promotions",
        description: "Receive QOT updates, promotions, and marketplace news.",
        icon: faBullhorn,
        iconTone: "bg-pink-100 text-pink-600",
    },
];

function loadPreferences() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return defaultPreferences;

        return {
            ...defaultPreferences,
            ...JSON.parse(saved),
        };
    } catch {
        return defaultPreferences;
    }
}

export default function NotificationPreferencesClient() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [preferences, setPreferences] = useState<any>(defaultPreferences);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        async function loadAccount() {
            try {
                const currentUser = await getCurrentUser();
                if (!active) return;

                setUser(currentUser?.user || currentUser?.data || currentUser);
                setPreferences(loadPreferences());
                setMounted(true);
            } catch {
                window.location.href = "/login?next=/account/settings";
            }
        }

        loadAccount();

        return () => {
            active = false;
        };
    }, []);

    function togglePreference(key: string) {
        setSuccess("");

        setPreferences((current: any) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    function savePreferences() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        setSuccess("Notification preferences saved successfully.");
    }

    function resetPreferences() {
        const confirmed = window.confirm("Reset notification preferences?");
        if (!confirmed) return;

        setPreferences(defaultPreferences);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPreferences));
        setSuccess("Notification preferences reset.");
    }

    if (!mounted || !user) {
        return (
            <section className="py-6">
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                    <p className="mt-4 text-sm font-black text-slate-600">Loading account settings...</p>
                </div>
            </section>
        );
    }

    const name = getUserDisplayName(user);
    const enabledCount = preferenceItems.filter((item) => preferences[item.key]).length;

    return (
        <section className="py-6">
            <div className="relative mb-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                    <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-orange-300/20">Account Settings</span>
                    <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Choose how QOT keeps you informed</h1>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">Control marketplace alerts, seller updates, renewal reminders, and promotional messages.</p>
                    </div>

                    <div className="flex items-center gap-3 rounded-[20px] bg-white/10 p-3 pr-5 ring-1 ring-white/15 backdrop-blur">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-orange-500 text-lg font-black text-white">
                            {name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <p className="max-w-44 truncate text-sm font-black text-white">{name}</p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-300">{enabledCount} of {preferenceItems.length} alerts enabled</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:p-8">
                    {success && (
                        <div className="mb-6 flex items-center gap-3 rounded-[18px] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
                            <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
                            {success}
                        </div>
                    )}

                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Notification Preferences</p>
                            <h2 className="mt-2 text-2xl font-black text-slate-950">Your alerts</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Turn individual QOT updates on or off.</p>
                        </div>
                        <span className="hidden rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 ring-1 ring-orange-100 sm:inline-flex">{enabledCount} enabled</span>
                    </div>

                    <div className="space-y-4">
                        {preferenceItems.map((item) => {
                            const enabled = Boolean(preferences[item.key]);

                            return (
                                <div
                                    key={item.key}
                                    className="flex flex-col justify-between gap-4 rounded-[22px] bg-slate-50 p-5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-sm sm:flex-row sm:items-center"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${item.iconTone}`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                        </span>

                                        <div>
                                        <h3 className="font-black text-slate-900">{item.title}</h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {item.description}
                                        </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => togglePreference(item.key)}
                                        aria-pressed={enabled}
                                        aria-label={`${enabled ? "Disable" : "Enable"} ${item.title}`}
                                        className={`relative h-8 w-14 shrink-0 rounded-full transition ${enabled ? "bg-orange-500" : "bg-slate-300"}`}
                                    >
                                        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${enabled ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={savePreferences}
                            className="rounded-[16px] bg-orange-500 px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] hover:bg-orange-600"
                        >
                            Save Preferences
                        </button>

                        <button
                            type="button"
                            onClick={resetPreferences}
                            className="rounded-[16px] bg-slate-50 px-6 py-3.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                            Reset Defaults
                        </button>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-[26px] bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-[0_16px_40px_rgba(249,115,22,0.22)]">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/15 ring-1 ring-white/20">
                            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                        </span>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-orange-100">
                            Recommended
                        </p>

                        <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-orange-50">
                            <li className="flex gap-2"><span>✓</span> Keep verification alerts on.</li>
                            <li className="flex gap-2"><span>✓</span> Keep buyer messages enabled.</li>
                            <li className="flex gap-2"><span>✓</span> Watch approval and rejection updates.</li>
                            <li className="flex gap-2"><span>✓</span> Use renewal reminders to stay visible.</li>
                        </ul>
                    </div>

                    <div className="rounded-[26px] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-100 text-slate-600">
                                <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                            </span>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                            Quick Links
                            </p>
                        </div>

                        <div className="mt-4 grid gap-3">
                            <a
                                href="/account/notifications"
                                className="rounded-[14px] bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                            >
                                View Notifications
                            </a>

                            <a
                                href="/account/verification"
                                className="rounded-[14px] bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                            >
                                Account Verification
                            </a>

                            <a
                                href="/account"
                                className="rounded-[14px] bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-600"
                            >
                                My Account
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
