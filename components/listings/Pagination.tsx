import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

type PaginationProps = {
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalCount?: number;
    pageSize?: number;
    searchParams: Record<string, string | undefined>;
};

function buildPageUrl(
    page: number,
    searchParams: Record<string, string | undefined>
) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });

    if (page > 1) {
        params.set("page", String(page));
    } else {
        params.delete("page");
    }

    const query = params.toString();
    return query ? `/ads?${query}` : "/ads";
}

function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | string> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("ellipsis-start");

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < totalPages - 1) pages.push("ellipsis-end");
    pages.push(totalPages);

    return pages;
}

export default function Pagination({
    currentPage,
    hasNext,
    hasPrevious,
    totalCount,
    pageSize = 16,
    searchParams,
}: PaginationProps) {
    if (!hasNext && !hasPrevious) return null;

    const safeCurrentPage = Number.isFinite(currentPage)
        ? Math.max(1, Math.floor(currentPage))
        : 1;
    const totalPages = Math.max(
        safeCurrentPage,
        totalCount !== undefined
            ? Math.ceil(totalCount / pageSize)
            : safeCurrentPage + (hasNext ? 1 : 0),
        1
    );
    const firstResult = totalCount === 0
        ? 0
        : (safeCurrentPage - 1) * pageSize + 1;
    const lastResult = totalCount !== undefined
        ? Math.min(safeCurrentPage * pageSize, totalCount)
        : safeCurrentPage * pageSize;
    const visiblePages = getVisiblePages(safeCurrentPage, totalPages);
    const progress = Math.min(100, (safeCurrentPage / totalPages) * 100);

    return (
        <nav
            aria-label="Ads pagination"
            className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_14px_42px_rgba(15,23,42,0.07)] ring-1 ring-black/5"
        >
            <div className="h-1 bg-slate-100">
                <div
                    className="h-full rounded-r-full bg-gradient-to-r from-orange-400 to-orange-600 transition-[width]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                        Page {safeCurrentPage} of {totalPages}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                        {totalCount !== undefined
                            ? `Showing ${firstResult.toLocaleString()}–${lastResult.toLocaleString()} of ${totalCount.toLocaleString()} ads`
                            : `Showing page ${safeCurrentPage}`}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    {hasPrevious ? (
                        <a
                            href={buildPageUrl(safeCurrentPage - 1, searchParams)}
                            aria-label="Go to previous page"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-950 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Previous</span>
                        </a>
                    ) : (
                        <span
                            aria-disabled="true"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 text-sm font-black text-slate-300"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Previous</span>
                        </span>
                    )}

                    <div className="hidden items-center gap-1.5 sm:flex">
                        {visiblePages.map((page) =>
                            typeof page === "number" ? (
                                page === safeCurrentPage ? (
                                    <span
                                        key={page}
                                        aria-current="page"
                                        className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-orange-500 px-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]"
                                    >
                                        {page}
                                    </span>
                                ) : (
                                    <a
                                        key={page}
                                        href={buildPageUrl(page, searchParams)}
                                        aria-label={`Go to page ${page}`}
                                        className="flex h-11 min-w-11 items-center justify-center rounded-2xl px-3 text-sm font-black text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        {page}
                                    </a>
                                )
                            ) : (
                                <span
                                    key={page}
                                    aria-hidden="true"
                                    className="flex h-11 w-7 items-center justify-center text-sm font-black text-slate-300"
                                >
                                    ···
                                </span>
                            )
                        )}
                    </div>

                    <span className="px-2 text-xs font-black text-slate-500 sm:hidden">
                        {safeCurrentPage} / {totalPages}
                    </span>

                    {hasNext ? (
                        <a
                            href={buildPageUrl(safeCurrentPage + 1, searchParams)}
                            aria-label="Go to next page"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-black text-white shadow-[0_8px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-600"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                        </a>
                    ) : (
                        <span
                            aria-disabled="true"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 text-sm font-black text-slate-300"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
}
