import AdminListingDetailClient from "@/components/admin/AdminListingDetailClient";

export default async function AdminAdDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <AdminListingDetailClient listingId={id} />;
}
