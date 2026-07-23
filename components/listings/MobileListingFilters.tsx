"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import ListingFilters from "./ListingFilters";

export default function MobileListingFilters(props: React.ComponentProps<typeof ListingFilters>) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previous; };
    }, [open]);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white lg:hidden">
                <FontAwesomeIcon icon={faSliders} className="h-4 w-4 text-orange-400" />Filter ads
            </button>
            {mounted && open && createPortal(
                <div className="fixed inset-0 z-[140] bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Filter ads">
                    <ListingFilters {...props} variant="mobile" onClose={() => setOpen(false)} />
                </div>,
                document.body
            )}
        </>
    );
}
