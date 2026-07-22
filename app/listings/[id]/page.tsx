import { permanentRedirect } from "next/navigation";

export default async function LegacyListingRedirect({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    permanentRedirect(`/ads/${id}`);
}
