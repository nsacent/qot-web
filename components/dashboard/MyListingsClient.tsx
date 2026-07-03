"use client";

import { useEffect, useState } from "react";
import MyListingCard from "@/components/dashboard/MyListingCard";
import SellerStats from "@/components/dashboard/SellerStats";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.my_listings)) return data.my_listings;
    return [];
}

export default function MyListingsClient() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMyListings() {
            const token = localStorage.getItem("qot_access_token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            const possibleEndpoints = [
                "/seller/listings/",
                "/listings/me/",
                "/seller/dashboard/",
            ];

            try {
                let successfulData: any = null;

                for (const endpoint of possibleEndpoints) {
                    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        successfulData = await response.json();
                        break;
                    }
                }

                if (!successfulData) {
                    throw new Error("Could not load your listings from the API.");
                }

                setListings(getArray(successfulData));
            } catch (err: any) {
                setError(err.message || "Failed to load your listings.");
            } finally {
                setLoading(false);
            }
        }

        loadMyListings();
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-slate-600">
                Loading your listings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <section>
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold">Your Adverts</h2>
                    <p className="mt-1 text-slate-600">
                        You have {listings.length} advert{listings.length === 1 ? "" : "s"}.
                    </p>
                </div>

                <a
                    href="/post-ad"
                    className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                >
                    Post New Advert
                </a>
            </div>

            <SellerStats listings={listings} />

            {listings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing: any) => (
                        <MyListingCard
                            key={listing.id || listing.slug}
                            listing={listing}
                            onChanged={() => window.location.reload()}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border bg-white p-8 text-slate-600">
                    You have not posted any adverts yet.
                </div>
            )}
        </section>
    );
}