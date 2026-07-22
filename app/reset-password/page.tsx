import { redirect } from "next/navigation";

type LegacyResetPasswordPageProps = {
    searchParams: Promise<{
        uid?: string | string[];
        token?: string | string[];
    }>;
};

function firstValue(value?: string | string[]) {
    return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function LegacyResetPasswordPage({
    searchParams,
}: LegacyResetPasswordPageProps) {
    const params = await searchParams;
    const query = new URLSearchParams();
    const uid = firstValue(params.uid);
    const token = firstValue(params.token);

    if (uid) query.set("uid", uid);
    if (token) query.set("token", token);

    const queryString = query.toString();
    redirect(`/account/reset-password${queryString ? `?${queryString}` : ""}`);
}
