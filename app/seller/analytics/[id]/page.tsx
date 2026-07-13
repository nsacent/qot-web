import Navbar from "@/components/layout/QotMarketplaceNav";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import ListingAnalyticsClient from "@/components/dashboard/ListingAnalyticsClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function SingleListingAnalyticsPage({
    params,
}: PageProps) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <VerifiedAccountGuard
                title="Listing analytics requires verification"
                description="Your account must be verified before you can view advert analytics."
            >
                <ListingAnalyticsClient listingId={id} />
            </VerifiedAccountGuard>
        </main>
    );
}