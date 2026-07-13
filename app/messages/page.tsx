import Navbar from "@/components/layout/QotMarketplaceNav";
import MessagesClient from "@/components/chats/MessagesClient";

export default function MessagesPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="text-3xl font-bold md:text-5xl">Messages</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">
                        View your conversations with buyers and sellers.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <MessagesClient />
            </section>
        </main>
    );
}