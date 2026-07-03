import AdminListingsClient from "@/components/admin/AdminListingsClient";

export default function AdminListingsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                        Admin Panel
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Listings Moderation</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Review, approve, reject, hide, restore, and open adverts submitted
                        on QOT.
                    </p>
                </div>
            </section>

            <AdminListingsClient />
        </main>
    );
}