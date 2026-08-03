import {
    faBullhorn,
    faCircleCheck,
    faClock,
    faEnvelope,
    faHeart,
    faShieldHalved,
    faStar,
    faTag,
    faUser,
    faTrash,
} from "@/lib/faIcons";

type NotificationLike = {
    notification_type?: string;
    type?: string;
};

export function getNotificationVisual(notification: NotificationLike | null | undefined) {
    const type = notification?.notification_type || notification?.type || "system";

    switch (type) {
        case "message":
            return {
                icon: faEnvelope,
                tone: "bg-blue-50 text-blue-600 ring-blue-100",
                label: "Message",
            };
        case "offer":
            return {
                icon: faTag,
                tone: "bg-orange-50 text-orange-600 ring-orange-100",
                label: "Offer",
            };
        case "listing_approved":
            return {
                icon: faCircleCheck,
                tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
                label: "Approved",
            };
        case "listing_rejected":
            return {
                icon: faShieldHalved,
                tone: "bg-rose-50 text-rose-600 ring-rose-100",
                label: "Needs attention",
            };
        case "listing_deleted":
            return {
                icon: faTrash,
                tone: "bg-red-50 text-red-700 ring-red-100",
                label: "Ad removed",
            };
        case "listing_expired":
            return {
                icon: faClock,
                tone: "bg-amber-50 text-amber-700 ring-amber-100",
                label: "Expired",
            };
        case "favorite":
            return {
                icon: faHeart,
                tone: "bg-pink-50 text-pink-600 ring-pink-100",
                label: "Saved ad",
            };
        case "follow":
            return {
                icon: faUser,
                tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
                label: "Follower",
            };
        case "review":
            return {
                icon: faStar,
                tone: "bg-amber-50 text-amber-600 ring-amber-100",
                label: "Review",
            };
        case "report":
            return {
                icon: faShieldHalved,
                tone: "bg-blue-50 text-blue-600 ring-blue-100",
                label: "Safety update",
            };
        case "announcement":
            return {
                icon: faBullhorn,
                tone: "bg-orange-50 text-orange-600 ring-orange-100",
                label: "QOT announcement",
            };
        default:
            return {
                icon: faBullhorn,
                tone: "bg-violet-50 text-violet-600 ring-violet-100",
                label: "QOT update",
            };
    }
}
