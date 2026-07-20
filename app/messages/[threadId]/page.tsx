import { redirect } from "next/navigation";

type PageProps = {
    params: Promise<{
        threadId: string;
    }>;
};

export default async function LegacyMessageThreadPage({ params }: PageProps) {
    const { threadId } = await params;

    redirect(`/account/messages/${threadId}`);
}
