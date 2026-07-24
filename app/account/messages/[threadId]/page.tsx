import ThreadMessagesClient from "@/components/chats/ThreadMessagesClient";

type PageProps = {
    params: Promise<{
        threadId: string;
    }>;
};

export default async function AccountMessageThreadPage({ params }: PageProps) {
    const { threadId } = await params;

    return (
        <div className="mx-auto max-w-5xl">
            <ThreadMessagesClient threadId={threadId} />
        </div>
    );
}
