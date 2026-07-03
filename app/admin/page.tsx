import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default function AdminDashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                        Admin Panel
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">QOT Admin Dashboard</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Monitor listings, reports, users, and moderation activity from one
                        central place.
                    </p>
                </div>
            </section>

            <AdminDashboardClient />
        </main>
    );
}