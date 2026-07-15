async function readResponse(response: Response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.message || data?.error || "Request failed."
        );
    }

    return data;
}

export async function sessionPost(path: string, body?: any) {
    const response = await fetch(`/api/auth${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    return readResponse(response);
}

export async function sessionPatch(path: string, body?: any) {
    const response = await fetch(`/api/auth${path}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    return readResponse(response);
}

export async function sessionGet(path: string) {
    const response = await fetch(`/api/auth${path}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    return readResponse(response);
}

export async function loginUser(body: {
    identifier: string;
    password: string;
}) {
    return sessionPost("/login", body);
}

export async function registerUser(body: {
    phone: string;
    email: string;
    full_name: string;
    password: string;
}) {
    return sessionPost("/register", body);
}

export async function logoutUser() {
    return sessionPost("/logout");
}

export async function getCurrentUser() {
    return sessionGet("/me");
}

export async function updateCurrentUser(body: any) {
    return sessionPatch("/me", body);
}

export async function requestPasswordReset(body: {
    email: string;
}) {
    return sessionPost("/password-reset/request", body);
}

export async function confirmPasswordReset(body: {
    email: string;
    code: string;
    password: string;
}) {
    return sessionPost("/password-reset/confirm", body);
}

export async function sendVerification() {
    return sessionPost("/verification/send");
}

export async function confirmVerification(body: { otp?: string; code?: string }) {
    return sessionPost("/verification/confirm", body);
}