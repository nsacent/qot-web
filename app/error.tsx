"use client";

import { useEffect } from "react";
import QotLogo from "@/components/brand/QotLogo";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-[75vh] items-center justify-center bg-[#fff7f2] px-4 py-12 text-slate-950">
            <section className="w-full max-w-2xl rounded-[34px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 sm:p-12">
                <QotLogo className="mx-auto h-12 w-auto text-orange-500" />
                <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-orange-500">Something went wrong</p>
                <h1 className="mt-3 text-4xl font-black">This page had a problem.</h1>
                <p className="mx-auto mt-4 max-w-lg text-sm font-semibold leading-7 text-slate-500">
                    Your account and advert data are safe. Try loading this section again, or return to the homepage.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <button type="button" onClick={reset} className="rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white hover:bg-orange-600">Try again</button>
                    <a href="/" className="rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-200">Go home</a>
                </div>
            </section>
        </main>
    );
}
