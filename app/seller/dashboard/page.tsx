import Navbar from "@/components/layout/Navbar";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerDashboardClient from "@/components/dashboard/SellerDashboardClient";

export default function SellerDashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <VerifiedAccountGuard
                title="Seller dashboard requires verification"
                description="Your account must be verified before you can access seller dashboard tools."
            >
                <SellerDashboardClient />
            </VerifiedAccountGuard>
        </main>
    );
}