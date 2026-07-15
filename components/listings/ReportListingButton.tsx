"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getStoredToken, getStoredUser } from "@/lib/auth";

type ReportListingButtonProps = {
    listingId: string | number;
    listing?: any;
};

const reportReasons = [
    { value: "scam", label: "Scam or fraud" },
    { value: "fake", label: "Fake or misleading advert" },
    { value: "wrong_price", label: "Wrong or misleading price" },
    { value: "sold", label: "Item already sold" },
    { value: "duplicate", label: "Duplicate advert" },
    { value: "offensive", label: "Offensive content" },
    { value: "other", label: "Other issue" },
];

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.listings)) return data.listings;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data?.listings)) return data.data.listings;

    return [];
}

function getListingId(item: any) {
    return (
        item?.id ||
        item?.listing?.id ||
        item?.listing_id ||
        item?.advert_id ||
        item?.listing?.listing_id ||
        ""
    );
}

function cleanValue(value: any) {
    if (value === undefined || value === null || value === "") return "";
    return String(value).trim().toLowerCase();
}

function uniqueValues(values: any[]) {
    return Array.from(new Set(values.map(cleanValue).filter(Boolean)));
}

function getCurrentUserIdentifiers(user: any) {
    return uniqueValues([
        user?.id,
        user?.user_id,
        user?.pk,
        user?.sub,
        user?.profile?.id,
        user?.profile?.user_id,
        user?.account?.id,
        user?.phone,
        user?.phone_number,
        user?.mobile,
        user?.email,
        user?.username,
        user?.identifier,
    ]);
}

function getListingOwnerIdentifiers(listing: any) {
    return uniqueValues([
        listing?.seller?.id,
        listing?.seller?.user?.id,
        listing?.seller?.user_id,
        listing?.seller_id,

        listing?.user?.id,
        listing?.user_id,

        listing?.owner?.id,
        listing?.owner?.user?.id,
        listing?.owner_id,

        listing?.created_by?.id,
        listing?.created_by_id,

        listing?.seller?.phone,
        listing?.seller?.phone_number,
        listing?.seller?.mobile,
        listing?.seller?.email,
        listing?.seller?.username,

        listing?.user?.phone,
        listing?.user?.email,
        listing?.user?.username,

        listing?.owner?.phone,
        listing?.owner?.email,
        listing?.owner?.username,
    ]);
}

function userOwnsListingByIdentifiers(user: any, listing: any) {
    const userIdentifiers = getCurrentUserIdentifiers(user);
    const ownerIdentifiers = getListingOwnerIdentifiers(listing);

    return userIdentifiers.some((value) => ownerIdentifiers.includes(value));
}

export default function ReportListingButton({
    listingId,
    listing,
}: ReportListingButtonProps) {
    const [checkingOwner, setCheckingOwner] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("scam");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function checkOwnership() {
            setCheckingOwner(true);

            const token = getStoredToken();
            const user = getStoredUser();

            if (!token) {
                setIsOwner(false);
                setCheckingOwner(false);
                return;
            }

            if (user && listing && userOwnsListingByIdentifiers(user, listing)) {
                setIsOwner(true);
                setCheckingOwner(false);
                return;
            }

            try {
                const sellerListingsData = await apiGet("/my-ads/", {
                    redirectOnUnauthorized: false,
                });

                const sellerListings = getArray(sellerListingsData);

                const found = sellerListings.some(
                    (item) => String(getListingId(item)) === String(listingId)
                );

                setIsOwner(found);

                console.log("Report button seller listing ownership check:", {
                    currentListingId: String(listingId),
                    sellerListingIds: sellerListings.map((item) =>
                        String(getListingId(item))
                    ),
                    owns: found,
                });
            } catch (error) {
                setIsOwner(false);

                console.log("Report button ownership check failed:", error);
            } finally {
                setCheckingOwner(false);
            }
        }

        checkOwnership();
    }, [listingId, listing]);

    async function submitReport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const token = getStoredToken();

        if (!token) {
            window.location.href = `/login?next=/listings/${listingId}`;
            return;
        }

        if (!description.trim()) {
            setError("Please describe the problem with this advert.");
            return;
        }

        setLoading(true);

        try {
            await apiPost(`/listings/${listingId}/report/`, {
                reason,
                description,
            });

            setSuccess("Report submitted successfully. QOT will review this advert.");
            setDescription("");
            setReason("scam");
        } catch (error: any) {
            setError(error.message || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    }

    if (checkingOwner) return null;

    if (isOwner) return null;

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            {!open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full rounded-xl bg-red-600 px-5 py-3 text-center font-semibold text-white hover:bg-red-700"
                >
                    Report this advert
                </button>
            ) : (
                <form onSubmit={submitReport} className="space-y-4">
                    <div>
                        <p className="font-bold text-red-700">Report this advert</p>

                        <p className="mt-1 text-sm text-red-600">
                            Tell us what looks suspicious or misleading.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Reason
                        </label>

                        <select
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
                        >
                            {reportReasons.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            placeholder="Explain the issue..."
                            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="grid gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setError("");
                                setSuccess("");
                            }}
                            className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}