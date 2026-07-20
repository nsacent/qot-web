type ApiClientOptions = RequestInit & {
    auth?: boolean;
    redirectOnUnauthorized?: boolean;
};

function getLoginRedirectUrl() {
    if (typeof window === "undefined") return "/login";

    const nextUrl = encodeURIComponent(
        window.location.pathname + window.location.search
    );

    return `/login?next=${nextUrl}`;
}

function isFormDataBody(body: any) {
    return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function apiFetch<T = any>(
    path: string,
    options: ApiClientOptions = {}
): Promise<T> {
    const {
        auth = true,
        redirectOnUnauthorized = true,
        headers,
        body,
        ...rest
    } = options;

    const requestHeaders: HeadersInit = {
        ...(isFormDataBody(body) ? {} : { "Content-Type": "application/json" }),
        ...(headers || {}),
    };

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const response = await fetch(`/api/proxy${cleanPath}`, {
        ...rest,
        body,
        headers: requestHeaders,
        credentials: "include",
        cache: rest.cache || "no-store",
    });

    const data = await response.json().catch(() => null);

    if (auth && response.status === 401) {
        if (redirectOnUnauthorized && typeof window !== "undefined") {
            window.location.href = getLoginRedirectUrl();
        }

        throw new Error(
            data?.detail ||
            data?.message ||
            "Your session has expired. Please login again."
        );
    }

    if (auth && response.status === 403) {
        throw new Error(
            data?.detail ||
            data?.message ||
            "You do not have permission to perform this action."
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            data?.error ||
            JSON.stringify(data) ||
            `API request failed: ${response.status}`
        );
    }

    return data as T;
}

export function apiGet<T = any>(path: string, options: ApiClientOptions = {}) {
    return apiFetch<T>(path, {
        ...options,
        method: "GET",
    });
}

export function apiPost<T = any>(
    path: string,
    data?: any,
    options: ApiClientOptions = {}
) {
    return apiFetch<T>(path, {
        ...options,
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data || {}),
    });
}

export function apiPatch<T = any>(
    path: string,
    data?: any,
    options: ApiClientOptions = {}
) {
    return apiFetch<T>(path, {
        ...options,
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data || {}),
    });
}

export function apiDelete<T = any>(
    path: string,
    data?: any,
    options: ApiClientOptions = {}
) {
    return apiFetch<T>(path, {
        ...options,
        method: "DELETE",
        body: data ? JSON.stringify(data) : undefined,
    });
}

export function buildQuery(params: Record<string, string | number | undefined>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            query.set(key, String(value));
        }
    });

    const queryString = query.toString();

    return queryString ? `?${queryString}` : "";
}
