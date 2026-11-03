import Link from "next/link";
import Image from "next/image";
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
    { label: "Browse ads", href: "/ads" },
    { label: "Post an ad", href: "/post-ad" },
    { label: "Safety center", href: "/safety/report" },
    { label: "Help & support", href: "mailto:support@qot.ug" },
];

const linkClassName = "inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700";

function AppStoreLinks() {
    return (
        <nav aria-label="Download the QOT app" className="flex flex-col items-center gap-3 min-[360px]:flex-row">
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
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 inset-y-0 rounded-[28px] border border-slate-200/70 bg-white sm:inset-x-4" />
                <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-8 lg:flex-nowrap">
                        <div className="text-center sm:text-left">
                            <Link href="/" aria-label="QOT Uganda home" className={linkClassName}>
                                <QotLogo className="h-8 w-auto text-orange-500" />
                            </Link>
                            <p className="mt-1 text-sm">Buy &amp; sell across Uganda.</p>
                        </div>

                        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 text-sm">
                            {footerLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={linkClassName}>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <section aria-label="QOT mobile app" className="text-center sm:text-left">
                            <h2 className="mb-3 text-sm font-medium text-slate-700">Get the QOT app</h2>
                            <AppStoreLinks />
                        </section>
                    </div>

                    <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:flex-wrap sm:gap-x-6">
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
