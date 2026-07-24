import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerAnalyticsClient from "@/components/dashboard/SellerAnalyticsClient";

export default function SellerAnalyticsPage() {
    return (
        <VerifiedAccountGuard
            title="Seller analytics requires verification"
            description="Your account must be verified before you can view seller analytics."
        >
            <SellerAnalyticsClient />
        </VerifiedAccountGuard>
    );
}
