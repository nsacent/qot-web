"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faEnvelope,
    faShieldHalved,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import QotLogo from "@/components/brand/QotLogo";
import {
    confirmVerification,
    getCurrentUser,
    sendVerification,
} from "@/lib/sessionClient";

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function VerificationForm() {
    const [user, setUser] = useState<any>(null);
    const [code, setCode] = useState("");

    const [checkingSession, setCheckingSession] = useState(true);
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadUser() {
        try {
            const data = await getCurrentUser();
            const currentUser = getUserObject(data);

            setUser(currentUser);
            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
        } catch {
            window.location.href = "/login?next=/account/verification";
            return;
        } finally {
            setCheckingSession(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    async function handleSendCode() {
        setSending(true);
        setError("");
        setMessage("");

        try {
            await sendVerification();
            setMessage("Verification code sent to your email address.");
        } catch (err: any) {
            setError(err.message || "Failed to send verification code.");
        } finally {
            setSending(false);
        }
    }

    async function handleConfirm(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setConfirming(true);
        setError("");
        setMessage("");

        try {
            await confirmVerification({
                code: code.trim(),
            });

            const data = await getCurrentUser();
            const currentUser = getUserObject(data);

            setUser(currentUser);
            localStorage.setItem("qot_user", JSON.stringify(currentUser));

            setMessage("Your account has been verified successfully.");
            setCode("");
        } catch (err: any) {
            setError(err.message || "Failed to verify account.");
        } finally {
            setConfirming(false);
        }
    }

    if (checkingSession) {
        return <QotLoader />;
    }

    const isVerified =
        user?.is_verified === true ||
        user?.email_verified === true ||
        user?.is_email_verified === true;

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
                                Secure your QOT account.
                            </h1>

                            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-orange-50">
                                Verify your email address to strengthen trust and improve your account security.
                            </p>
                        </div>

                        <div className="relative rounded-3xl bg-white/15 p-5 backdrop-blur">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7" />
                            <p className="mt-4 text-sm font-black">Email verification</p>
                            <p className="mt-1 text-xs font-semibold text-orange-50">
                                We send a short code to your registered email.
                            </p>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-8 md:hidden">
                            <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <QotLogo className="h-11 w-auto text-orange-500" />
                            </a>
                        </div>

                        {isVerified ? (
                            <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-600">
                                    <FontAwesomeIcon icon={faCircleCheck} className="h-8 w-8" />
                                </div>

                                <h2 className="mt-6 text-3xl font-black text-slate-950">
                                    Account verified
                                </h2>

                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                    Your QOT account is already verified. You can continue buying,
                                    selling, saving ads, and managing your marketplace activity.
                                </p>

                                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                                    <a
                                        href="/"
                                        className="rounded-2xl bg-orange-500 px-5 py-3.5 text-center text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        Go Home
                                    </a>

                                    <a
                                        href="/account"
                                        className="rounded-2xl bg-slate-50 px-5 py-3.5 text-center text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        My Account
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-black text-slate-950">
                                    Verify email
                                </h2>

                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                    We shall send a verification code to:
                                    <br />
                                    <span className="font-black text-slate-900">
                                        {user?.email || "your registered email"}
                                    </span>
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

                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={sending}
                                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                                    {sending ? "Sending code..." : "Send verification code"}
                                </button>

                                <form onSubmit={handleConfirm} className="mt-5 space-y-4">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-black text-slate-700">
                                            Verification code
                                        </span>

                                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                            <FontAwesomeIcon
                                                icon={faShieldHalved}
                                                className="h-4 w-4 text-slate-400"
                                            />

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={code}
                                                onChange={(event) => setCode(event.target.value)}
                                                placeholder="Enter 6-digit code"
                                                required
                                                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={confirming}
                                        className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {confirming ? "Verifying..." : "Verify account"}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function VerificationClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <VerificationForm />
        </Suspense>
    );
}
