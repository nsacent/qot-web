import { permanentRedirect } from "next/navigation";

export default async function LegacyAdminListingRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    permanentRedirect(`/admin/ads/${id}`);
}
