import Navbar from "@/components/layout/QotMarketplaceNav";
import SavedListingsClient from "@/components/listings/SavedListingsClient";

export default function SavedListingsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">Saved Listings</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        View adverts you have saved for later.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <SavedListingsClient />
            </section>
        </main>
    );
}