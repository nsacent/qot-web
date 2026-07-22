import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
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
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />

                <VerifiedAccountGuard
                    title="Ad analytics requires verification"
                    description="Your account must be verified before you can view advert analytics."
                >
                    <ListingAnalyticsClient listingId={id} />
                </VerifiedAccountGuard>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
