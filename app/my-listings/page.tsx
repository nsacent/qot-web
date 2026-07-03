import Navbar from "@/components/layout/Navbar";
import MyListingsClient from "@/components/dashboard/MyListingsClient";

export default function MyListingsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">My Listings</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        Manage the adverts you have posted on QOT.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <MyListingsClient />
            </section>
        </main>
    );
}