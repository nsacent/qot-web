"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, loginWithFacebook } from "@/lib/sessionClient";

type FacebookLoginResponse = {
    status?: "connected" | "not_authorized" | "unknown";
    authResponse?: {
        accessToken?: string;
    };
};

type FacebookSdk = {
    init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
    }) => void;
    login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string; return_scopes: boolean }
    ) => void;
};

declare global {
    interface Window {
        FB?: FacebookSdk;
        fbAsyncInit?: () => void;
    }
}

type FacebookSignInButtonProps = {
    keepSignedIn: boolean;
    nextUrl: string;
    mode?: "sign-in" | "sign-up";
};

let initializedFacebookAppId = "";

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
        : "Facebook sign-in failed. Please try again.";
}

export default function FacebookSignInButton({
    keepSignedIn,
    nextUrl,
    mode = "sign-in",
}: FacebookSignInButtonProps) {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const initializeFacebook = useCallback(() => {
        if (!window.FB || !appId) return;

        if (initializedFacebookAppId !== appId) {
            window.FB.init({
                appId,
                cookie: false,
                xfbml: false,
                version: "v25.0",
            });
            initializedFacebookAppId = appId;
        }

        setReady(true);
        setError("");
    }, [appId]);

    useEffect(() => {
        if (!appId) return;

        window.fbAsyncInit = initializeFacebook;

        return () => {
            if (window.fbAsyncInit === initializeFacebook) {
                delete window.fbAsyncInit;
            }
        };
    }, [appId, initializeFacebook]);

    const finishSignIn = useCallback(async (accessToken: string) => {
        setLoading(true);
        setError("");

        try {
            await loginWithFacebook({
                access_token: accessToken,
                keep_signed_in: keepSignedIn === true,
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

            window.location.href = nextUrl || "/";
        } catch (signInError: unknown) {
            setError(getErrorMessage(signInError));
            setLoading(false);
        }
    }, [keepSignedIn, nextUrl]);

    const startSignIn = useCallback(() => {
        if (!window.FB || !ready || loading) {
            setError("Facebook sign-in is still loading. Please try again.");
            return;
        }

        window.FB.login(
            (response) => {
                const accessToken = response.authResponse?.accessToken || "";

                if (response.status !== "connected" || !accessToken) {
                    setError("Facebook sign-in was cancelled or email access was not granted.");
                    return;
                }

                void finishSignIn(accessToken);
            },
            {
                scope: "public_profile,email",
                return_scopes: true,
            }
        );
    }, [finishSignIn, loading, ready]);

    if (!appId) return null;

    return (
        <div>
            <Script
                id="facebook-javascript-sdk"
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="afterInteractive"
                crossOrigin="anonymous"
                onReady={initializeFacebook}
                onError={() => {
                    setError("Facebook sign-in could not load. Please check your connection.");
                }}
            />

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={startSignIn}
                    disabled={!ready || loading}
                    className="relative flex min-h-11 w-full max-w-80 items-center justify-center rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#166fe5] disabled:cursor-wait disabled:opacity-65"
                >
                    <span
                        aria-hidden="true"
                        className="absolute left-5 flex h-6 w-6 items-end justify-center rounded-full bg-white text-xl font-black leading-[22px] text-[#1877F2]"
                    >
                        f
                    </span>
                    {loading
                        ? mode === "sign-up"
                            ? "Creating your account..."
                            : "Signing you in..."
                        : mode === "sign-up"
                            ? "Sign up with Facebook"
                            : "Continue with Facebook"}
                </button>
            </div>

            {error && (
                <p className="mt-3 text-center text-xs font-bold text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
