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

export function getStoredUser() {
    if (typeof window === "undefined") return null;

    try {
        const rawUser = localStorage.getItem("qot_user");

        if (!rawUser) return null;

        return JSON.parse(rawUser);
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
        user?.is_moderator === true
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