"use client";

import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faEnvelope,
    faLock,
    faShieldHalved,
} from "@/lib/faIcons";
import { useAccountShell } from "@/components/account/AccountShell";
import { requestPasswordReset } from "@/lib/sessionClient";

export default function AccountPasswordClient() {
    const { user } = useAccountShell();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const email = String(user?.email || "");

    async function handleRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!email) {
            setError("Add an email address to your account before requesting a password reset.");
            setLoading(false);
            return;
        }

        try {
            await requestPasswordReset({ email });
            setMessage("A secure password reset link has been sent to your account email.");
        } catch (requestError: any) {
            setError(requestError.message || "Failed to send the password reset link.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="hidden bg-slate-950 p-8 text-white xl:block">
                <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-500">
                    <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6" />
                </span>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    Account security
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight">
                    Keep your QOT account protected.
                </h1>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
                    Password changes use a private, single-use link sent to your registered email.
                </p>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
                <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-orange-50 text-orange-600">
                        <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">
                            Password & security
                        </p>
                        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                            Reset your password
                        </h1>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                            We will send a secure reset link to the email fixed to your account.
                        </p>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                        {error}
                    </div>
                )}

                {message && (
                    <div role="status" className="mt-6 flex gap-3 rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-700 ring-1 ring-emerald-100">
                        <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <p className="text-sm font-black">Check your email</p>
                            <p className="mt-1 text-xs font-bold leading-5">{message}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleRequest} className="mt-7">
                    <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                            Account email
                        </span>
                        <span className="flex h-13 items-center gap-3 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100">
                            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                readOnly
                                aria-readonly="true"
                                className="h-13 min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm font-bold text-slate-700 outline-none"
                            />
                            <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5 text-slate-300" />
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading || !email || Boolean(message)}
                        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.20)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                        {loading ? "Sending..." : message ? "Reset link sent" : "Send reset link"}
                    </button>
                </form>

                <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    {[
                        "Single-use link",
                        "Time-limited token",
                        "Registered email only",
                    ].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-[11px] font-black text-slate-600"
                        >
                            <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5 text-emerald-500" />
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
