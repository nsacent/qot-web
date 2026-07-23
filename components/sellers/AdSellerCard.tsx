import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCalendarCheck,
    faLocationDot,
    faShieldHalved,
    faStar,
    faStore,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import BuyerListingActions from "@/components/listings/BuyerListingActions";
import ListingShareActions from "@/components/listings/ListingShareActions";

type AdSellerCardProps = {
    listing: any;
    sellerId: string | number | null;
    sellerName: string;
    location: string;
    sellerProfile?: any;
};

function formatCompactNumber(value: any) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) return "0";

    return new Intl.NumberFormat("en-UG", {
        notation: number >= 1000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(number);
}

function formatMemberSince(value: any) {
    if (!value) return "QOT member";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "QOT member";

    return `Member since ${date.toLocaleDateString("en-UG", {
        month: "short",
        year: "numeric",
    })}`;
}

export default function AdSellerCard({
    listing,
    sellerId,
    sellerName,
    location,
    sellerProfile,
}: AdSellerCardProps) {
    const displayName =
        sellerProfile?.business_name || sellerProfile?.full_name || sellerName;
    const personalName =
        sellerProfile?.business_name && sellerProfile?.full_name
            ? sellerProfile.full_name
            : "";
    const initial = String(displayName || "Q").charAt(0).toUpperCase();
    const activeAds = sellerProfile?.total_active_listings || 0;
    const followers = sellerProfile?.followers_count || 0;
    const totalReviews = Number(sellerProfile?.total_reviews || 0);
    const averageRating = Number(sellerProfile?.average_rating || 0);
    const rating = totalReviews > 0 && Number.isFinite(averageRating)
        ? averageRating.toFixed(1)
        : "New";
    const rawTrustScore = Number(sellerProfile?.trust_score);
    const trustScore = Number.isFinite(rawTrustScore)
        ? Math.max(0, Math.min(100, Math.round(rawTrustScore)))
        : null;

    return (
        <section
            aria-label="Seller information"
            className="overflow-hidden rounded-[34px] bg-white shadow-[0_20px_65px_rgba(15,23,42,0.12)] ring-1 ring-black/5"
        >
            <div className="relative h-28 overflow-hidden bg-slate-950">
                {sellerProfile?.cover_photo && (
                    <img
                        src={sellerProfile.cover_photo}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-75"
                    />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.96),rgba(15,23,42,0.70)_55%,rgba(249,115,22,0.82))]" />
                <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[24px] border-white/10" />

                <div className="relative flex h-full items-start justify-between p-5 text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                            Seller information
                        </p>
                        <p className="mt-1 text-sm font-bold text-white/75">
                            Know who you are buying from
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ring-1 ring-white/15 backdrop-blur">
                        <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-orange-300" />
                        QOT seller
                    </span>
                </div>
            </div>

            <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="flex items-end justify-between gap-4">
                    <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white bg-orange-500 text-2xl font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                        {sellerProfile?.avatar ? (
                            <img
                                src={sellerProfile.avatar}
                                alt={`${displayName} profile`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            initial
                        )}
                    </div>

                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                        Protected contact
                    </span>
                </div>

                <div className="mt-4">
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">
                        {displayName}
                    </h2>

                    {personalName && (
                        <p className="mt-1 text-sm font-bold text-slate-500">
                            {personalName}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-orange-500" />
                            {location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendarCheck} className="h-3.5 w-3.5 text-orange-500" />
                            {formatMemberSince(sellerProfile?.date_joined)}
                        </span>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[22px] bg-slate-50 ring-1 ring-slate-100">
                    <div className="px-3 py-3.5 text-center">
                        <span className="block text-lg font-black text-slate-950">
                            {formatCompactNumber(activeAds)}
                        </span>
                        <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                            Active ads
                        </span>
                    </div>
                    <div className="border-x border-slate-200/80 px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-lg font-black text-slate-950">
                            {formatCompactNumber(followers)}
                            <FontAwesomeIcon icon={faUsers} className="h-3 w-3 text-orange-500" />
                        </span>
                        <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                            Followers
                        </span>
                    </div>
                    <div className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-lg font-black text-slate-950">
                            {rating}
                            {rating !== "New" && (
                                <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400" />
                            )}
                        </span>
                        <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                            Rating
                        </span>
                    </div>
                </div>

                {trustScore !== null && (
                    <div className="mt-4 rounded-[22px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                                    <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                                </span>
                                <div>
                                    <p className="text-xs font-black text-emerald-950">QOT trust score</p>
                                    <p className="text-[10px] font-bold text-emerald-700">Based on profile and activity</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-emerald-800">{trustScore}/100</span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-200">
                            <div
                                className="h-full rounded-full bg-emerald-600"
                                style={{ width: `${trustScore}%` }}
                            />
                        </div>
                    </div>
                )}

                {sellerId ? (
                    <a
                        href={`/sellers/${sellerId}`}
                        className="group mt-4 flex items-center justify-between rounded-[20px] bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                        <span>View full seller profile</span>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="h-4 w-4 text-orange-400 transition group-hover:translate-x-1"
                        />
                    </a>
                ) : null}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                <div className="mb-4">
                    <h3 className="text-base font-black text-slate-950">Contact this seller</h3>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        Chat starts with “Hi, is this ad still available?” You can edit or follow up in Messages.
                    </p>
                </div>

                <BuyerListingActions listing={listing} listingId={listing.id} />

                <div className="mt-4 border-t border-slate-200 pt-4">
                    <ListingShareActions
                        listing={listing}
                        listingId={listing?.id}
                        title={listing?.title}
                    />
                </div>
            </div>
        </section>
    );
}
