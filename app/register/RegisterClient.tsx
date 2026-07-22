"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLock,
    faMobileScreen,
    faShieldHalved,
    faStore,
    faTag,
    faUser,
} from "@/lib/faIcons";
import {
    getCurrentUser,
    registerUser,
    sendVerification,
} from "@/lib/sessionClient";
import QotLoader from "@/components/common/QotLoader";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import QotLogo from "@/components/brand/QotLogo";
import {
    getUgandanNationalNumber,
    isValidUgandanMobile,
    toUgandanPhone,
} from "@/lib/ugandanPhone";

function RegisterForm() {
    const searchParams = useSearchParams();
    const requestedNextUrl = searchParams.get("next") || "/";
    const nextUrl =
        requestedNextUrl.startsWith("/") && !requestedNextUrl.startsWith("//")
            ? requestedNextUrl
            : "/";

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
    async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

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

        if (!isValidUgandanMobile(phone)) {
            setError("Enter a valid Ugandan mobile number, such as +256 700 000 001.");
            setLoading(false);
            return;
        }

        try {
            await registerUser({
                full_name: fullName.trim(),
                phone: toUgandanPhone(phone),
                email: email.trim(),
                password,
                password_confirm: confirmPassword,
            });

            try {
                const user = await getCurrentUser();

                localStorage.setItem("qot_user", JSON.stringify(user));
                localStorage.removeItem("qot_access_token");
                localStorage.removeItem("qot_refresh_token");

                window.dispatchEvent(new Event("storage"));

                let sent = false;

                try {
                    await sendVerification("phone");
                    sent = true;
                } catch {
                    // The account remains valid and the user can retry on the next screen.
                }

                const verificationParams = new URLSearchParams({
                    next: nextUrl,
                });

                if (sent) {
                    verificationParams.set("sent", "1");
                }

                window.location.href = `/account/verification?${verificationParams.toString()}`;
            } catch {
                window.location.href = `/login?registered=1&next=${encodeURIComponent(
                    "/account/verification"
                )}`;
            }
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
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
                                Join Uganda’s fast-growing marketplace.
                            </h1>

                            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-orange-50">
                                Create your QOT account to post ads, save items, chat with sellers, and manage your marketplace activity.
                            </p>
                        </div>

                        <div className="relative grid gap-3">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faStore} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Start selling</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Post ads and reach buyers quickly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Protected session</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Your login stays secured with cookies.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                    <FontAwesomeIcon icon={faTag} className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-black">Save and compare</p>
                                    <p className="text-xs font-semibold text-orange-50">
                                        Keep your favorite ads in one place.
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

                        <h2 className="text-3xl font-black text-slate-950">
                            Create account
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Register with your phone number, email, and password.
                        </p>

                        <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
                            By creating an account, you agree to QOT Uganda&apos;s{" "}
                            <a href="/terms" target="_blank" rel="noreferrer" className="font-black text-orange-600 hover:text-orange-700">
                                Terms of Service
                            </a>{" "}
                            and acknowledge the{" "}
                            <a href="/privacy" target="_blank" rel="noreferrer" className="font-black text-orange-600 hover:text-orange-700">
                                Privacy Policy
                            </a>.
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

                        <div className="mt-6">
                            <GoogleSignInButton
                                keepSignedIn={false}
                                nextUrl={nextUrl}
                                mode="sign-up"
                            />
                        </div>

                        <div className="my-6 flex items-center gap-4">
                            <span className="h-px flex-1 bg-slate-200" />
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Or register with your details
                            </span>
                            <span className="h-px flex-1 bg-slate-200" />
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Full name
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        placeholder="Brian Seller"
                                        required
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Phone number
                                </span>

                                <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faMobileScreen}
                                        className="mr-3 h-4 w-4 text-slate-400"
                                    />

                                    <span className="border-r border-slate-200 pr-3 text-sm font-black text-slate-700">
                                        +256
                                    </span>

                                    <input
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
                                        aria-describedby="phone-help"
                                        className="w-full bg-transparent pl-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>

                                <span
                                    id="phone-help"
                                    className="mt-2 block text-xs font-semibold text-slate-400"
                                >
                                    Enter the 9 mobile digits after Uganda’s +256 country code.
                                </span>
                            </label>

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
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Create password"
                                        required
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Confirm password
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faLock}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Repeat password"
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
                                {loading ? "Creating account..." : "Create account"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                            Already have an account?{" "}
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

export default function RegisterClient() {
    return (
        <Suspense
            fallback={<QotLoader />}
        >
            <RegisterForm />
        </Suspense>
    );
}
