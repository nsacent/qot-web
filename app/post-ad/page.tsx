import Navbar from "@/components/layout/QotMarketplaceNav";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import PostAdForm from "@/components/listings/PostAdForm";

export default function PostAdPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />
                <VerifiedAccountGuard
                    title="Posting adverts requires verification"
                    description="Your account must be verified before you can post adverts on QOT."
                >
                    <section className="mx-auto max-w-6xl py-5 sm:py-6">
                        <div className="mb-4 px-1 sm:flex sm:items-end sm:justify-between sm:gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                                    Create an advert
                                </p>
                                <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                                    Post Ad
                                </h1>
                            </div>

                            <p className="mt-1 text-sm font-semibold text-slate-500 sm:mt-0">
                                Start with photos, add the essentials, then preview.
                            </p>
                        </div>
                        <PostAdForm />
                    </section>
                </VerifiedAccountGuard>
            </div>
        </main>
    );
}
