import type { SVGProps } from "react";

type QotLogoProps = SVGProps<SVGSVGElement> & {
    markOnly?: boolean;
    title?: string;
};

export default function QotLogo({
    markOnly = false,
    title = "QOT - Buy & Sell For Free",
    ...props
}: QotLogoProps) {
    if (markOnly) {
        return (
            <svg
                viewBox="0 0 100 100"
                role="img"
                aria-label={title}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                <circle cx="40" cy="42" r="29" stroke="currentColor" strokeWidth="18" />
                <path
                    d="M58.5 60.5L81.5 83.5"
                    stroke="currentColor"
                    strokeWidth="18"
                    strokeLinecap="square"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 240 100"
            role="img"
            aria-label={title}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx="40" cy="42" r="29" stroke="currentColor" strokeWidth="18" />
            <path
                d="M58.5 60.5L81.5 83.5"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="square"
            />
            <circle cx="124" cy="42" r="29" stroke="currentColor" strokeWidth="18" />
            <path
                d="M178 12L196 3V24H226V43H196V68C196 76 200 80 208 80H224V98H208C188 98 178 88 178 68V12Z"
                fill="currentColor"
            />
        </svg>
    );
}
