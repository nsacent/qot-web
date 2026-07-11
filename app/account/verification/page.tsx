import Navbar from "@/components/layout/Navbar";
import VerificationRequestClient from "@/components/account/VerificationRequestClient";

export default function VerificationPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <VerificationRequestClient />
        </main>
    );
}