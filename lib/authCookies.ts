import { cookies } from "next/headers";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const ACCESS_COOKIE = "qot_access_token";
export const REFRESH_COOKIE = "qot_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
};

export async function getAccessToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_COOKIE)?.value || "";
}

export async function getRefreshToken() {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE)?.value || "";
}

export async function setAuthCookies(access?: string, refresh?: string) {
    const cookieStore = await cookies();

    if (access) {
        cookieStore.set(ACCESS_COOKIE, access, {
            ...cookieOptions,
            maxAge: 60 * 15,
        });
    }

    if (refresh) {
        cookieStore.set(REFRESH_COOKIE, refresh, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 30,
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

export async function refreshAccessToken() {
    const refresh = await getRefreshToken();

    if (!refresh) return "";

    const result = await backendJson("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
    });

    if (!result.ok) {
        await clearAuthCookies();
        return "";
    }

    const access = extractAccessToken(result.data);
    const newRefresh = extractRefreshToken(result.data) || refresh;

    if (!access) {
        await clearAuthCookies();
        return "";
    }

    await setAuthCookies(access, newRefresh);

    return access;
}

export async function backendJsonWithSession(
    path: string,
    init: RequestInit = {}
) {
    let access = await getAccessToken();

    let result = await backendJson(path, init, access);

    if (result.status === 401) {
        access = await refreshAccessToken();

        if (access) {
            result = await backendJson(path, init, access);
        }
    }

    return result;
}