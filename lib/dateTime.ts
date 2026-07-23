export const DEFAULT_TIME_ZONE = "Africa/Kampala";

export const TIME_ZONE_OPTIONS = [
    { value: "Africa/Kampala", label: "Uganda — Kampala (EAT)" },
    { value: "Africa/Nairobi", label: "Kenya — Nairobi (EAT)" },
    { value: "Africa/Kigali", label: "Rwanda — Kigali (CAT)" },
    { value: "Africa/Dar_es_Salaam", label: "Tanzania — Dar es Salaam (EAT)" },
    { value: "Africa/Juba", label: "South Sudan — Juba (CAT)" },
    { value: "Africa/Johannesburg", label: "South Africa — Johannesburg (SAST)" },
    { value: "Africa/Lagos", label: "Nigeria — Lagos (WAT)" },
    { value: "Europe/London", label: "United Kingdom — London" },
    { value: "Asia/Dubai", label: "United Arab Emirates — Dubai" },
    { value: "America/New_York", label: "United States — New York" },
    { value: "America/Los_Angeles", label: "United States — Los Angeles" },
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
] as const;

function parseDate(value: unknown) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRelativeTime(value: unknown, now = Date.now()) {
    const date = parseDate(value);
    if (!date) return "Recently";

    const differenceSeconds = Math.round((now - date.getTime()) / 1000);
    const future = differenceSeconds < -30;
    const seconds = Math.abs(differenceSeconds);

    if (seconds < 45) return future ? "Soon" : "Just now";

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return future ? `In ${minutes}m` : `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return future ? `In ${hours}h` : `${hours}h ago`;

    const days = Math.round(hours / 24);
    if (days < 30) {
        if (!future && days === 1) return "Yesterday";
        return future ? `In ${days}d` : `${days}d ago`;
    }

    const months = Math.round(days / 30.44);
    if (months < 12) return future ? `In ${months}mo` : `${months}mo ago`;

    const years = Math.round(days / 365.25);
    return future ? `In ${years}y` : `${years}y ago`;
}

export function formatDateTime(
    value: unknown,
    timeZone = DEFAULT_TIME_ZONE,
    options: Intl.DateTimeFormatOptions = {}
) {
    const date = parseDate(value);
    if (!date) return "Recently";

    try {
        return new Intl.DateTimeFormat("en-UG", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone,
            ...options,
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat("en-UG", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: DEFAULT_TIME_ZONE,
        }).format(date);
    }
}
