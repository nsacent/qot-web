import type { Metadata } from "next";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import DeleteAccountClient from "./DeleteAccountClient";

export const metadata: Metadata = {
    title: "Delete Your QOT Account | QOT",
    description: "Request permanent deletion of your QOT account and associated personal data.",
    alternates: { canonical: "https://qot.ug/delete-account" },
    robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <div className="qot-container pt-2 md:pt-4">
                <QotMarketplaceNav />
            </div>
            <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-12">
                <DeleteAccountClient />
            </div>
            <QotMarketplaceFooter />
        </main>
    );
}
