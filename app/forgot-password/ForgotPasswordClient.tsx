"use client";

import { Suspense, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faShieldHalved } from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import QotLogo from "@/components/brand/QotLogo";
import { getCurrentUser, requestPasswordReset } from "@/lib/sessionClient";

function ForgotPasswordForm() {
    const [email, setEmail] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                await getCurrentUser();
                window.location.href = "/";
            } catch {
                setCheckingSession(false);
            }
        }

        checkSession();
    }, []);

    if (checkingSession) {
        return <QotLoader />;
    }

    async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await requestPasswordReset({
                email: email.trim().toLowerCase(),
            });

            setMessage(
                "If an account exists with that email, a password reset link has been sent."
            );
        } catch (err: any) {
            setError(err.message || "Failed to request password reset.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fff7f2] px-4 py-8 text-slate-950">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1500px] items-center justify-center">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-[34px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] ring-1 ring-black/5 md:grid-cols-[0.95fr_1.05fr]">
                    <section className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-10 text-white md:flex md:flex-col md:justify-between">
                        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
                        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10" />

                        <div className="relative">
                            <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <QotLogo className="h-14 w-auto text-white" />
                            </a>

                            <h1 className="mt-10 text-4xl font-black leading-tight">
                                Recover your QOT account.
                            </h1>

                            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-orange-50">
                                Enter your email address and we shall send you a secure password reset link.
                            </p>
                        </div>

                        <div className="relative rounded-3xl bg-white/15 p-5 backdrop-blur">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7" />
                            <p className="mt-4 text-sm font-black">Secure reset link</p>
                            <p className="mt-1 text-xs font-semibold text-orange-50">
                                Use the link in your email to create a new password.
                            </p>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-8 md:hidden">
                            <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <QotLogo className="h-11 w-auto text-orange-500" />
                            </a>
                        </div>

                        <h2 className="text-3xl font-black text-slate-950">
                            Forgot password
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Enter your email address to receive a reset link.
                        </p>

                        {error && (
                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleRequest} className="mt-7 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Email address
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="seller@example.com"
                                        required
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Sending reset link..." : "Send reset link"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                            Remember password?{" "}
                            <a
                                href="/login"
                                className="font-black text-orange-600 hover:text-orange-700"
                            >
                                Login
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function ForgotPasswordClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
