"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getUserDisplayName } from "@/lib/auth";
import { getCurrentUser, updateCurrentUser } from "@/lib/sessionClient";
import {
    faBell,
    faBullhorn,
    faCircleCheck,
    faClock,
    faEnvelope,
    faHeart,
    faShieldHalved,
    faUser,
} from "@/lib/faIcons";
import UserAvatar from "@/components/account/UserAvatar";
import { QotInlineLoader } from "@/components/common/QotLoader";

const defaultPreferences = {
    verification: true,
    messages: true,
    listing_approvals: true,
    listing_rejections: true,
    favorites: true,
    followers: true,
    reports: true,
    renewals: true,
    marketing: false,
};

type NotificationPreferences = typeof defaultPreferences;

const preferenceItems = [
    {
        key: "verification",
        title: "Verification OTP",
        description: "Receive phone OTPs for account verification.",
        icon: faShieldHalved,
        iconTone: "bg-violet-100 text-violet-600",
    },
    {
        key: "messages",
        title: "Messages & Offers",
        description: "Receive alerts for chats, price offers, and offer decisions.",
        icon: faEnvelope,
        iconTone: "bg-blue-100 text-blue-600",
    },
    {
        key: "listing_approvals",
        title: "Ad Approvals",
        description: "Know when your advert has been approved.",
        icon: faCircleCheck,
        iconTone: "bg-green-100 text-green-600",
    },
    {
        key: "listing_rejections",
        title: "Ad Rejections",
        description: "Know when your advert has been rejected and why.",
        icon: faBell,
        iconTone: "bg-red-100 text-red-600",
    },
    {
        key: "favorites",
        title: "Saved Ad Alerts",
        description: "Know when someone saves one of your ads.",
        icon: faHeart,
        iconTone: "bg-rose-100 text-rose-600",
    },
    {
        key: "followers",
        title: "New Followers",
        description: "Know when a member starts following your seller profile.",
        icon: faUser,
        iconTone: "bg-cyan-100 text-cyan-700",
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
] as const;

function normalizePreferences(value: unknown): NotificationPreferences {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { ...defaultPreferences };
    }

    const saved = value as Partial<NotificationPreferences>;

    return Object.fromEntries(
        Object.entries(defaultPreferences).map(([key, fallback]) => [
            key,
            typeof saved[key as keyof NotificationPreferences] === "boolean"
                ? saved[key as keyof NotificationPreferences]
                : fallback,
        ])
    ) as NotificationPreferences;
}

