function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : null;
}

export function catalogArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];

    for (const key of ["results", "data", "categories", "cities", "regions"]) {
        if (Array.isArray(record[key])) return record[key] as unknown[];
    }

    return [];
}

function proxyPath(value: string) {
    if (!value) return "";

    if (value.startsWith("http")) {
        const url = new URL(value);
        return `${url.pathname}${url.search}`.replace(/^\/api\/v1/, "");
    }

    return value.replace(/^\/api\/v1/, "");
}

/** Fetch every API page, while also supporting unpaginated catalog responses. */
export async function fetchAllProxyPages(path: string): Promise<unknown[]> {
    const items: unknown[] = [];
    const visited = new Set<string>();
    let nextPath = proxyPath(path);

    while (nextPath && !visited.has(nextPath) && visited.size < 50) {
        visited.add(nextPath);
        const response = await fetch(`/api/proxy${nextPath}`, {
            credentials: "include",
            cache: "no-store",
        });
        const data: unknown = await response.json().catch(() => null);

        if (!response.ok) {
            const record = asRecord(data);
            throw new Error(
                String(record?.detail || record?.message || "Failed to load marketplace options.")
            );
        }

        items.push(...catalogArray(data));
        const record = asRecord(data);
        nextPath = typeof record?.next === "string" ? proxyPath(record.next) : "";
    }

    return items;
}
