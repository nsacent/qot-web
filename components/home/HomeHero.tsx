import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@/lib/faIcons";

type HomeHeroProps = {
    latestAds?: any[];
};

function formatPrice(value: any, currency = "UGX") {
    if (!value) return "Price on request";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return `${currency} ${value}`;
    }

    return `${currency} ${numberValue.toLocaleString()}`;
}

function getAdImage(ad: any) {
    return (
        ad?.image ||
        ad?.image_url ||
        ad?.thumbnail ||
        ad?.primary_image?.image ||
        ad?.primary_image?.url ||
        ad?.images?.[0]?.image ||
        ad?.images?.[0]?.url ||
        ""
    );
}

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.uuid || "";
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

function LatestAdMiniCard({ ad }: { ad: any }) {
    const id = getAdId(ad);
    const image = getAdImage(ad);

    return (
        <a
            href={id ? `/listings/${id}` : "/listings"}
            className="flex gap-3 border-t border-slate-100 py-3 first:border-t-0"
        >
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {image ? (
                    <img
                        src={image}
                        alt={getAdTitle(ad)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-300">
                        QOT
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-black text-slate-950">
                    {getAdTitle(ad)}
                </p>

                <p className="mt-1 text-sm font-black text-orange-600">
                    {formatPrice(ad?.price, ad?.currency)}
                </p>
            </div>
        </a>
    );
}

export default function HomeHero({ latestAds = [] }: HomeHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_12px_45px_rgba(15,23,42,0.08)]">
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

                    <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-slate-700">
                        Find great deals, sell what you don&apos;t need, and connect with
                        trusted buyers and sellers across Uganda.
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <a
                            href="/listings"
                            className="rounded-2xl bg-orange-500 px-7 py-3.5 text-center text-sm font-black text-white shadow-sm hover:bg-orange-600"
                        >
                            Browse Ads →
                        </a>

                        <a
                            href="/post-ad"
                            className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-center text-sm font-black text-slate-950 shadow-sm hover:bg-slate-50"
                        >
                            Post Your Ad
                        </a>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-black text-slate-800">
                        <span>100% Free to Use</span>
                        <span>Verified Sellers</span>
                        <span>Safe & Secure</span>
                    </div>
                </div>

                <div className="relative hidden overflow-hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-orange-100 to-transparent" />

                    <div className="absolute bottom-0 right-0 h-full w-[82%] rounded-l-[5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.96),rgba(251,146,60,0.35)_46%,rgba(249,115,22,0.18)_100%)]" />

                    <div className="absolute right-16 top-8 w-72 rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                        <div className="mb-3 flex items-center justify-between gap-2 text-sm font-black text-slate-950">
                            <span>Latest Ads</span>

                            <a
                                href="/listings?sort=newest"
                                className="text-xs font-black text-orange-600 hover:text-orange-700"
                            >
                                View all
                            </a>
                        </div>

                        {latestAds.slice(0, 3).length > 0 ? (
                            latestAds
                                .slice(0, 3)
                                .map((ad) => (
                                    <LatestAdMiniCard key={getAdId(ad) || getAdTitle(ad)} ad={ad} />
                                ))
                        ) : (
                            <div className="rounded-2xl border border-dashed p-5 text-center">
                                <p className="text-sm font-black text-slate-900">
                                    No ads yet
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    New ads will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}