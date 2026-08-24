import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";
import AccountSignOutSection from "@/components/account/AccountSignOutSection";
import Link from "next/link";

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
            <section className="rounded-[20px] border border-red-200 bg-red-50 p-5 shadow-sm">
                <h2 className="text-base font-black text-red-900">Permanent account deletion</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-red-800/80">
                    Permanently remove your QOT account and associated data. This cannot be undone.
                </p>
                <Link
                    href="/delete-account"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[13px] bg-red-700 px-5 text-xs font-black text-white transition hover:bg-red-800"
                >
                    Review account deletion
                </Link>
            </section>
        </div>
    );
}
