"use client";

import { useEffect, useState } from "react";
import { getStoredUser, getUserDisplayName } from "@/lib/auth";

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
    },
    {
        key: "messages",
        title: "Chat Messages",
        description: "Receive alerts when buyers or sellers message you.",
    },
    {
        key: "listing_approvals",
        title: "Listing Approvals",
        description: "Know when your advert has been approved.",
    },
    {
        key: "listing_rejections",
        title: "Listing Rejections",
        description: "Know when your advert has been rejected and why.",
    },
    {
        key: "reports",
        title: "Reports and Moderation",
        description: "Receive alerts about reported or moderated adverts.",
    },
    {
        key: "renewals",
        title: "Renewal Reminders",
        description: "Receive reminders when adverts need renewal.",
    },
    {
        key: "marketing",
        title: "Marketing and Promotions",
        description: "Receive QOT updates, promotions, and marketplace news.",
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
        const storedUser = getStoredUser();

        if (!storedUser) {
            window.location.href = "/login?next=/account/notifications";
            return;
        }

        setUser(storedUser);
        setPreferences(loadPreferences());
        setMounted(true);
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
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading notification preferences...
                </div>
            </section>
        );
    }

    const name = getUserDisplayName(user);

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Notification Settings
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
                    Notification Preferences
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Choose which QOT alerts you want to receive. These preferences help
                    reduce unnecessary notifications.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div className="mb-6 rounded-2xl bg-slate-50 p-5">
                        <p className="font-bold text-slate-900">Account</p>
                        <p className="mt-1 text-sm text-slate-600">{name}</p>
                    </div>

                    <div className="space-y-4">
                        {preferenceItems.map((item) => {
                            const enabled = Boolean(preferences[item.key]);

                            return (
                                <div
                                    key={item.key}
                                    className="flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center"
                                >
                                    <div>
                                        <h2 className="font-bold text-slate-900">{item.title}</h2>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => togglePreference(item.key)}
                                        className={
                                            enabled
                                                ? "min-w-28 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600"
                                                : "min-w-28 rounded-full bg-slate-200 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-300"
                                        }
                                    >
                                        {enabled ? "On" : "Off"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={savePreferences}
                            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                        >
                            Save Preferences
                        </button>

                        <button
                            type="button"
                            onClick={resetPreferences}
                            className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
                        >
                            Reset Defaults
                        </button>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Recommended
                        </p>

                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <li>• Keep verification OTP alerts on.</li>
                            <li>• Keep chat message alerts on if you sell often.</li>
                            <li>• Keep approval and rejection alerts on for adverts.</li>
                            <li>• Turn off marketing alerts if you want fewer emails.</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Quick Links
                        </p>

                        <div className="mt-4 grid gap-3">
                            <a
                                href="/notifications"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                View Notifications
                            </a>

                            <a
                                href="/account/verification"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Account Verification
                            </a>

                            <a
                                href="/account"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
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