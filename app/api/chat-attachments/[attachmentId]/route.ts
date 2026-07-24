import { NextRequest, NextResponse } from "next/server";
import {
    API_BASE_URL,
    getAccessToken,
    refreshAccessToken,
} from "@/lib/authCookies";

type RouteContext = {
    params: Promise<{ attachmentId: string }>;
};

async function requestAttachment(
    attachmentId: string,
    download: boolean,
    accessToken: string
) {
    const query = download ? "?download=1" : "";

    return fetch(
        `${API_BASE_URL}/chats/attachments/${attachmentId}/${query}`,
        {
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        }
    );
}

export async function GET(request: NextRequest, context: RouteContext) {
    const { attachmentId } = await context.params;

    if (!/^\d+$/.test(attachmentId)) {
        return NextResponse.json(
            { detail: "Invalid attachment." },
            { status: 400 }
        );
    }

    let accessToken = await getAccessToken();

    if (!accessToken) {
        return NextResponse.json(
            { detail: "Authentication required." },
            { status: 401 }
        );
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    let response = await requestAttachment(attachmentId, download, accessToken);

    if (response.status === 401) {
        accessToken = await refreshAccessToken();

        if (accessToken) {
            response = await requestAttachment(attachmentId, download, accessToken);
        }
    }

    if (!response.ok) {
        const detail = await response.json().catch(() => ({
            detail: "Attachment unavailable.",
        }));
        return NextResponse.json(detail, { status: response.status });
    }

    const headers = new Headers({
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
    });

    for (const header of ["content-type", "content-length", "content-disposition"]) {
        const value = response.headers.get(header);
        if (value) headers.set(header, value);
    }

    return new NextResponse(response.body, {
        status: response.status,
        headers,
    });
}
