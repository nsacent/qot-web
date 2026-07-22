import { permanentRedirect } from "next/navigation";

export default async function LegacyAdminListingEditRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    permanentRedirect(`/admin/ads/${id}/edit`);
}
