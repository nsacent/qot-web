type SellerStatsProps = {
    listings: any[];
};

function getStatus(listing: any) {
    return String(listing.status || "").toLowerCase();
}

function getViews(listing: any) {
    return Number(
        listing.views_count ||
        listing.view_count ||
        listing.views ||
        0
    );
}

function getSaves(listing: any) {
    return Number(
        listing.favorites_count ||
        listing.saves_count ||
        listing.saved_count ||
        0
    );
}

export default function SellerStats({ listings }: SellerStatsProps) {
    const totalListings = listings.length;

    const activeListings = listings.filter((listing) =>
        ["active", "approved", "published"].includes(getStatus(listing))
    ).length;

    const soldListings = listings.filter((listing) =>
        ["sold", "closed"].includes(getStatus(listing))
    ).length;

    const pendingListings = listings.filter((listing) =>
        ["pending", "draft", "inactive", "rejected"].includes(getStatus(listing))
    ).length;

    const totalViews = listings.reduce(
        (sum, listing) => sum + getViews(listing),
        0
    );

    const totalSaves = listings.reduce(
        (sum, listing) => sum + getSaves(listing),
        0
    );

    const stats = [
        {
            label: "Total Adverts",
            value: totalListings,
            description: "All your posted adverts",
        },
        {
            label: "Active",
            value: activeListings,
            description: "Visible to buyers",
        },
        {
            label: "Sold",
            value: soldListings,
            description: "Marked as sold",
        },
        {
            label: "Pending / Draft",
            value: pendingListings,
            description: "Not fully active",
        },
        {
            label: "Total Views",
            value: totalViews,
            description: "Buyer visits",
        },
        {
            label: "Total Saves",
            value: totalSaves,
            description: "Saved by buyers",
        },
    ];

    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                    <p className="text-sm font-semibold text-slate-500">
                        {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {stat.description}
                    </p>
                </div>
            ))}
        </div>
    );
}