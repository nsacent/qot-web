import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerDashboardClient from "@/components/dashboard/SellerDashboardClient";

export const dynamic = "force-dynamic";

export default function AccountDashboardPage() {
    return (
        <VerifiedAccountGuard
            title="Account dashboard requires verification"
            description="Your account must be verified before you can access dashboard tools."
        >
            <SellerDashboardClient />
        </VerifiedAccountGuard>
    );
}
