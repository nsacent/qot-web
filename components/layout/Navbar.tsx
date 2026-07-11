"use client";

import { useEffect, useState } from "react";
import AuthMenu from "@/components/auth/AuthMenu";
import NotificationBellNoSSR from "@/components/notifications/NotificationBellNoSSR";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("qot_access_token");
        setIsLoggedIn(Boolean(token));
    }, []);

    function logout() {
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");
        localStorage.removeItem("qot_user");
        window.location.href = "/";
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <a href="/" className="text-2xl font-bold text-orange-600">
                    QOT
                </a>

                <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
                    <a href="/" className="hover:text-orange-600">
                        Home
                    </a>

                    <a href="/listings" className="hover:text-orange-600">
                        Listings
                    </a>

                    <a href="/categories" className="hover:text-orange-600">
                        Categories
                    </a>
                    <NotificationBellNoSSR />
                    <AuthMenu />
                </nav>

                <div className="hidden md:block">
                    <a
                        href="/post-ad"
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Post Ad
                    </a>
                </div>

                <button
                    onClick={() => setOpen((current) => !current)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold md:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? "Close" : "Menu"}
                </button>
            </div>

            {open && (
                <div className="border-t bg-white md:hidden">
                    <nav className="mx-auto grid max-w-7xl gap-2 px-6 py-4 text-sm font-medium text-slate-700">
                        <a href="/" className="rounded-xl px-3 py-3 hover:bg-slate-50">
                            Home
                        </a>

                        <a
                            href="/listings"
                            className="rounded-xl px-3 py-3 hover:bg-slate-50"
                        >
                            Listings
                        </a>

                        <a
                            href="/categories"
                            className="rounded-xl px-3 py-3 hover:bg-slate-50"
                        >
                            Categories
                        </a>

                        <a href="/saved-searches" className="font-medium hover:text-orange-600">
                            Saved Searches
                        </a>

                        <a
                            href="/post-ad"
                            className="rounded-xl bg-orange-500 px-3 py-3 text-center font-semibold text-white hover:bg-orange-600"
                        >
                            Post Ad
                        </a>

                        {isLoggedIn ? (
                            <>

                                <a
                                    href="/account"
                                    className="block rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    My Account
                                </a>
                                <a
                                    href="/saved"
                                    className="rounded-xl px-3 py-3 hover:bg-slate-50"
                                >
                                    Saved
                                </a>

                                <a href="/recently-viewed" className="font-medium hover:text-orange-600">
                                    Recently Viewed
                                </a>


                                <a
                                    href="/my-reviews"
                                    className="block rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    My Reviews
                                </a>

                                <a
                                    href="/messages"
                                    className="rounded-xl px-3 py-3 hover:bg-slate-50"
                                >
                                    Messages
                                </a>


                                <a
                                    href="/account/notifications"
                                    className="block rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Notification Settings
                                </a>

                                <a
                                    href="/account/activity"
                                    className="block rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Activity History
                                </a>

                                <a
                                    href="/my-listings"
                                    className="rounded-xl px-3 py-3 hover:bg-slate-50"
                                >
                                    My Listings
                                </a>

                                <button
                                    onClick={logout}
                                    className="rounded-xl px-3 py-3 text-left hover:bg-slate-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    className="rounded-xl px-3 py-3 hover:bg-slate-50"
                                >
                                    Login
                                </a>

                                <a
                                    href="/register"
                                    className="rounded-xl px-3 py-3 hover:bg-slate-50"
                                >
                                    Create Account
                                </a>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}