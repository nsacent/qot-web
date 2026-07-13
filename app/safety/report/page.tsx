import { Suspense } from "react";
import Navbar from "@/components/layout/QotMarketplaceNav";
import SafetyReportClient from "@/components/safety/SafetyReportClient";

export const dynamic = "force-dynamic";

function SafetyReportFallback() {
    return (
        <section className="mx-auto max-w-5xl px-6 py-10">
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading report form...
            </div>
        </section>
    );
}

export default function SafetyReportPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <Suspense fallback={<SafetyReportFallback />}>
                <SafetyReportClient />
            </Suspense>
        </main>
    );
}