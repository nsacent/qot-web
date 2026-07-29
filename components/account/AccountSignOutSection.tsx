"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@/lib/faIcons";
import { useAccountShell } from "@/components/account/AccountShell";

export default function AccountSignOutSection() {
    const { logout } = useAccountShell();

    return (
        <section className="mb-28 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-red-100 sm:p-5 md:mb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-black text-slate-950">Sign out of QOT</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                        End your session on this device.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void logout()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 sm:w-auto"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </section>
    );
}
