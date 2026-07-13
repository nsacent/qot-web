import Navbar from "@/components/layout/QotMarketplaceNav";
import ThreadMessagesClient from "@/components/chats/ThreadMessagesClient";

type PageProps = {
    params: Promise<{
        threadId: string;
    }>;
};

export default async function MessageThreadPage({ params }: PageProps) {
    const { threadId } = await params;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">Chat</h1>
                    <p className="mt-3 text-slate-600">
                        Continue your conversation safely on QOT.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <ThreadMessagesClient threadId={threadId} />
            </section>
        </main>
    );
}