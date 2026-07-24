function firstErrorMessage(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const message = firstErrorMessage(item);

            if (message) return message;
        }

        return "";
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const preferredKeys = ["detail", "message", "error", "non_field_errors"];

        for (const key of preferredKeys) {
            const message = firstErrorMessage(record[key]);

            if (message) return message;
        }

        for (const item of Object.values(record)) {
            const message = firstErrorMessage(item);

            if (message) return message;
        }
    }

    return "";
}

function friendlyErrorMessage(response: Response, data: unknown) {
    const serverMessage = firstErrorMessage(data);

    if (/invalid login credentials|no active account/i.test(serverMessage)) {
        return "The phone/email or password is incorrect.";
    }

    if (serverMessage) return serverMessage;

    if (response.status === 429) {
        return "Too many attempts. Please wait a moment and try again.";
    }

    if (response.status >= 500) {
        return "The server is having trouble right now. Please try again shortly.";
    }

    return "We could not complete this request. Please check your details and try again.";
}

async function readResponse(response: Response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(friendlyErrorMessage(response, data));
    }

    return data;
}

export async function sessionPost(path: string, body?: any) {
    let response: Response;

    try {
        response = await fetch(`/api/auth${path}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error(
            "We could not connect to QOT. Check your internet connection and try again."
        );
    }

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
    keep_signed_in?: boolean;
}) {
    return sessionPost("/login", body);
}

export async function loginWithGoogle(body: {
    credential: string;
    keep_signed_in?: boolean;
}) {
    return sessionPost("/google", body);
}

export async function loginWithFacebook(body: {
    access_token: string;
    keep_signed_in?: boolean;
}) {
    return sessionPost("/facebook", body);
}

export async function registerUser(body: {
    phone: string;
    email: string;
    full_name: string;
    password: string;
    password_confirm: string;
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
    uid: string;
    token: string;
    new_password: string;
    new_password_confirm: string;
}) {
    return sessionPost("/password-reset/confirm", body);
}

export async function sendVerification(channel: "phone" | "email" = "phone") {
    return sessionPost("/verification/send", { channel });
}

export async function confirmVerification(body: {
    otp?: string;
    code?: string;
    channel?: "phone" | "email";
}) {
    return sessionPost("/verification/confirm", body);
}
