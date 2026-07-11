import Navbar from "@/components/layout/Navbar";
import ActivityHistoryClient from "@/components/account/ActivityHistoryClient";

export default function AccountActivityPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <ActivityHistoryClient />
        </main>
    );
}