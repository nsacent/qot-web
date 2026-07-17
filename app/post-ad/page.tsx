import Navbar from "@/components/layout/QotMarketplaceNav";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import VerifiedAccountGuard from "@/components/auth/VerifiedAccountGuard";
import PostAdForm from "@/components/listings/PostAdForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBullhorn,
    faCamera,
    faCircleCheck,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

export default function PostAdPage() {
    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <Navbar />

                <VerifiedAccountGuard
                    title="Posting adverts requires verification"
                    description="Your account must be verified before you can post adverts on QOT."
                >
                    <section className="pt-6">
                        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-white sm:p-8 lg:p-10">
                                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/20 blur-xl" />
                                <div className="absolute -bottom-20 left-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />

                                <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                                    <div>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-100 ring-1 ring-white/10">
                                            <FontAwesomeIcon icon={faBullhorn} className="h-3.5 w-3.5" />
                                            Sell on QOT
                                        </span>

                                        <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight md:text-5xl">
                                            Post a new advert
                                        </h1>

                                        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/70 md:text-base">
                                            Add clear details, choose the right category, set your price, and upload photos after submission.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                        <HeroMiniCard icon={faCircleCheck} title="Verified sellers" />
                                        <HeroMiniCard icon={faShieldHalved} title="Safer marketplace" />
                                        <HeroMiniCard icon={faCamera} title="Photos after posting" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-5xl py-8">
                        <PostAdForm />
                    </section>
                </VerifiedAccountGuard>

                <QotMarketplaceFooter />
            </div>
        </main>
    );
}

function HeroMiniCard({ icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-3 rounded-[20px] bg-white/10 p-4 ring-1 ring-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
            </div>

            <p className="text-sm font-black text-white">{title}</p>
        </div>
    );
}