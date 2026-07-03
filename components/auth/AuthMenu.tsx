"use client";

import { useEffect, useState } from "react";

export default function AuthMenu() {
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

    if (!isLoggedIn) {
        return (
            <a href="/login" className="hover:text-orange-600">
                Login
            </a>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <a href="/saved" className="hover:text-orange-600">
                Saved
            </a>
            <a href="/messages" className="hover:text-orange-600">
                Messages
            </a>
            <a href="/my-listings" className="hover:text-orange-600">
                My Listings
            </a>

            <button onClick={logout} className="hover:text-orange-600">
                Logout
            </button>
        </div>
    );
}