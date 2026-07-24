"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCircleCheck,
    faEnvelope,
    faLock,
    faShieldHalved,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import QotLogo from "@/components/brand/QotLogo";
import {
    confirmPasswordReset,
    getCurrentUser,
    requestPasswordReset,
} from "@/lib/sessionClient";

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const uid = searchParams.get("uid") || "";
    const token = searchParams.get("token") || "";
    const resetLinkMode = Boolean(uid || token);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountEmail, setAccountEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(!resetLinkMode);

    useEffect(() => {
        if (resetLinkMode) return;

        let active = true;

        async function loadAccount() {
            try {
                const user = getUserObject(await getCurrentUser());

                if (!active) return;

                if (!user?.email) {
                    setError("Your account does not have an email address available for password recovery.");
                } else {
                    setAccountEmail(user.email);
                }
            } catch {
                window.location.href = "/forgot-password";
                return;
            } finally {
                if (active) setCheckingSession(false);
            }
        }

        loadAccount();

        return () => {
            active = false;
        };
    }, [resetLinkMode]);

    async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!accountEmail) {
            setError("No account email is available for this request.");
            setLoading(false);
            return;
        }

        try {
            await requestPasswordReset({ email: accountEmail });
            setMessage("A secure password reset link has been sent to your account email.");
        } catch (error: any) {
            setError(error.message || "Failed to send the password reset link.");
        } finally {
            setLoading(false);
        }
    }

    async function handleReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!uid || !token) {
            setError("This password reset link is incomplete or invalid.");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await confirmPasswordReset({
                uid,
                token,
                new_password: password,
                new_password_confirm: confirmPassword,
            });

            window.location.href = "/login?reset=1";
        } catch (error: any) {
            setError(error.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    }

    if (checkingSession) return <QotLoader />;

    return (
        <main className="min-h-screen bg-[#fff7f2] px-4 py-4 text-slate-950 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-[1180px]">
                <header className="hidden items-center justify-between rounded-[24px] bg-white px-4 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.07)] ring-1 ring-black/5 md:flex md:px-5">
                    <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                        <QotLogo className="h-10 w-auto text-orange-500 sm:h-11" />
                    </a>

                    <a
                        href={resetLinkMode ? "/login" : "/account"}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-50 px-4 text-xs font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                        {resetLinkMode ? "Back to Login" : "Back to Profile"}
                    </a>
                </header>

                <section className="mt-5 grid overflow-hidden rounded-[36px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.14)] ring-1 ring-black/5 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-7 text-white sm:p-10 lg:min-h-[620px]">
                        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
                        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

                        <div className="relative flex h-full flex-col justify-between gap-10">
                            <div>
                                <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                                    <FontAwesomeIcon icon={resetLinkMode ? faLock : faEnvelope} className="h-5 w-5" />
                                </span>
                                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                                    Account security
                                </p>
                                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                                    {resetLinkMode
                                        ? "Create a password only you know."
                                        : "Reset your password securely."}
                                </h1>
                                <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-300">
                                    {resetLinkMode
                                        ? "Choose a strong new password to regain secure access to your QOT account."
                                        : "We will send a single-use reset link to the verified email already connected to your profile."}
                                </p>
                            </div>

                            <div className="rounded-[26px] bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-400/15 text-green-300">
                                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-black">Protected account recovery</p>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                                            Reset links expire and can only be used with the matching secure token.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center p-6 sm:p-10 lg:p-12">
                        <div className="w-full">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                                {resetLinkMode ? "Choose a new password" : "Request reset link"}
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                                {resetLinkMode ? "Reset Password" : "Secure your account"}
                            </h2>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                {resetLinkMode
                                    ? "Enter your new password twice to confirm it."
                                    : "Your account email is fixed and cannot be changed here."}
                            </p>

                            {error && (
                                <div role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3.5 text-sm font-bold leading-6 text-red-700 ring-1 ring-red-100">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div role="status" className="mt-6 flex gap-3 rounded-2xl bg-green-50 px-4 py-4 text-green-700 ring-1 ring-green-100">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-black">Check your email</p>
                                        <p className="mt-1 text-xs font-bold leading-5">{message}</p>
                                    </div>
                                </div>
                            )}

                            {resetLinkMode ? (
                                <form onSubmit={handleReset} className="mt-7 space-y-5">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-black text-slate-800">New password</span>
                                        <span className="flex h-13 items-center gap-3 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200">
                                            <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-slate-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                placeholder="At least 8 characters"
                                                autoComplete="new-password"
                                                required
                                                className="h-13 w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                        </span>
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-black text-slate-800">Confirm new password</span>
                                        <span className="flex h-13 items-center gap-3 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200">
                                            <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-slate-400" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                placeholder="Repeat your new password"
                                                autoComplete="new-password"
                                                required
                                                className="h-13 w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                        </span>
                                    </label>

                                    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-xs font-bold leading-5 text-orange-800">
                                        Use at least 8 characters and avoid passwords you use on other websites.
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FontAwesomeIcon icon={loading ? faShieldHalved : faLock} className="h-4 w-4" />
                                        {loading ? "Resetting Password..." : "Save New Password"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRequest} className="mt-7 space-y-5">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-black text-slate-800">Account email</span>
                                        <span className="flex h-13 items-center gap-3 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100">
                                            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={accountEmail}
                                                readOnly
                                                aria-readonly="true"
                                                className="h-13 w-full cursor-not-allowed bg-transparent text-sm font-bold text-slate-700 outline-none"
                                            />
                                            <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5 text-slate-300" />
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={loading || !accountEmail || Boolean(message)}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FontAwesomeIcon icon={loading ? faShieldHalved : faEnvelope} className="h-4 w-4" />
                                        {loading ? "Sending Reset Link..." : message ? "Reset Link Sent" : "Send Reset Link"}
                                    </button>

                                    <p className="text-center text-xs font-semibold leading-5 text-slate-500">
                                        If you no longer have access to this email, contact QOT at{" "}
                                        <a href="mailto:info@qot.ug" className="font-black text-orange-600 hover:text-orange-700">
                                            info@qot.ug
                                        </a>.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function ResetPasswordClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
