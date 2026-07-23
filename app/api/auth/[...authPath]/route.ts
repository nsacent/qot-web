import { NextRequest, NextResponse } from "next/server";
import {
    backendJson,
    backendJsonWithSession,
    clearAuthCookies,
    extractAccessToken,
    extractRefreshToken,
    getRefreshToken,
    refreshAccessToken,
    setAuthCookies,
    stripTokens,
} from "@/lib/authCookies";

type RouteContext = {
    params: Promise<{
        authPath?: string[];
    }>;
};

async function getAuthKey(context: RouteContext) {
    const params = await context.params;
    return (params.authPath || []).join("/");
}

async function getBodyText(request: NextRequest) {
    return await request.text().catch(() => "");
}

function json(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

function normalizeOrigin(value: string | null | undefined) {
    if (!value) return "";

    try {
        return new URL(value).origin;
    } catch {
        return "";
    }
}

function hasTrustedOrigin(request: NextRequest) {
    const requestOrigin = normalizeOrigin(request.headers.get("origin"));

    if (!requestOrigin) return false;

    const forwardedHost = request.headers
        .get("x-forwarded-host")
        ?.split(",")[0]
        ?.trim();
    const forwardedProtocol = request.headers
        .get("x-forwarded-proto")
        ?.split(",")[0]
        ?.trim();
    const requestHost = forwardedHost || request.headers.get("host") || "";
    const requestProtocol =
        forwardedProtocol || request.nextUrl.protocol.replace(":", "");
    const proxyOrigin =
        requestHost && requestProtocol
            ? normalizeOrigin(`${requestProtocol}://${requestHost}`)
            : "";

    const trustedOrigins = new Set(
        [
            normalizeOrigin(process.env.APP_ORIGIN),
            normalizeOrigin(request.nextUrl.origin),
            proxyOrigin,
        ].filter(Boolean)
    );

    return trustedOrigins.has(requestOrigin);
}

async function handleAuthRequest(
    request: NextRequest,
    context: RouteContext,
    method: string
) {
    const authKey = await getAuthKey(context);
    const backendPath = `/auth/${authKey}/`;
    const bodyText = method === "GET" ? "" : await getBodyText(request);

    if (authKey === "google") {
        if (!hasTrustedOrigin(request)) {
            return json({ detail: "Invalid Google sign-in origin." }, 403);
        }

        let payload: Record<string, unknown> = {};

        try {
            const parsed = bodyText ? JSON.parse(bodyText) : {};

            payload =
                parsed && typeof parsed === "object" && !Array.isArray(parsed)
                    ? (parsed as Record<string, unknown>)
                    : {};
        } catch {
            payload = {};
        }

        const keepSignedIn =
            payload.keep_signed_in === true || payload.keepSignedIn === true;
        const result = await backendJson("/auth/google/", {
            method: "POST",
            body: JSON.stringify({
                credential:
                    typeof payload.credential === "string"
                        ? payload.credential
                        : "",
                keep_signed_in: keepSignedIn,
            }),
        });

        if (!result.ok) {
            return json(result.data, result.status);
        }

        const access = extractAccessToken(result.data);
        const refresh = extractRefreshToken(result.data);

        if (access || refresh) {
            await setAuthCookies(access, refresh, keepSignedIn);
        }

        return json(stripTokens(result.data), result.status);
    }

    if (authKey === "verification/confirm") {
        let payload: any = {};

        try {
            payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
            payload = {};
        }

        const code = String(payload.code || payload.otp || "").trim();
        const channel = payload.channel === "email" ? "email" : "phone";
        const result = await backendJsonWithSession(
            "/auth/verification/confirm/",
            {
                method: "POST",
                body: JSON.stringify({
                    code,
                    channel,
                }),
            }
        );

        return json(
            result?.data || { detail: "Verification failed." },
            result?.status || 400
        );
    }


    if (authKey === "login") {
        let payload: any = {};

        try {
            payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
            payload = {};
        }

        const identifier = String(
            payload.identifier || payload.phone || payload.email || ""
        ).trim();

        const password = payload.password;
        const keepSignedIn =
            payload.keep_signed_in === true || payload.keepSignedIn === true;

        const result = await backendJson("/auth/login/", {
            method: "POST",
            body: JSON.stringify({
                identifier,
                password,
                keep_signed_in: keepSignedIn,
            }),
        });

        if (!result?.ok) {
            return json(result?.data || { detail: "Login failed." }, result?.status || 400);
        }

        const access = extractAccessToken(result.data);
        const refresh = extractRefreshToken(result.data);

        if (access || refresh) {
            await setAuthCookies(access, refresh, keepSignedIn);
        }

        return json(stripTokens(result.data), result.status);
    }

    if (authKey === "register") {
        const result = await backendJson("/auth/register/", {
            method: "POST",
            body: bodyText,
        });

        if (result.ok) {
            const access = extractAccessToken(result.data);
            const refresh = extractRefreshToken(result.data);

            if (access || refresh) {
                await setAuthCookies(access, refresh);
            }
        }

        return json(stripTokens(result.data), result.status);
    }

    if (authKey === "logout") {
        const refresh = await getRefreshToken();

        await backendJsonWithSession("/auth/logout/", {
            method: "POST",
            body: bodyText || JSON.stringify({ refresh }),
        });

        await clearAuthCookies();

        return json({
            detail: "Logged out successfully.",
        });
    }

    if (authKey === "token/refresh") {
        const access = await refreshAccessToken();

        if (!access) {
            return json({ detail: "Invalid or expired refresh token." }, 401);
        }

        return json({ detail: "Session refreshed." });
    }

    if (authKey === "password-reset/request") {
        let payload: any = {};

        try {
            payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
            payload = {};
        }

        const email = String(payload.email || "").trim().toLowerCase();

        const result = await backendJson("/auth/password-reset/request/", {
            method: "POST",
            body: JSON.stringify({ email }),
        });

        return json(result.data, result.status);
    }

    if (authKey === "password-reset/confirm") {
        let payload: any = {};

        try {
            payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
            payload = {};
        }

        const result = await backendJson("/auth/password-reset/confirm/", {
            method: "POST",
            body: JSON.stringify({
                uid: payload.uid,
                token: payload.token,
                new_password: payload.new_password || payload.password,
                new_password_confirm:
                    payload.new_password_confirm ||
                    payload.password_confirm ||
                    payload.confirmPassword,
            }),
        });

        return json(result.data, result.status);
    }


    const publicPaths = new Set([
        "password-reset/request",
        "password-reset/confirm",
    ]);

    if (publicPaths.has(authKey)) {
        const result = await backendJson(backendPath, {
            method,
            body: bodyText || undefined,
        });

        return json(result.data, result.status);
    }

    const result = await backendJsonWithSession(backendPath, {
        method,
        body: bodyText || undefined,
    });

    return json(result.data, result.status);
}

export async function GET(request: NextRequest, context: RouteContext) {
    return handleAuthRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
    return handleAuthRequest(request, context, "POST");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return handleAuthRequest(request, context, "PATCH");
}
