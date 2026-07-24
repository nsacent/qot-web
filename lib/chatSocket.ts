"use client";

export type ChatSocketController = {
    send: (payload: Record<string, unknown>) => boolean;
    close: () => void;
};

type ChatSocketOptions = {
    path: string;
    onMessage: (event: Record<string, any>) => void;
    onConnectionChange?: (connected: boolean) => void;
    onUnauthorized?: () => void;
};

const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function buildSocketUrl(path: string, ticket: string) {
    const fallbackBase = window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000/api/v1"
        : "https://api.qot.ug/api/v1";
    const url = new URL(CONFIGURED_API_BASE_URL || fallbackBase, window.location.origin);

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = path.startsWith("/") ? path : `/${path}`;
    url.search = "";
    url.searchParams.set("ticket", ticket);

    return url.toString();
}

async function requestSocketTicket() {
    const response = await fetch("/api/proxy/chats/socket-ticket/", {
        credentials: "include",
        cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
        const error = new Error("Your chat session has expired.");
        error.name = "ChatUnauthorizedError";
        throw error;
    }

    if (!response.ok || !data?.ticket) {
        throw new Error(data?.detail || "Could not connect to live chat.");
    }

    return String(data.ticket);
}

export function createChatSocket({
    path,
    onMessage,
    onConnectionChange,
    onUnauthorized,
}: ChatSocketOptions): ChatSocketController {
    let socket: WebSocket | null = null;
    let stopped = false;
    let reconnectAttempt = 0;
    let reconnectTimer: number | null = null;
    let heartbeatTimer: number | null = null;

    function clearTimers() {
        if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
        if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
        reconnectTimer = null;
        heartbeatTimer = null;
    }

    function scheduleReconnect() {
        if (stopped || reconnectTimer !== null) return;

        const delay = Math.min(2500 * 2 ** reconnectAttempt, 15000);
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(() => {
            reconnectTimer = null;
            void connect();
        }, delay);
    }

    async function connect() {
        try {
            const ticket = await requestSocketTicket();
            if (stopped) return;

            socket = new WebSocket(buildSocketUrl(path, ticket));
            socket.onopen = () => {
                reconnectAttempt = 0;
                onConnectionChange?.(true);
                heartbeatTimer = window.setInterval(() => {
                    if (socket?.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "heartbeat" }));
                    }
                }, 25000);
            };
            socket.onmessage = (message) => {
                try {
                    onMessage(JSON.parse(message.data));
                } catch {
                    // Ignore malformed socket events and keep the connection alive.
                }
            };
            socket.onerror = () => socket?.close();
            socket.onclose = () => {
                if (heartbeatTimer !== null) {
                    window.clearInterval(heartbeatTimer);
                    heartbeatTimer = null;
                }
                socket = null;
                onConnectionChange?.(false);
                scheduleReconnect();
            };
        } catch (error) {
            if (stopped) return;

            if (error instanceof Error && error.name === "ChatUnauthorizedError") {
                stopped = true;
                onUnauthorized?.();
                return;
            }

            onConnectionChange?.(false);
            scheduleReconnect();
        }
    }

    void connect();

    return {
        send(payload) {
            if (!socket || socket.readyState !== WebSocket.OPEN) return false;
            socket.send(JSON.stringify(payload));
            return true;
        },
        close() {
            stopped = true;
            clearTimers();
            socket?.close();
            socket = null;
        },
    };
}