export default function NotificationPreferencesClient() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        ...defaultPreferences,
    });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadAccount() {
            try {
                const currentUser = await getCurrentUser();
                if (!active) return;

                const account = currentUser?.user || currentUser?.data || currentUser;
                setUser(account);
                setPreferences(
                    normalizePreferences(account?.profile?.notification_preferences)
                );
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

    function togglePreference(key: keyof NotificationPreferences) {
        setSuccess("");
        setError("");

        setPreferences((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    async function persistPreferences(nextPreferences: NotificationPreferences) {
        setSaving(true);
        setSuccess("");
        setError("");

        try {
            await updateCurrentUser({
                profile: {
                    notification_preferences: nextPreferences,
                },
            });
            setPreferences(nextPreferences);
            setSuccess("Notification preferences saved to your QOT account.");
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Failed to save notification preferences."
            );
        } finally {
            setSaving(false);
        }
    }

    async function savePreferences() {
        await persistPreferences(preferences);
    }

    async function resetPreferences() {
        await persistPreferences({ ...defaultPreferences });
    }

    if (!mounted || !user) {
        return (
            <section className="py-0 md:py-6">
                <div className="rounded-[30px] bg-white p-10 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <QotInlineLoader text="Loading account settings…" />
                </div>
            </section>
        );
    }

    const name = getUserDisplayName(user);
    const enabledCount = preferenceItems.filter((item) => preferences[item.key]).length;
    const mutedCount = preferenceItems.length - enabledCount;

    return (
        <section className="pb-24 pt-0 md:py-6">
            <div className="relative mb-7 hidden overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-7 text-white shadow-[0_24px_65px_rgba(15,23,42,0.20)] md:block">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                    <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-orange-300/20">Account Settings</span>
                    <h1 className="mt-4 text-3xl font-black tracking-tight">Choose how QOT keeps you informed</h1>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">Control marketplace alerts, seller updates, renewal reminders, and promotional messages.</p>
                    </div>

                    <div className="flex items-center gap-3 rounded-[20px] bg-white/10 p-3 pr-5 ring-1 ring-white/15 backdrop-blur">
                        <UserAvatar
                            user={user}
                            name={name}
                            className="h-12 w-12 rounded-[16px] bg-orange-500 text-lg text-white"
                        />
                        <div>
                            <p className="max-w-44 truncate text-sm font-black text-white">{name}</p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-300">{enabledCount} of {preferenceItems.length} alerts enabled</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:hidden">
                <div className="rounded-[20px] bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-lg shadow-orange-100">
                    <p className="text-[9px] font-black uppercase tracking-wide text-orange-100">Enabled</p>
                    <p className="mt-2 text-2xl font-black">{enabledCount}</p>
                    <p className="mt-1 text-[9px] font-bold text-orange-100">Alerts reaching you</p>
                </div>
                <div className="rounded-[20px] bg-white p-4 text-slate-800 shadow-sm ring-1 ring-slate-200">
                    <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Muted</p>
                    <p className="mt-2 text-2xl font-black">{mutedCount}</p>
                    <p className="mt-1 text-[9px] font-bold text-slate-400">Alerts turned off</p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 md:hidden">
                <a href="/account/notifications" className="rounded-2xl bg-white px-3 py-3 text-center text-[11px] font-black text-slate-700 ring-1 ring-slate-200">Notifications</a>
                <a href="/account/verification" className="rounded-2xl bg-white px-3 py-3 text-center text-[11px] font-black text-slate-700 ring-1 ring-slate-200">Verification</a>
            </div>

            <div className="mt-5 grid gap-6 md:mt-0 xl:grid-cols-[minmax(0,1fr)_310px]">
                <div className="rounded-[24px] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:rounded-[30px] md:p-7">
                    {success && (
                        <div className="mb-6 flex items-center gap-3 rounded-[18px] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
                            <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600 md:text-xs">Notification Preferences</p>
                            <h2 className="mt-1 text-lg font-black text-slate-950 md:mt-2 md:text-2xl">Your alerts</h2>
                            <p className="mt-1 text-xs font-semibold text-slate-500 md:text-sm">Choose exactly what QOT sends you.</p>
                        </div>
                        <span className="hidden rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 ring-1 ring-orange-100 sm:inline-flex">{enabledCount} enabled</span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {preferenceItems.map((item) => {
                            const enabled = Boolean(preferences[item.key]);

                            return (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50 p-3.5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-sm md:rounded-[22px] md:p-4"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] md:h-10 md:w-10 ${item.iconTone}`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                                        </span>

                                        <div className="min-w-0">
                                        <h3 className="text-xs font-black text-slate-900 md:text-sm">{item.title}</h3>

                                        <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500 md:text-[11px] md:leading-5">
                                            {item.description}
                                        </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => togglePreference(item.key)}
                                        disabled={saving}
                                        aria-pressed={enabled}
                                        aria-label={`${enabled ? "Disable" : "Enable"} ${item.title}`}
                                        className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${enabled ? "bg-orange-500" : "bg-slate-300"}`}
                                    >
                                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${enabled ? "left-6" : "left-1"}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="fixed inset-x-0 bottom-[68px] z-[80] flex gap-2 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                        <button
                            type="button"
                            onClick={savePreferences}
                            disabled={saving}
                            className="min-w-0 flex-1 rounded-[16px] bg-orange-500 px-4 py-3.5 text-xs font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] hover:bg-orange-600 disabled:opacity-60 md:flex-none md:px-6 md:text-sm"
                        >
                            {saving ? "Saving..." : "Save settings"}
                        </button>

                        <button
                            type="button"
                            onClick={resetPreferences}
                            disabled={saving}
                            className="min-w-0 flex-1 rounded-[16px] bg-slate-50 px-4 py-3.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-60 md:flex-none md:px-6 md:text-sm"
                        >
                            Reset Defaults
                        </button>
                    </div>
                </div>

                <aside className="hidden space-y-5 xl:block">
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
