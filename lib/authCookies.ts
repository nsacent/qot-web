import { cookies } from "next/headers";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const ACCESS_COOKIE = "qot_access_token";
export const REFRESH_COOKIE = "qot_refresh_token";
export const KEEP_SIGNED_IN_COOKIE = "qot_keep_signed_in";

const ACCESS_COOKIE_MAX_AGE = 60 * 30;
const KEEP_SIGNED_IN_MAX_AGE = 60 * 60 * 24 * 365;

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    priority: "high" as const,
};

function persistentCookie(maxAge: number) {
    return {
        maxAge,
        expires: new Date(Date.now() + maxAge * 1000),
    };
}

export async function getAccessToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_COOKIE)?.value || "";
}

export async function getRefreshToken() {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE)?.value || "";
}

export async function getKeepSignedIn() {
    const cookieStore = await cookies();
    return cookieStore.get(KEEP_SIGNED_IN_COOKIE)?.value === "1";
}

function refreshTokenRequestsPersistence(refresh: string) {
    try {
        const payload = refresh.split(".")[1];
        if (!payload) return false;

        const decoded = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        return decoded?.keep_signed_in === true;
    } catch {
        return false;
    }
}

export async function setAuthCookies(
    access?: string,
    refresh?: string,
    keepSignedIn = false
) {
    const cookieStore = await cookies();
    const accessPersistence = keepSignedIn
        ? persistentCookie(ACCESS_COOKIE_MAX_AGE)
        : {};
    const refreshPersistence = keepSignedIn
        ? persistentCookie(KEEP_SIGNED_IN_MAX_AGE)
        : {};

    if (access) {
        cookieStore.set(ACCESS_COOKIE, access, {
            ...cookieOptions,
            ...accessPersistence,
        });
    }

    if (refresh) {
        cookieStore.set(REFRESH_COOKIE, refresh, {
            ...cookieOptions,
            ...refreshPersistence,
        });
    }

    if (keepSignedIn) {
        cookieStore.set(KEEP_SIGNED_IN_COOKIE, "1", {
            ...cookieOptions,
            ...persistentCookie(KEEP_SIGNED_IN_MAX_AGE),
        });
    } else {
        cookieStore.set(KEEP_SIGNED_IN_COOKIE, "", {
            ...cookieOptions,
            maxAge: 0,
        });
    }
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.set(ACCESS_COOKIE, "", {
        ...cookieOptions,
        maxAge: 0,
    });

    cookieStore.set(REFRESH_COOKIE, "", {
        ...cookieOptions,
        maxAge: 0,
    });

    cookieStore.set(KEEP_SIGNED_IN_COOKIE, "", {
        ...cookieOptions,
        maxAge: 0,
    });
}

export function extractAccessToken(data: any) {
    return (
        data?.access ||
        data?.access_token ||
        data?.token?.access ||
        data?.tokens?.access ||
        ""
    );
}

export function extractRefreshToken(data: any) {
    return (
        data?.refresh ||
        data?.refresh_token ||
        data?.token?.refresh ||
        data?.tokens?.refresh ||
        ""
    );
}

export function stripTokens(data: any) {
    if (!data || typeof data !== "object") return data;

    const cleaned = { ...data };

    delete cleaned.access;
    delete cleaned.refresh;
    delete cleaned.access_token;
    delete cleaned.refresh_token;
    delete cleaned.token;
    delete cleaned.tokens;

    return cleaned;
}

export async function backendJson(
    path: string,
    init: RequestInit = {},
    accessToken = ""
) {
    const headers = new Headers(init.headers);

    headers.set("Accept", "application/json");

    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        cache: "no-store",
    });

    const text = await response.text();

    let data: any = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { detail: text };
    }

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}

type BackendJsonResult = Awaited<ReturnType<typeof backendJson>>;

const refreshRequests = new Map<string, Promise<BackendJsonResult>>();

function refreshOnce(refresh: string) {
    const pendingRefresh = refreshRequests.get(refresh);

    if (pendingRefresh) return pendingRefresh;

    const request = backendJson("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
    });

    refreshRequests.set(refresh, request);

    const clearPendingRequest = () => {
        if (refreshRequests.get(refresh) === request) {
            refreshRequests.delete(refresh);
        }
    };

    void request.then(clearPendingRequest, clearPendingRequest);

    return request;
}

export async function refreshAccessToken() {
    const refresh = await getRefreshToken();

    if (!refresh) return "";

    // The signed JWT claim is a recovery path if an older deployment lost the
    // small preference cookie while the persistent refresh cookie survived.
    const keepSignedIn =
        (await getKeepSignedIn()) || refreshTokenRequestsPersistence(refresh);
    const result = await refreshOnce(refresh);

    if (!result.ok) {
        // Do not clear cookies here. Several protected requests can reach this
        // point together when a tab reopens. One request may have already rotated
        // the refresh token successfully, and a late failure must not erase it.
        return "";
    }

    const access = extractAccessToken(result.data);
    const newRefresh = extractRefreshToken(result.data) || refresh;

    if (!access) {
        return "";
    }

    await setAuthCookies(access, newRefresh, keepSignedIn);

    return access;
}

export async function backendJsonWithSession(
    path: string,
    init: RequestInit = {}
) {
    let access = await getAccessToken();

    // A remembered browser session can legitimately reopen after the short-lived
    // access cookie has expired. Refresh before the first protected request so the
    // user is not briefly treated as signed out.
    if (!access) {
        access = await refreshAccessToken();
    }

    let result = await backendJson(path, init, access);

    if (result.status === 401) {
        access = await refreshAccessToken();

        if (access) {
            result = await backendJson(path, init, access);
        }
    }

    return result;
}
