export default function Footer() {
    return (
        <footer className="border-t bg-slate-950 text-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
                <div>
                    <a href="/" className="text-2xl font-bold text-orange-400">
                        QOT
                    </a>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                        QOT is a trusted local classifieds platform helping people in Uganda
                        buy, sell, and discover products and services faster.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold">Browse</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                        <a href="/listings" className="hover:text-orange-400">
                            Listings
                        </a>
                        <a href="/categories" className="hover:text-orange-400">
                            Categories
                        </a>
                        <a href="/post-ad" className="hover:text-orange-400">
                            Post Ad
                        </a>
                        <a href="/saved" className="hover:text-orange-400">
                            Saved Listings
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold">Account</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                        <a href="/login" className="hover:text-orange-400">
                            Login
                        </a>
                        <a href="/register" className="hover:text-orange-400">
                            Register
                        </a>
                        <a href="/my-listings" className="hover:text-orange-400">
                            My Listings
                        </a>
                        <a href="/messages" className="hover:text-orange-400">
                            Messages
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold">Safety</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                        <p>Meet in safe public places.</p>
                        <p>Check items before paying.</p>
                        <p>Do not send money before viewing.</p>
                        <p>Report suspicious adverts.</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-5 text-sm text-slate-400 md:flex-row">
                    <p>© {new Date().getFullYear()} QOT Uganda. All rights reserved.</p>
                    <p>Buy and sell safely across Uganda.</p>
                </div>
            </div>
        </footer>
    );
}