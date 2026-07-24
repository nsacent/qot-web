"use client";


export default function CookieSettingsButton({ className = "" }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("qot_open_cookie_settings"))}
            className={className}
        >
            Cookie settings
        </button>
    );
}
