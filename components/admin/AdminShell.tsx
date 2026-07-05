"use client";

import { useEffect, useState } from "react";

const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Listings", href: "/admin/listings" },
    { label: "Users", href: "/admin/users" },
    { label: "Payments", href: "/admin/payments" },
];

type AdminShellProps = {
    children: React.ReactNode;
};

function getStoredToken() {
    return (
        localStorage.getItem("qot_access_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token") ||
        ""
    );
}

export default function AdminShell({ children }: AdminShellProps) {
    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        try {
            const token = getStoredToken();

            if (!token) {
                setAllowed(false);
                setChecking(false);

                const nextUrl = encodeURIComponent(window.location.pathname);
                window.location.href = `/login?next=${nextUrl}`;
                return;
            }

            localStorage.setItem("qot_access_token", token);

            setAllowed(true);
            setChecking(false);
        } catch (error) {
            console.error("Admin access check failed:", error);
            setAllowed(false);
            setChecking(false);
        }
    }, []);

    if (checking) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-slate-600">
                    Checking admin access...
                </div>
            </main>
        );
    }

    if (!allowed) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Login required
                    </h1>
                    <p className="mt-2 text-slate-600">
                        You need to login before accessing the admin panel.
                    </p>

                    <a
                        href="/login?next=/admin"
                        className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Go to Login
                    </a>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
                <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <a href="/admin" className="block">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            QOT Admin
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Control Panel
                        </h2>
                    </a>

                    <nav className="mt-6 grid gap-2">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Admin tools</p>
                        <p className="mt-1">
                            Manage listings, users, reports, and platform activity.
                        </p>
                    </div>

                    <a
                        href="/"
                        className="mt-5 block rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                    >
                        Back to Website
                    </a>
                </aside>

                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}