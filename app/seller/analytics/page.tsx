import Navbar from "@/components/layout/QotMarketplaceNav";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerAnalyticsClient from "@/components/dashboard/SellerAnalyticsClient";

export default function SellerAnalyticsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <VerifiedAccountGuard
                title="Seller analytics requires verification"
                description="Your account must be verified before you can view seller analytics."
            >
                <SellerAnalyticsClient />
            </VerifiedAccountGuard>
        </main>
    );
}