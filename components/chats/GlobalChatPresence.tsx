"use client";

import { useEffect } from "react";
import { createChatSocket } from "@/lib/chatSocket";

export default function GlobalChatPresence() {
    useEffect(() => {
        let disposed = false;
        let socket: ReturnType<typeof createChatSocket> | null = null;

        async function connectForSignedInUser() {
            const response = await fetch("/api/auth/me", {
                credentials: "include",
                cache: "no-store",
            }).catch(() => null);

            if (disposed || !response?.ok) return;

            socket = createChatSocket({
                path: "/ws/chats/presence/",
                onConnectionChange: (connected) => {
                    window.dispatchEvent(new CustomEvent("qot_chat_connection", {
                        detail: { connected },
                    }));
                },
                onMessage: (event) => {
                    window.dispatchEvent(new CustomEvent("qot_chat_event", {
                        detail: event,
                    }));
                },
            });
        }

        void connectForSignedInUser();

        return () => {
            disposed = true;
            socket?.close();
        };
    }, []);

    return null;
}
