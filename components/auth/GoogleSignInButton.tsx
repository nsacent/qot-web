"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { getCurrentUser, loginWithGoogle } from "@/lib/sessionClient";

type GoogleCredentialResponse = {
    credential?: string;
    select_by?: string;
};

type GoogleIdentityApi = {
    initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
    }) => void;
    renderButton: (
        parent: HTMLElement,
        options: {
            type: "standard";
            theme: "outline";
            size: "large";
            text: "continue_with" | "signup_with";
            shape: "pill";
            logo_alignment: "left";
            width: number;
        }
    ) => void;
};

declare global {
    interface Window {
        google?: {
            accounts: {
                id: GoogleIdentityApi;
            };
        };
    }
}

type GoogleSignInButtonProps = {
    keepSignedIn: boolean;
    nextUrl: string;
    mode?: "sign-in" | "sign-up";
};

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function getUserObject(data: unknown) {
    const response = asRecord(data);
    const nestedData = asRecord(response?.data);

    return asRecord(response?.user) || asRecord(nestedData?.user) || nestedData || response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Google sign-in failed. Please try again.";
}

export default function GoogleSignInButton({
    keepSignedIn,
    nextUrl,
    mode = "sign-in",
}: GoogleSignInButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || "";
    const buttonRef = useRef<HTMLDivElement>(null);
    const keepSignedInRef = useRef(keepSignedIn);
    const nextUrlRef = useRef(nextUrl);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        keepSignedInRef.current = keepSignedIn;
        nextUrlRef.current = nextUrl;
    }, [keepSignedIn, nextUrl]);

    const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
        const credential = response.credential || "";

        if (!credential) {
            setError("Google did not return a sign-in credential. Please try again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await loginWithGoogle({
                credential,
                keep_signed_in: keepSignedInRef.current,
            });

            try {
                const data = await getCurrentUser();
                const user = getUserObject(data);

                if (user) {
                    localStorage.setItem("qot_user", JSON.stringify(user));
                    localStorage.removeItem("qot_access_token");
                    localStorage.removeItem("qot_refresh_token");
                    window.dispatchEvent(new Event("storage"));
                }
            } catch {
                // The secure session cookies are already saved.
            }

            window.location.href = nextUrlRef.current || "/";
        } catch (error: unknown) {
            setError(getErrorMessage(error));
            setLoading(false);
        }
    }, []);

    const renderGoogleButton = useCallback(() => {
        const target = buttonRef.current;
        const identityApi = window.google?.accounts?.id;

        if (!target || !identityApi || !clientId) {
            setError("Google sign-in could not load. Please refresh and try again.");
            return;
        }

        target.replaceChildren();

        identityApi.initialize({
            client_id: clientId,
            callback: (response) => {
                void handleCredential(response);
            },
            ux_mode: "popup",
        });

        identityApi.renderButton(target, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: mode === "sign-up" ? "signup_with" : "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: 320,
        });

        setReady(true);
    }, [clientId, handleCredential, mode]);

    if (!clientId) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700">
                Google sign-in will appear after the OAuth client ID is configured.
            </div>
        );
    }

    return (
        <div>
            <Script
                id="google-identity-services"
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                referrerPolicy="strict-origin-when-cross-origin"
                onReady={renderGoogleButton}
                onError={() => {
                    setError("Google sign-in could not load. Please check your connection.");
                }}
            />

            <div className="relative flex min-h-11 justify-center">
                <div
                    ref={buttonRef}
                    aria-label={mode === "sign-up" ? "Sign up with Google" : "Continue with Google"}
                />

                {!ready && !error && (
                    <div className="absolute inset-0 animate-pulse rounded-full bg-slate-100" />
                )}

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/95 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                        {mode === "sign-up" ? "Creating your account..." : "Signing you in..."}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-3 text-center text-xs font-bold text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
