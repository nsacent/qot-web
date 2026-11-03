import Link from "next/link";
import Image from "next/image";
import QotLogo from "@/components/brand/QotLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CookieSettingsButton from "@/components/privacy/CookieSettingsButton";
import {
    faCircleCheck,
    faEnvelope,
    faHeartRegular,
    faLocationDot,
    faPlus,
    faShieldHalved,
    faStore,
} from "@/lib/faIcons";

const appStoreLinks = [
    {
        label: "App Store",
        href: "https://apps.apple.com/ug/app/qot-uganda/id6801803137",
        badge: "/images/app-badges/app-store.svg",
        alt: "Download on the App Store",
        width: 119.66407,
        height: 40,
        imageClassName: "h-[52px] w-auto",
    },
    {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=ug.qot.mobile",
        badge: "/images/app-badges/google-play.png",
        alt: "Get it on Google Play",
        width: 646,
        height: 250,
        // Google's artwork includes transparent padding; align the visible badges.
        imageClassName: "-m-[13px] h-[78px] w-auto max-w-none",
    },
];

function AppStoreLinks({ className = "" }: { className?: string }) {
    return (
        <nav aria-label="Download the QOT app" className={`flex flex-col items-center gap-4 min-[480px]:flex-row ${className}`}>
            {appStoreLinks.map((store) => (
                <a
                    key={store.href}
                    href={store.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`QOT on ${store.label} (opens in a new tab)`}
                    className="inline-flex shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700"
                >
                    <Image
                        src={store.badge}
                        alt={store.alt}
                        width={store.width}
                        height={store.height}
                        className={store.imageClassName}
                        unoptimized
                    />
                </a>
            ))}
        </nav>
    );
}

const footerGroups = [
    {
        title: "Marketplace",
        links: [
            { label: "Browse ads", href: "/ads" },
            { label: "Explore categories", href: "/categories" },
            { label: "Meet sellers", href: "/sellers" },
            { label: "Post an ad", href: "/post-ad" },
        ],
    },
    {
        title: "Selling",
        links: [
            { label: "My Dashboard", href: "/account/dashboard" },
            { label: "My adverts", href: "/account/my-ads" },
            { label: "Analytics", href: "/account/analytics" },
            { label: "Renewals", href: "/account/renewals" },
        ],
    },
    {
        title: "Your account",
        links: [
            { label: "My account", href: "/account" },
            { label: "Saved ads", href: "/account/saved" },
            { label: "Messages", href: "/account/messages" },
            { label: "Notifications", href: "/account/notifications" },
        ],
    },
    {
        title: "Trust & support",
        links: [
            { label: "Safety center", href: "/safety/report" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Help & support", href: "mailto:support@qot.ug" },
        ],
    },
];

const trustItems = [
    {
        icon: faCircleCheck,
        title: "Verified sellers",
        description: "Shop with more confidence.",
    },
    {
        icon: faShieldHalved,
        title: "Safer conversations",
        description: "Keep every deal on QOT.",
    },
    {
        icon: faLocationDot,
        title: "Across Uganda",
        description: "Discover nearby opportunities.",
    },
];

export default function QotMarketplaceFooter() {
    return (
        <footer className="mt-10 w-full pb-8">
            <section aria-label="QOT mobile app" className="mx-3 rounded-[28px] border border-slate-200 bg-white px-5 py-7 text-center text-slate-900 sm:mx-4 md:hidden">
                <h2 className="text-lg font-black">Get the QOT app</h2>
                <p className="mt-1 text-sm text-slate-600">Buy &amp; sell on the go.</p>
                <AppStoreLinks className="mt-6 justify-center" />
            </section>
            <div className="relative hidden text-slate-900 md:block">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 inset-y-0 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] sm:inset-x-4">
                    <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-500/8 blur-3xl" />
                    <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-orange-400/5 blur-3xl" />
                    <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
                    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-5 py-6 shadow-[0_20px_45px_rgba(249,115,22,0.22)] sm:px-7 sm:py-7 lg:flex lg:items-center lg:justify-between lg:gap-8">
                        <span className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
                        <div className="relative flex items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/30 text-orange-950 ring-1 ring-white/40 backdrop-blur sm:h-14 sm:w-14">
                                <FontAwesomeIcon icon={faStore} className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-950">
                                    Your next buyer is already browsing
                                </p>
                                <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
                                    Turn what you have into your next opportunity.
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-orange-950">
                                    Create a clear advert, add great photos, and reach buyers across Uganda.
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-5 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
                            <Link
                                href="/post-ad"
                                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-white px-6 py-3.5 text-sm font-black text-orange-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50"
                            >
                                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                                Post an ad
                            </Link>
                            <Link
                                href="/ads"
                                className="inline-flex items-center justify-center rounded-[16px] bg-white/25 px-6 py-3.5 text-sm font-black text-orange-950 ring-1 ring-orange-950/15 backdrop-blur transition hover:bg-white hover:text-orange-700"
                            >
                                Browse marketplace
                            </Link>
                        </div>
                    </section>

                    <div className="grid gap-9 pb-3 pt-9 lg:grid-cols-[1.35fr_repeat(4,minmax(0,0.72fr))] lg:gap-8 lg:pt-11">
                        <div className="lg:pr-6">
                            <Link href="/" aria-label="QOT Uganda home" className="inline-flex items-center">
                                <span>
                                    <QotLogo className="h-12 w-auto text-orange-500" />
                                    <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-orange-700">
                                        Uganda marketplace
                                    </span>
                                </span>
                            </Link>

                            <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-slate-600">
                                Quality, Opportunities and Trust. A simpler way to buy, sell, and connect with people across Uganda.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link
                                    href="/account/saved"
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-orange-700 hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faHeartRegular} className="h-3.5 w-3.5" />
                                    Saved ads
                                </Link>
                                <Link
                                    href="/account/messages"
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-orange-700 hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
                                    Messages
                                </Link>
                            </div>
                        </div>

                        {footerGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-700">
                                    {group.title}
                                </h3>
                                <nav className="mt-4 grid gap-3.5">
                                    {group.links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:translate-x-1 hover:text-orange-700"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 transition group-hover:bg-orange-500" />
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        ))}
                    </div>

                    <section aria-label="QOT mobile app" className="mt-7 flex flex-wrap items-center justify-between gap-6 rounded-[24px] bg-slate-50 px-6 py-6 ring-1 ring-slate-200">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Get the QOT app</h2>
                            <p className="mt-1 text-sm text-slate-600">Buy &amp; sell on the go.</p>
                        </div>
                        <AppStoreLinks />
                    </section>

                    <section className="mt-5 grid gap-3 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-3 sm:p-4">
                        {trustItems.map((item) => (
                            <div key={item.title} className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-white">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                </span>
                                <span>
                                    <span className="block text-xs font-black text-slate-900">{item.title}</span>
                                    <span className="mt-0.5 block text-[11px] font-semibold text-slate-600">{item.description}</span>
                                </span>
                            </div>
                        ))}
                    </section>

                    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 text-[11px] font-semibold text-slate-600 sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} QOT Uganda. All rights reserved.</p>
                        <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <Link href="/privacy" className="font-black text-slate-600 transition hover:text-orange-700">
                                Privacy
                            </Link>
                            <Link href="/terms" className="font-black text-slate-600 transition hover:text-orange-700">
                                Terms
                            </Link>
                            <CookieSettingsButton className="font-black text-slate-600 transition hover:text-orange-700" />
                            <a href="tel:+256200911678" className="font-black text-slate-600 transition hover:text-orange-700">
                                0200 911 678
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
}
