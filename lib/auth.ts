export function getStoredToken() {
    if (typeof window === "undefined") return "";

    return (
        localStorage.getItem("qot_access_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token") ||
        ""
    );
}

export function decodeJwtPayload(token: string) {
    try {
        const parts = token.split(".");

        if (parts.length < 2) return null;

        const payload = parts[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(normalized);

        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function getStoredUser() {
    if (typeof window === "undefined") return null;

    try {
        const rawUser = localStorage.getItem("qot_user");

        if (rawUser) {
            return JSON.parse(rawUser);
        }

        const token = getStoredToken();

        if (!token) return null;

        return decodeJwtPayload(token);
    } catch {
        return null;
    }
}

export function getUserRole(user: any) {
    return String(
        user?.role ||
        user?.user_role ||
        user?.user_type ||
        user?.account_type ||
        user?.type ||
        ""
    ).toLowerCase();
}

export function isAdminOrModerator(user: any) {
    const role = getUserRole(user);

    return (
        role === "admin" ||
        role === "moderator" ||
        user?.is_staff === true ||
        user?.is_superuser === true ||
        user?.is_admin === true ||
        user?.is_moderator === true ||
        user?.staff === true ||
        user?.superuser === true
    );
}

export function getUserDisplayName(user: any) {
    return (
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.phone ||
        user?.email ||
        user?.identifier ||
        "Account"
    );
}

export function clearAuthStorage() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("qot_access_token");
    localStorage.removeItem("qot_refresh_token");
    localStorage.removeItem("qot_user");

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
}