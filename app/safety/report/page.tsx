import { Suspense } from "react";
import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import SafetyReportClient from "@/components/safety/SafetyReportClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Marketplace Safety and Reporting",
    description: "Learn how to buy and sell safely on QOT Uganda, identify common scams and report a suspicious ad or seller.",
    alternates: { canonical: "/safety/report" },
    openGraph: {
        title: "Marketplace Safety on QOT Uganda",
        description: "Safety guidance for buyers and sellers, plus tools to report suspicious marketplace activity.",
        url: "https://qot.ug/safety/report",
    },
};

function SafetyReportFallback() {
    return (
        <section className="py-6">
            <div className="animate-pulse rounded-[34px] bg-white p-8 font-bold text-slate-400 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                Loading report form...
            </div>
        </section>
    );
}

export default function SafetyReportPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-3 py-2 md:px-6 md:py-4">
                <Navbar />

                <Suspense fallback={<SafetyReportFallback />}>
                    <SafetyReportClient />
                </Suspense>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
