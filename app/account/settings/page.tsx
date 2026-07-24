import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";

export const dynamic = "force-dynamic";

export default function AccountSettingsPage() {
    return (
        <VerifiedAccountGuard
            title="Account settings require verification"
            description="Your account must be verified before you can manage notification preferences."
        >
            <div className="space-y-6">
                <NotificationPreferencesClient />
            </div>
        </VerifiedAccountGuard>
    );
}
