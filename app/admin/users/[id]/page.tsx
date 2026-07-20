import AdminUserDetailClient from "@/components/admin/AdminUserDetailClient";

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <AdminUserDetailClient userId={id} />;
}
