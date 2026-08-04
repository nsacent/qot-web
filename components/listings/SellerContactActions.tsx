"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
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
    listing: SellerContactListing;
    compact?: boolean;
};

type SellerContactListing = {
    seller?: {
        phone?: string;
        phone_number?: string;
        whatsapp?: string;
        alternative_phone?: string;
        business_name?: string;
        shop_name?: string;
        company_name?: string;
        full_name?: string;
        name?: string;
        username?: string;
        profile?: {
            alternative_phone?: string;
        };
    };
    seller_phone?: string;
    seller_alternative_phone?: string;
    seller_name?: string;
    phone?: string;
    contact_phone?: string;
    whatsapp?: string;
    alternative_phone?: string;
};

function getPhone(listing: SellerContactListing) {
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

function getAlternativePhone(listing: SellerContactListing) {
    return (
        listing?.seller?.profile?.alternative_phone ||
        listing?.seller?.alternative_phone ||
        listing?.seller_alternative_phone ||
        listing?.alternative_phone ||
        ""
    );
}

function getSellerName(listing: SellerContactListing) {
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

function phoneKey(phone: string) {
    const digits = cleanPhone(phone).replace(/\D/g, "");
    if (digits.startsWith("0")) return `256${digits.slice(1)}`;
    return digits;
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
    const [open, setOpen] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState("");

    const primaryPhone = getPhone(listing);
    const alternativePhone = getAlternativePhone(listing);
    const sellerName = getSellerName(listing);
    const contacts = [
        { label: "Primary contact", phone: primaryPhone },
        { label: "Alternative contact", phone: alternativePhone },
    ].filter((contact, index, allContacts) => {
        if (!contact.phone) return false;
        const key = phoneKey(contact.phone);
        return allContacts.findIndex((item) => phoneKey(item.phone) === key) === index;
    });

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
        setCopiedPhone("");
    }

    async function copyPhone(phone: string) {
        if (!phone) return;

        try {
            await navigator.clipboard.writeText(phone);
            setCopiedPhone(phoneKey(phone));

            window.setTimeout(() => {
                setCopiedPhone("");
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
            {open
                ? createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
                        <div
                            className="absolute inset-0"
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:rounded-[34px]">
                            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
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
                                    aria-label="Close contact details"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4 sm:p-6">
                                {contacts.length > 0 ? (
                                    <>
                                        <div className="grid gap-3">
                                            {contacts.map((contact) => {
                                                const cleanedPhone = cleanPhone(contact.phone);
                                                const whatsappPhone = getWhatsAppPhone(contact.phone);
                                                const copied = copiedPhone === phoneKey(contact.phone);

                                                return (
                                                    <div
                                                        key={`${contact.label}-${phoneKey(contact.phone)}`}
                                                        className="rounded-[22px] bg-slate-50 p-4 ring-1 ring-slate-100 sm:p-5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                                                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                                                    {contact.label}
                                                                </p>
                                                                <p className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                                                    {contact.phone}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                                            <a
                                                                href={`tel:${cleanedPhone}`}
                                                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-2 text-[11px] font-black text-white hover:bg-green-700"
                                                            >
                                                                <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
                                                                Call
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${whatsappPhone}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-2 text-[11px] font-black text-white hover:bg-slate-800"
                                                            >
                                                                <FontAwesomeIcon icon={faCommentDots} className="h-3.5 w-3.5" />
                                                                WhatsApp
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyPhone(contact.phone)}
                                                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-2 text-[11px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-green-50 hover:text-green-700"
                                                            >
                                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="h-3.5 w-3.5" />
                                                                {copied ? "Copied" : "Copy"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-xs font-bold leading-5 text-orange-800 ring-1 ring-orange-100">
                                            Meet in a safe public place and inspect the item before making payment.
                                        </p>
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

                                        <Link
                                            href="/account/messages"
                                            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800"
                                        >
                                            <FontAwesomeIcon
                                                icon={faCommentDots}
                                                className="h-4 w-4"
                                            />
                                            Go to Messages
                                        </Link>
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
