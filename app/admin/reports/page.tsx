import Navbar from "@/components/layout/QotMarketplaceNav";
import ReportModerationClient from "@/components/admin/ReportModerationClient";

export default function AdminReportsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <ReportModerationClient />
        </main>
    );
}