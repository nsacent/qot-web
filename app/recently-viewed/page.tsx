import RecentlyViewedClient from "@/components/listings/RecentlyViewedClient";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

export default function RecentlyViewedPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />

                <RecentlyViewedClient />
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
