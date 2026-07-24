import MyAdViewClient from "@/app/my-ads/[id]/MyAdViewClient";

export const dynamic = "force-dynamic";

export default async function AccountMyAdViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <MyAdViewClient id={id} />;
}
