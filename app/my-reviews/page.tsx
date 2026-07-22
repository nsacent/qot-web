import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import MyReviewsClient from "@/components/reviews/MyReviewsClient";

export default function MyReviewsPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />
                <MyReviewsClient />
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
