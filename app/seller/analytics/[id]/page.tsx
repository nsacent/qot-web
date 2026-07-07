import Navbar from "@/components/layout/Navbar";
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
            <ListingAnalyticsClient listingId={id} />
        </main>
    );
}