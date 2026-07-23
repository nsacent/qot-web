"use client";

import { useEffect, useState } from "react";
import QotLoader from "@/components/common/QotLoader";

export default function RequireAccountSession({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const response = await fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    const nextUrl = encodeURIComponent(
                        window.location.pathname + window.location.search
                    );
                    window.location.replace(`/login?next=${nextUrl}`);
                    return;
                }

                if (!cancelled) setAuthorized(true);
            } catch {
                const nextUrl = encodeURIComponent(
                    window.location.pathname + window.location.search
                );
                window.location.replace(`/login?next=${nextUrl}`);
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!authorized) {
        return <QotLoader text="Checking your account…" showText />;
    }

    return children;
}
