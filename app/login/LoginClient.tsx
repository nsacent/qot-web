"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faMobileScreen, faShieldHalved, faStore, faTag } from "@/lib/faIcons";
import { getCurrentUser, loginUser } from "@/lib/sessionClient";
import QotLoader from "@/components/common/QotLoader";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import FacebookSignInButton from "@/components/auth/FacebookSignInButton";
import QotLogo from "@/components/brand/QotLogo";
import {
    getUgandanNationalNumber,
    isValidUgandanMobile,
    toUgandanPhone,
} from "@/lib/ugandanPhone";

function LoginForm() {
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") || "/";
    const passwordWasReset = searchParams.get("reset") === "1";

    const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                await getCurrentUser();
                window.location.href = nextUrl || "/";
            } catch {
                setCheckingSession(false);
            }
        }

        checkSession();
    }, [nextUrl]);

    if (checkingSession) {
        return <QotLoader />;
    }

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (loginMethod === "phone" && !isValidUgandanMobile(phone)) {
            setError("Enter a valid Ugandan mobile number, such as +256 700 000 001.");
            return;
        }

        setLoading(true);

        try {
            await loginUser({
                identifier:
                    loginMethod === "phone"
                        ? toUgandanPhone(phone)
                        : email.trim(),
                password,
                keep_signed_in: keepSignedIn,
            });

            try {
                const user = await getCurrentUser();

                localStorage.setItem("qot_user", JSON.stringify(user));
                localStorage.removeItem("qot_access_token");
                localStorage.removeItem("qot_refresh_token");

                window.dispatchEvent(new Event("storage"));
            } catch {
                // Session cookies are already saved.
            }

            window.location.href = nextUrl;
        } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
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
                                Welcome back to Uganda’s marketplace.
                            </h1>

                            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-orange-50">
                                Login to manage your ads, messages, saved items, notifications, and seller activity.
                            </p>
                        </div>

                        <div className="relative grid gap-3">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faStore} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Sell faster</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Reach buyers around Uganda.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Secure account</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Session protected with cookies.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Buy with confidence</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Save ads and contact sellers easily.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-8 md:hidden">
                            <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <QotLogo className="h-11 w-auto text-orange-500" />
                            </a>
                        </div>

                        <h2 className="text-3xl font-black text-slate-950">Login</h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {loginMethod === "phone"
                                ? "Enter your Ugandan phone number to continue."
                                : "Enter your email address to continue."}
                        </p>

                        {error && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {passwordWasReset && !error && (
                            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                Password reset successfully. You can now log in with your new password.
                            </div>
                        )}

                        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                            <input
                                type="checkbox"
                                checked={keepSignedIn}
                                onChange={(event) => setKeepSignedIn(event.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                            />

                            <span>
                                <span className="block text-sm font-black text-slate-700">
                                    Keep me signed in
                                </span>
                                <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                                    Stay signed in for one year on this device.
                                </span>
                            </span>
                        </label>

                        <div className="mt-5 space-y-3">
                            <GoogleSignInButton
                                keepSignedIn={keepSignedIn}
                                nextUrl={nextUrl}
                            />
                            <FacebookSignInButton
                                keepSignedIn={keepSignedIn}
                                nextUrl={nextUrl}
                            />
                        </div>

                        <div className="my-6 flex items-center gap-4">
                            <span className="h-px flex-1 bg-slate-200" />
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Or use your password
                            </span>
                            <span className="h-px flex-1 bg-slate-200" />
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="block">
                                <label htmlFor="login-identifier" className="mb-2 block text-sm font-black text-slate-700">
                                    {loginMethod === "phone" ? "Phone number" : "Email address"}
                                </label>

                                {loginMethod === "phone" ? (
                                    <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                        <FontAwesomeIcon
                                            icon={faMobileScreen}
                                            className="mr-3 h-4 w-4 text-slate-400"
                                        />

                                        <span className="border-r border-slate-200 pr-3 text-sm font-black text-slate-700">
                                            +256
                                        </span>

                                        <input
                                            id="login-identifier"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel-national"
                                            value={phone}
                                            onChange={(event) => {
                                                setPhone(getUgandanNationalNumber(event.target.value));
                                                setError("");
                                            }}
                                            placeholder="700 000 001"
                                            pattern="[0-9]{9}"
                                            maxLength={16}
                                            required
                                            className="w-full bg-transparent pl-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="h-4 w-4 text-slate-400"
                                        />

                                        <input
                                            id="login-identifier"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(event) => {
                                                setEmail(event.target.value);
                                                setError("");
                                            }}
                                            placeholder="seller@example.com"
                                            required
                                            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                )}

                                <p className="mt-2 text-xs font-semibold text-slate-400">
                                    {loginMethod === "phone"
                                        ? "Prefer to sign in with your email? "
                                        : "Prefer to sign in with your phone number? "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                                            setError("");
                                        }}
                                        className="font-black text-orange-600 hover:text-orange-700"
                                    >
                                        {loginMethod === "phone" ? "Use email instead" : "Use phone number instead"}
                                    </button>
                                </p>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Password
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faLock}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter password"
                                        required
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <div className="flex justify-end">
                                <a
                                    href="/forgot-password"
                                    className="shrink-0 text-sm font-black text-orange-600 hover:text-orange-700"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                            Do not have an account?{" "}
                            <a
                                href="/register"
                                className="font-black text-orange-600 hover:text-orange-700"
                            >
                                Create account
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function LoginClient() {
    return (
        <Suspense
            fallback={<QotLoader />}
        >
            <LoginForm />
        </Suspense>
    );
}
