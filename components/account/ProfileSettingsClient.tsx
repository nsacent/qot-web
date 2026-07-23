"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera,
    faCircleCheck,
    faClock,
    faEnvelope,
    faLocationDot,
    faPhone,
    faShieldHalved,
    faStore,
    faUser,
    faUsers,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { LocationPickerModal } from "@/components/listings/MarketplacePickerModals";
import QotLoader from "@/components/common/QotLoader";
import { getCurrentUser } from "@/lib/sessionClient";
import { fetchAllProxyPages } from "@/lib/marketplaceCatalog";
import {
    getUgandanNationalNumber,
    toUgandanPhone,
} from "@/lib/ugandanPhone";
import { DEFAULT_TIME_ZONE, TIME_ZONE_OPTIONS } from "@/lib/dateTime";
import UserAvatar from "@/components/account/UserAvatar";

function getUserObject(data: any) {
    return data?.user || data?.data || data;
}

function getCityValue(city: any) {
    return String(city?.id || city?.value || city?.slug || "");
}

function getCityLabel(city: any) {
    return city?.name || city?.title || "City";
}

function getErrorMessage(data: any) {
    if (typeof data?.detail === "string") return data.detail;

    for (const value of Object.values(data || {})) {
        if (Array.isArray(value) && value[0]) return String(value[0]);
        if (typeof value === "string") return value;
    }

    return "Failed to update your profile.";
}

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getMemberName(member: any) {
    return member?.business_name || member?.full_name || "QOT member";
}

