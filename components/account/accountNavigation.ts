import {
    faBell,
    faBookmark,
    faChartLine,
    faClock,
    faClockRotateLeft,
    faGaugeHigh,
    faHeart,
    faLock,
    faMessage,
    faPenToSquare,
    faRotateRight,
    faShieldHalved,
    faStar,
    faStore,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

export type AccountNavigationItem = {
    href: string;
    label: string;
    description: string;
    icon: any;
};

export type AccountNavigationSection = {
    label: string;
    items: AccountNavigationItem[];
};

export const accountQuickActions: AccountNavigationItem[] = [
    {
        href: "/account/my-ads",
        label: "My Ads",
        description: "Manage your ads",
        icon: faStore,
    },
    {
        href: "/account/messages",
        label: "Messages",
        description: "Buyer conversations",
        icon: faMessage,
    },
    {
        href: "/account/saved",
        label: "Saved",
        description: "Ads you saved",
        icon: faHeart,
    },
    {
        href: "/account/saved?tab=searches",
        label: "Saved Searches",
        description: "Filters you saved",
        icon: faBookmark,
    },
    {
        href: "/account/dashboard",
        label: "Dashboard",
        description: "Selling overview",
        icon: faGaugeHigh,
    },
];

export const accountNavigationSections: AccountNavigationSection[] = [
    {
        label: "Selling",
        items: [
            {
                href: "/account/dashboard",
                label: "Dashboard",
                description: "Selling overview",
                icon: faGaugeHigh,
            },
            {
                href: "/account/my-ads",
                label: "My Ads",
                description: "Manage all your ads",
                icon: faStore,
            },
            {
                href: "/account/analytics",
                label: "Analytics",
                description: "Views and performance",
                icon: faChartLine,
            },
            {
                href: "/account/renewals",
                label: "Renewals",
                description: "Renew expired ads",
                icon: faRotateRight,
            },
        ],
    },
    {
        label: "Activity",
        items: [
            {
                href: "/account/saved",
                label: "Saved",
                description: "Saved ads and searches",
                icon: faHeart,
            },
            {
                href: "/account/messages",
                label: "Messages",
                description: "Buyer and seller chats",
                icon: faMessage,
            },
            {
                href: "/account/notifications",
                label: "Notifications",
                description: "Account alerts",
                icon: faBell,
            },
            {
                href: "/account/activity",
                label: "Activity History",
                description: "Your account activity",
                icon: faClockRotateLeft,
            },
            {
                href: "/account/recently-viewed",
                label: "Recently Viewed",
                description: "Ads you opened",
                icon: faClock,
            },
            {
                href: "/account/my-reviews",
                label: "My Reviews",
                description: "Reviews you submitted",
                icon: faStar,
            },
        ],
    },
    {
        label: "Account",
        items: [
            {
                href: "/account/profile",
                label: "Profile Details",
                description: "Public profile and location",
                icon: faUser,
            },
            {
                href: "/account/verification",
                label: "Verification",
                description: "Verify phone and email",
                icon: faShieldHalved,
            },
            {
                href: "/account/settings",
                label: "Preferences",
                description: "Notification settings",
                icon: faPenToSquare,
            },
            {
                href: "/account/reset-password",
                label: "Password & Security",
                description: "Protect your account",
                icon: faLock,
            },
        ],
    },
];

export function getAccountPageTitle(pathname: string) {
    if (pathname === "/account") return "My Account";

    const items = [
        ...accountQuickActions,
        ...accountNavigationSections.flatMap((section) => section.items),
    ];
    const match = items.find((item) => (
        pathname === item.href || pathname.startsWith(`${item.href}/`)
    ));

    return match?.label || "My Account";
}
