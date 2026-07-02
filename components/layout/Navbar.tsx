export default function Navbar() {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <a href="/" className="text-2xl font-bold text-orange-600">
                    QOT
                </a>

                <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
                    <a href="/">Home</a>
                    <a href="/listings">Listings</a>
                    <a href="/categories">Categories</a>
                    <a href="/login">Login</a>
                </nav>

                <a
                    href="/post-ad"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    Post Ad
                </a>
            </div>
        </header>
    );
}