"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCheck,
    faLock,
    faMobileScreenButton,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";

type VerifiedAccountGuardProps = {
    children: React.ReactNode;
    title?: string;
    description?: string;
};

function isVerifiedUser(user: any) {
    return (
        user?.phone_verified === true ||
        Boolean(user?.phone_verified_at) ||
        (!user?.phone && user?.is_verified === true)
    );
}

function maskPhone(value: unknown) {
    const phone = String(value || "").replace(/\s+/g, "");
    if (phone.length < 7) return "your QOT phone number";
    return `${phone.slice(0, 6)}•••${phone.slice(-3)}`;
}

export default function VerifiedAccountGuard({
    children,
    title = "Verify your phone to continue",
    description = "A verified phone number keeps QOT safer and helps buyers know they are dealing with a real person.",
}: VerifiedAccountGuardProps) {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        let active = true;

        async function checkAccount() {
            try {
                const currentUser = await getCurrentUser();
                if (active) setUser(currentUser);
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setMounted(true);
            }
        }

        checkAccount();

        return () => {
            active = false;
        };
    }, []);

    if (!mounted) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <div className="rounded-[30px] bg-white py-16 shadow-sm ring-1 ring-black/5">
                    <QotLoader />
                </div>
            </section>
        );
    }

    const nextUrl = encodeURIComponent(
        window.location.pathname + window.location.search
    );

    if (!user) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-9">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/25 blur-3xl" />
                    <div className="relative">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10 text-orange-300 ring-1 ring-white/15">
                            <FontAwesomeIcon icon={faLock} className="h-6 w-6" />
                        </span>
                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Secure feature</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight">Sign in to continue</h1>
                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300">
                            Your QOT account keeps this activity private and connected to you.
                        </p>
                        <a
                            href={`/login?next=${nextUrl}`}
                            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-6 text-sm font-black text-white transition hover:bg-orange-600"
                        >
                            Sign in
                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    if (!isVerifiedUser(user)) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
                <div className="relative overflow-hidden rounded-[34px] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="p-6 sm:p-9 lg:p-11">
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-700 ring-1 ring-orange-100">
                                <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                                One quick security step
                            </span>

                            <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                {title}
                            </h1>
                            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                                {description}
                            </p>

                            <div className="mt-7 rounded-[20px] bg-slate-50 p-4 ring-1 ring-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-orange-600 shadow-sm ring-1 ring-black/5">
                                        <FontAwesomeIcon icon={faMobileScreenButton} className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Code will be sent to</p>
                                        <p className="mt-1 truncate text-sm font-black text-slate-900">{maskPhone(user?.phone || user?.phone_number)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={`/account/verification?next=${nextUrl}`}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                                >
                                    Verify phone number
                                    <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                </a>
                                <a
                                    href="/account"
                                    className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-100 px-6 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                                >
                                    Back to My Account
                                </a>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-9 lg:p-11">
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
                            <div className="relative">
                                <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-500 text-white shadow-[0_16px_35px_rgba(249,115,22,0.35)]">
                                    <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7" />
                                </span>
                                <h2 className="mt-7 text-2xl font-black tracking-tight">Why QOT verifies phones</h2>
                                <div className="mt-6 space-y-4">
                                    {[
                                        "Reduces fake and duplicate accounts",
                                        "Builds more trust between buyers and sellers",
                                        "Protects important account actions",
                                    ].map((benefit) => (
                                        <div key={benefit} className="flex items-start gap-3">
                                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
                                                <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" />
                                            </span>
                                            <p className="text-sm font-semibold leading-6 text-slate-300">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-7 rounded-[18px] bg-white/5 px-4 py-3 text-xs font-semibold leading-5 text-slate-400 ring-1 ring-white/10">
                                    The OTP expires shortly and should never be shared with anyone, including QOT support.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return <>{children}</>;
}
