"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCircleExclamation,
    faShieldHalved,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import QotLoader from "@/components/common/QotLoader";
import {
    deleteCurrentAccount,
    getOptionalCurrentUser,
} from "@/lib/sessionClient";

export default function DeleteAccountClient() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getOptionalCurrentUser()
            .then((currentUser) => active && setUser(currentUser))
            .catch((requestError) => {
                if (active) setError(requestError?.message || "QOT could not check your account session.");
            })
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    async function handleDelete() {
        if (confirmation.trim().toUpperCase() !== "DELETE") {
            setError("Enter DELETE to confirm permanent account deletion.");
            return;
        }

        setDeleting(true);
        setError("");
        try {
            await deleteCurrentAccount();
            localStorage.removeItem("qot_user");
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
            window.dispatchEvent(new Event("qot_session_updated"));
            window.location.href = "/?account_deleted=1";
        } catch (requestError: any) {
            setError(requestError?.message || "Your account could not be deleted. Please try again.");
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return <div className="rounded-[24px] bg-white py-24 shadow-sm ring-1 ring-slate-200"><QotLoader /></div>;
    }

    return (
        <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.09)] ring-1 ring-slate-200">
            <div className="bg-slate-950 p-5 text-white sm:p-8">
                <Link href={user ? "/account/settings" : "/"} className="inline-flex items-center gap-2 text-xs font-black text-slate-300 hover:text-white">
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                    Back
                </Link>
                <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-[17px] bg-red-500/15 text-red-300 ring-1 ring-red-400/20">
                    <FontAwesomeIcon icon={faTrashCan} className="h-6 w-6" />
                </div>
                <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Delete your QOT account</h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300">
                    This permanently removes your account and associated personal data. It is different from temporarily freezing your account.
                </p>
            </div>

            <div className="p-5 sm:p-8">
                <div className="rounded-[18px] bg-red-50 p-4 ring-1 ring-red-100">
                    <div className="flex gap-3">
                        <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
                        <div>
                            <h2 className="text-sm font-black text-red-950">This cannot be undone</h2>
                            <p className="mt-1 text-xs font-semibold leading-5 text-red-800/80">
                                Your profile, ads, drafts, saved items, messages, uploaded images and sign-in sessions will be deleted. Limited records may be retained only where required for security, disputes, payments or law, as explained in our Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>

                {!user ? (
                    <div className="mt-6 rounded-[18px] border border-slate-200 p-5 text-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7 text-orange-500" />
                        <h2 className="mt-3 text-base font-black text-slate-950">Sign in to continue</h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">We need to verify the account owner before permanent deletion.</p>
                        <Link href="/login?next=%2Fdelete-account" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[14px] bg-orange-500 px-6 text-sm font-black text-white hover:bg-orange-600">
                            Sign in to delete account
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6">
                        <p className="text-sm font-black text-slate-950">Account to be deleted</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{user?.full_name || "QOT user"} · {user?.phone || user?.email}</p>
                        <label className="mt-5 block text-xs font-black uppercase tracking-wide text-slate-600" htmlFor="delete-confirmation">Enter DELETE to confirm</label>
                        <input
                            id="delete-confirmation"
                            value={confirmation}
                            onChange={(event) => { setConfirmation(event.target.value); setError(""); }}
                            autoComplete="off"
                            className="mt-2 h-12 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black uppercase outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            placeholder="DELETE"
                        />
                        {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Link href="/account/settings" className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-slate-200 px-5 text-sm font-black text-slate-700 hover:bg-slate-50">Keep my account</Link>
                            <button
                                type="button"
                                disabled={deleting || confirmation.trim().toUpperCase() !== "DELETE"}
                                onClick={() => void handleDelete()}
                                className="min-h-12 rounded-[14px] bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {deleting ? "Deleting account…" : "Delete account forever"}
                            </button>
                        </div>
                    </div>
                )}

                <p className="mt-7 text-center text-xs font-semibold leading-5 text-slate-500">
                    Need help first? Email <a className="font-black text-orange-600" href="mailto:support@qot.ug">support@qot.ug</a> or review the <Link className="font-black text-orange-600" href="/privacy">Privacy Policy</Link>.
                </p>
            </div>
        </section>
    );
}
