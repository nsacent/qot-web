import NotificationsClient from "@/components/notifications/NotificationsClient";
import RequireAccountSession from "@/components/account/RequireAccountSession";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

export default function AccountNotificationsPage() {
    return (
        <RequireAccountSession>
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />
                <NotificationsClient />
            </div>
            <QotMarketplaceFooter />
        </main>
        </RequireAccountSession>
    );
}
