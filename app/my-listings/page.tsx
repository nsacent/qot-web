import Navbar from "@/components/layout/Navbar";
import MyListingsClient from "@/components/dashboard/MyListingsClient";

export default function MyListingsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <MyListingsClient />
        </main>
    );
}