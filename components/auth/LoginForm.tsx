"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getAccessToken(data: any) {
    return (
        data?.access ||
        data?.access_token ||
        data?.token ||
        data?.tokens?.access ||
        data?.token?.access ||
        data?.data?.access ||
        data?.data?.access_token ||
        data?.data?.token ||
        data?.data?.tokens?.access ||
        data?.data?.token?.access ||
        ""
    );
}

function getRefreshToken(data: any) {
    return (
        data?.refresh ||
        data?.refresh_token ||
        data?.tokens?.refresh ||
        data?.token?.refresh ||
        data?.data?.refresh ||
        data?.data?.refresh_token ||
        data?.data?.tokens?.refresh ||
        data?.data?.token?.refresh ||
        ""
    );
}

function getUser(data: any) {
    return (
        data?.user ||
        data?.data?.user ||
        data?.account ||
        data?.profile ||
        data?.data?.account ||
        data?.data?.profile ||
        null
    );
}

export default function LoginForm() {
    const [identifier, setIdentifier] = useState("+256700000999");
    const [password, setPassword] = useState("StrongPass123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier,
                    password,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Login failed. Please check your details."
                );
            }

            const accessToken = getAccessToken(data);
            const refreshToken = getRefreshToken(data);
            const user = getUser(data);

            console.log("Login response:", data);
            console.log("Access token found:", accessToken);
            console.log("User found:", user);

            if (!accessToken) {
                throw new Error("Login worked, but no access token was found.");
            }

            localStorage.setItem("qot_access_token", accessToken);

            if (refreshToken) {
                localStorage.setItem("qot_refresh_token", refreshToken);
            }

            if (user) {
                localStorage.setItem("qot_user", JSON.stringify(user));
            } else {
                localStorage.removeItem("qot_user");
            }

            const params = new URLSearchParams(window.location.search);
            const nextUrl = params.get("next") || "/";

            window.location.href = nextUrl;
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone or Email
                </label>

                <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Enter phone or email"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Login"}
            </button>
        </form>
    );
}