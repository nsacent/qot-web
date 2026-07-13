export default function QotMarketplaceFooter() {
    return (
        <footer className="mx-auto max-w-[1390px] px-2 pb-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
                <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
                    <div>
                        <div className="text-4xl font-black leading-8 tracking-tight text-orange-500">
                            QOT
                        </div>

                        <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-300">
                            Quality, Opportunities and Trust. Buy, sell and connect with
                            people across Uganda.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-white">
                            Marketplace
                        </h3>

                        <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
                            <a href="/listings" className="hover:text-orange-400">
                                Browse Listings
                            </a>
                            <a href="/categories" className="hover:text-orange-400">
                                Categories
                            </a>
                            <a href="/post-ad" className="hover:text-orange-400">
                                Post Advert
                            </a>
                            <a href="/seller/dashboard" className="hover:text-orange-400">
                                Seller Dashboard
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-white">
                            Account
                        </h3>

                        <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
                            <a href="/login" className="hover:text-orange-400">
                                Login
                            </a>
                            <a href="/register" className="hover:text-orange-400">
                                Register
                            </a>
                            <a href="/saved" className="hover:text-orange-400">
                                Saved Adverts
                            </a>
                            <a href="/messages" className="hover:text-orange-400">
                                Messages
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-white">
                            Safety
                        </h3>

                        <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
                            <a href="/safety/report" className="hover:text-orange-400">
                                Safety Center
                            </a>
                            <a href="/account/verification" className="hover:text-orange-400">
                                Verify Account
                            </a>
                            <a href="/notifications" className="hover:text-orange-400">
                                Notifications
                            </a>
                            <a href="/account" className="hover:text-orange-400">
                                My Account
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-5 text-xs font-semibold text-slate-400">
                    © {new Date().getFullYear()} QOT Uganda. All rights reserved.
                </div>
            </div>
        </footer>
    );
}