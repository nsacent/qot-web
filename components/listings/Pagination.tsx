type PaginationProps = {
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalCount?: number;
    searchParams: Record<string, string | undefined>;
};

function buildPageUrl(
    page: number,
    searchParams: Record<string, string | undefined>
) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    if (page > 1) {
        params.set("page", String(page));
    } else {
        params.delete("page");
    }

    return `/ads?${params.toString()}`;
}

export default function Pagination({
    currentPage,
    hasNext,
    hasPrevious,
    totalCount,
    searchParams,
}: PaginationProps) {
    if (!hasNext && !hasPrevious) return null;

    return (
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-4 sm:flex-row">
            <div className="text-sm text-slate-600">
                Page <span className="font-semibold">{currentPage}</span>
                {totalCount !== undefined && (
                    <>
                        {" "}
                        • <span className="font-semibold">{totalCount}</span> adverts found
                    </>
                )}
            </div>

            <div className="flex items-center gap-3">
                {hasPrevious ? (
                    <a
                        href={buildPageUrl(Math.max(currentPage - 1, 1), searchParams)}
                        className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                        ← Previous
                    </a>
                ) : (
                    <span className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-300">
                        ← Previous
                    </span>
                )}

                {hasNext ? (
                    <a
                        href={buildPageUrl(currentPage + 1, searchParams)}
                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Next →
                    </a>
                ) : (
                    <span className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-300">
                        Next →
                    </span>
                )}
            </div>
        </div>
    );
}
