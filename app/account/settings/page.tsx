import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";

export const dynamic = "force-dynamic";

export default function AccountSettingsPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />

                <VerifiedAccountGuard
                    title="Account settings require verification"
                    description="Your account must be verified before you can manage seller notification preferences."
                >
                    <NotificationPreferencesClient />
                </VerifiedAccountGuard>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
