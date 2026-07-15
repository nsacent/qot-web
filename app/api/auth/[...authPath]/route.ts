import { NextRequest, NextResponse } from "next/server";
import {
    backendJson,
    backendJsonWithSession,
    clearAuthCookies,
    extractAccessToken,
    extractRefreshToken,
    getRefreshToken,
    setAuthCookies,
    stripTokens,
} from "@/lib/authCookies";

type RouteContext = {
    params:
    | Promise<{
        authPath?: string[];
    }>
    | {
        authPath?: string[];
    };
};

async function getAuthKey(context: RouteContext) {
    const params = await Promise.resolve(context.params);
    return (params.authPath || []).join("/");
}

async function getBodyText(request: NextRequest) {
    return await request.text().catch(() => "");
}

function json(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

async function handleAuthRequest(
    request: NextRequest,
    context: RouteContext,
    method: string
) {
    const authKey = await getAuthKey(context);
    const backendPath = `/auth/${authKey}/`;
    const bodyText = method === "GET" ? "" : await getBodyText(request);


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

        const loginAttempts = identifier.includes("@")
            ? [
                { email: identifier, password },
                { identifier, password },
                { phone: identifier, password },
            ]
            : [
                { phone: identifier, password },
                { identifier, password },
                { email: identifier, password },
            ];

        let result: any = null;

        for (const loginBody of loginAttempts) {
            result = await backendJson("/auth/login/", {
                method: "POST",
                body: JSON.stringify(loginBody),
            });

            if (result.ok) {
                break;
            }
        }

        if (!result?.ok) {
            return json(result?.data || { detail: "Login failed." }, result?.status || 400);
        }

        const access = extractAccessToken(result.data);
        const refresh = extractRefreshToken(result.data);

        if (access || refresh) {
            await setAuthCookies(access, refresh);
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
        const refresh = await getRefreshToken();

        const result = await backendJson("/auth/token/refresh/", {
            method: "POST",
            body: bodyText || JSON.stringify({ refresh }),
        });

        if (!result.ok) {
            await clearAuthCookies();
            return json(result.data, result.status);
        }

        const access = extractAccessToken(result.data);
        const newRefresh = extractRefreshToken(result.data) || refresh;

        await setAuthCookies(access, newRefresh);

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

        const email = String(payload.email || "").trim().toLowerCase();

        const code = String(
            payload.code || payload.otp || payload.token || ""
        ).trim();

        const password = payload.password || payload.new_password;

        const attempts = [
            { email, code, password },
            { email, otp: code, password },
            { email, token: code, password },
            { email, code, new_password: password },
            { email, otp: code, new_password: password },
            { email, token: code, new_password: password },
        ];

        let result: any = null;

        for (const resetBody of attempts) {
            result = await backendJson("/auth/password-reset/confirm/", {
                method: "POST",
                body: JSON.stringify(resetBody),
            });

            if (result.ok) {
                break;
            }
        }

        return json(
            result?.data || { detail: "Password reset failed." },
            result?.status || 400
        );
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