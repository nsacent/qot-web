"use client";

import { useEffect, useState } from "react";
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

function getVerificationText(user: any) {
    if (!user) return "You need to login first.";

    return (
        user?.verification_status ||
        user?.status ||
        user?.profile?.verification_status ||
        "Your phone number is not yet verified."
    );
}

export default function VerifiedAccountGuard({
    children,
    title = "Phone verification required",
    description = "Verify your phone number before using this QOT feature.",
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
            <section className="mx-auto max-w-4xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    Checking account status...
                </div>
            </section>
        );
    }

    if (!user) {
        const nextUrl = encodeURIComponent(
            window.location.pathname + window.location.search
        );

        return (
            <section className="mx-auto max-w-4xl px-6 py-10">
                <div className="rounded-2xl border bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Login Required
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                        Please login first
                    </h1>

                    <p className="mt-3 text-slate-600">
                        You need to login before accessing this feature.
                    </p>

                    <a
                        href={`/login?next=${nextUrl}`}
                        className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Login
                    </a>
                </div>
            </section>
        );
    }

    if (!isVerifiedUser(user)) {
        return (
            <section className="mx-auto max-w-4xl px-6 py-10">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                        Verification Needed
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>

                    <p className="mt-3 text-slate-700">{description}</p>

                    <div className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Current status:</p>
                        <p className="mt-1">{getVerificationText(user)}</p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                        <a
                            href="/account/verification"
                            className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                        >
                            Verify Phone Number
                        </a>
                        <a
                            href="/account"
                            className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                        >
                            View Account
                        </a>

                        <a
                            href="/"
                            className="rounded-xl border bg-white px-5 py-3 text-center font-semibold hover:bg-slate-50"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    return <>{children}</>;
}
