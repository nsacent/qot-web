"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import {
    getStoredToken,
    getStoredUser,
    getUserDisplayName,
    isAdminOrModerator,
} from "@/lib/auth";

export default function AuthMenu() {
    const [mounted, setMounted] = useState(false);
    const [token, setToken] = useState("");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken) {
            localStorage.setItem("qot_access_token", storedToken);
            setToken(storedToken);
            setUser(storedUser);
        } else {
            setToken("");
            setUser(null);
        }

        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-3">
                <a
                    href="/login"
                    className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                    Login
                </a>

                <a
                    href="/register"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    Register
                </a>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex items-center gap-3">
                <a
                    href="/login"
                    className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                    Login
                </a>

                <a
                    href="/register"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    Register
                </a>
            </div>
        );
    }

    const canAccessAdmin = user ? isAdminOrModerator(user) : false;

    return (
        <div className="flex items-center gap-3">
            {canAccessAdmin && (
                <a
                    href="/admin"
                    className="hidden rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 md:inline-block"
                >
                    Admin
                </a>
            )}

            <a
                href="/my-listings"
                className="hidden text-sm font-semibold text-slate-700 hover:text-orange-600 md:inline"
            >
                {getUserDisplayName(user)}
            </a>

            <a
                href="/my-listings"
                className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
                My Ads
            </a>

            <LogoutButton />
        </div>
    );
}