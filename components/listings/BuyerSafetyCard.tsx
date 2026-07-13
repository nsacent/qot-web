type BuyerSafetyCardProps = {
    listingId?: string | number;
};

export default function BuyerSafetyCard({ listingId }: BuyerSafetyCardProps) {
    const reportHref = listingId
        ? `/safety/report?listing=${listingId}`
        : "/safety/report";

    return (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                Buyer Safety
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
                Stay safe before making payment
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• Meet the seller in a safe public place.</li>
                <li>• Inspect the item carefully before paying.</li>
                <li>• Do not send money before confirming the item.</li>
                <li>• Be careful with deals that look too cheap.</li>
                <li>• Report suspicious adverts immediately.</li>
            </ul>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                    href="/safety/report"
                    className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-center text-sm font-semibold text-orange-700 hover:bg-orange-100"
                >
                    Safety Center
                </a>

                <a
                    href={reportHref}
                    className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                >
                    Report Advert
                </a>
            </div>
        </div>
    );
}