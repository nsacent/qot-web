"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCircleCheck,
    faEnvelope,
    faMobileScreen,
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

function maskPhone(phone: string) {
    const value = String(phone || "");

    if (value.length < 7) return value || "your registered phone number";

    return `${value.slice(0, 4)} ••• ••${value.slice(-2)}`;
}

function maskEmail(email: string) {
    const value = String(email || "").trim();
    const separator = value.lastIndexOf("@");

    if (separator < 1) return value || "your registered email address";

    const local = value.slice(0, separator);
    const domain = value.slice(separator + 1);
    const visible = local.slice(0, Math.min(2, local.length));

    return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

type VerificationChannel = "phone" | "email";

function VerificationForm({ embedded = false }: { embedded?: boolean }) {
    const searchParams = useSearchParams();
    const requestedNextUrl = searchParams.get("next") || "/account";
    const nextUrl =
        requestedNextUrl.startsWith("/") && !requestedNextUrl.startsWith("//")
            ? requestedNextUrl
            : "/account";
    const codeWasSent = searchParams.get("sent") === "1";
    const requestedChannel: VerificationChannel =
        searchParams.get("channel") === "email" ? "email" : "phone";
    const [user, setUser] = useState<any>(null);
    const [channel, setChannel] = useState<VerificationChannel>(requestedChannel);
    const [code, setCode] = useState("");
    const [hasSentCode, setHasSentCode] = useState(codeWasSent);
    const [resendSeconds, setResendSeconds] = useState(
        codeWasSent ? 60 : 0
    );

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

    useEffect(() => {
        if (codeWasSent && channel === "phone") {
            setMessage("A 6-digit verification code was sent to your phone.");
        }
    }, [channel, codeWasSent]);

    useEffect(() => {
        if (resendSeconds <= 0) return;

        const timer = window.setInterval(() => {
            setResendSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendSeconds]);

    async function handleSendCode() {
        setSending(true);
        setError("");
        setMessage("");

        try {
            const result = await sendVerification(channel);
            setMessage(
                `Verification code sent to ${
                    result?.destination ||
                    (channel === "phone"
                        ? maskPhone(user?.phone)
                        : maskEmail(user?.email))
                }.`
            );
            setHasSentCode(true);
            setResendSeconds(Number(result?.resend_after || 60));
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
                channel,
            });

            const data = await getCurrentUser();
            const currentUser = getUserObject(data);

            setUser(currentUser);
            localStorage.setItem("qot_user", JSON.stringify(currentUser));

            setMessage(
                channel === "phone"
                    ? "Your phone number has been verified successfully."
                    : "Your email address has been verified successfully."
            );
            setCode("");

            window.setTimeout(() => {
                window.location.href = nextUrl;
            }, 900);
        } catch (err: any) {
            setError(err.message || "Failed to verify account.");
        } finally {
            setConfirming(false);
        }
    }

    if (checkingSession) {
        return <QotLoader />;
    }

    const isPhoneVerified =
        user?.phone_verified === true ||
        Boolean(user?.phone_verified_at);
    const isEmailVerified =
        user?.email_verified === true ||
        Boolean(user?.email_verified_at);
    const isVerified = channel === "phone" ? isPhoneVerified : isEmailVerified;
    const isPhoneChannel = channel === "phone";
    const destination = isPhoneChannel
        ? maskPhone(user?.phone)
        : maskEmail(user?.email);
    const hasDestination = isPhoneChannel
        ? Boolean(user?.phone)
        : Boolean(user?.email);

    function selectChannel(nextChannel: VerificationChannel) {
        if (nextChannel === channel) return;

        setChannel(nextChannel);
        setCode("");
        setHasSentCode(false);
        setResendSeconds(0);
        setMessage("");
        setError("");
    }

    return (
        <section className={embedded ? "text-slate-950" : "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_30%),linear-gradient(180deg,#fffaf7_0%,#fff7f2_100%)] px-4 py-4 text-slate-950 sm:px-6 sm:py-6"}>
            {!embedded && (
                <header className="mx-auto hidden max-w-[1180px] items-center justify-between rounded-[22px] bg-white/90 px-4 py-3 shadow-sm ring-1 ring-black/5 backdrop-blur md:flex md:px-5">
                    <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                        <QotLogo className="h-10 w-auto text-orange-500 sm:h-11" />
                    </a>

                    <a
                        href="/account"
                        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-100 px-4 text-xs font-black text-slate-700 transition hover:bg-slate-950 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                        My account
                    </a>
                </header>
            )}

            <div className={`mx-auto grid max-w-[1180px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/5 ${embedded ? "xl:grid-cols-[0.82fr_1.18fr]" : "lg:mt-6 lg:grid-cols-[0.88fr_1.12fr]"}`}>
                <section className={`relative overflow-hidden bg-slate-950 p-6 text-white sm:p-8 lg:p-10 ${embedded ? "hidden xl:block" : ""}`}>
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
                    <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

                    <div className="relative">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-500 text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)]">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6" />
                        </span>

                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                            Account protection
                        </p>
                        <h1 className="mt-2 max-w-md text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl">
                            Verification builds trust on QOT.
                        </h1>
                        <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-slate-300">
                            Confirm your contact details once to protect your account and help buyers know they are dealing with a real person.
                        </p>
                    </div>

                    <div className="relative mt-8 hidden gap-3 lg:grid">
                        {[
                            "Unlock posting and seller tools",
                            "Build confidence with buyers",
                            "Protect account recovery",
                        ].map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
                                    <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-black text-slate-100">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative mt-7 flex items-start gap-3 rounded-2xl bg-orange-500/10 p-4 ring-1 ring-orange-300/15 lg:mt-10">
                        <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                        <p className="text-xs font-semibold leading-5 text-slate-300">
                            Your code is private, expires after 10 minutes, and should never be shared with anyone.
                        </p>
                    </div>
                </section>

                <section className="p-5 sm:p-8 lg:p-10">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                Verify your account
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                                Phone is your primary verification method
                            </p>
                        </div>
                        {!isVerified && (
                            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600 ring-1 ring-orange-100">
                                {hasSentCode ? "Step 2 of 2" : "Step 1 of 2"}
                            </span>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2 rounded-[20px] bg-slate-100 p-1.5">
                        <button
                            type="button"
                            onClick={() => selectChannel("phone")}
                            aria-pressed={isPhoneChannel}
                            className={`rounded-[15px] px-3 py-3 text-left transition ${isPhoneChannel ? "bg-white shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:bg-white/60"}`}
                        >
                            <span className="flex items-center gap-2 text-sm font-black">
                                <FontAwesomeIcon icon={faMobileScreen} className={`h-4 w-4 ${isPhoneChannel ? "text-orange-500" : "text-slate-400"}`} />
                                Phone
                            </span>
                            <span className={`mt-1 block text-[9px] font-black uppercase tracking-wider ${isPhoneChannel ? "text-orange-600" : "text-slate-400"}`}>
                                Primary {isPhoneVerified ? "• Verified" : ""}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => selectChannel("email")}
                            aria-pressed={!isPhoneChannel}
                            className={`rounded-[15px] px-3 py-3 text-left transition ${!isPhoneChannel ? "bg-white shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:bg-white/60"}`}
                        >
                            <span className="flex items-center gap-2 text-sm font-black">
                                <FontAwesomeIcon icon={faEnvelope} className={`h-4 w-4 ${!isPhoneChannel ? "text-orange-500" : "text-slate-400"}`} />
                                Email
                            </span>
                            <span className={`mt-1 block text-[9px] font-black uppercase tracking-wider ${!isPhoneChannel ? "text-orange-600" : "text-slate-400"}`}>
                                Secondary {isEmailVerified ? "• Verified" : ""}
                            </span>
                        </button>
                    </div>

                    {isVerified ? (
                        <div className="mt-7 rounded-[26px] bg-emerald-50 p-6 ring-1 ring-emerald-100 sm:p-8">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-500 text-white shadow-[0_12px_28px_rgba(16,185,129,0.22)]">
                                <FontAwesomeIcon icon={faCircleCheck} className="h-8 w-8" />
                            </div>
                            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                                {isPhoneChannel ? "Phone verified" : "Email verified"}
                            </h2>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                                {isPhoneChannel
                                    ? "Your primary QOT contact is confirmed and your seller tools are protected."
                                    : "Your email is confirmed for account updates and recovery."}
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <a href={nextUrl} className="rounded-2xl bg-slate-950 px-5 py-3.5 text-center text-sm font-black text-white transition hover:bg-slate-800">
                                    Continue
                                </a>
                                <a href="/account" className="rounded-2xl bg-white px-5 py-3.5 text-center text-sm font-black text-slate-700 ring-1 ring-emerald-100 transition hover:text-orange-600">
                                    My account
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-7">
                            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                {hasSentCode
                                    ? "Enter your 6-digit code"
                                    : isPhoneChannel
                                        ? "Confirm your phone number"
                                        : "Confirm your email address"}
                            </h2>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                {hasSentCode
                                    ? `We sent a one-time code ${isPhoneChannel ? "by SMS" : "by email"}.`
                                    : `We will send a private one-time code ${isPhoneChannel ? "by SMS" : "by email"}.`}
                            </p>

                            <div className="mt-5 flex items-center gap-3 rounded-[20px] bg-slate-50 p-4 ring-1 ring-slate-100">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-orange-500 shadow-sm ring-1 ring-slate-100">
                                    <FontAwesomeIcon icon={isPhoneChannel ? faMobileScreen : faEnvelope} className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                        Code destination
                                    </p>
                                    <p className="mt-1 truncate text-sm font-black text-slate-900">{destination}</p>
                                </div>
                                <a href={embedded ? "/account/profile" : "/account"} className="shrink-0 text-xs font-black text-orange-600 hover:text-orange-700">
                                    Change
                                </a>
                            </div>

                            {error && (
                                <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-5 text-emerald-700">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 h-4 w-4 shrink-0" />
                                    {message}
                                </div>
                            )}

                            {!hasSentCode ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={sending || !hasDestination}
                                        className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-[18px] bg-orange-500 px-5 text-sm font-black text-white shadow-[0_12px_26px_rgba(249,115,22,0.22)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FontAwesomeIcon icon={isPhoneChannel ? faMobileScreen : faEnvelope} className="h-4 w-4" />
                                        {sending
                                            ? "Sending code..."
                                            : isPhoneChannel
                                                ? "Send code by SMS"
                                                : "Send code by email"}
                                    </button>
                                    <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-400">
                                        {!hasDestination
                                            ? `Add ${isPhoneChannel ? "a phone number" : "an email address"} in your account first.`
                                            : isPhoneChannel
                                                ? "SMS delivery can take up to one minute."
                                                : "Check your inbox and spam folder."}
                                    </p>
                                </>
                            ) : (
                                <form onSubmit={handleConfirm} className="mt-6">
                                    <label className="block">
                                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                                            Verification code
                                        </span>
                                        <div className="rounded-[18px] bg-slate-50 px-4 py-3 ring-1 ring-slate-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-300">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                value={code}
                                                onChange={(event) => {
                                                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                                                    setError("");
                                                }}
                                                placeholder="000000"
                                                aria-label="6-digit verification code"
                                                pattern="[0-9]{6}"
                                                maxLength={6}
                                                required
                                                autoFocus
                                                className="w-full bg-transparent text-center text-2xl font-black tracking-[0.4em] text-slate-950 outline-none placeholder:text-slate-300"
                                            />
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={confirming || code.length !== 6}
                                        className="mt-4 h-13 w-full rounded-[18px] bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                                    >
                                        {confirming
                                            ? "Checking code..."
                                            : isPhoneChannel
                                                ? "Verify phone number"
                                                : "Verify email address"}
                                    </button>

                                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <span className="text-xs font-semibold text-slate-500">Didn&apos;t get the code?</span>
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={sending || resendSeconds > 0}
                                            className="shrink-0 text-xs font-black text-orange-600 hover:text-orange-700 disabled:text-slate-400"
                                        >
                                            {sending
                                                ? "Sending..."
                                                : resendSeconds > 0
                                                    ? `Resend in ${resendSeconds}s`
                                                    : "Resend code"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}

export default function VerificationClient({ embedded = false }: { embedded?: boolean }) {
    return (
        <Suspense fallback={<QotLoader />}>
            <VerificationForm embedded={embedded} />
        </Suspense>
    );
}
