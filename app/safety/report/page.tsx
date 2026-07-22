import { Suspense } from "react";
import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import SafetyReportClient from "@/components/safety/SafetyReportClient";

export const dynamic = "force-dynamic";

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
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />

                <Suspense fallback={<SafetyReportFallback />}>
                    <SafetyReportClient />
                </Suspense>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
