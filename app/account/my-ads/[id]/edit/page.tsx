import EditAdClient from "@/app/my-ads/[id]/edit/EditAdClient";

export const dynamic = "force-dynamic";

export default async function AccountEditMyAdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <section className="py-2 sm:py-3">
            <div className="mb-4 px-1 sm:flex sm:items-end sm:justify-between sm:gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                        Manage your advert
                    </p>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Edit Ad
                    </h1>
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-500 sm:mt-0">
                    Start with photos, update the essentials, then preview.
                </p>
            </div>
            <EditAdClient id={id} />
        </section>
    );
}
