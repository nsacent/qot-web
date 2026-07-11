"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import {
    getStoredToken,
    getStoredUser,
    getUserDisplayName,
} from "@/lib/auth";

function isVerifiedUser(user: any) {
    return (
        user?.is_verified === true ||
        user?.verified === true ||
        user?.account_verified === true ||
        user?.phone_verified === true ||
        user?.email_verified === true ||
        user?.profile?.is_verified === true ||
        user?.profile?.verified === true
    );
}

function getPhone(user: any) {
    return (
        user?.phone ||
        user?.phone_number ||
        user?.mobile ||
        user?.identifier ||
        ""
    );
}

function getEmail(user: any) {
    return user?.email || "";
}

function getVerificationMessage(data: any, fallback: string) {
    return (
        data?.detail ||
        data?.message ||
        data?.success ||
        data?.data?.message ||
        fallback
    );
}

function getUserFromResponse(data: any) {
    return data?.user || data?.data?.user || data?.data || data || null;
}

function maskEmail(email: string) {
    if (!email || !email.includes("@")) return email || "your registered email";

    const [name, domain] = email.split("@");
    const visible = name.slice(0, 2);

    return `${visible}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
}

export default function VerificationRequestClient() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [otp, setOtp] = useState("");
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        if (!token || !storedUser) {
            window.location.href = "/login?next=/account/verification";
            return;
        }

        setUser(storedUser);
        setMounted(true);

        refreshUser();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = window.setTimeout(() => {
            setCooldown((current) => current - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [cooldown]);

    async function refreshUser() {
        try {
            const data = await apiGet("/auth/me/");
            const freshUser = getUserFromResponse(data);

            if (freshUser) {
                localStorage.setItem("qot_user", JSON.stringify(freshUser));
                setUser(freshUser);

                window.dispatchEvent(new Event("storage"));
            }
        } catch (error) {
            console.log("Failed to refresh user:", error);
        }
    }

    async function sendOtp() {
        setError("");
        setSuccess("");

        if (cooldown > 0) return;

        setSending(true);

        try {
            const data = await apiPost("/auth/verification/send/", {});

            setOtpSent(true);
            setCooldown(60);

            setSuccess(
                getVerificationMessage(
                    data,
                    "Verification OTP has been sent to your registered contact."
                )
            );
        } catch (error: any) {
            setError(error.message || "Failed to send verification OTP.");
        } finally {
            setSending(false);
        }
    }

    async function confirmOtp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanOtp = otp.trim();

        if (!cleanOtp) {
            setError("Please enter the OTP code.");
            return;
        }

        if (cleanOtp.length < 4) {
            setError("Please enter a valid OTP code.");
            return;
        }

        setConfirming(true);

        try {
            const data = await apiPost("/auth/verification/confirm/", {
                otp: cleanOtp,
                code: cleanOtp,
            });

            setSuccess(
                getVerificationMessage(
                    data,
                    "Account verified successfully. Seller tools are now available."
                )
            );

            setOtp("");
            setOtpSent(false);
            setCooldown(0);

            await refreshUser();
        } catch (error: any) {
            setError(error.message || "Failed to confirm verification OTP.");
        } finally {
            setConfirming(false);
        }
    }

    if (!mounted || !user) {
        return (
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Loading verification page...
                </div>
            </section>
        );
    }

    const verified = isVerifiedUser(user);
    const name = getUserDisplayName(user);
    const phone = getPhone(user);
    const email = getEmail(user);

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                    Account Verification
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
                    Verify your QOT account
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Confirm your account using OTP so you can access seller tools, post
                    adverts, and use trusted account features.
                </p>
            </div>

            {verified ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-green-800">
                    <p className="text-sm font-semibold uppercase tracking-wide">
                        Verified Account
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        Your account is verified.
                    </h2>

                    <p className="mt-2 text-sm">
                        Seller tools are now available. You can post adverts, manage your
                        listings, and use your dashboard.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <a
                            href="/post-ad"
                            className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700"
                        >
                            Post Advert
                        </a>

                        <a
                            href="/seller/dashboard"
                            className="rounded-xl border border-green-200 bg-white px-5 py-3 text-center font-semibold text-green-700 hover:bg-green-100"
                        >
                            Seller Dashboard
                        </a>

                        <a
                            href="/account"
                            className="rounded-xl border border-green-200 bg-white px-5 py-3 text-center font-semibold text-green-700 hover:bg-green-100"
                        >
                            My Account
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
                            <p className="font-bold">Your account is not yet verified.</p>

                            <p className="mt-1 text-sm">
                                Send an OTP to your registered contact, then enter the code
                                below.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Name
                                </label>

                                <input
                                    value={name}
                                    readOnly
                                    className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-600"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Phone
                                </label>

                                <input
                                    value={phone || "Not provided"}
                                    readOnly
                                    className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Email
                            </label>

                            <input
                                value={email ? maskEmail(email) : "Not provided"}
                                readOnly
                                className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-600"
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={sendOtp}
                                disabled={sending || cooldown > 0}
                                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                            >
                                {sending
                                    ? "Sending OTP..."
                                    : cooldown > 0
                                        ? `Resend OTP in ${cooldown}s`
                                        : otpSent
                                            ? "Resend OTP"
                                            : "Send OTP"}
                            </button>

                            {otpSent && (
                                <p className="mt-2 text-center text-xs text-slate-500">
                                    Check your inbox or spam folder for the OTP code.
                                </p>
                            )}
                        </div>

                        <form onSubmit={confirmOtp} className="mt-6">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Enter OTP Code
                            </label>

                            <input
                                value={otp}
                                onChange={(event) => setOtp(event.target.value)}
                                placeholder="Example: 123456"
                                inputMode="numeric"
                                maxLength={8}
                                className="w-full rounded-xl border px-4 py-3 text-center text-xl font-bold tracking-widest outline-none focus:border-orange-500"
                            />

                            <button
                                type="submit"
                                disabled={confirming}
                                className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {confirming ? "Verifying..." : "Verify Account"}
                            </button>
                        </form>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                How it works
                            </p>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Click Send OTP.</li>
                                <li>• Check your registered email or phone.</li>
                                <li>• Enter the OTP before it expires.</li>
                                <li>• Your account unlocks seller tools after verification.</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                Verification Benefits
                            </p>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Helps reduce fake accounts.</li>
                                <li>• Builds buyer confidence.</li>
                                <li>• Unlocks posting and seller tools.</li>
                                <li>• Improves marketplace safety.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}