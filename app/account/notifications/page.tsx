import Navbar from "@/components/layout/QotMarketplaceNav";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";

export default function NotificationPreferencesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <NotificationPreferencesClient />
        </main>
    );
}