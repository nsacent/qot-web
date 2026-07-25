type LoaderProps = {
    text?: string;
    showText?: boolean;
    className?: string;
};

export function QotSpinner({ className = "h-7 w-7" }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`inline-block animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500 motion-reduce:animate-none ${className}`}
        />
    );
}

export function QotInlineLoader({
    text = "Loading…",
    className = "",
}: LoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex items-center justify-center gap-3 text-sm font-bold text-slate-500 ${className}`}
        >
            <QotSpinner />
            {text && <span>{text}</span>}
        </div>
    );
}

export default function QotLoader({
    text = "Loading…",
    showText = false,
    className = "",
}: LoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={`fixed inset-0 z-[200] flex h-[100dvh] min-h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#fffaf7] px-4 ${className}`}
        >
            <div className="flex flex-col items-center gap-3">
                <QotSpinner className="h-8 w-8" />
                {showText && text && (
                    <p className="text-sm font-bold text-slate-500">{text}</p>
                )}
            </div>
        </div>
    );
}
