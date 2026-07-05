"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import {
    getStoredToken,
    getStoredUser,
    getUserDisplayName,
    isAdminOrModerator,
} from "@/lib/auth";

function getUserName(user: any) {
    return (
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.phone ||
        user?.email ||
        "Account"
    );
}

export default function AuthMenu() {
    const [mounted, setMounted] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        if (token) {
            localStorage.setItem("qot_access_token", token);
            setLoggedIn(true);
            setUser(storedUser);
        } else {
            setLoggedIn(false);
            setUser(null);
        }

        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!loggedIn) {
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

    const canAccessAdmin = isAdminOrModerator(user);

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