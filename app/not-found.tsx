import QotLogo from "@/components/brand/QotLogo";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fff7f2] px-4 py-12 text-slate-950">
            <section className="w-full max-w-2xl rounded-[34px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 sm:p-12">
                <a href="/" aria-label="QOT Uganda home" className="inline-flex">
                    <QotLogo className="h-12 w-auto text-orange-500" />
                </a>
                <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-orange-500">Error 404</p>
                <h1 className="mt-3 text-4xl font-black sm:text-5xl">We could not find that page.</h1>
                <p className="mx-auto mt-4 max-w-lg text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                    The link may be old, the advert may no longer be available, or the address may be incorrect.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <a href="/" className="rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white hover:bg-orange-600">Go to homepage</a>
                    <a href="/ads" className="rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-200">Browse ads</a>
                </div>
            </section>
        </main>
    );
}
