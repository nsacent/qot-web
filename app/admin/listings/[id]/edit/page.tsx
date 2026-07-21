import AdminListingEditClient from "@/components/admin/AdminListingEditClient";

export default async function AdminListingEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <AdminListingEditClient listingId={id} />;
}
