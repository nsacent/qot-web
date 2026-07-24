import { redirect } from "next/navigation";

export default async function LegacyMyAdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    redirect(`/account/my-ads/${id}`);
}
