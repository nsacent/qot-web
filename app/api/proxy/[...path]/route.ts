import { NextRequest, NextResponse } from "next/server";
import { backendJsonWithSession } from "@/lib/authCookies";

type RouteContext = {
    params: Promise<{ path?: string[] }>;
};

async function getProxyPath(context: RouteContext, request: NextRequest) {
    const params = await context.params;
    const path = params.path || [];

    const backendPath = `/${path.join("/")}/`;
    const search = request.nextUrl.search || "";

    return `${backendPath}${search}`;
}

async function getRequestBodyAndHeaders(request: NextRequest, method: string) {
    const headers = new Headers();

    const contentType = request.headers.get("content-type");
    const accept = request.headers.get("accept");

    if (contentType) headers.set("Content-Type", contentType);
    if (accept) headers.set("Accept", accept);

    if (method === "GET" || method === "HEAD") {
        return {
            body: undefined,
            headers,
        };
    }

    const bodyBuffer = await request.arrayBuffer();

    return {
        body: bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
        headers,
    };
}

function json(data: any, status = 200) {
    if (status === 204 || status === 205 || status === 304) {
        return new NextResponse(null, { status });
    }

    return NextResponse.json(data, { status });
}

async function handleProxy(
    request: NextRequest,
    context: RouteContext,
    method: string
) {
    const backendPath = await getProxyPath(context, request);
    const { body, headers } = await getRequestBodyAndHeaders(request, method);

    const result = await backendJsonWithSession(backendPath, {
        method,
        body,
        headers,
    });

    return json(result.data, result.status);
}

export async function GET(request: NextRequest, context: RouteContext) {
    return handleProxy(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
    return handleProxy(request, context, "POST");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return handleProxy(request, context, "PATCH");
}

export async function PUT(request: NextRequest, context: RouteContext) {
    return handleProxy(request, context, "PUT");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    return handleProxy(request, context, "DELETE");
}
