import Navbar from "@/components/layout/Navbar";
import { apiGet } from "@/lib/api";
import FavoriteButton from "@/components/listings/FavoriteButton";
import ContactSellerButton from "@/components/chats/ContactSellerButton";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ListingDetailsPage({ params }: PageProps) {
    const { id } = await params;

    let listing: any = null;

    try {
        listing = await apiGet(`/listings/${id}/`);
    } catch (error) {
        console.error("Listing detail API error:", error);
    }

    if (!listing) {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-16">
                    <div className="rounded-2xl border bg-white p-8">
                        <h1 className="text-2xl font-bold">Listing not found</h1>
                        <p className="mt-2 text-slate-600">
                            This advert may have been removed or is not available.
                        </p>

                        <a
                            href="/listings"
                            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
                        >
                            Back to listings
                        </a>
                    </div>
                </section>
            </main>
        );
    }

    const images =
        listing.images?.length > 0
            ? listing.images
            : listing.primary_image || listing.image
                ? [{ image: listing.primary_image || listing.image }]
                : [];

    const mainImage =
        images?.[0]?.image || images?.[0]?.url || listing.primary_image || listing.image;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="mx-auto max-w-7xl px-6 py-10">
                <a
                    href="/listings"
                    className="mb-6 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    ← Back to listings
                </a>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex h-[420px] items-center justify-center bg-slate-200 text-slate-500">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={listing.title || "Listing image"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>No image available</span>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3 p-4">
                                    {images.slice(0, 4).map((item: any, index: number) => {
                                        const image = item.image || item.url;

                                        return (
                                            <div
                                                key={index}
                                                className="h-24 overflow-hidden rounded-xl bg-slate-200"
                                            >
                                                {image && (
                                                    <img
                                                        src={image}
                                                        alt={`Listing image ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                                {listing.category?.name || listing.category_name || "Listing"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {(listing.is_featured || listing.featured || listing.featured_until) && (
                                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                                        Featured
                                    </span>
                                )}

                                {(listing.seller?.is_verified || listing.seller?.verified) && (
                                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                        Verified Seller
                                    </span>
                                )}

                                {listing.status && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                                        {listing.status}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                                {listing.title || "Untitled listing"}
                            </h1>

                            <p className="mt-3 text-slate-500">
                                {listing.city?.name || listing.location || "Uganda"}
                            </p>

                            <p className="mt-6 text-3xl font-bold text-orange-600">
                                {listing.price
                                    ? `UGX ${Number(listing.price).toLocaleString()}`
                                    : "Contact seller"}
                            </p>


                            <div className="mt-8 border-t pt-6">
                                <h2 className="text-xl font-bold">Description</h2>

                                <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                                    {listing.description || "No description provided."}
                                </p>
                            </div>
                        </div>



                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold">Seller Information</h2>

                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <p>
                                    <span className="font-semibold">Seller:</span>{" "}
                                    {listing.seller?.id ? (
                                        <a
                                            href={`/sellers/${listing.seller.id}`}
                                            className="font-semibold text-orange-600 hover:text-orange-700"
                                        >
                                            {listing.seller?.full_name ||
                                                listing.seller?.name ||
                                                listing.seller_name ||
                                                "QOT Seller"}
                                        </a>
                                    ) : (
                                        listing.seller?.full_name ||
                                        listing.seller?.name ||
                                        listing.seller_name ||
                                        "QOT Seller"
                                    )}
                                </p>

                                <p>
                                    <span className="font-semibold">Location:</span>{" "}
                                    {listing.city?.name || listing.location || "Uganda"}
                                </p>

                                <p>
                                    <span className="font-semibold">Status:</span>{" "}
                                    {listing.status || "Available"}
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <FavoriteButton listingId={listing.id} />

                                <ContactSellerButton listingId={listing.id} />

                                <a
                                    href="/messages"
                                    className="block rounded-xl border px-5 py-3 text-center font-semibold text-slate-900 hover:bg-slate-50"
                                >
                                    My Messages
                                </a>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold">Safety Tips</h2>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Meet the seller in a safe public place.</li>
                                <li>• Check the item properly before paying.</li>
                                <li>• Avoid sending money before seeing the item.</li>
                                <li>• Report suspicious adverts to QOT support.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}