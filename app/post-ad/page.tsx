import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
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


                    <section className="mx-auto max-w-5xl py-8">
                        <div className="mb-8 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                            <h1 className="text-3xl font-black text-slate-900">
                                Post New Ad
                            </h1>

                            <p className="mt-2 text-sm text-slate-600">
                                Fill in the details and add photos below to create your advert.
                            </p>
                        </div>
                        <PostAdForm />
                    </section>
                </VerifiedAccountGuard>

            </div>
        </main>
    );
}
