"use client";

import { useEffect, useState } from "react";
import {
    clearAuthStorage,
    getStoredUser,
    getUserDisplayName,
    getUserRole,
    isAdminOrModerator,
} from "@/lib/auth";

function getUserPhone(user: any) {
    return (
        user?.phone ||
        user?.phone_number ||
        user?.mobile ||
        user?.identifier ||
        "Not provided"
    );
}

function getUserEmail(user: any) {
    return user?.email || "Not provided";
}

function getVerificationStatus(user: any) {
    if (
        user?.is_verified === true ||
        user?.verified === true ||
        user?.account_verified === true ||
        user?.phone_verified === true
    ) {
        return "Verified";
    }

    return "Not verified";
}

export default function AccountClient() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = getStoredUser();

        if (!storedUser) {
            window.location.href = "/login?next=/account";
            return;
        }

        setUser(storedUser);
        setMounted(true);
    }, []);

    function logout() {
        clearAuthStorage();
        window.location.href = "/";
    }

    if (!mounted || !user) {
        return (
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading account...
                </div>
            </section>
        );
    }

    const name = getUserDisplayName(user);
    const role = getUserRole(user) || "user";
    const verified = getVerificationStatus(user);
    const isStaff = isAdminOrModerator(user);

    const quickLinks = [
        {
            label: "Saved Searches",
            href: "/saved-searches",
            description: "Reopen your saved filters",
        },

        {
            label: "My Listings",
            href: "/my-listings",
            description: "Manage your adverts",
        },
        {
            label: "Seller Dashboard",
            href: "/seller/dashboard",
            description: "Seller summary and renewal tools",
        },
        {
            label: "Seller Analytics",
            href: "/seller/analytics",
            description: "Track advert performance",
        },
        {
            label: "Saved Adverts",
            href: "/saved",
            description: "Listings you saved",
        },
        {
            label: "Messages",
            href: "/messages",
            description: "Buyer and seller chats",
        },
        {
            label: "Notifications",
            href: "/notifications",
            description: "Account alerts",
        },
        {
            label: "My Reviews",
            href: "/my-reviews",
            description: "Reviews you submitted",
        },
        {
            label: "Recently Viewed",
            href: "/recently-viewed",
            description: "Adverts opened recently",
        },
    ];

    if (isStaff) {
        quickLinks.unshift({
            label: "Admin Panel",
            href: "/admin",
            description: "Moderate users, listings, and reports",
        });
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    My Account
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Account Profile
                </h1>

                <p className="mt-2 text-slate-600">
                    View your account details and quickly access your QOT tools.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <aside className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500 text-4xl font-black text-white">
                        {name.charAt(0).toUpperCase()}
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-900">{name}</h2>

                    <div className="mt-5 space-y-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-500">Role</p>
                            <p className="mt-1 font-bold capitalize text-slate-900">{role}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-500">Verification</p>
                            <p
                                className={
                                    verified === "Verified"
                                        ? "mt-1 font-bold text-green-600"
                                        : "mt-1 font-bold text-red-600"
                                }
                            >
                                {verified}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-500">Phone</p>
                            <p className="mt-1 font-bold text-slate-900">
                                {getUserPhone(user)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-500">Email</p>
                            <p className="mt-1 break-words font-bold text-slate-900">
                                {getUserEmail(user)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
                    >
                        Logout
                    </button>
                </aside>

                <div>
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Quick Links
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                What would you like to do?
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {quickLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-2xl border p-5 hover:border-orange-200 hover:bg-orange-50"
                                >
                                    <p className="font-bold text-slate-900">{link.label}</p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        {link.description}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Seller Tools
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Start selling faster
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Post adverts with clear images, honest descriptions, fair prices,
                            and quick responses to buyers.
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="/post-ad"
                                className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                            >
                                Post New Advert
                            </a>

                            <a
                                href="/my-listings"
                                className="rounded-xl border px-5 py-3 text-center font-semibold hover:bg-slate-50"
                            >
                                Manage Listings
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}