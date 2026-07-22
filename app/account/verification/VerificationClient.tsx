"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

function VerificationForm() {
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
                                Confirm that your Ugandan phone number belongs to you before using QOT seller tools.
                            </p>
                        </div>

                        <div className="relative rounded-3xl bg-white/15 p-5 backdrop-blur">
                            <FontAwesomeIcon icon={faMobileScreen} className="h-7 w-7" />
                            <p className="mt-4 text-sm font-black">Phone verification</p>
                            <p className="mt-1 text-xs font-semibold text-orange-50">
                                QOT sends a private 6-digit code by SMS. It expires after 10 minutes.
                            </p>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-8 md:hidden">
                            <a href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <QotLogo className="h-11 w-auto text-orange-500" />
                            </a>
                        </div>

                        <div className="mb-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => selectChannel("phone")}
                                className={`rounded-xl px-3 py-3 text-left transition ${isPhoneChannel ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-white/60"}`}
                            >
                                <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                                    <FontAwesomeIcon icon={faMobileScreen} className="h-4 w-4 text-orange-500" />
                                    Phone
                                </span>
                                <span className="mt-1 block text-[10px] font-black uppercase tracking-wider text-orange-600">
                                    Primary {isPhoneVerified ? "• Verified" : ""}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => selectChannel("email")}
                                className={`rounded-xl px-3 py-3 text-left transition ${!isPhoneChannel ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-white/60"}`}
                            >
                                <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-slate-500" />
                                    Email
                                </span>
                                <span className="mt-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Secondary {isEmailVerified ? "• Verified" : ""}
                                </span>
                            </button>
                        </div>

                        {isVerified ? (
                            <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-600">
                                    <FontAwesomeIcon icon={faCircleCheck} className="h-8 w-8" />
                                </div>

                                <h2 className="mt-6 text-3xl font-black text-slate-950">
                                    {isPhoneChannel ? "Phone verified" : "Email verified"}
                                </h2>

                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                    {isPhoneChannel
                                        ? "Your QOT phone number is verified. This is your primary account verification."
                                        : "Your QOT email address is verified as a secondary account and recovery contact."}
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
                                    {isPhoneChannel ? "Verify your phone" : "Verify your email"}
                                </h2>

                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                    We will send a one-time verification code {isPhoneChannel ? "by SMS" : "by email"} to:
                                    <br />
                                    <span className="font-black text-slate-900">
                                        {destination}
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
                                    disabled={sending || resendSeconds > 0}
                                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={isPhoneChannel ? faMobileScreen : faEnvelope} className="h-4 w-4" />
                                    {sending
                                        ? "Sending OTP..."
                                        : resendSeconds > 0
                                            ? `Resend in ${resendSeconds}s`
                                            : hasSentCode
                                                ? "Resend OTP"
                                                : isPhoneChannel
                                                    ? "Send OTP by SMS"
                                                    : "Send OTP by email"}
                                </button>

                                <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-400">
                                    {isPhoneChannel
                                        ? "SMS delivery can take up to one minute. Never share this code with anyone."
                                        : "Check your inbox and spam folder. Never share this code with anyone."}
                                </p>

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
                                                autoComplete="one-time-code"
                                                value={code}
                                                onChange={(event) => {
                                                    setCode(
                                                        event.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 6)
                                                    );
                                                    setError("");
                                                }}
                                                placeholder="Enter 6-digit code"
                                                pattern="[0-9]{6}"
                                                maxLength={6}
                                                required
                                                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={confirming || code.length !== 6}
                                        className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {confirming
                                            ? "Verifying..."
                                            : isPhoneChannel
                                                ? "Verify phone number"
                                                : "Verify email address"}
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
