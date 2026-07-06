type SellerStatsProps = {
    listings: any[];
    dashboard?: any;
};

function getStatus(listing: any) {
    return String(listing?.status || "active").toLowerCase();
}

function getViews(listing: any) {
    return Number(
        listing?.views_count ||
        listing?.view_count ||
        listing?.views ||
        listing?.total_views ||
        0
    );
}

function getSaves(listing: any) {
    return Number(
        listing?.favorites_count ||
        listing?.favourites_count ||
        listing?.saved_count ||
        listing?.saves_count ||
        listing?.total_saves ||
        0
    );
}

function getNumber(...values: any[]) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return Number(value) || 0;
        }
    }

    return 0;
}

export default function SellerStats({
    listings = [],
    dashboard = null,
}: SellerStatsProps) {
    const total = getNumber(
        dashboard?.total_listings,
        dashboard?.listings_count,
        dashboard?.summary?.total_listings,
        listings.length
    );

    const active = getNumber(
        dashboard?.active_listings,
        dashboard?.active_count,
        dashboard?.summary?.active_listings,
        listings.filter((listing) => getStatus(listing) === "active").length
    );

    const pending = getNumber(
        dashboard?.pending_listings,
        dashboard?.pending_count,
        dashboard?.summary?.pending_listings,
        listings.filter((listing) => getStatus(listing) === "pending").length
    );

    const sold = getNumber(
        dashboard?.sold_listings,
        dashboard?.sold_count,
        dashboard?.summary?.sold_listings,
        listings.filter((listing) => getStatus(listing) === "sold").length
    );

    const draft = getNumber(
        dashboard?.draft_listings,
        dashboard?.draft_count,
        dashboard?.summary?.draft_listings,
        listings.filter((listing) => getStatus(listing) === "draft").length
    );

    const featured = getNumber(
        dashboard?.active_featured_listings,
        dashboard?.featured_listings,
        dashboard?.featured_count,
        dashboard?.summary?.active_featured_listings,
        listings.filter(
            (listing) =>
                listing?.is_featured || listing?.featured || listing?.featured_until
        ).length
    );

    const renewal = getNumber(
        dashboard?.listings_needing_renewal,
        dashboard?.renewal_count,
        dashboard?.summary?.listings_needing_renewal
    );

    const totalViews = getNumber(
        dashboard?.total_views,
        dashboard?.views_count,
        dashboard?.summary?.total_views,
        listings.reduce((sum, listing) => sum + getViews(listing), 0)
    );

    const totalSaves = getNumber(
        dashboard?.total_saves,
        dashboard?.total_favorites,
        dashboard?.favorites_count,
        dashboard?.summary?.total_saves,
        listings.reduce((sum, listing) => sum + getSaves(listing), 0)
    );

    const stats = [
        {
            label: "Total Adverts",
            value: total,
            helper: "All your adverts",
        },
        {
            label: "Active",
            value: active,
            helper: "Visible to buyers",
        },
        {
            label: "Pending",
            value: pending,
            helper: "Waiting approval",
        },
        {
            label: "Sold",
            value: sold,
            helper: "Marked as sold",
        },
        {
            label: "Draft",
            value: draft,
            helper: "Not yet published",
        },
        {
            label: "Featured",
            value: featured,
            helper: "Currently promoted",
        },
        {
            label: "Need Renewal",
            value: renewal,
            helper: "Expiring soon",
        },
        {
            label: "Total Views",
            value: totalViews,
            helper: "Buyer visits",
        },
        {
            label: "Total Saves",
            value: totalSaves,
            helper: "Saved by buyers",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                    <p className="text-sm font-semibold text-slate-500">{stat.label}</p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {Number(stat.value).toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">{stat.helper}</p>
                </div>
            ))}
        </div>
    );
}