"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faCommentDots,
    faCopy,
    faPhone,
    faPhoneVolume,
    faShieldHalved,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

type SellerContactActionsProps = {
    listing: any;
    compact?: boolean;
};

function getPhone(listing: any) {
    return (
        listing?.seller?.phone ||
        listing?.seller?.phone_number ||
        listing?.seller_phone ||
        listing?.phone ||
        listing?.contact_phone ||
        listing?.whatsapp ||
        listing?.seller?.whatsapp ||
        ""
    );
}

function getSellerName(listing: any) {
    return (
        listing?.seller?.business_name ||
        listing?.seller?.shop_name ||
        listing?.seller?.company_name ||
        listing?.seller?.full_name ||
        listing?.seller?.name ||
        listing?.seller?.username ||
        listing?.seller_name ||
        "Seller"
    );
}

function cleanPhone(phone: string) {
    return String(phone || "").replace(/\s+/g, "");
}

function getWhatsAppPhone(phone: string) {
    const cleaned = cleanPhone(phone);

    if (cleaned.startsWith("+")) {
        return cleaned.replace("+", "");
    }

    if (cleaned.startsWith("0")) {
        return `256${cleaned.slice(1)}`;
    }

    return cleaned;
}

export default function SellerContactActions({
    listing,
    compact = false,
}: SellerContactActionsProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const phone = getPhone(listing);
    const sellerName = getSellerName(listing);
    const cleanedPhone = cleanPhone(phone);
    const whatsappPhone = getWhatsAppPhone(phone);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [open]);

    function closeModal() {
        setOpen(false);
        setCopied(false);
    }

    async function copyPhone() {
        if (!phone) return;

        try {
            await navigator.clipboard.writeText(phone);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch {
            alert("Failed to copy phone number.");
        }
    }


    const buttonClass = compact
        ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700"
        : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-green-600 px-4 text-sm font-black text-white ring-1 ring-green-100 transition hover:bg-green-700";

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-green-600 ring-1 ring-green-100">
                    <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
                </span>

                Show Contact
            </button>
            {mounted && open
                ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
                        <div
                            className="absolute inset-0"
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        <div className="relative w-full max-w-lg overflow-hidden rounded-[34px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                                        <FontAwesomeIcon icon={faPhoneVolume} className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-slate-950">
                                            Contact seller
                                        </h2>
                                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                            Reach {sellerName} safely through the available contact
                                            options.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6">
                                {phone ? (
                                    <>
                                        <div className="rounded-[26px] bg-slate-50 p-5 ring-1 ring-slate-100">
                                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                                Seller phone
                                            </p>

                                            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                                {phone}
                                            </p>

                                            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                                                Call only when you are serious about the ad. Meet in a
                                                safe public place and inspect the item before payment.
                                            </p>
                                        </div>

                                        <div className="mt-5 grid gap-3">
                                            <a
                                                href={`tel:${cleanedPhone}`}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-green-600 px-4 text-sm font-black text-white hover:bg-green-700"
                                            >
                                                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                                                Call Seller
                                            </a>

                                            <a
                                                href={`https://wa.me/${whatsappPhone}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faCommentDots}
                                                    className="h-4 w-4"
                                                />
                                                WhatsApp Seller
                                            </a>

                                            <button
                                                type="button"
                                                onClick={copyPhone}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-green-50 hover:text-green-700"
                                            >
                                                <FontAwesomeIcon
                                                    icon={copied ? faCheck : faCopy}
                                                    className="h-4 w-4"
                                                />
                                                {copied ? "Phone Copied" : "Copy Phone"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="rounded-[26px] bg-orange-50 p-5 text-center ring-1 ring-orange-100">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white">
                                                <FontAwesomeIcon
                                                    icon={faShieldHalved}
                                                    className="h-5 w-5"
                                                />
                                            </div>

                                            <p className="mt-4 text-lg font-black text-slate-950">
                                                Phone not available
                                            </p>

                                            <p className="mt-2 text-sm font-bold leading-6 text-orange-700">
                                                This seller has not added a visible phone number. Use
                                                chat to contact the seller through QOT.
                                            </p>
                                        </div>

                                        <a
                                            href="/messages"
                                            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                        >
                                            <FontAwesomeIcon
                                                icon={faCommentDots}
                                                className="h-4 w-4"
                                            />
                                            Go to Messages
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
                : null}
        </>
    );
}