import Navbar from "@/components/layout/Navbar";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import PostAdForm from "@/components/listings/PostAdForm";

export default function PostAdPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <VerifiedAccountGuard
                title="Posting adverts requires verification"
                description="Your account must be verified before you can post adverts on QOT."
            >
                <section className="mx-auto max-w-4xl px-6 py-10">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Sell on QOT
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Post New Advert
                        </h1>

                        <p className="mt-2 text-slate-600">
                            Add clear details and images to help buyers trust your advert.
                        </p>
                    </div>

                    <PostAdForm />
                </section>
            </VerifiedAccountGuard>
        </main>
    );
}