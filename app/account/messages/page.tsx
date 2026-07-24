import MessagesClient from "@/components/chats/MessagesClient";

export default function AccountMessagesPage() {
    return (
        <section className="rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-black/5 sm:p-5">
            <div className="mb-4 px-1 pt-1">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">
                    Account inbox
                </p>
                <h1 className="mt-1 text-2xl font-black text-slate-950">
                    Messages
                </h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                    Keep buyer and seller conversations in one place.
                </p>
            </div>
            <MessagesClient />
        </section>
    );
}