export default function ProfileSettingsClient() {
    const [user, setUser] = useState<any>(null);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [bio, setBio] = useState("");
    const [defaultCity, setDefaultCity] = useState("");
    const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TIME_ZONE);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");
    const [connectionMode, setConnectionMode] = useState<"followers" | "following" | null>(null);
    const [connections, setConnections] = useState<any[]>([]);
    const [connectionsLoading, setConnectionsLoading] = useState(false);

    const avatarPreview = useMemo(
        () => (avatarFile ? URL.createObjectURL(avatarFile) : user?.profile?.avatar || ""),
        [avatarFile, user]
    );
    const coverPreview = useMemo(
        () => (coverFile ? URL.createObjectURL(coverFile) : user?.profile?.cover_photo || ""),
        [coverFile, user]
    );
    const selectedCity = useMemo(
        () => cities.find((city) => getCityValue(city) === String(defaultCity)),
        [cities, defaultCity]
    );
    const phoneVerified =
        user?.phone_verified === true || Boolean(user?.phone_verified_at);
    const emailVerified =
        user?.email_verified === true || Boolean(user?.email_verified_at);
    const phoneWasChanged = phone.trim() !== String(user?.phone || "").trim();

    useEffect(() => {
        return () => {
            if (avatarFile && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
            if (coverFile && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
        };
    }, [avatarFile, avatarPreview, coverFile, coverPreview]);

    function applyUser(currentUser: any) {
        setUser(currentUser);
        setFullName(currentUser?.full_name || "");
        setPhone(currentUser?.phone || "");
        setBusinessName(currentUser?.profile?.business_name || "");
        setBio(currentUser?.profile?.bio || "");
        setDefaultCity(String(currentUser?.profile?.default_city || ""));
        setSelectedTimezone(currentUser?.profile?.timezone || DEFAULT_TIME_ZONE);
    }

    useEffect(() => {
        async function loadSettings() {
            try {
                const [userData, cityData] = await Promise.all([
                    getCurrentUser(),
                    fetchAllProxyPages("/locations/cities/?page_size=50"),
                ]);
                applyUser(getUserObject(userData));
                setCities(cityData);
            } catch (err: any) {
                setError(err.message || "Failed to load account settings.");
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    function selectImage(
        event: ChangeEvent<HTMLInputElement>,
        setter: (file: File | null) => void
    ) {
        const file = event.target.files?.[0] || null;
        event.target.value = "";

        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Use a JPG, PNG, or WEBP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Profile images must be 5MB or smaller.");
            return;
        }

        setError("");
        setter(file);
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("full_name", fullName.trim());
            formData.append("phone", phone.trim());
            formData.append("business_name", businessName.trim());
            formData.append("bio", bio.trim());
            if (defaultCity) formData.append("default_city", defaultCity);
            formData.append("timezone", selectedTimezone);
            if (avatarFile) formData.append("avatar", avatarFile);
            if (coverFile) formData.append("cover_photo", coverFile);

            const response = await fetch("/api/proxy/auth/me/", {
                method: "PATCH",
                credentials: "include",
                body: formData,
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error(getErrorMessage(data));

            const freshData = await getCurrentUser();
            const currentUser = getUserObject(freshData);
            applyUser(currentUser);
            setAvatarFile(null);
            setCoverFile(null);
            localStorage.setItem("qot_user", JSON.stringify(currentUser));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("qot_session_updated"));
            setMessage("Profile, default location, and timezone saved.");
        } catch (err: any) {
            setError(err.message || "Failed to update your profile.");
        } finally {
            setSaving(false);
        }
    }

    async function openConnections(mode: "followers" | "following") {
        if (!user?.id) return;

        setConnectionMode(mode);
        setConnections([]);
        setConnectionsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/proxy/sellers/${user.id}/${mode}/?page_size=100`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || `Failed to load ${mode}.`);
            }

            setConnections(getArray(data));
        } catch (err: any) {
            setError(err.message || `Failed to load ${mode}.`);
        } finally {
            setConnectionsLoading(false);
        }
    }

    if (loading) return <QotLoader />;

    return (
        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
            <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-950 sm:h-56">
                {coverPreview && (
                    <img src={coverPreview} alt="Profile cover" className="h-full w-full object-cover" />
                )}
                <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950/75 px-4 py-2 text-xs font-black text-white backdrop-blur hover:bg-slate-950">
                    <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                    Change cover
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => selectImage(event, setCoverFile)}
                    />
                </label>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="relative -mt-20 h-32 w-32 shrink-0 overflow-hidden rounded-[30px] border-4 border-white bg-orange-500 shadow-xl">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-5xl font-black text-white">
                                {(fullName || "Q").charAt(0).toUpperCase()}
                            </span>
                        )}
                        <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1.5 bg-slate-950/80 py-2 text-[11px] font-black text-white">
                            <FontAwesomeIcon icon={faCamera} className="h-3.5 w-3.5" />
                            Photo
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(event) => selectImage(event, setAvatarFile)}
                            />
                        </label>
                    </div>

                    <div className="pb-1">
                        <h2 className="text-2xl font-black text-slate-950">Public profile</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                            Your profile details appear to buyers across QOT Uganda.
                        </p>

                        <div className="mt-4 grid max-w-sm grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => openConnections("followers")}
                                className="rounded-2xl bg-orange-50 px-4 py-3 text-left ring-1 ring-orange-100 transition hover:bg-orange-100"
                            >
                                <span className="block text-xl font-black text-slate-950">
                                    {Number(user?.followers_count || 0).toLocaleString()}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-wide text-orange-600">
                                    Followers
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => openConnections("following")}
                                className="rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100 transition hover:bg-slate-100"
                            >
                                <span className="block text-xl font-black text-slate-950">
                                    {Number(user?.following_count || 0).toLocaleString()}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Following
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div>}
                {message && <div className="mb-5 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 ring-1 ring-green-100"><FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" />{message}</div>}

                <div className="grid gap-5 md:grid-cols-2">
                    <ProfileField label="Full name" icon={faUser}>
                        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required className="w-full bg-transparent text-sm font-bold outline-none" />
                    </ProfileField>
                    <div>
                        <ProfileField label="Phone number" icon={faPhone}>
                            <span className="border-r border-slate-200 pr-3 text-sm font-black text-slate-700">
                                +256
                            </span>
                            <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                value={getUgandanNationalNumber(phone)}
                                onChange={(event) => setPhone(toUgandanPhone(event.target.value))}
                                placeholder="700 000 001"
                                pattern="[0-9]{9}"
                                maxLength={16}
                                className="w-full bg-transparent text-sm font-bold outline-none"
                            />
                        </ProfileField>

                        {phoneWasChanged ? (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                                Save this number before verifying it.
                            </p>
                        ) : phoneVerified ? (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
                                <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" />
                                Phone number verified
                            </p>
                        ) : user?.phone ? (
                            <a
                                href="/account/verification?next=/account"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700"
                            >
                                <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
                                Verify this phone number by SMS →
                            </a>
                        ) : null}
                    </div>
                    <div>
                        <ProfileField label="Email address" icon={faEnvelope}>
                            <input
                                type="email"
                                value={user?.email || ""}
                                readOnly
                                aria-readonly="true"
                                className="w-full cursor-not-allowed bg-transparent text-sm font-bold text-slate-500 outline-none"
                            />
                        </ProfileField>

                        {emailVerified ? (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
                                <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" />
                                Email address verified
                            </p>
                        ) : user?.email ? (
                            <a
                                href="/account/verification?channel=email&next=/account"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-orange-600"
                            >
                                <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
                                Verify email address →
                            </a>
                        ) : null}
                    </div>
                    <ProfileField label="Business name" icon={faStore}>
                        <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Optional business or shop name" className="w-full bg-transparent text-sm font-bold outline-none" />
                    </ProfileField>
                    <div>
                        <p className="mb-2 text-sm font-black text-slate-700">Default ad location</p>
                        <button type="button" onClick={() => setLocationModalOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100 hover:bg-orange-50">
                            <span>
                                <span className="block text-sm font-black text-slate-900">{selectedCity ? getCityLabel(selectedCity) : "Choose a city"}</span>
                                <span className="text-xs font-semibold text-slate-500">Used automatically when posting an ad</span>
                            </span>
                            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 text-orange-500" />
                        </button>
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-black text-slate-700">Timezone</p>
                        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                            <FontAwesomeIcon icon={faClock} className="h-4 w-4 shrink-0 text-orange-500" />
                            <span className="min-w-0 flex-1">
                                <select
                                    value={selectedTimezone}
                                    onChange={(event) => setSelectedTimezone(event.target.value)}
                                    className="w-full bg-transparent text-sm font-black text-slate-900 outline-none"
                                    aria-label="Account timezone"
                                >
                                    {!TIME_ZONE_OPTIONS.some((item) => item.value === selectedTimezone) && (
                                        <option value={selectedTimezone}>{selectedTimezone}</option>
                                    )}
                                    {TIME_ZONE_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                                    Used for dates and account activity
                                </span>
                            </span>
                        </label>
                    </div>
                </div>

                <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-black text-slate-700">About you or your business</span>
                    <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} placeholder="Tell buyers a little about you..." className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-orange-200" />
                </label>

                <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60 sm:w-auto">
                    {saving ? "Saving profile..." : "Save profile"}
                </button>
            </form>

            {connectionMode && (
                <div
                    className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setConnectionMode(null);
                    }}
                >
                    <section className="max-h-[78vh] w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
                        <header className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                    <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="text-xl font-black capitalize text-slate-950">
                                        {connectionMode}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Your QOT connections
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConnectionMode(null)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                                aria-label="Close"
                            >
                                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                            </button>
                        </header>

                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {connectionsLoading ? (
                                <p className="p-6 text-center text-sm font-bold text-slate-500">
                                    Loading {connectionMode}...
                                </p>
                            ) : connections.length === 0 ? (
                                <p className="p-6 text-center text-sm font-bold text-slate-500">
                                    No {connectionMode} yet.
                                </p>
                            ) : (
                                <div className="grid gap-2">
                                    {connections.map((member) => (
                                        <a
                                            key={member.id}
                                            href={`/sellers/${member.id}`}
                                            className="flex items-center gap-3 rounded-2xl p-3 hover:bg-orange-50"
                                        >
                                            <UserAvatar
                                                user={member}
                                                name={getMemberName(member)}
                                                className="h-12 w-12 rounded-2xl bg-orange-500 text-sm text-white"
                                            />
                                            <span className="min-w-0">
                                                <span className="block truncate font-black text-slate-900">
                                                    {getMemberName(member)}
                                                </span>
                                                {member.business_name && member.full_name && (
                                                    <span className="block truncate text-xs font-semibold text-slate-500">
                                                        {member.full_name}
                                                    </span>
                                                )}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            <LocationPickerModal
                open={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                cities={cities}
                selectedValue={defaultCity}
                search={locationSearch}
                setSearch={setLocationSearch}
                onSelect={(value) => {
                    setDefaultCity(value);
                    setLocationSearch("");
                    setLocationModalOpen(false);
                }}
            />
        </section>
    );
}

function ProfileField({ label, icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
            <span className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-orange-200">
                <FontAwesomeIcon icon={icon} className="h-4 w-4 text-slate-400" />
                {children}
            </span>
        </label>
    );
}
