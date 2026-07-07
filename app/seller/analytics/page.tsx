import Navbar from "@/components/layout/Navbar";
import SellerAnalyticsClient from "@/components/dashboard/SellerAnalyticsClient";

export default function SellerAnalyticsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <SellerAnalyticsClient />
        </main>
    );
}