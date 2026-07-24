import type { Metadata } from "next";
import LegalPageShell, {
    LegalList,
    LegalListItem,
    LegalSection,
} from "@/components/legal/LegalPageShell";
import CookieSettingsButton from "@/components/privacy/CookieSettingsButton";

export const metadata: Metadata = {
    title: "Privacy Policy | QOT Uganda",
    description: "How QOT Uganda collects, uses, protects, and shares personal information.",
    alternates: { canonical: "https://qot.ug/privacy" },
    openGraph: {
        title: "Privacy Policy | QOT Uganda",
        description: "How QOT Uganda collects, uses, protects, and shares personal information.",
        url: "https://qot.ug/privacy",
        siteName: "QOT Uganda",
        type: "website",
    },
};

const sections = [
    { id: "who-we-are", label: "Who we are" },
    { id: "information-we-collect", label: "Information we collect" },
    { id: "how-we-use-information", label: "How we use information" },
    { id: "lawful-processing", label: "Lawful processing" },
    { id: "public-information", label: "Public marketplace information" },
    { id: "sharing", label: "When we share information" },
    { id: "retention", label: "How long we keep information" },
    { id: "security", label: "How we protect information" },
    { id: "your-rights", label: "Your rights and choices" },
    { id: "cookies", label: "Cookies and similar technology" },
    { id: "children", label: "Children" },
    { id: "changes", label: "Changes to this policy" },
    { id: "contact", label: "Contact us" },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalPageShell
            eyebrow="Your privacy"
            title="Privacy Policy"
            summary="This policy explains what information QOT Uganda handles when you browse, register, post adverts, contact other members, or use our marketplace services."
            updated="24 July 2026"
            sections={sections}
        >
            <LegalSection id="who-we-are" title="1. Who we are">
                <p>
                    QOT Uganda (&quot;QOT&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the QOT Uganda online marketplace at qot.ug. For the personal information described in this policy, QOT Uganda is the data controller unless we state otherwise.
                </p>
                <p>
                    QOT connects buyers and sellers. We provide the platform and related services, but users ordinarily arrange and complete transactions directly with each other.
                </p>
            </LegalSection>

            <LegalSection id="information-we-collect" title="2. Information we collect">
                <p>Depending on how you use QOT, we may collect or receive:</p>
                <LegalList>
                    <LegalListItem><strong>Account information:</strong> your name, phone number, email address, password in protected form, account role, and sign-in details.</LegalListItem>
                    <LegalListItem><strong>Profile and verification information:</strong> profile details, business information you choose to provide, verification status, and information used to review account trust and safety.</LegalListItem>
                    <LegalListItem><strong>Advert information:</strong> titles, descriptions, prices, condition, category, location, photographs, attributes, and any contact or transaction information you include.</LegalListItem>
                    <LegalListItem><strong>Marketplace activity:</strong> saved adverts, searches, recently viewed items, notifications, reviews, reports, ad views, and seller activity.</LegalListItem>
                    <LegalListItem><strong>Communications:</strong> messages exchanged through QOT and communications you send to our support, safety, or moderation teams.</LegalListItem>
                    <LegalListItem><strong>Payment and promotion records:</strong> payment references, method, amount, status, and promotion details when you use a paid service. QOT should not ask you to place card PINs or mobile-money PINs in an advert or chat.</LegalListItem>
                    <LegalListItem><strong>Technical information:</strong> information normally provided when a website is used, such as IP address, browser or device details, request logs, cookie identifiers, dates, and security events.</LegalListItem>
                    <LegalListItem><strong>Google sign-in information:</strong> basic account information provided by Google when you choose Google authentication, subject to your Google permissions.</LegalListItem>
                </LegalList>
                <p>
                    Please do not place national identification numbers, financial PINs, passwords, or other unnecessary sensitive information in public adverts or marketplace messages.
                </p>
            </LegalSection>

            <LegalSection id="how-we-use-information" title="3. How we use information">
                <p>We use personal information to:</p>
                <LegalList>
                    <LegalListItem>Create, authenticate, secure, and manage accounts.</LegalListItem>
                    <LegalListItem>Publish adverts and help users search, filter, save, share, and respond to them.</LegalListItem>
                    <LegalListItem>Enable marketplace messages, reviews, notifications, account verification, and seller tools.</LegalListItem>
                    <LegalListItem>Process promotion or payment records and provide requested services.</LegalListItem>
                    <LegalListItem>Review adverts, reports, suspected scams, prohibited content, and violations of our Terms.</LegalListItem>
                    <LegalListItem>Prevent fraud, abuse, unauthorised access, spam, and other security threats.</LegalListItem>
                    <LegalListItem>Provide support, account recovery, service notices, and responses to privacy requests.</LegalListItem>
                    <LegalListItem>Maintain, troubleshoot, measure, and improve QOT and comply with legal obligations.</LegalListItem>
                </LegalList>
            </LegalSection>

            <LegalSection id="lawful-processing" title="4. Lawful processing">
                <p>
                    We process information with your consent, when it is necessary to provide a service or perform an agreement with you, to comply with a legal obligation, to protect users and the marketplace, or on another basis permitted by Uganda&apos;s Data Protection and Privacy Act and applicable law.
                </p>
                <p>
                    Where processing depends on consent, you may withdraw that consent. Withdrawal does not affect processing already performed lawfully and may limit features that need the information concerned.
                </p>
            </LegalSection>

            <LegalSection id="public-information" title="5. Public marketplace information">
                <p>
                    Adverts are intended to be public. Information such as an advert&apos;s title, description, price, photographs, approximate location, category, seller display information, and review information may be visible to anyone and may appear in search engines or when a link is shared.
                </p>
                <p>
                    Your email address, password, private account controls, and private QOT messages are not intended to appear publicly through normal platform use. A seller may choose to make a phone number or other contact detail available to buyers.
                </p>
            </LegalSection>

            <LegalSection id="sharing" title="6. When we share information">
                <p>We may share relevant information:</p>
                <LegalList>
                    <LegalListItem>With other users when needed for the marketplace features you choose to use.</LegalListItem>
                    <LegalListItem>With hosting, email, authentication, communications, security, analytics, storage, and payment service providers working for QOT under appropriate obligations.</LegalListItem>
                    <LegalListItem>With professional advisers, auditors, or insurers when reasonably necessary.</LegalListItem>
                    <LegalListItem>With regulators, law-enforcement authorities, courts, or other parties when required by law or reasonably necessary to protect rights, safety, users, or the public.</LegalListItem>
                    <LegalListItem>As part of a genuine merger, financing, restructuring, or transfer of QOT, subject to appropriate confidentiality and legal safeguards.</LegalListItem>
                </LegalList>
                <p>
                    Some service providers may process information outside Uganda. Where this occurs, we take reasonable steps to use providers and arrangements that protect the information as required by applicable law.
                </p>
                <p>We do not sell your personal information as a standalone product.</p>
            </LegalSection>

            <LegalSection id="retention" title="7. How long we keep information">
                <p>
                    We keep personal information for as long as reasonably needed to operate your account and provide QOT. Different records may be retained for different periods based on their purpose.
                </p>
                <p>
                    After an account or advert is removed, we may retain limited information where necessary for fraud prevention, dispute handling, security, backups, enforcement, financial records, or legal obligations. When information is no longer required, we take reasonable steps to delete or de-identify it.
                </p>
            </LegalSection>

            <LegalSection id="security" title="8. How we protect information">
                <p>
                    We use administrative and technical safeguards designed to protect information, including encrypted HTTPS connections, access controls, protected passwords, restricted production systems, backups, and monitoring. No online service can guarantee complete security.
                </p>
                <p>
                    Protect your password and verification codes, use a secure device, and tell us promptly if you believe your account or personal information has been compromised.
                </p>
            </LegalSection>

            <LegalSection id="your-rights" title="9. Your rights and choices">
                <p>Subject to applicable law, you may ask QOT to:</p>
                <LegalList>
                    <LegalListItem>Confirm whether we hold personal information about you and provide access to it.</LegalListItem>
                    <LegalListItem>Correct personal information that is inaccurate or incomplete.</LegalListItem>
                    <LegalListItem>Delete information that is no longer required or withdraw consent where consent is the basis for processing.</LegalListItem>
                    <LegalListItem>Stop or restrict certain processing, including direct marketing.</LegalListItem>
                    <LegalListItem>Explain a significant decision based solely on automated processing, where applicable.</LegalListItem>
                    <LegalListItem>Receive or transfer information where a portability right applies.</LegalListItem>
                </LegalList>
                <p>
                    You may update some information through account settings. For another request, contact info@qot.ug. We may need to verify your identity before acting and may retain information where the law permits or requires it. You may also raise a concern with Uganda&apos;s Personal Data Protection Office.
                </p>
            </LegalSection>

            <LegalSection id="cookies" title="10. Cookies and similar technology">
                <p>
                    QOT uses cookies and similar browser storage that are necessary for sign-in, security, preferences, and core marketplace functions. We may also use limited measurement technology to understand service performance and improve QOT.
                </p>
                <p>
                    You can accept optional cookies or keep only essential cookies through QOT&apos;s cookie controls. You can change your choice later from the footer or the button below. Blocking essential cookies in your browser may prevent sign-in, saved preferences, or other account functions from working correctly.
                </p>
                <CookieSettingsButton className="inline-flex rounded-[14px] bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-orange-500" />
            </LegalSection>

            <LegalSection id="children" title="11. Children">
                <p>
                    QOT accounts and marketplace transactions are intended for people aged 18 or older. We do not knowingly invite children to create accounts or enter marketplace transactions on their own. A parent or legal guardian who believes a child has provided personal information should contact us so we can review and take appropriate action.
                </p>
            </LegalSection>

            <LegalSection id="changes" title="12. Changes to this policy">
                <p>
                    We may update this policy as QOT, our services, or legal requirements change. We will publish the updated version here and change the effective date. Where a change is material, we may also provide an account or service notice.
                </p>
            </LegalSection>

            <LegalSection id="contact" title="13. Contact us">
                <p>
                    For privacy questions, requests, complaints, or concerns, contact QOT Uganda at <a className="font-black text-orange-600 hover:text-orange-700" href="mailto:info@qot.ug">info@qot.ug</a> or call <a className="font-black text-orange-600 hover:text-orange-700" href="tel:+256200911678">0200 911 678</a>.
                </p>
                <p>
                    Please use the subject “Privacy Request” and explain what you need. Do not include passwords, PINs, or unnecessary identification documents in your first message.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
