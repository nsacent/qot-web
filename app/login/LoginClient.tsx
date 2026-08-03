"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faMobileScreen, faShieldHalved, faStore, faTag } from "@/lib/faIcons";
import {
    confirmPhoneLoginOtp,
    getCurrentUser,
    loginUser,
    requestPhoneLoginOtp,
} from "@/lib/sessionClient";
import QotLoader from "@/components/common/QotLoader";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
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

    const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
    const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        setKeepSignedIn(localStorage.getItem("qot_keep_signed_in_preference") === "1");

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

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = window.setInterval(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [cooldown]);

    if (checkingSession) {
        return <QotLoader />;
    }

    async function finishLogin() {
        try {
            const user = await getCurrentUser();

            localStorage.setItem("qot_user", JSON.stringify(user));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");

            window.dispatchEvent(new Event("storage"));
        } catch {
            // The secure session cookies are already saved.
        }

        window.location.href = nextUrl;
    }

    function validatePhone() {
        if (isValidUgandanMobile(phone)) return true;

        setError("Enter a valid Ugandan mobile number, such as +256 700 000 001.");
        return false;
    }

    function updatePhone(value: string) {
        const nextPhone = getUgandanNationalNumber(value);

        if (otpSent && nextPhone !== phone) {
            setOtpSent(false);
            setOtpCode("");
            setCooldown(0);
            setMessage("");
        }

        setPhone(nextPhone);
        setError("");
    }

    async function sendOtp(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        setError("");
        setMessage("");

        if (!validatePhone()) return;

        setLoading(true);

        try {
            const result = await requestPhoneLoginOtp(toUgandanPhone(phone));
            setOtpSent(true);
            setCooldown(Math.max(0, Number(result?.resend_after || 60)));
            setMessage(
                `A 6-digit sign-in code was sent to ${result?.destination || toUgandanPhone(phone)}.`
            );
        } catch (requestError: any) {
            setError(requestError?.message || "We could not send a sign-in code. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!validatePhone()) return;

        if (!/^\d{6}$/.test(otpCode)) {
            setError("Enter the complete 6-digit code sent to your phone.");
            return;
        }

        setLoading(true);

        try {
            await confirmPhoneLoginOtp({
                phone: toUgandanPhone(phone),
                code: otpCode,
            });
            await finishLogin();
        } catch (requestError: any) {
            setError(requestError?.message || "The sign-in code could not be verified.");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setMessage("");

        if (loginMethod === "phone" && !validatePhone()) return;

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

            await finishLogin();
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

                        <h2 className="text-3xl font-black text-slate-950">Welcome back</h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Sign in securely with a phone code or your password.
                        </p>

                        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                            <button
                                type="button"
                                aria-pressed={authMode === "otp"}
                                onClick={() => {
                                    setAuthMode("otp");
                                    setError("");
                                    setMessage("");
                                }}
                                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
                                    authMode === "otp"
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <FontAwesomeIcon icon={faMobileScreen} className="h-3.5 w-3.5" />
                                Phone OTP
                            </button>
                            <button
                                type="button"
                                aria-pressed={authMode === "password"}
                                onClick={() => {
                                    setAuthMode("password");
                                    setError("");
                                    setMessage("");
                                }}
                                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
                                    authMode === "password"
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5" />
                                Password
                            </button>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {message && !error && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
                            >
                                {message}
                            </div>
                        )}

                        {passwordWasReset && !error && (
                            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                Password reset successfully. You can now log in with your new password.
                            </div>
                        )}

                        {authMode === "otp" ? (
                            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="otp-phone" className="mb-2 block text-sm font-black text-slate-700">
                                        Ugandan phone number
                                    </label>
                                    <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200">
                                        <FontAwesomeIcon icon={faMobileScreen} className="mr-3 h-4 w-4 text-slate-400" />
                                        <span className="border-r border-slate-200 pr-3 text-sm font-black text-slate-700">
                                            +256
                                        </span>
                                        <input
                                            id="otp-phone"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel-national"
                                            value={phone}
                                            onChange={(event) => updatePhone(event.target.value)}
                                            placeholder="700 000 001"
                                            pattern="[0-9]{9}"
                                            maxLength={16}
                                            required
                                            className="w-full bg-transparent pl-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-slate-400">
                                        Only Ugandan mobile numbers beginning with +2567 are accepted.
                                    </p>
                                </div>

                                {otpSent && (
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-black text-slate-700">
                                            6-digit sign-in code
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            value={otpCode}
                                            onChange={(event) => {
                                                setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                                                setError("");
                                            }}
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                            autoFocus
                                            className="h-14 w-full rounded-2xl bg-slate-50 px-4 text-center text-xl font-black tracking-[0.45em] text-slate-950 outline-none ring-1 ring-slate-100 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-orange-200"
                                        />
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? otpSent ? "Verifying..." : "Sending code..."
                                        : otpSent ? "Verify and sign in" : "Send sign-in code"}
                                </button>

                                {otpSent && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtpCode("");
                                                setCooldown(0);
                                                setMessage("");
                                                setError("");
                                            }}
                                            className="text-slate-500 hover:text-slate-800"
                                        >
                                            Change number
                                        </button>
                                        <button
                                            type="button"
                                            disabled={loading || cooldown > 0}
                                            onClick={() => void sendOtp()}
                                            className="font-black text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:text-slate-300"
                                        >
                                            {cooldown > 0 ? `Send again in ${cooldown}s` : "Send a new code"}
                                        </button>
                                    </div>
                                )}

                                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-500 ring-1 ring-slate-100">
                                    Successful OTP sign-in verifies this phone and keeps this device securely signed in for up to one year.
                                </p>
                            </form>
                        ) : (
                        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                                            onChange={(event) => updatePhone(event.target.value)}
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

                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                                <input
                                    type="checkbox"
                                    checked={keepSignedIn}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        setKeepSignedIn(checked);
                                        localStorage.setItem(
                                            "qot_keep_signed_in_preference",
                                            checked ? "1" : "0"
                                        );
                                    }}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                                />
                                <span>
                                    <span className="block text-sm font-black text-slate-700">Keep me signed in</span>
                                    <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                                        Stay signed in for one year on this device.
                                    </span>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                        )}

                        <div className="my-6 flex items-center gap-4">
                            <span className="h-px flex-1 bg-slate-200" />
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Or continue with
                            </span>
                            <span className="h-px flex-1 bg-slate-200" />
                        </div>

                        <GoogleSignInButton
                            keepSignedIn={keepSignedIn}
                            nextUrl={nextUrl}
                        />

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
