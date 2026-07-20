import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRotateRight,
    faCircleExclamation,
    faInbox,
} from "@fortawesome/free-solid-svg-icons";

export function AdminPageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}

export function AdminRefreshButton({
    onClick,
    loading = false,
}: {
    onClick: () => void;
    loading?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-orange-600 disabled:opacity-60"
        >
            <FontAwesomeIcon
                icon={faArrowRotateRight}
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
        </button>
    );
}

export function AdminLoadingState({ label }: { label: string }) {
    return (
        <div className="rounded-[26px] bg-white p-7 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center gap-4">
                <span className="h-11 w-11 animate-pulse rounded-2xl bg-orange-100" />
                <div className="flex-1">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
                    <div className="mt-3 h-2.5 w-52 max-w-full animate-pulse rounded-full bg-slate-100" />
                </div>
            </div>
            <p className="sr-only">{label}</p>
        </div>
    );
}

export function AdminErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="rounded-[26px] border border-red-200 bg-red-50 p-7 text-red-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <FontAwesomeIcon
                        icon={faCircleExclamation}
                        className="mt-0.5 h-5 w-5 shrink-0"
                    />
                    <div>
                        <p className="text-sm font-black">Unable to load this workspace</p>
                        <p className="mt-1 text-sm font-medium text-red-700">{message}</p>
                    </div>
                </div>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}

export function AdminEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FontAwesomeIcon icon={faInbox} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
                {description}
            </p>
        </div>
    );
}

export function AdminStatCard({
    label,
    value,
    detail,
    icon,
    tone = "orange",
    href,
}: {
    label: string;
    value: React.ReactNode;
    detail?: string;
    icon: any;
    tone?: "orange" | "blue" | "green" | "red" | "violet" | "slate";
    href?: string;
}) {
    const tones = {
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
        violet: "bg-violet-50 text-violet-600",
        slate: "bg-slate-100 text-slate-600",
    };

    const content = (
        <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {label}
                    </p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
                        {value}
                    </p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
                    <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </span>
            </div>
            {detail && (
                <p className="mt-3 text-xs font-semibold text-slate-500">{detail}</p>
            )}
        </>
    );

    const className =
        "block rounded-[24px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]";

    return href ? (
        <a href={href} className={className}>
            {content}
        </a>
    ) : (
        <div className={className}>{content}</div>
    );
}
