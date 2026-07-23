import { NextRequest, NextResponse } from "next/server";
import {
    API_BASE_URL,
    getAccessToken,
    refreshAccessToken,
} from "@/lib/authCookies";

type RouteContext = {
    params: Promise<{ filename: string }> | { filename: string };
};

const BACKUP_NAME_PATTERN =
    /^qot-db-\d{8}-\d{6}-[a-f0-9]{8}\.(?:dump|sqlite3)$/;

async function requestBackup(filename: string, accessToken: string) {
    return fetch(
        `${API_BASE_URL}/admin-panel/backups/${encodeURIComponent(filename)}/download/`,
        {
            headers: {
                Accept: "application/octet-stream",
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        }
    );
}

export async function GET(_request: NextRequest, context: RouteContext) {
    const { filename } = await Promise.resolve(context.params);

    if (!BACKUP_NAME_PATTERN.test(filename || "")) {
        return NextResponse.json({ detail: "Backup not found." }, { status: 404 });
    }

    let accessToken = await getAccessToken();

    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }

    let response = await requestBackup(filename, accessToken);

    if (response.status === 401) {
        accessToken = await refreshAccessToken();

        if (accessToken) response = await requestBackup(filename, accessToken);
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => "Backup download failed.");
        return NextResponse.json(
            { detail: detail || "Backup download failed." },
            { status: response.status }
        );
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set(
        "Content-Disposition",
        response.headers.get("content-disposition") ||
            `attachment; filename="${filename}"`
    );
    headers.set("Cache-Control", "private, no-store");

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(response.body, {
        status: 200,
        headers,
    });
}
