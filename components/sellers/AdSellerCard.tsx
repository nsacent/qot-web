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
            className="overflow-hidden rounded-[16px] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.09)] ring-1 ring-black/5 sm:rounded-[34px] sm:shadow-[0_20px_65px_rgba(15,23,42,0.12)]"
        >
            <div className="relative hidden h-28 overflow-hidden bg-slate-950 sm:block">
                {sellerProfile?.cover_photo && (
                    <img
                        src={sellerProfile.cover_photo}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-75"
                    />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.96),rgba(15,23,42,0.70)_55%,rgba(249,115,22,0.82))]" />
                <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[24px] border-white/10" />

                <div className="relative flex h-full items-start justify-between p-4 text-white sm:p-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                            Seller information
                        </p>
                        <p className="mt-1 hidden text-sm font-bold text-white/75 sm:block">
                            Know who you are buying from
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-wide ring-1 ring-white/15 backdrop-blur sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                        <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-orange-300" />
                        QOT seller
                    </span>
                </div>
            </div>

            <div className="relative p-3 sm:px-6 sm:pb-6 sm:pt-0">
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.15em] text-orange-600 sm:hidden">
                    Seller information
                </p>

                <div className="flex items-center justify-between gap-3 sm:items-end sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-orange-500 text-base font-black text-white ring-2 ring-orange-100 sm:-mt-10 sm:h-20 sm:w-20 sm:rounded-[26px] sm:border-4 sm:border-white sm:text-2xl sm:shadow-[0_12px_30px_rgba(15,23,42,0.18)] sm:ring-0">
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

                    <div className="min-w-0 flex-1 sm:hidden">
                        <h2 className="truncate text-base font-black tracking-tight text-slate-950">
                            {displayName}
                        </h2>
                        <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[9px] font-bold text-slate-500">
                            <FontAwesomeIcon icon={faLocationDot} className="h-2.5 w-2.5 shrink-0 text-orange-500" />
                            <span className="truncate">{location}</span>
                        </p>
                    </div>

                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 sm:mb-1 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-full sm:px-3 sm:py-1.5 sm:text-[10px] sm:font-black sm:uppercase sm:tracking-wide">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                        <span className="hidden sm:inline">Protected contact</span>
                    </span>
                </div>

                <div className="mt-4 hidden sm:block">
                    <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-2xl">
                        {displayName}
                    </h2>

                    {personalName && (
                        <p className="mt-1 text-sm font-bold text-slate-500">
                            {personalName}
                        </p>
                    )}

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-500 sm:mt-2 sm:gap-x-4 sm:gap-y-2 sm:text-xs">
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

                <div className="mt-2.5 grid grid-cols-3 overflow-hidden rounded-[11px] bg-slate-50 ring-1 ring-slate-100 sm:mt-5 sm:rounded-[22px]">
                    <div className="px-2 py-2 text-center sm:px-3 sm:py-3.5">
                        <span className="block text-sm font-black text-slate-950 sm:text-lg">
                            {formatCompactNumber(activeAds)}
                        </span>
                        <span className="mt-0.5 block text-[7px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px] sm:tracking-[0.13em]">
                            Active ads
                        </span>
                    </div>
                    <div className="border-x border-slate-200/80 px-2 py-2 text-center sm:px-3 sm:py-3.5">
                        <span className="inline-flex items-center gap-1 text-sm font-black text-slate-950 sm:text-lg">
                            {formatCompactNumber(followers)}
                            <FontAwesomeIcon icon={faUsers} className="h-3 w-3 text-orange-500" />
                        </span>
                        <span className="mt-0.5 block text-[7px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px] sm:tracking-[0.13em]">
                            Followers
                        </span>
                    </div>
                    <div className="px-2 py-2 text-center sm:px-3 sm:py-3.5">
                        <span className="inline-flex items-center gap-1 text-sm font-black text-slate-950 sm:text-lg">
                            {rating}
                            {rating !== "New" && (
                                <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400" />
                            )}
                        </span>
                        <span className="mt-0.5 block text-[7px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[9px] sm:tracking-[0.13em]">
                            Rating
                        </span>
                    </div>
                </div>

                {trustScore !== null && (
                    <div className="mt-2.5 rounded-[11px] bg-emerald-50 px-2.5 py-2 ring-1 ring-emerald-100 sm:mt-4 sm:rounded-[22px] sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-emerald-600 text-white sm:h-8 sm:w-8 sm:rounded-xl">
                                    <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-950 sm:text-xs">QOT trust score</p>
                                    <p className="hidden text-[10px] font-bold text-emerald-700 sm:block">Based on profile and activity</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-emerald-800">{trustScore}/100</span>
                        </div>

                        <div className="mt-3 hidden h-1.5 overflow-hidden rounded-full bg-emerald-200 sm:block">
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
                        className="group mt-2.5 flex h-9 items-center justify-between rounded-[10px] bg-slate-950 px-3 text-[10px] font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 sm:mt-4 sm:h-auto sm:rounded-[20px] sm:px-5 sm:py-3.5 sm:text-sm"
                    >
                        <span>View full seller profile</span>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="h-4 w-4 text-orange-400 transition group-hover:translate-x-1"
                        />
                    </a>
                ) : null}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 p-3 sm:p-6">
                <div className="mb-2 sm:mb-4">
                    <h3 className="text-xs font-black text-slate-950 sm:text-base">Contact this seller</h3>
                    <p className="mt-1 hidden text-xs font-bold leading-5 text-slate-500 sm:block">
                        Chat starts with “Hi, is this ad still available?” You can edit or follow up in Messages.
                    </p>
                </div>

                <BuyerListingActions listing={listing} listingId={listing.id} />

                <div className="mt-2.5 border-t border-slate-200 pt-2.5 sm:mt-4 sm:pt-4">
                    <ListingShareActions
                        listing={listing}
                        listingId={listing?.id}
                        title={listing?.title}
                        className="gap-2 [&_button]:!rounded-[10px] [&_button]:!px-3 [&_button]:!py-2 [&_button]:!text-[10px] sm:gap-3 sm:[&_button]:!rounded-2xl sm:[&_button]:!px-4 sm:[&_button]:!py-3 sm:[&_button]:!text-sm"
                    />
                </div>
            </div>
        </section>
    );
}
