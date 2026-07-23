"use client";

import { useState } from "react";

type UserAvatarProps = {
    user?: UserAvatarUser | null;
    src?: string | null;
    name?: string | null;
    alt?: string;
    className?: string;
    imageClassName?: string;
};

type UserAvatarUser = {
    profile?: {
        avatar?: string | null;
        business_name?: string | null;
    } | null;
    avatar?: string | null;
    avatar_url?: string | null;
    profile_picture?: string | null;
    photo_url?: string | null;
    business_name?: string | null;
    full_name?: string | null;
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    email?: string | null;
};

export function getUserAvatarSource(user?: UserAvatarUser | null) {
    return (
        user?.profile?.avatar ||
        user?.avatar ||
        user?.avatar_url ||
        user?.profile_picture ||
        user?.photo_url ||
        ""
    );
}

export function getUserAvatarName(user?: UserAvatarUser | null) {
    return (
        user?.profile?.business_name ||
        user?.business_name ||
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.phone ||
        user?.email ||
        "QOT member"
    );
}

function initialsFor(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "Q"
    );
}

export default function UserAvatar({
    user,
    src,
    name,
    alt,
    className = "h-10 w-10 rounded-xl bg-orange-500 text-sm text-white",
    imageClassName = "h-full w-full object-cover",
}: UserAvatarProps) {
    const imageSource = src || getUserAvatarSource(user);
    const displayName = name || getUserAvatarName(user);
    const [failedSource, setFailedSource] = useState("");

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden font-black ${className}`}
            aria-label={alt || displayName}
        >
            {imageSource && failedSource !== imageSource ? (
                <img
                    src={imageSource}
                    alt={alt || `${displayName} profile photo`}
                    className={imageClassName}
                    onError={() => setFailedSource(imageSource)}
                />
            ) : (
                <span aria-hidden="true">{initialsFor(displayName)}</span>
            )}
        </span>
    );
}
