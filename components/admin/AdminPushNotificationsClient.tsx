"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faBullhorn,
    faCheck,
    faClockRotateLeft,
    faMagnifyingGlass,
    faMobileScreen,
    faPaperPlane,
    faTriangleExclamation,
    faUsers,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "@/lib/apiClient";
import {
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminStatCard,
} from "@/components/admin/AdminUi";

type Audience = "all" | "android" | "ios" | "selected";
type DeliveryType = "announcement" | "marketing";

type PushSummary = {
    active_devices: number;
    android_devices: number;
    ios_devices: number;
};

type Broadcast = {
    id: number;
    title: string;
    message: string;
    audience: Audience;
    audience_label: string;
    delivery_type: DeliveryType;
    delivery_type_label: string;
    action_url: string;
    created_by_name: string;
    matched_users: number;
    targeted_devices: number;
    accepted_devices: number;
    rejected_devices: number;
    created_at: string;
};

type AdminUser = {
    id: number;
    full_name: string;
    phone?: string;
    email?: string;
};

const audienceOptions: Array<{
    value: Audience;
    label: string;
    description: string;
}> = [
    { value: "all", label: "All users", description: "Every active QOT account" },
    { value: "android", label: "Android", description: "Registered Android devices" },
    { value: "ios", label: "iOS", description: "Registered iPhone devices" },
    { value: "selected", label: "Selected", description: "Choose specific members" },
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function getResults<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value;
    if (
        value &&
        typeof value === "object" &&
        "results" in value &&
        Array.isArray((value as { results?: unknown }).results)
    ) {
        return (value as { results: T[] }).results;
    }
    return [];
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminPushNotificationsClient() {
    const [summary, setSummary] = useState<PushSummary | null>(null);
    const [history, setHistory] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [audience, setAudience] = useState<Audience>("all");
    const [deliveryType, setDeliveryType] = useState<DeliveryType>("announcement");
    const [destination, setDestination] = useState<"notifications" | "ad" | "message">("notifications");
    const [destinationId, setDestinationId] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<AdminUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    async function loadDashboard() {
        setLoading(true);
        setError("");
        try {
            const data = await apiGet<{ summary: PushSummary; results: Broadcast[] }>(
                "/admin-panel/push-notifications/"
            );
            setSummary(data.summary);
            setHistory(data.results || []);
        } catch (loadError: unknown) {
            setError(errorMessage(loadError, "Unable to load push notifications."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, []);

    useEffect(() => {
        if (audience !== "selected" || userSearch.trim().length < 2) {
            return;
        }

        const timeout = window.setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const data = await apiGet(
                    `/admin-panel/users/?search=${encodeURIComponent(userSearch.trim())}`
                );
                const selectedIds = new Set(selectedUsers.map((user) => user.id));
                setUserResults(
                    getResults<AdminUser>(data)
                        .filter((user) => !selectedIds.has(user.id))
                        .slice(0, 8)
                );
            } catch {
                setUserResults([]);
            } finally {
                setSearchingUsers(false);
            }
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [audience, userSearch, selectedUsers]);

    const actionUrl = useMemo(() => {
        if (destination === "ad" && destinationId.trim()) {
            return `qot://ads/${destinationId.trim()}`;
        }
        if (destination === "message" && destinationId.trim()) {
            return `qot://messages/${destinationId.trim()}`;
        }
        return "qot://notifications";
    }, [destination, destinationId]);

    const formError = useMemo(() => {
        if (!title.trim()) return "Add a notification title.";
        if (!message.trim()) return "Add a notification message.";
        if (audience === "selected" && selectedUsers.length === 0) {
            return "Select at least one user.";
        }
        if (destination !== "notifications" && !/^\d+$/.test(destinationId.trim())) {
            return `Enter a valid ${destination === "ad" ? "ad" : "conversation"} ID.`;
        }
        return "";
    }, [title, message, audience, selectedUsers, destination, destinationId]);

    function requestConfirmation(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (formError) {
            setError(formError);
            return;
        }
        setConfirmOpen(true);
    }

    async function sendBroadcast() {
        setSending(true);
        setError("");
        try {
            const sent = await apiPost<Broadcast>(
                "/admin-panel/push-notifications/",
                {
                    title: title.trim(),
                    message: message.trim(),
                    audience,
                    delivery_type: deliveryType,
                    action_url: actionUrl,
                    user_ids: selectedUsers.map((user) => user.id),
                }
            );
            setHistory((current) => [sent, ...current].slice(0, 30));
            setSuccess(
                `${sent.matched_users.toLocaleString()} users notified; ` +
                `${sent.accepted_devices.toLocaleString()} device deliveries accepted.`
            );
            setTitle("");
            setMessage("");
            setDestination("notifications");
            setDestinationId("");
            setSelectedUsers([]);
            setConfirmOpen(false);
            await loadDashboard();
        } catch (sendError: unknown) {
            setConfirmOpen(false);
            setError(errorMessage(sendError, "The notification could not be sent."));
        } finally {
            setSending(false);
        }
    }

    if (loading && !summary) {
        return <AdminLoadingState label="Opening notification centre…" />;
    }

    if (error && !summary) {
        return <AdminErrorState message={error} onRetry={loadDashboard} />;
    }

    return (
        <>
            <AdminPageHeader
                eyebrow="Member engagement"
                title="Push notifications"
                description="Send timely QOT updates to registered devices and keep a clear delivery history."
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <AdminStatCard label="Active devices" value={summary?.active_devices || 0} detail="Ready for push delivery" icon={faMobileScreen} tone="orange" />
                <AdminStatCard label="Android" value={summary?.android_devices || 0} detail="FCM-enabled devices" icon={faBell} tone="green" />
                <AdminStatCard label="iOS" value={summary?.ios_devices || 0} detail="Registered Apple devices" icon={faMobileScreen} tone="blue" />
            </div>

            {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2 h-4 w-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />
                    {success}
                </div>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
                <form onSubmit={requestConfirmation} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                            <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-slate-950">Create notification</h3>
                            <p className="text-xs font-semibold text-slate-500">Recipients see this in the app and notification centre.</p>
                        </div>
                    </div>

                    <label className="mt-6 block text-xs font-black uppercase tracking-wider text-slate-500">Audience</label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {audienceOptions.map((option) => (
                            <button key={option.value} type="button" onClick={() => setAudience(option.value)} className={`rounded-2xl border p-4 text-left transition ${audience === option.value ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100" : "border-slate-200 hover:border-slate-300"}`}>
                                <span className="block text-sm font-black text-slate-900">{option.label}</span>
                                <span className="mt-1 block text-xs font-semibold text-slate-500">{option.description}</span>
                            </button>
                        ))}
                    </div>

                    {audience === "selected" && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <div className="relative">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name, phone or email" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-orange-400" />
                            </div>
                            {userSearch.trim().length >= 2 && (searchingUsers || userResults.length > 0) && (
                                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                    {searchingUsers ? <p className="p-3 text-xs font-bold text-slate-500">Searching…</p> : userResults.map((user) => (
                                        <button key={user.id} type="button" onClick={() => { setSelectedUsers((current) => [...current, user]); setUserSearch(""); }} className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-orange-50">
                                            <span><span className="block text-sm font-black text-slate-800">{user.full_name}</span><span className="block text-[11px] font-semibold text-slate-500">{user.phone || user.email || `User #${user.id}`}</span></span>
                                            <span className="text-xs font-black text-orange-600">Add</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedUsers.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedUsers.map((user) => (
                                        <span key={user.id} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                                            {user.full_name}
                                            <button type="button" aria-label={`Remove ${user.full_name}`} onClick={() => setSelectedUsers((current) => current.filter((item) => item.id !== user.id))}><FontAwesomeIcon icon={faXmark} className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="block"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Delivery type</span><select value={deliveryType} onChange={(event) => setDeliveryType(event.target.value as DeliveryType)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-orange-400"><option value="announcement">Service announcement</option><option value="marketing">Marketing (opted-in users)</option></select></label>
                        <label className="block"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Opens</span><select value={destination} onChange={(event) => setDestination(event.target.value as typeof destination)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-orange-400"><option value="notifications">Notification centre</option><option value="ad">A specific ad</option><option value="message">A conversation</option></select></label>
                    </div>
                    {destination !== "notifications" && <input inputMode="numeric" value={destinationId} onChange={(event) => setDestinationId(event.target.value.replace(/\D/g, ""))} placeholder={destination === "ad" ? "Ad ID" : "Conversation ID"} className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-orange-400" />}

                    <label className="mt-5 block"><span className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500"><span>Title</span><span>{title.length}/150</span></span><input maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short, clear headline" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-orange-400" /></label>
                    <label className="mt-4 block"><span className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500"><span>Message</span><span>{message.length}/500</span></span><textarea maxLength={500} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell members what changed and what they should do next." className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-orange-400" /></label>

                    <button type="submit" disabled={sending} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"><FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />Review and send</button>
                </form>

                <div>
                    <div className="sticky top-28 rounded-[28px] bg-slate-950 p-5 text-white shadow-xl sm:p-7">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Live preview</p>
                        <div className="mt-5 rounded-[24px] bg-slate-100 p-4 text-slate-950">
                            <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"><FontAwesomeIcon icon={faBell} className="h-4 w-4" /></span>
                                <span className="min-w-0"><span className="block text-xs font-black text-slate-400">QOT • now</span><span className="mt-1 block break-words text-sm font-black text-slate-950">{title.trim() || "Your notification title"}</span><span className="mt-1 block break-words text-xs font-semibold leading-5 text-slate-600">{message.trim() || "Your message will appear here before you send it."}</span></span>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-300"><FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5 text-orange-400" />{audienceOptions.find((option) => option.value === audience)?.label}{audience === "selected" ? ` • ${selectedUsers.length} selected` : ""}</div>
                        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-300"><FontAwesomeIcon icon={deliveryType === "marketing" ? faBullhorn : faBell} className="h-3.5 w-3.5 text-orange-400" />{deliveryType === "marketing" ? "Only marketing opt-ins" : "Important service update"}</div>
                    </div>
                </div>
            </div>

            <section className="mt-7 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><FontAwesomeIcon icon={faClockRotateLeft} className="h-4 w-4" /></span><div><h3 className="text-lg font-black text-slate-950">Recent sends</h3><p className="text-xs font-semibold text-slate-500">Latest 30 admin broadcasts</p></div></div>
                <div className="mt-5 grid gap-3">
                    {history.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-bold text-slate-500">No push notifications have been sent yet.</p> : history.map((item) => (
                        <article key={item.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700">{item.audience_label}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">{item.delivery_type_label}</span></div><h4 className="mt-3 text-sm font-black text-slate-950">{item.title}</h4><p className="mt-1 max-w-3xl text-xs font-semibold leading-5 text-slate-600">{item.message}</p></div><p className="shrink-0 text-[11px] font-bold text-slate-400">{formatDate(item.created_at)}</p></div>
                            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><span><strong className="block text-base font-black text-slate-950">{item.matched_users}</strong><small className="text-[10px] font-bold uppercase text-slate-400">Users</small></span><span><strong className="block text-base font-black text-emerald-600">{item.accepted_devices}</strong><small className="text-[10px] font-bold uppercase text-slate-400">Accepted</small></span><span><strong className="block text-base font-black text-red-500">{item.rejected_devices}</strong><small className="text-[10px] font-bold uppercase text-slate-400">Rejected</small></span></div>
                            <p className="mt-3 text-[10px] font-bold text-slate-400">Sent by {item.created_by_name || "QOT admin"}</p>
                        </article>
                    ))}
                </div>
            </section>

            {confirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !sending) setConfirmOpen(false); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="push-confirm-title" className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><FontAwesomeIcon icon={faPaperPlane} className="h-5 w-5" /></span>
                        <h3 id="push-confirm-title" className="mt-5 text-xl font-black text-slate-950">Send this notification?</h3>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">This immediately creates an in-app alert and sends push notifications to the selected audience.</p>
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{message}</p></div>
                        <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={sending} onClick={() => setConfirmOpen(false)} className="min-h-12 rounded-2xl border border-slate-200 text-sm font-black text-slate-700 disabled:opacity-50">Cancel</button><button type="button" disabled={sending} onClick={sendBroadcast} className="min-h-12 rounded-2xl bg-orange-500 text-sm font-black text-white disabled:opacity-60">{sending ? "Sending…" : "Send now"}</button></div>
                    </div>
                </div>
            )}
        </>
    );
}
