"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faUserPlus, faUsers, faXmark } from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "@/components/account/UserAvatar";

function getArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getName(user: any) {
    return user?.business_name || user?.full_name || "QOT member";
}

export default function SellerFollowCard({
    sellerId,
    initialFollowers = 0,
    initialFollowing = 0,
}: {
    sellerId: string;
    initialFollowers?: number;
    initialFollowing?: number;
}) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(initialFollowers);
    const [followingCount, setFollowingCount] = useState(initialFollowing);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [listMode, setListMode] = useState<"followers" | "following" | null>(null);
    const [people, setPeople] = useState<any[]>([]);
    const [peopleLoading, setPeopleLoading] = useState(false);

    useEffect(() => {
        async function loadPersonalState() {
            const [sellerResponse, meResponse] = await Promise.allSettled([
                fetch(`/api/proxy/sellers/${sellerId}/`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            if (sellerResponse.status === "fulfilled" && sellerResponse.value.ok) {
                const seller = await sellerResponse.value.json();
                setIsFollowing(seller?.is_following === true);
                setFollowersCount(Number(seller?.followers_count || 0));
                setFollowingCount(Number(seller?.following_count || 0));
            }

            if (meResponse.status === "fulfilled" && meResponse.value.ok) {
                const payload = await meResponse.value.json();
                const me = payload?.user || payload?.data || payload;
                setIsOwnProfile(String(me?.id) === String(sellerId));
            }
        }

        loadPersonalState();
    }, [sellerId]);

    async function toggleFollow() {
        setSaving(true);
        setError("");

        try {
            const response = await fetch(`/api/proxy/sellers/${sellerId}/follow/`, {
                method: isFollowing ? "DELETE" : "POST",
                credentials: "include",
                headers: isFollowing ? undefined : { "Content-Type": "application/json" },
                body: isFollowing ? undefined : "{}",
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = `/login?next=/sellers/${sellerId}`;
                return;
            }

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.detail || "Failed to update follow status.");

            setIsFollowing(data?.is_following === true);
            setFollowersCount(Number(data?.followers_count || 0));
            setFollowingCount(Number(data?.following_count || 0));
        } catch (err: any) {
            setError(err.message || "Failed to update follow status.");
        } finally {
            setSaving(false);
        }
    }

    async function openPeople(mode: "followers" | "following") {
        setListMode(mode);
        setPeople([]);
        setPeopleLoading(true);

        try {
            const response = await fetch(`/api/proxy/sellers/${sellerId}/${mode}/?page_size=100`, {
                credentials: "include",
                cache: "no-store",
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.detail || `Failed to load ${mode}.`);
            setPeople(getArray(data));
        } catch (err: any) {
            setError(err.message || `Failed to load ${mode}.`);
        } finally {
            setPeopleLoading(false);
        }
    }

    return (
        <>
            <div className="grid gap-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => openPeople("followers")} className="rounded-2xl bg-orange-50 px-4 py-3 text-left ring-1 ring-orange-100 transition hover:bg-orange-100">
                        <span className="block text-xl font-black text-slate-950">{followersCount.toLocaleString()}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-600">Followers</span>
                    </button>
                    <button type="button" onClick={() => openPeople("following")} className="rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100 transition hover:bg-slate-100">
                        <span className="block text-xl font-black text-slate-950">{followingCount.toLocaleString()}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Following</span>
                    </button>
                </div>

                {isOwnProfile ? (
                    <a href="/account" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">
                        Edit your profile
                    </a>
                ) : (
                    <button type="button" onClick={toggleFollow} disabled={saving} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition disabled:opacity-60 ${isFollowing ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.22)] hover:bg-orange-600"}`}>
                        <FontAwesomeIcon icon={isFollowing ? faUserCheck : faUserPlus} className="h-4 w-4" />
                        {saving ? "Saving..." : isFollowing ? "Following" : "Follow seller"}
                    </button>
                )}

                {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
            </div>

            {listMode && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setListMode(null);
                }}>
                    <section className="max-h-[78vh] w-full max-w-lg overflow-hidden rounded-[28px] bg-white text-slate-950 shadow-2xl">
                        <header className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><FontAwesomeIcon icon={faUsers} className="h-5 w-5" /></span>
                                <div>
                                    <h2 className="text-xl font-black capitalize">{listMode}</h2>
                                    <p className="text-xs font-semibold text-slate-500">People connected through QOT</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setListMode(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Close"><FontAwesomeIcon icon={faXmark} className="h-4 w-4" /></button>
                        </header>

                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {peopleLoading ? (
                                <p className="p-6 text-center text-sm font-bold text-slate-500">Loading {listMode}...</p>
                            ) : people.length === 0 ? (
                                <p className="p-6 text-center text-sm font-bold text-slate-500">No {listMode} yet.</p>
                            ) : (
                                <div className="grid gap-2">
                                    {people.map((person) => (
                                        <a key={person.id} href={`/sellers/${person.id}`} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-orange-50">
                                            <UserAvatar
                                                user={person}
                                                name={getName(person)}
                                                className="h-12 w-12 rounded-2xl bg-orange-500 text-sm text-white"
                                            />
                                            <span className="min-w-0">
                                                <span className="block truncate font-black text-slate-900">{getName(person)}</span>
                                                {person.business_name && person.full_name && <span className="block truncate text-xs font-semibold text-slate-500">{person.full_name}</span>}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
