"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function RegisterForm() {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("+256");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName,
                    phone,
                    email,
                    password,
                    password_confirm: passwordConfirm,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    JSON.stringify(data) ||
                    "Registration failed."
                );
            }

            window.location.href = "/login";
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
                    Full Name
                </label>
                <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                </label>
                <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+256..."
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
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
                    placeholder="Create password"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                </label>
                <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Creating account..." : "Create Account"}
            </button>
        </form>
    );
}