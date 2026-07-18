import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerAnalyticsClient from "@/components/dashboard/SellerAnalyticsClient";

export default function SellerAnalyticsPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />

                <VerifiedAccountGuard
                    title="Seller analytics requires verification"
                    description="Your account must be verified before you can view seller analytics."
                >
                    <SellerAnalyticsClient />
                </VerifiedAccountGuard>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
