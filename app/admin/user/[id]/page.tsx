import { redirect } from "next/navigation";

export default async function AdminUserRoute({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    redirect(`/admin/users/${id}`);
}
