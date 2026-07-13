import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@/lib/faIcons";
import HomeAdCard from "@/components/home/HomeAdCard";

type HomeLatestAdsProps = {
    ads?: any[];
};

function getAdId(ad: any) {
    return ad?.id || ad?.listing_id || ad?.uuid || "";
}

function getAdTitle(ad: any) {
    return ad?.title || ad?.name || "Untitled ad";
}

export default function HomeLatestAds({ ads = [] }: HomeLatestAdsProps) {
    return (
        <section className="mx-auto max-w-[1390px] px-2 pb-5 pt-2">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                    </span>
                    Latest Ads on QOT
                </h2>

                <a
                    href="/listings?sort=newest"
                    className="rounded-xl px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-50"
                >
                    View More →
                </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {ads.length > 0 ? (
                    ads.map((ad) => (
                        <HomeAdCard key={getAdId(ad) || getAdTitle(ad)} ad={ad} />
                    ))
                ) : (
                    <div className="col-span-full rounded-3xl border border-dashed bg-white p-10 text-center">
                        <p className="text-lg font-black text-slate-950">
                            No latest ads yet.
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            New ads will appear here once sellers post.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}