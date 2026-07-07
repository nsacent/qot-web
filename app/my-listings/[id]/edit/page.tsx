import Navbar from "@/components/layout/Navbar";
import EditListingForm from "@/components/dashboard/EditListingForm";
import ListingImageManager from "@/components/dashboard/ListingImageManager";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
    searchParams?: Promise<{
        images?: string;
    }>;
};

export default async function EditListingPage({
    params,
    searchParams,
}: PageProps) {
    const { id } = await params;
    const query = searchParams ? await searchParams : {};
    const showImageNotice = query?.images === "1";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="mx-auto max-w-4xl px-6 py-12">
                <a
                    href="/my-listings"
                    className="mb-6 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    ← Back to my listings
                </a>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold md:text-5xl">Edit Listing</h1>

                    <p className="mt-3 text-slate-600">
                        Update advert details, price, condition, status, and images.
                    </p>
                </div>

                {showImageNotice && (
                    <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
                        <p className="font-bold">Advert created successfully.</p>

                        <p className="mt-1 text-sm">
                            Now upload clear images for this advert. Listings with good images
                            attract more buyers and look more trustworthy.
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                        <EditListingForm listingId={id} />
                    </div>

                    <ListingImageManager listingId={id} />
                </div>
            </section>
        </main>
    );
}