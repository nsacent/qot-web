"use client";

import dynamic from "next/dynamic";

const NotificationBell = dynamic(() => import("./NotificationBell"), {
    ssr: false,
    loading: () => null,
});

export default function NotificationBellNoSSR() {
    return <NotificationBell />;
}