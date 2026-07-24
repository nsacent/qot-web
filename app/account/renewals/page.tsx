import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import SellerRenewalsClient from "@/components/dashboard/SellerRenewalsClient";

export const dynamic = "force-dynamic";

export default function SellerRenewalsPage() {
    return (
        <VerifiedAccountGuard
            title="Renewal center requires verification"
            description="Your account must be verified before you can renew or relist ads."
        >
            <SellerRenewalsClient />
        </VerifiedAccountGuard>
    );
}
