import Navbar from "@/components/layout/Navbar";
import SellerDashboardClient from "@/components/dashboard/SellerDashboardClient";

export default function SellerDashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <SellerDashboardClient />
        </main>
    );
}