"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookieBite, faShieldHalved } from "@fortawesome/free-solid-svg-icons";


export type CookieConsentChoice = "all" | "essential";

const COOKIE_NAME = "qot_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function hasSavedConsent() {
    return document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`));
}

function saveConsent(choice: CookieConsentChoice) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${choice}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    window.dispatchEvent(
        new CustomEvent("qot_cookie_consent_updated", { detail: { choice } })
    );
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setVisible(!hasSavedConsent());
        });
        const openSettings = () => setVisible(true);

        window.addEventListener("qot_open_cookie_settings", openSettings);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("qot_open_cookie_settings", openSettings);
        };
    }, []);

    function choose(choice: CookieConsentChoice) {
        saveConsent(choice);
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <aside
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-description"
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[100] mx-auto max-w-3xl md:bottom-6"
        >
            <div className="relative overflow-hidden rounded-[26px] bg-slate-950 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,0.34)] ring-1 ring-white/10 sm:p-5">
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                        <FontAwesomeIcon icon={faCookieBite} className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 id="cookie-consent-title" className="text-base font-black tracking-tight">
                                Your privacy, your choice
                            </h2>
                            <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5 text-orange-300" />
                        </div>
                        <p id="cookie-consent-description" className="mt-1.5 text-xs font-semibold leading-5 text-slate-300">
                            Essential cookies keep QOT secure and signed in. With your permission, optional cookies can help us remember preferences and improve the marketplace.
                        </p>
                        <Link href="/privacy" className="mt-2 inline-flex text-[11px] font-black text-orange-300 hover:text-orange-200">
                            Read our Privacy Policy
                        </Link>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:flex-col">
                        <button
                            type="button"
                            onClick={() => choose("all")}
                            className="rounded-[14px] bg-orange-500 px-4 py-3 text-xs font-black text-white transition hover:bg-orange-600 active:scale-[0.98]"
                        >
                            Accept all
                        </button>
                        <button
                            type="button"
                            onClick={() => choose("essential")}
                            className="rounded-[14px] bg-white/10 px-4 py-3 text-xs font-black text-slate-100 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
                        >
                            Essential only
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
