"use client";

export default function LogoutButton() {
    function logout() {
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");
        localStorage.removeItem("qot_user");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("token");

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