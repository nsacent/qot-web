"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

type PaginationControlsProps = {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    itemLabel?: string;
    loading?: boolean;
    onPageChange: (page: number) => void;
};

function visiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | string> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("ellipsis-start");
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push("ellipsis-end");
    pages.push(totalPages);

    return pages;
}

export default function PaginationControls({
    currentPage,
    pageSize,
    totalCount,
    itemLabel = "items",
    loading = false,
    onPageChange,
}: PaginationControlsProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (totalPages <= 1) return null;

    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const firstItem = (safePage - 1) * pageSize + 1;
    const lastItem = Math.min(safePage * pageSize, totalCount);
    const pages = visiblePages(safePage, totalPages);

    return (
        <nav
            aria-label={`${itemLabel} pagination`}
            className="mt-6 flex flex-col gap-3 rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900">{firstItem.toLocaleString()}–{lastItem.toLocaleString()}</span> of{" "}
                <span className="text-slate-900">{totalCount.toLocaleString()}</span> {itemLabel}
            </p>

            <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safePage === 1 || loading}
                    onClick={() => onPageChange(safePage - 1)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                    {pages.map((page) =>
                        typeof page === "number" ? (
                            <button
                                key={page}
                                type="button"
                                aria-label={`Page ${page}`}
                                aria-current={page === safePage ? "page" : undefined}
                                disabled={loading}
                                onClick={() => onPageChange(page)}
                                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-xs font-black transition ${
                                    page === safePage
                                        ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                                        : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={page} aria-hidden="true" className="px-1 text-xs font-black text-slate-300">
                                ···
                            </span>
                        )
                    )}
                </div>

                <span className="px-2 text-xs font-black text-slate-500 sm:hidden">
                    {safePage} / {totalPages}
                </span>

                <button
                    type="button"
                    aria-label="Next page"
                    disabled={safePage === totalPages || loading}
                    onClick={() => onPageChange(safePage + 1)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <span className="hidden sm:inline">Next</span>
                    <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
                </button>
            </div>
        </nav>
    );
}
