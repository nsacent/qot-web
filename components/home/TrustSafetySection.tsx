const items = [
    {
        title: "Verified sellers",
        description:
            "QOT highlights seller trust signals to help buyers make safer decisions.",
    },
    {
        title: "Local marketplace",
        description:
            "Browse adverts from sellers around Uganda, filtered by category and location.",
    },
    {
        title: "Chat before payment",
        description:
            "Contact sellers directly, ask questions, and confirm details before meeting.",
    },
    {
        title: "Safety-first buying",
        description:
            "Meet in public places, inspect items, and avoid sending money before viewing.",
    },
];

export default function TrustSafetySection() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Trust & Safety
                    </p>
                    <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                        Built for safer local buying and selling
                    </h2>
                    <p className="mt-3 text-slate-600">
                        QOT gives buyers and sellers simple tools to discover, compare, chat,
                        and trade more confidently.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border bg-slate-50 p-6"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-orange-600">
                                ✓
                            </div>
                            <h3 className="font-bold text-slate-900">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}