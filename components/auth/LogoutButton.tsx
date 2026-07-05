"use client";

import { clearAuthStorage } from "@/lib/auth";

export default function LogoutButton() {
    function logout() {
        clearAuthStorage();
        window.location.href = "/login";
    }

    return (
        <button
            type="button"
            onClick={logout}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
            Logout
        </button>
    );
}