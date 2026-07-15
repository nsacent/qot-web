export default function QotLoader({
    text,
    showText = false,
}: {
    text?: string;
    showText?: boolean;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fff7f2] px-4">
            <div className="flex flex-col items-center">
                <div className="relative flex h-32 w-32 items-center justify-center">
                    <div className="absolute h-32 w-32 animate-ping rounded-full bg-orange-200 opacity-40" />

                    <div className="absolute h-28 w-28 rounded-full border-4 border-orange-100" />

                    <div className="absolute h-28 w-28 animate-spin rounded-full border-4 border-transparent border-r-orange-500 border-t-orange-500" />

                    <div className="absolute h-20 w-20 animate-pulse rounded-[28px] bg-orange-100" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-3xl font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.35)]">
                        Q
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500" />
                </div>

                {showText && text && (
                    <p className="mt-4 text-sm font-black text-slate-500">{text}</p>
                )}
            </div>
        </div>
    );
}