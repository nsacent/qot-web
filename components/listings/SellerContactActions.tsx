"use client";

import { useState } from "react";

type SellerContactActionsProps = {
    listing: any;
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
}: SellerContactActionsProps) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const phone = getPhone(listing);
    const cleanedPhone = cleanPhone(phone);

    async function copyPhone() {
        try {
            await navigator.clipboard.writeText(phone);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            alert("Failed to copy phone number.");
        }
    }

    if (!phone) {
        return (
            <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                Seller phone number is not available. Use chat to contact the seller.
            </div>
        );
    }

    if (!revealed) {
        return (
            <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
                Show Seller Phone
            </button>
        );
    }

    return (
        <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Seller Phone</p>

            <p className="mt-2 text-xl font-bold text-slate-900">{phone}</p>

            <div className="mt-4 grid gap-3">
                <a
                    href={`tel:${cleanedPhone}`}
                    className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                >
                    Call Seller
                </a>

                <a
                    href={`https://wa.me/${getWhatsAppPhone(phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700"
                >
                    WhatsApp Seller
                </a>

                <button
                    type="button"
                    onClick={copyPhone}
                    className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                >
                    {copied ? "Phone Copied ✓" : "Copy Phone"}
                </button>
            </div>
        </div>
    );
}