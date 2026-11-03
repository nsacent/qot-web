import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMobileScreenButton } from "@fortawesome/free-solid-svg-icons";
import QotLogo from "@/components/brand/QotLogo";
import CookieSettingsButton from "@/components/privacy/CookieSettingsButton";

const appStoreLinks = [
    {
        label: "App Store",
        href: "https://apps.apple.com/ug/app/qot-uganda/id6801803137",
        badge: "/images/app-badges/app-store.svg",
        alt: "Download on the App Store",
        width: 119.66407,
        height: 40,
        imageClassName: "h-[44px] w-auto",
    },
    {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=ug.qot.mobile",
        badge: "/images/app-badges/google-play.png",
        alt: "Get it on Google Play",
        width: 646,
        height: 250,
        // Google's artwork includes transparent padding; align the visible badges.
        imageClassName: "-m-[11px] h-[66px] w-auto max-w-none",
    },
];

const footerLinks = [
    {
        title: "Explore QOT",
        links: [
            { label: "Browse ads", href: "/ads" },
            { label: "Post an ad", href: "/post-ad" },
        ],
    },
    {
        title: "Here to help",
        links: [
            { label: "Safety center", href: "/safety/report" },
            { label: "Contact support", href: "mailto:support@qot.ug" },
        ],
    },
];

const linkClassName = "inline-flex min-h-[44px] items-center rounded-sm transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700";

function AppStoreLinks() {
    return (
        <nav aria-label="Download the QOT app" className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
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

export default function QotMarketplaceFooter() {
    return (
        <footer className="mt-10 w-full pb-8 text-slate-600">
            <div className="relative">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 inset-y-0 rounded-[28px] border border-orange-100 bg-white shadow-[0_8px_32px_rgba(124,45,18,0.035)] sm:inset-x-4" />
                <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10">
                    <div className="grid items-start gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1fr_1fr_1.15fr] lg:items-center">
                        <div className="text-center sm:text-left">
                            <Link href="/" aria-label="QOT Uganda home" className={linkClassName}>
                                <QotLogo className="h-10 w-auto text-orange-500" />
                            </Link>
                            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Buy. Sell. Connect.</p>
                            <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed sm:mx-0">Great finds and new opportunities, right here in Uganda.</p>
                        </div>

                        <nav aria-label="Footer" className="mx-auto grid w-full max-w-sm grid-cols-2 gap-x-5 text-center text-sm sm:mx-0 sm:max-w-none sm:gap-x-8 sm:text-left">
                            {footerLinks.map((group) => (
                                <div key={group.title}>
                                    <h2 className="mb-2 text-sm font-semibold text-slate-900">{group.title}</h2>
                                    <ul>
                                        {group.links.map((link) => (
                                            <li key={link.href}>
                                                <Link href={link.href} className={linkClassName}>{link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        <section aria-label="QOT mobile app" className="rounded-[22px] border border-orange-100/80 bg-orange-50/80 px-4 py-5 text-center sm:col-span-2 sm:px-5 sm:text-left lg:col-span-1">
                            <div className="mb-4 flex items-center justify-center gap-3 sm:justify-start">
                                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
                                    <FontAwesomeIcon icon={faMobileScreenButton} className="h-5 w-5" />
                                </span>
                                <div className="text-left">
                                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">Take QOT with you</h2>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-600">Browse, post and chat on the go.</p>
                                </div>
                            </div>
                            <AppStoreLinks />
                        </section>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-orange-100/70 pt-4 text-xs sm:flex-row sm:flex-wrap sm:gap-x-6">
                        <p>© {new Date().getFullYear()} QOT Uganda.</p>
                        <nav aria-label="Legal and contact" className="flex flex-wrap items-center justify-center gap-x-5">
                            <Link href="/privacy" className={linkClassName}>Privacy</Link>
                            <Link href="/terms" className={linkClassName}>Terms</Link>
                            <CookieSettingsButton className={linkClassName} />
                            <a href="tel:+256200911678" className={linkClassName}>0200 911 678</a>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
}
