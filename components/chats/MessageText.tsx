import type { ReactNode } from "react";

const MESSAGE_TOKEN_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?|(?:\+?256|0)(?:[\s().-]*[237])(?:[\s().-]*\d){8})/gi;
const URL_END_PUNCTUATION = /[.,!?;:)}\]]+$/;

function phoneHref(value: string) {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("256")) return `tel:+${digits}`;
    if (digits.startsWith("0")) return `tel:+256${digits.slice(1)}`;
    return `tel:${digits}`;
}

function isPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    return /^(?:256|0)[237]\d{8}$/.test(digits);
}

function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function splitTrailingPunctuation(value: string) {
    const punctuation = value.match(URL_END_PUNCTUATION)?.[0] || "";
    return {
        value: punctuation ? value.slice(0, -punctuation.length) : value,
        punctuation,
    };
}

export default function MessageText({
    text,
    mine = false,
}: {
    text: string;
    mine?: boolean;
}) {
    const parts: ReactNode[] = [];
    let cursor = 0;

    for (const match of text.matchAll(MESSAGE_TOKEN_PATTERN)) {
        const index = match.index ?? 0;
        const rawValue = match[0];

        if (index > cursor) parts.push(text.slice(cursor, index));

        if (isPhone(rawValue)) {
            parts.push(
                <a
                    key={`${index}-${rawValue}`}
                    href={phoneHref(rawValue)}
                    className={`font-black underline decoration-2 underline-offset-2 ${mine ? "text-white" : "text-orange-600"}`}
                >
                    {rawValue}
                </a>
            );
            cursor = index + rawValue.length;
            continue;
        }

        if (isEmail(rawValue)) {
            parts.push(
                <a
                    key={`${index}-${rawValue}`}
                    href={`mailto:${rawValue}`}
                    className={`font-black underline decoration-2 underline-offset-2 ${mine ? "text-white" : "text-orange-600"}`}
                >
                    {rawValue}
                </a>
            );
            cursor = index + rawValue.length;
            continue;
        }

        const { value, punctuation } = splitTrailingPunctuation(rawValue);
        const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        parts.push(
            <a
                key={`${index}-${value}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
                className={`break-all font-black underline decoration-2 underline-offset-2 ${mine ? "text-white" : "text-orange-600"}`}
            >
                {value}
            </a>
        );
        if (punctuation) parts.push(punctuation);
        cursor = index + rawValue.length;
    }

    if (cursor < text.length) parts.push(text.slice(cursor));

    return (
        <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6">
            {parts.length > 0 ? parts : text}
        </p>
    );
}
