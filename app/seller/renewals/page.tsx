import Navbar from "@/components/layout/QotMarketplaceNav";
import SellerRenewalsClient from "@/components/dashboard/SellerRenewalsClient";

export const dynamic = "force-dynamic";

export default function SellerRenewalsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <SellerRenewalsClient />
        </main>
    );
}