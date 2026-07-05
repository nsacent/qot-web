"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const DASHBOARD_ENDPOINT = "/admin-panel/dashboard/";

function getValue(data: any, keys: string[]) {
    for (const key of keys) {
        if (data?.[key] !== undefined && data?.[key] !== null) {
            return data[key];
        }
    }

    return 0;
}

function money(value: any) {
    return `UGX ${Number(value || 0).toLocaleString()}`;
}

export default function AdminDashboardClient() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(DASHBOARD_ENDPOINT);
            setDashboard(data);
        } catch (error: any) {
            setError(error.message || "Failed to load admin dashboard.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading admin dashboard...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {error}
                </div>
            </section>
        );
    }

    const cards = [
        {
            label: "Total Users",
            value: getValue(dashboard, ["users_count", "total_users", "user_count"]),
            description: "Registered accounts",
            href: "/admin/users",
        },
        {
            label: "Total Listings",
            value: getValue(dashboard, [
                "listings_count",
                "total_listings",
                "listing_count",
            ]),
            description: "All adverts on QOT",
            href: "/admin/listings",
        },
        {
            label: "Reports",
            value: getValue(dashboard, [
                "reports_count",
                "total_reports",
                "report_count",
                "unresolved_reports",
            ]),
            description: "Reported adverts",
            href: "/admin/reports",
        },
        {
            label: "Payments",
            value: getValue(dashboard, [
                "payments_count",
                "total_payments",
                "payment_count",
            ]),
            description: "Payment records",
            href: "/admin/payments",
        },
    ];

    const revenueCards = [
        {
            label: "Total Revenue",
            value: money(
                getValue(dashboard, ["total_revenue", "revenue_total", "revenue"])
            ),
        },
        {
            label: "Today Revenue",
            value: money(
                getValue(dashboard, ["today_revenue", "revenue_today"])
            ),
        },
        {
            label: "Week Revenue",
            value: money(
                getValue(dashboard, ["week_revenue", "weekly_revenue", "revenue_week"])
            ),
        },
        {
            label: "Month Revenue",
            value: money(
                getValue(dashboard, [
                    "month_revenue",
                    "monthly_revenue",
                    "revenue_month",
                ])
            ),
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Platform Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Live summary from your QOT admin dashboard API.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadDashboard}
                    className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                >
                    Refresh
                </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <a
                        key={card.label}
                        href={card.href}
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                    >
                        <p className="text-sm font-semibold text-slate-500">
                            {card.label}
                        </p>

                        <p className="mt-3 text-4xl font-bold text-slate-900">
                            {Number(card.value || 0).toLocaleString()}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            {card.description}
                        </p>
                    </a>
                ))}
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-bold text-slate-900">Revenue Summary</h3>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {revenueCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border bg-white p-6 shadow-sm"
                        >
                            <p className="text-sm font-semibold text-slate-500">
                                {card.label}
                            </p>

                            <p className="mt-3 text-2xl font-bold text-orange-600">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                    Moderation Shortcuts
                </h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                        href="/admin/reports"
                        className="rounded-xl bg-red-50 px-5 py-4 font-semibold text-red-700 hover:bg-red-100"
                    >
                        Review Reports
                    </a>

                    <a
                        href="/admin/listings"
                        className="rounded-xl bg-orange-50 px-5 py-4 font-semibold text-orange-700 hover:bg-orange-100"
                    >
                        Manage Listings
                    </a>

                    <a
                        href="/admin/users"
                        className="rounded-xl bg-slate-100 px-5 py-4 font-semibold text-slate-700 hover:bg-slate-200"
                    >
                        Manage Users
                    </a>

                    <a
                        href="/admin/payments"
                        className="rounded-xl bg-green-50 px-5 py-4 font-semibold text-green-700 hover:bg-green-100"
                    >
                        View Payments
                    </a>
                </div>
            </div>
        </section>
    );
}