import Navbar from "@/components/layout/Navbar";
import SafetyReportClient from "@/components/safety/SafetyReportClient";

export default function SafetyReportPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <SafetyReportClient />
        </main>
    );
}