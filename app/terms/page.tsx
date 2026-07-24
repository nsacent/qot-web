import type { Metadata } from "next";
import LegalPageShell, {
    LegalList,
    LegalListItem,
    LegalSection,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
    title: "Terms of Service | QOT Uganda",
    description: "The rules and responsibilities that apply when using the QOT Uganda marketplace.",
    alternates: { canonical: "https://qot.ug/terms" },
    openGraph: {
        title: "Terms of Service | QOT Uganda",
        description: "The rules and responsibilities that apply when using the QOT Uganda marketplace.",
        url: "https://qot.ug/terms",
        siteName: "QOT Uganda",
        type: "website",
    },
};

const sections = [
    { id: "acceptance", label: "Acceptance" },
    { id: "eligibility", label: "Eligibility and accounts" },
    { id: "marketplace-role", label: "QOT's marketplace role" },
    { id: "listing-rules", label: "Advert and product rules" },
    { id: "transactions", label: "Transactions and safety" },
    { id: "content", label: "Your content" },
    { id: "moderation", label: "Moderation and enforcement" },
    { id: "communications", label: "Messages, reviews, and reports" },
    { id: "fees", label: "Fees and promotions" },
    { id: "intellectual-property", label: "QOT intellectual property" },
    { id: "third-parties", label: "Third-party services" },
    { id: "disclaimers", label: "Disclaimers" },
    { id: "liability", label: "Limits of liability" },
    { id: "termination", label: "Suspension and termination" },
    { id: "changes", label: "Changes to these terms" },
    { id: "law", label: "Governing law and disputes" },
    { id: "contact", label: "Contact us" },
];

