"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";

type LoginPageClientProps = {
    children: React.ReactNode;
};

export default function LoginPageClient({ children }: LoginPageClientProps) {
    const [checking, setChecking] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const token = getStoredToken();

        if (token) {
            setLoggedIn(true);

            const params = new URLSearchParams(window.location.search);
            const nextUrl = params.get("next") || "/";

            window.location.href = nextUrl;
            return;
        }

        setChecking(false);
    }, []);

    if (checking || loggedIn) {
        return (
            <section className="mx-auto max-w-md px-6 py-16">
                <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
                    Checking login status...
                </div>
            </section>
        );
    }

    return <>{children}</>;
}