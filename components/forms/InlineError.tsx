"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTriangleExclamation,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function InlineError({
    message,
    onDismiss,
    className = "",
}: {
    message: string;
    onDismiss?: () => void;
    className?: string;
}) {
    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-[15px] border border-red-200 bg-red-50 px-3.5 py-3 text-red-700 ${className}`}
        >
            <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mt-0.5 h-4 w-4 shrink-0"
            />
            <p className="min-w-0 flex-1 text-xs font-black leading-5">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss error"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-100"
                >
                    <FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" />
                </button>
            )}
        </div>
    );
}
