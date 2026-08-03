import type { Metadata } from "next";
import LegalPageShell, {
    LegalList,
    LegalListItem,
    LegalSection,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
    title: "Delete Your QOT Account | QOT",
    description: "How to request deletion of your QOT account and associated personal data.",
    alternates: { canonical: "https://qot.ug/account-deletion" },
    openGraph: {
        title: "Delete Your QOT Account | QOT",
        description: "How to request deletion of your QOT account and associated personal data.",
        url: "https://qot.ug/account-deletion",
        siteName: "QOT",
        type: "website",
    },
};

const sections = [
    { id: "request", label: "Request deletion" },
    { id: "deleted", label: "What we delete" },
    { id: "retained", label: "What may be retained" },
    { id: "timing", label: "Timing and confirmation" },
];

export default function AccountDeletionPage() {
    return (
        <LegalPageShell
            eyebrow="Account controls"
            title="Delete your QOT account"
            summary="You can request permanent deletion of your QOT account and the personal data associated with it. This page applies to both the QOT website and mobile app."
            updated="3 August 2026"
            sections={sections}
        >
            <LegalSection id="request" title="1. How to request account deletion">
                <p>
                    Email <a className="font-black text-orange-600 hover:text-orange-700" href="mailto:info@qot.ug?subject=Delete%20my%20QOT%20account">info@qot.ug</a> from the email address registered to your QOT account with the subject <strong>Delete my QOT account</strong>. Include your registered phone number so we can locate the correct account.
                </p>
                <p>
                    If you cannot access your registered email address, contact us at the same address or call <a className="font-black text-orange-600 hover:text-orange-700" href="tel:+256200911678">0200 911 678</a>. We will ask for enough information to verify that you own the account before deleting it. Never send us your password, PIN, or one-time verification code.
                </p>
            </LegalSection>

            <LegalSection id="deleted" title="2. Data deleted with your account">
                <p>After we verify and approve your request, we delete or de-identify data that is no longer needed, including:</p>
                <LegalList>
                    <LegalListItem>Your account profile and contact details.</LegalListItem>
                    <LegalListItem>Your active, draft, pending, rejected, paused, and sold adverts.</LegalListItem>
                    <LegalListItem>Saved adverts, saved searches, follows, notification preferences, and recent activity linked to your account.</LegalListItem>
                    <LegalListItem>Uploaded profile, cover, and advert photos that do not need to be retained.</LegalListItem>
                </LegalList>
                <p>
                    Messages or reviews visible to another user may be anonymised instead of removed where this is necessary to preserve the other user&apos;s conversation, transaction history, or marketplace safety record.
                </p>
            </LegalSection>

            <LegalSection id="retained" title="3. Data that may be retained">
                <p>
                    We may retain limited records where reasonably necessary for fraud prevention, user safety, dispute handling, enforcement, security backups, financial or tax records, or another legal obligation. Retained information is restricted to those purposes and is deleted or de-identified when it is no longer required.
                </p>
            </LegalSection>

            <LegalSection id="timing" title="4. Timing and confirmation">
                <p>
                    We aim to verify and complete valid deletion requests within 30 days. A longer period may be required for complex requests or where the law allows it. We will confirm by email when the request has been completed or explain why limited information must be retained.
                </p>
                <p>
                    For more information about how QOT handles personal data, read our <a className="font-black text-orange-600 hover:text-orange-700" href="/privacy">Privacy Policy</a>.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
