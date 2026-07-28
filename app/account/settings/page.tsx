import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";
import AccountSignOutSection from "@/components/account/AccountSignOutSection";

export const dynamic = "force-dynamic";

export default function AccountSettingsPage() {
    return (
        <div className="space-y-6">
            <VerifiedAccountGuard
                title="Account settings require verification"
                description="Your account must be verified before you can manage notification preferences."
            >
                <NotificationPreferencesClient />
            </VerifiedAccountGuard>
            <AccountSignOutSection />
        </div>
    );
}
