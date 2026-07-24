import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import ListingAnalyticsClient from "@/components/dashboard/ListingAnalyticsClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function SingleListingAnalyticsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <VerifiedAccountGuard
            title="Ad analytics requires verification"
            description="Your account must be verified before you can view ad analytics."
        >
            <ListingAnalyticsClient listingId={id} />
        </VerifiedAccountGuard>
    );
}
