import Navbar from "@/components/layout/QotMarketplaceNav";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import SellerRenewalsClient from "@/components/dashboard/SellerRenewalsClient";

export const dynamic = "force-dynamic";

export default function SellerRenewalsPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />

                <VerifiedAccountGuard
                    title="Renewal center requires verification"
                    description="Your account must be verified before you can renew or relist adverts."
                >
                    <SellerRenewalsClient />
                </VerifiedAccountGuard>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
