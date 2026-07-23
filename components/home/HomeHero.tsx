import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faStar } from "@/lib/faIcons";
import ListingCardImage from "@/components/listings/ListingCardImage";

type HeroListing = Record<string, unknown> & {
    id?: string | number;
    listing_id?: string | number;
    uuid?: string;
    title?: string;
    name?: string;
    price?: string | number;
    currency?: string;
};

type HomeHeroProps = {
    featuredAds?: HeroListing[];
};

function formatPrice(value: unknown, currency = "UGX") {
    if (!value) return "Price on request";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return `${currency} ${String(value)}`;
    }

    return `${currency} ${numberValue.toLocaleString()}`;
}

function getAdId(ad: HeroListing) {
    return ad.id || ad.listing_id || ad.uuid || "";
}

function getAdTitle(ad: HeroListing) {
    return ad.title || ad.name || "Untitled ad";
}

function FeaturedAdMiniCard({ ad }: { ad: HeroListing }) {
    const id = getAdId(ad);

    return (
        <Link
            href={id ? `/ads/${id}` : "/ads"}
            className="group flex snap-start gap-3 border-t border-slate-100 py-2.5 first:border-t-0"
        >
            <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <ListingCardImage
                    listing={ad}
                    title={getAdTitle(ad)}
                    fill
                    className="h-full transition duration-300 group-hover:scale-105"
                />
            </div>

            <div className="min-w-0">
                <p className="line-clamp-1 text-xs font-black text-slate-950 transition group-hover:text-orange-600">
                    {getAdTitle(ad)}
                </p>

                <p className="mt-1 text-xs font-black text-orange-600">
                    {formatPrice(ad.price, ad.currency || "UGX")}
                </p>
            </div>
        </Link>
    );
}

export default function HomeHero({ featuredAds = [] }: HomeHeroProps) {
    return (
        <section className="relative hidden overflow-hidden rounded-[2rem] bg-white shadow-[0_12px_45px_rgba(15,23,42,0.08)] md:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(255,103,0,0.12),transparent_26%),linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_50%,rgba(255,237,213,0.55)_100%)]" />

            <div className="relative grid min-h-[300px] gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="px-6 py-7 md:px-10 md:py-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-slate-900">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                            <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                        </span>
                        Uganda&apos;s trusted marketplace
                    </div>

                    <h1 className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-5xl">
                        Buy. Sell. Connect. All in{" "}
                        <span className="relative inline-block text-orange-600">
                            One Place
                            <span className="absolute -bottom-2 left-2 h-1 w-24 rounded-full bg-orange-500" />
                        </span>
                    </h1>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/ads"
                            className="rounded-2xl bg-orange-500 px-7 py-3.5 text-center text-sm font-black text-white shadow-sm hover:bg-orange-600"
                        >
                            Browse Ads →
                        </Link>

                        <Link
                            href="/post-ad"
                            className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-center text-sm font-black text-slate-950 shadow-sm hover:bg-slate-50"
                        >
                            Post Your Ad
                        </Link>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-black text-slate-800">
                        <span>100% Free to Use</span>
                        <span>Verified Sellers</span>
                        <span>Safe &amp; Secure</span>
                    </div>
                </div>

                <div className="relative hidden overflow-hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-orange-100 to-transparent" />

                    <div className="absolute bottom-0 right-0 h-full w-[82%] rounded-l-[5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.96),rgba(251,146,60,0.35)_46%,rgba(249,115,22,0.18)_100%)]" />

                    <div className="absolute bottom-6 right-10 top-6 flex w-[330px] flex-col rounded-3xl bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-sm font-black text-slate-950">
                            <span className="inline-flex items-center gap-2">
                                <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 text-orange-500" />
                                Featured Ads
                            </span>

                            <Link
                                href="/ads?sort=featured"
                                className="text-xs font-black text-orange-600 hover:text-orange-700"
                            >
                                View all
                            </Link>
                        </div>

                        {featuredAds.slice(0, 5).length > 0 ? (
                            <div
                                aria-label="Featured ads"
                                className="mt-1 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain pr-1 [scrollbar-color:#fdba74_transparent] [scrollbar-width:thin]"
                            >
                                {featuredAds
                                    .slice(0, 5)
                                    .map((ad) => (
                                        <FeaturedAdMiniCard key={getAdId(ad) || getAdTitle(ad)} ad={ad} />
                                    ))}
                            </div>
                        ) : (
                            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 p-5 text-center">
                                <p className="text-sm font-black text-slate-900">
                                    Featured spots available
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    Promoted ads will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
