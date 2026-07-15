import { NextRequest, NextResponse } from "next/server";
import { backendJsonWithSession } from "@/lib/authCookies";

type RouteContext = {
    params:
    | Promise<{
        path?: string[];
    }>
    | {
        path?: string[];
    };
};

async function getProxyPath(context: RouteContext, request: NextRequest) {
    const params = await Promise.resolve(context.params);
    const path = params.path || [];

    const backendPath = `/${path.join("/")}/`;
    const search = request.nextUrl.search || "";

    return `${backendPath}${search}`;
}

async function getBodyText(request: NextRequest) {
    return await request.text().catch(() => "");
}

function json(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

async function handleProxy(
    request: NextRequest,
    context: RouteContext,
    method: string
) {
    const backendPath = await getProxyPath(context, request);
    const bodyText = method === "GET" ? "" : await getBodyText(request);

    const result = await backendJsonWithSession(backendPath, {
        method,
        body: bodyText || undefined,
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