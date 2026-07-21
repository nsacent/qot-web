import type { ReactNode } from "react";
import Link from "next/link";
import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";

type SectionLink = {
    id: string;
    label: string;
};

type LegalPageShellProps = {
    eyebrow: string;
    title: string;
    summary: string;
    updated: string;
    sections: SectionLink[];
    children: ReactNode;
};

export function LegalSection({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-28 border-b border-slate-100 pb-9 last:border-0 last:pb-0">
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                {title}
            </h2>
            <div className="mt-4 space-y-4 text-sm font-medium leading-7 text-slate-600 sm:text-[15px]">
                {children}
            </div>
        </section>
    );
}

export function LegalList({ children }: { children: ReactNode }) {
    return (
        <ul className="grid gap-3 pl-1">
            {children}
        </ul>
    );
}

export function LegalListItem({ children }: { children: ReactNode }) {
    return (
        <li className="flex gap-3">
            <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
            <span>{children}</span>
        </li>
    );
}

export default function LegalPageShell({
    eyebrow,
    title,
    summary,
    updated,
    sections,
    children,
}: LegalPageShellProps) {
    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-950">
            <QotMarketplaceNav />

            <section className="border-b border-slate-200/80 bg-white">
                <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 ring-1 ring-orange-100">
                            {eyebrow}
                        </span>
                        <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
                            {summary}
                        </p>
                        <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Effective and last updated: {updated}
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-14">
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            On this page
                        </p>
                        <nav aria-label={`${title} sections`} className="mt-4 grid gap-1.5">
                            {sections.map((section, index) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-xs font-bold leading-5 text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
                                >
                                    <span className="mt-0.5 text-[10px] font-black text-slate-300 group-hover:text-orange-400">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    {section.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-4 rounded-[26px] bg-slate-950 p-5 text-white shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-300">
                            Questions or requests?
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                            Contact QOT Uganda about these terms or your personal information.
                        </p>
                        <a href="mailto:info@qot.ug" className="mt-4 block text-sm font-black text-white hover:text-orange-300">
                            info@qot.ug
                        </a>
                        <a href="tel:+256200911678" className="mt-2 block text-sm font-black text-white hover:text-orange-300">
                            0200 911 678
                        </a>
                    </div>
                </aside>

                <article className="space-y-9 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-9 lg:p-11">
                    {children}

                    <div className="rounded-[22px] bg-orange-50 p-5 ring-1 ring-orange-100 sm:flex sm:items-center sm:justify-between sm:gap-6">
                        <div>
                            <p className="text-sm font-black text-slate-950">QOT Uganda legal documents</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                                Review both documents to understand your rights and responsibilities.
                            </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
                            <Link href="/privacy" className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 ring-1 ring-orange-200 hover:text-orange-700">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-600">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </article>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
