import ReportModerationClient from "@/components/admin/ReportModerationClient";

export default function AdminReportsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                        Admin Moderation
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Reported Adverts</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Review suspicious adverts, mark reports as handled, and hide or
                        restore listings where necessary.
                    </p>
                </div>
            </section>

            <ReportModerationClient />
        </main>
    );
}