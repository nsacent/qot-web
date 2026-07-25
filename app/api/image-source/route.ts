import { NextRequest, NextResponse } from "next/server";
import { backendJsonWithSession } from "@/lib/authCookies";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function GET(request: NextRequest) {
    const session = await backendJsonWithSession("/auth/me/", { method: "GET" });
    if (!session.ok) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }

    const source = request.nextUrl.searchParams.get("src");
    if (!source) {
        return NextResponse.json({ detail: "Photo source is required." }, { status: 400 });
    }

    let sourceUrl: URL;
    try {
        sourceUrl = new URL(source, new URL(API_BASE_URL).origin);
    } catch {
        return NextResponse.json({ detail: "Invalid photo source." }, { status: 400 });
    }

    const apiOrigin = new URL(API_BASE_URL).origin;
    if (sourceUrl.origin !== apiOrigin || !sourceUrl.pathname.startsWith("/media/")) {
        return NextResponse.json({ detail: "Photo source is not allowed." }, { status: 403 });
    }

    const photoResponse = await fetch(sourceUrl, { cache: "no-store" });
    if (!photoResponse.ok || !photoResponse.body) {
        return NextResponse.json({ detail: "Photo could not be loaded." }, { status: photoResponse.status || 404 });
    }

    return new NextResponse(photoResponse.body, {
        status: 200,
        headers: {
            "Content-Type": photoResponse.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
