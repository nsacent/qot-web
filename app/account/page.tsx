import Navbar from "@/components/layout/Navbar";
import AccountClient from "@/components/account/AccountClient";

export default function AccountPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <AccountClient />
        </main>
    );
}