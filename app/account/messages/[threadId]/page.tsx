import ThreadMessagesClient from "@/components/chats/ThreadMessagesClient";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

type PageProps = {
    params: Promise<{
        threadId: string;
    }>;
};

export default async function AccountMessageThreadPage({ params }: PageProps) {
    const { threadId } = await params;

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />
                <div className="mx-auto max-w-5xl py-3 sm:py-6">
                    <ThreadMessagesClient threadId={threadId} />
                </div>
            </div>
            <QotMarketplaceFooter />
        </main>
    );
}