export default function TermsOfServicePage() {
    return (
        <LegalPageShell
            eyebrow="Marketplace rules"
            title="Terms of Service"
            summary="These terms explain the rules for using QOT Uganda and help keep the marketplace useful, lawful, and safer for buyers and sellers."
            updated="21 July 2026"
            sections={sections}
        >
            <LegalSection id="acceptance" title="1. Acceptance of these terms">
                <p>
                    These Terms of Service (&quot;Terms&quot;) are an agreement between you and QOT Uganda (&quot;QOT&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). They apply when you access qot.ug, create an account, post or respond to an advert, send a message, or otherwise use QOT.
                </p>
                <p>
                    By using QOT, you agree to these Terms and acknowledge our <a className="font-black text-orange-600 hover:text-orange-700" href="/privacy">Privacy Policy</a>. If you do not agree, do not create an account or use the marketplace.
                </p>
            </LegalSection>

            <LegalSection id="eligibility" title="2. Eligibility and accounts">
                <LegalList>
                    <LegalListItem>You must be at least 18 years old and legally able to enter an agreement.</LegalListItem>
                    <LegalListItem>You must provide accurate, current information and keep it updated.</LegalListItem>
                    <LegalListItem>You are responsible for activity under your account and for protecting your password and verification codes.</LegalListItem>
                    <LegalListItem>You may not sell, transfer, impersonate, or create an account for deceptive, unlawful, or abusive purposes.</LegalListItem>
                    <LegalListItem>You must contact QOT promptly if you suspect unauthorised account access.</LegalListItem>
                </LegalList>
                <p>
                    Account verification is a trust signal, not a guarantee of identity, honesty, product quality, or transaction safety.
                </p>
            </LegalSection>

            <LegalSection id="marketplace-role" title="3. QOT's marketplace role">
                <p>
                    QOT provides a classified-advertising and communication platform. Unless QOT expressly states otherwise for a specific service, QOT is not the buyer, seller, owner, manufacturer, importer, delivery provider, insurer, or payment guarantor for items advertised by users.
                </p>
                <p>
                    Users decide whether to communicate, inspect an item, agree a price, pay, deliver, or complete a transaction. QOT does not routinely inspect advertised items or guarantee that an advert, seller, buyer, review, price, or statement is accurate.
                </p>
            </LegalSection>

            <LegalSection id="listing-rules" title="4. Advert and product rules">
                <p>You may post only adverts that are lawful, accurate, and genuinely available. You must:</p>
                <LegalList>
                    <LegalListItem>Use the correct category, price, condition, location, description, and photographs.</LegalListItem>
                    <LegalListItem>Have the legal right to offer the item, property, job, or service.</LegalListItem>
                    <LegalListItem>Disclose material defects, restrictions, fees, or conditions that could affect a buyer.</LegalListItem>
                    <LegalListItem>Remove or mark an advert sold when it is no longer available.</LegalListItem>
                    <LegalListItem>Respect intellectual-property, consumer-protection, employment, property, tax, licensing, and other applicable laws.</LegalListItem>
                </LegalList>
                <p>You may not advertise or promote:</p>
                <LegalList>
                    <LegalListItem>Stolen, counterfeit, fraudulent, recalled, or unlawfully obtained goods.</LegalListItem>
                    <LegalListItem>Illegal drugs, human trafficking, sexual exploitation, or unlawful adult services.</LegalListItem>
                    <LegalListItem>Weapons, explosives, hazardous materials, or regulated products offered contrary to law or without required authority.</LegalListItem>
                    <LegalListItem>Scams, pyramid schemes, deceptive investments, fake jobs, advance-fee fraud, or misleading financial services.</LegalListItem>
                    <LegalListItem>Content that promotes violence, hatred, harassment, discrimination, or unlawful activity.</LegalListItem>
                    <LegalListItem>Personal information, credentials, accounts, documents, or services that violate another person&apos;s privacy or rights.</LegalListItem>
                    <LegalListItem>Duplicate, spam, keyword-stuffed, bait-and-switch, or deliberately misleading adverts.</LegalListItem>
                </LegalList>
                <p>
                    This list is not exhaustive. QOT may publish category-specific rules or reject content that creates a legal, safety, fraud, or marketplace-quality risk.
                </p>
            </LegalSection>

            <LegalSection id="transactions" title="5. Transactions and safety">
                <p>Buyers and sellers are responsible for their transactions. We strongly recommend that users:</p>
                <LegalList>
                    <LegalListItem>Keep initial communication on QOT and be cautious when asked to move immediately to another channel.</LegalListItem>
                    <LegalListItem>Meet in a safe, public location and tell someone where you are going.</LegalListItem>
                    <LegalListItem>Inspect and test an item, confirm ownership, and review relevant documents before payment.</LegalListItem>
                    <LegalListItem>Do not share passwords, one-time codes, card PINs, or mobile-money PINs.</LegalListItem>
                    <LegalListItem>Be cautious of deposits, overpayments, remote-payment screenshots, courier stories, urgency, and requests to pay before inspection.</LegalListItem>
                    <LegalListItem>Use lawful payment methods and retain appropriate transaction records.</LegalListItem>
                </LegalList>
                <p>
                    Unless QOT expressly offers a protected payment or delivery service with separate written terms, money and goods exchanged between users are outside QOT&apos;s custody. Disputes about product condition, ownership, payment, delivery, refunds, warranties, or performance are primarily between the buyer and seller.
                </p>
            </LegalSection>

            <LegalSection id="content" title="6. Your content">
                <p>
                    You keep ownership of content you create, including advert text and photographs. You confirm that you have the necessary rights to use and publish it.
                </p>
                <p>
                    You grant QOT a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, adapt for technical display, publish, distribute, and promote that content only as reasonably needed to operate, secure, improve, and market QOT. This licence ends when the content is deleted, except for reasonable backup, legal, enforcement, or already-shared uses.
                </p>
                <p>
                    Do not upload content that infringes copyright, trademarks, privacy, publicity, confidentiality, or another person&apos;s rights. Contact info@qot.ug to report an intellectual-property concern and include enough information for us to review it.
                </p>
            </LegalSection>

            <LegalSection id="moderation" title="7. Moderation and enforcement">
                <p>
                    QOT may use automated tools and human review to detect spam, fraud, prohibited content, safety concerns, and violations. We may request information, limit visibility, reject or remove an advert, remove featured status, restrict messaging, warn a user, suspend an account, preserve relevant records, or refer a matter to authorities where reasonably necessary.
                </p>
                <p>
                    Moderation decisions involve judgement and may not be immediate or error-free. You may ask us to review a decision by contacting info@qot.ug with the relevant account and advert details.
                </p>
            </LegalSection>

            <LegalSection id="communications" title="8. Messages, reviews, and reports">
                <LegalList>
                    <LegalListItem>Use messages only for genuine marketplace communication. Do not send spam, threats, harassment, malware, unlawful offers, or deceptive links.</LegalListItem>
                    <LegalListItem>Reviews must reflect a genuine experience and must not be bought, fabricated, retaliatory, or manipulated.</LegalListItem>
                    <LegalListItem>Reports must be made honestly. Repeatedly submitting false or abusive reports may lead to restrictions.</LegalListItem>
                    <LegalListItem>QOT may review communications and associated records when investigating a report, fraud, safety event, technical problem, or legal requirement, as explained in our Privacy Policy.</LegalListItem>
                </LegalList>
            </LegalSection>

            <LegalSection id="fees" title="9. Fees and promotions">
                <p>
                    QOT may offer free and paid services, including featured placement, boosts, homepage promotion, subscriptions, or verification-related services. The price, duration, method, and any specific conditions will be shown before you confirm a paid service.
                </p>
                <p>
                    Paying for promotion improves placement only; it does not guarantee views, messages, sales, approval, or a particular result. Unless the purchase screen or applicable law states otherwise, a promotion that has already started is not refundable merely because it did not produce the result a user expected.
                </p>
                <p>
                    QOT may change future prices or service packages, but a change will not retroactively alter a completed purchase.
                </p>
            </LegalSection>

            <LegalSection id="intellectual-property" title="10. QOT intellectual property">
                <p>
                    QOT&apos;s name, branding, interface, software, design, text, graphics, and platform features are owned by or licensed to QOT Uganda and are protected by applicable law. These Terms give you a limited, revocable, non-transferable right to use QOT for its intended marketplace purpose.
                </p>
                <p>
                    You may not copy, scrape, reverse engineer, sell, interfere with, overload, bypass security on, or commercially exploit QOT except where applicable law expressly permits it or QOT gives written permission.
                </p>
            </LegalSection>

            <LegalSection id="third-parties" title="11. Third-party services">
                <p>
                    QOT may contain links to, integrate with, or rely on third-party services such as Google or Facebook authentication, email, hosting, maps, payment providers, or websites linked by users. Their own terms and privacy practices apply to their services. QOT is not responsible for independent third-party content or conduct.
                </p>
            </LegalSection>

            <LegalSection id="disclaimers" title="12. Disclaimers">
                <p>
                    To the extent permitted by law, QOT is provided on an “as available” and “as is” basis. We do not promise uninterrupted operation or guarantee the identity or conduct of users, the accuracy of content, the legality or quality of an item, or the success of any transaction.
                </p>
                <p>
                    Nothing in these Terms excludes a warranty, consumer right, duty, or remedy that cannot lawfully be excluded.
                </p>
            </LegalSection>

            <LegalSection id="liability" title="13. Limits of liability">
                <p>
                    To the maximum extent permitted by law, QOT Uganda is not liable for indirect, incidental, special, punitive, or consequential loss; loss of profit, opportunity, data, reputation, or goodwill; or loss arising from user conduct, adverts, transactions, third-party services, or events outside our reasonable control.
                </p>
                <p>
                    Where QOT is legally liable and a limit is permitted, QOT&apos;s total liability relating to a paid QOT service will not exceed the amount you paid QOT for that specific service during the six months before the event giving rise to the claim. This limit does not apply where liability cannot lawfully be limited.
                </p>
                <p>
                    You are responsible for losses and reasonable costs caused by your unlawful use of QOT, your content, or your material breach of these Terms, to the extent permitted by law.
                </p>
            </LegalSection>

            <LegalSection id="termination" title="14. Suspension and termination">
                <p>
                    You may stop using QOT at any time and may request account closure. QOT may suspend, restrict, or close an account where reasonably necessary for safety, fraud prevention, legal compliance, repeated violations, non-payment of a paid service, risk to other users, or protection of the platform.
                </p>
                <p>
                    Terms that by their nature should continue—such as content responsibility, intellectual property, disputes, disclaimers, and liability provisions—remain effective after account closure.
                </p>
            </LegalSection>

            <LegalSection id="changes" title="15. Changes to these terms">
                <p>
                    We may update these Terms as QOT, marketplace risks, services, or legal requirements change. We will publish the new version and update the effective date. For a material change, we may also provide a notice through QOT or your registered contact details. Continued use after the effective date means you accept the updated Terms.
                </p>
            </LegalSection>

            <LegalSection id="law" title="16. Governing law and disputes">
                <p>
                    These Terms are governed by the laws of Uganda. Before starting formal proceedings, you and QOT should first try in good faith to resolve a dispute by written notice. Send the notice to info@qot.ug and allow a reasonable opportunity for review.
                </p>
                <p>
                    If a dispute cannot be resolved informally, it may be submitted to the courts of competent jurisdiction in Uganda, unless applicable law provides another mandatory process or forum.
                </p>
            </LegalSection>

            <LegalSection id="contact" title="17. Contact us">
                <p>
                    Questions about these Terms may be sent to QOT Uganda at <a className="font-black text-orange-600 hover:text-orange-700" href="mailto:info@qot.ug">info@qot.ug</a> or by telephone at <a className="font-black text-orange-600 hover:text-orange-700" href="tel:+256200911678">0200 911 678</a>.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
