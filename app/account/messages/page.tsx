import MessagesClient from "@/components/chats/MessagesClient";
import RequireAccountSession from "@/components/account/RequireAccountSession";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

export default function AccountMessagesPage() {
    return (
        <RequireAccountSession>
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />

                <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-6 py-7 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:px-8">
                    <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-orange-500/20 blur-3xl" />
                    <div className="relative">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Account inbox</p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Conversations that move deals forward.</h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                            Keep every buyer and seller conversation organized, secure, and easy to return to.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl py-6">
                    <MessagesClient />
                </section>
            </div>
            <QotMarketplaceFooter />
        </main>
        </RequireAccountSession>
    );
}
