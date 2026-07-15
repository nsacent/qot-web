"use client";

import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faEnvelope,
    faGear,
    faMobileScreen,
    faRightFromBracket,
    faShieldHalved,
    faUser,
} from "@/lib/faIcons";
import QotLoader from "@/components/common/QotLoader";
import {
    getCurrentUser,
    logoutUser,
    updateCurrentUser,
} from "@/lib/sessionClient";

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function AccountForm() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState<any>(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadUser() {
        try {
            const data = await getCurrentUser();
            const currentUser = getUserObject(data);

            setUser(currentUser);
            setFullName(currentUser?.full_name || "");
            setEmail(currentUser?.email || "");
            setPhone(currentUser?.phone || "");

            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            localStorage.removeItem("qot_access_token");
            localStorage.removeItem("qot_refresh_token");
        } catch {
            window.location.href = "/login?next=/account";
            return;
        } finally {
            setCheckingSession(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await updateCurrentUser({
                full_name: fullName.trim(),
                phone: phone.trim(),
            });

            const freshData = await getCurrentUser();
            const currentUser = getUserObject(freshData);

            setUser(currentUser);
            setFullName(currentUser?.full_name || "");
            setEmail(currentUser?.email || "");
            setPhone(currentUser?.phone || "");

            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            window.dispatchEvent(new Event("storage"));

            setMessage("Profile updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        try {
            await logoutUser();
        } catch {
            // continue clearing local state
        }

        localStorage.removeItem("qot_user");
        localStorage.removeItem("qot_access_token");
        localStorage.removeItem("qot_refresh_token");

        window.dispatchEvent(new Event("storage"));
        window.location.href = "/";
    }

    if (checkingSession) {
        return <QotLoader />;
    }

    const isVerified =
        user?.is_verified === true ||
        user?.email_verified === true ||
        user?.is_email_verified === true;

    return (
        <section className="text-slate-950">
            <div className="mx-auto max-w-[1500px]">
                <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <aside className="flex min-h-[560px] flex-col rounded-[34px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:min-h-[620px] lg:min-h-[calc(100vh-260px)]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-orange-500 text-3xl font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.25)]">
                                {(user?.full_name || user?.email || user?.phone || "Q")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-black text-slate-950">
                                    {user?.full_name || "QOT Member"}
                                </h1>

                                <p className="mt-1 truncate text-sm font-bold text-slate-500">
                                    {user?.email || user?.phone}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                            {isVerified ? (
                                <div className="flex items-center gap-3 text-green-700">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                                        <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <p className="text-sm font-black">Verified account</p>
                                        <p className="text-xs font-semibold text-green-700/80">
                                            Your email is verified.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-orange-700">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100">
                                            <FontAwesomeIcon
                                                icon={faShieldHalved}
                                                className="h-5 w-5"
                                            />
                                        </span>

                                        <div>
                                            <p className="text-sm font-black">Not verified</p>
                                            <p className="text-xs font-semibold text-orange-700/80">
                                                Verify your email to improve trust.
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href="/account/verification"
                                        className="block rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white hover:bg-orange-600"
                                    >
                                        Verify Account
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-1 flex-col">
                            <div className="grid gap-2">
                                <a
                                    href="/my-ads"
                                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    My Ads
                                </a>

                                <a
                                    href="/seller/dashboard"
                                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    Dashboard
                                </a>

                                <a
                                    href="/saved"
                                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    Saved Ads
                                </a>

                                <a
                                    href="/account/settings"
                                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                                >
                                    Account Settings
                                </a>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </aside>

                    <section className="rounded-[34px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                <FontAwesomeIcon icon={faGear} className="h-5 w-5" />
                            </span>

                            <div>
                                <h2 className="text-2xl font-black text-slate-950">
                                    Profile details
                                </h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                    Update your public account information.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="mt-7 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Full name
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-slate-400" />

                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        placeholder="Your full name"
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <div className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Email address
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-slate-100">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <p className="w-full truncate text-sm font-black text-slate-700">
                                        {email || "No email available"}
                                    </p>

                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">
                                        Locked
                                    </span>
                                </div>

                                <p className="mt-2 text-xs font-semibold text-slate-500">
                                    Email cannot be edited because it is used for login, verification, and password reset.
                                </p>
                            </div>
                            <label className="block">
                                <span className="mb-2 block text-sm font-black text-slate-700">
                                    Phone number
                                </span>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                                    <FontAwesomeIcon
                                        icon={faMobileScreen}
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="+256700000001"
                                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </section>
    );
}

export default function AccountClient() {
    return (
        <Suspense fallback={<QotLoader />}>
            <AccountForm />
        </Suspense>
    );
}