"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircleCheck,
    faClock,
    faCreditCard,
    faFlag,
    faListCheck,
    faMoneyBillTrendUp,
    faShieldHalved,
    faStore,
    faTriangleExclamation,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet } from "@/lib/apiClient";
import {
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminRefreshButton,
    AdminStatCard,
} from "@/components/admin/AdminUi";

const DASHBOARD_ENDPOINT = "/admin-panel/dashboard/";

function getValue(data: any, keys: string[]) {
    for (const key of keys) {
        if (data?.[key] !== undefined && data?.[key] !== null) {
            return Number(data[key]) || 0;
        }
    }

    return 0;
}

function number(value: any) {
    return Number(value || 0).toLocaleString();
}

function money(value: any) {
    return `UGX ${Number(value || 0).toLocaleString()}`;
}

export default function AdminDashboardClient() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(DASHBOARD_ENDPOINT);
            setDashboard(data);
            setLastUpdated(
                new Date().toLocaleTimeString("en-UG", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );
        } catch (error: any) {
            setError(error.message || "Failed to load admin dashboard.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    const primaryStats = [
        {
            label: "Total users",
            value: number(getValue(dashboard, ["total_users", "users_count"])),
            detail: `${number(getValue(dashboard, ["banned_users"]))} currently banned`,
            href: "/admin/users",
            icon: faUsers,
            tone: "blue" as const,
        },
        {
            label: "All ads",
            value: number(getValue(dashboard, ["total_listings", "listings_count"])),
            detail: `${number(getValue(dashboard, ["active_listings"]))} active adverts`,
            href: "/admin/ads",
            icon: faStore,
            tone: "orange" as const,
        },
        {
            label: "Open reports",
            value: number(getValue(dashboard, ["unresolved_reports", "reports_count"])),
            detail: `${number(getValue(dashboard, ["resolved_reports"]))} resolved`,
            href: "/admin/reports",
            icon: faFlag,
            tone: "red" as const,
        },
        {
            label: "Payments",
            value: number(getValue(dashboard, ["total_payments", "payments_count"])),
            detail: `${number(getValue(dashboard, ["paid_payments"]))} successful`,
            href: "/admin/payments",
            icon: faCreditCard,
            tone: "green" as const,
        },
    ];

    const queueItems = [
        {
            label: "Pending ads",
            value: getValue(dashboard, ["pending_listings"]),
            href: "/admin/ads",
            icon: faClock,
            tone: "bg-orange-50 text-orange-600",
        },
        {
            label: "Rejected ads",
            value: getValue(dashboard, ["rejected_listings"]),
            href: "/admin/ads",
            icon: faTriangleExclamation,
            tone: "bg-red-50 text-red-600",
        },
        {
            label: "Pending payments",
            value: getValue(dashboard, ["pending_payments"]),
            href: "/admin/payments",
            icon: faCreditCard,
            tone: "bg-violet-50 text-violet-600",
        },
        {
            label: "Resolved reports",
            value: getValue(dashboard, ["resolved_reports"]),
            href: "/admin/reports",
            icon: faCircleCheck,
            tone: "bg-emerald-50 text-emerald-600",
        },
    ];

    return (
        <section>
            <AdminPageHeader
                eyebrow="Command centre"
                title="Platform overview"
                description="Monitor QOT activity, moderation queues, users, ads, and revenue from one focused workspace."
                action={<AdminRefreshButton onClick={loadDashboard} loading={loading} />}
            />

            {loading && !dashboard ? (
                <AdminLoadingState label="Loading admin dashboard" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={loadDashboard} />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {primaryStats.map((card) => (
                            <AdminStatCard key={card.label} {...card} />
                        ))}
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                        <section className="overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-7">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                                        Revenue performance
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight">
                                        {money(getValue(dashboard, ["total_revenue"]))}
                                    </h3>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        Total confirmed platform revenue
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-950/40">
                                    <FontAwesomeIcon icon={faMoneyBillTrendUp} className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                {[
                                    ["Today", getValue(dashboard, ["today_revenue"])],
                                    ["This week", getValue(dashboard, ["this_week_revenue", "week_revenue"])],
                                    ["This month", getValue(dashboard, ["this_month_revenue", "month_revenue"])],
                                ].map(([label, value]) => (
                                    <div key={String(label)} className="rounded-2xl bg-white/7 p-4 ring-1 ring-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {label}
                                        </p>
                                        <p className="mt-2 text-base font-black text-white">
                                            {money(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                        Moderation
                                    </p>
                                    <h3 className="mt-1 text-xl font-black text-slate-950">
                                        Work queue
                                    </h3>
                                </div>
                                <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5 text-slate-300" />
                            </div>

                            <div className="mt-5 grid gap-2">
                                {queueItems.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-slate-50"
                                    >
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-xs font-black text-slate-700">
                                                {item.label}
                                            </span>
                                            <span className="block text-lg font-black text-slate-950">
                                                {number(item.value)}
                                            </span>
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="h-3 w-3 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500"
                                        />
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                    Ad health
                                </p>
                                <h3 className="mt-1 text-xl font-black text-slate-950">
                                    Marketplace status
                                </h3>
                            </div>
                            {lastUpdated && (
                                <p className="text-xs font-bold text-slate-400">
                                    Updated at {lastUpdated}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {[
                                ["Active", "active_listings", "text-emerald-600"],
                                ["Pending", "pending_listings", "text-orange-600"],
                                ["Sold", "sold_listings", "text-blue-600"],
                                ["Expired", "expired_listings", "text-slate-600"],
                                ["Unavailable", "unavailable_listings", "text-red-600"],
                            ].map(([label, key, tone]) => (
                                <div key={key} className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        {label}
                                    </p>
                                    <p className={`mt-2 text-2xl font-black ${tone}`}>
                                        {number(getValue(dashboard, [key]))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
