import QotMarketplaceFooter from "@/components/layout/QotMarketplaceFooter";
import QotMarketplaceNav from "@/components/layout/QotMarketplaceNav";
import UserAvatar from "@/components/account/UserAvatar";
import { apiGet, getArray } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faLocationDot,
    faMagnifyingGlass,
    faShieldHalved,
    faStar,
    faStore,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

type SellersPageProps = {
    searchParams: Promise<{
        search?: string;
        page?: string;
    }>;
};

function sellerName(seller: any) {
    return seller?.business_name || seller?.full_name || "QOT seller";
}

function sellerLocation(seller: any) {
    if (seller?.city_name && seller?.region_name) {
        return `${seller.city_name}, ${seller.region_name}`;
    }

    return seller?.city_name || seller?.region_name || "Uganda";
}

function compactNumber(value: any) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-UG", {
        notation: number >= 1000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(number);
}

export default async function SellersPage({ searchParams }: SellersPageProps) {
    const filters = await searchParams;
    const search = String(filters?.search || "").trim();
    const requestedPage = Number.parseInt(String(filters?.page || "1"), 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const query = new URLSearchParams({
        page: String(page),
        page_size: "24",
    });

    if (search) query.set("search", search);

    let data: any = null;
    let sellers: any[] = [];
    let loadError = false;

    try {
        data = await apiGet(`/sellers/?${query.toString()}`);
        sellers = getArray(data);
    } catch (error) {
        console.error("Sellers directory API error:", error);
        loadError = true;
    }

    const total = Number(data?.count || sellers.length);
    const totalPages = Math.max(1, Math.ceil(total / 24));
    const pageHref = (nextPage: number) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", String(nextPage));
        return `/sellers?${params.toString()}`;
    };

    return (
        <main className="min-h-screen bg-[#fff7f2] text-slate-950 antialiased">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <QotMarketplaceNav />

                <section className="relative mt-4 overflow-hidden rounded-[30px] bg-slate-950 px-6 py-8 text-white shadow-[0_22px_65px_rgba(15,23,42,0.20)] sm:px-9 sm:py-10">
                    <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
                    <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

                    <div className="relative grid items-end gap-7 lg:grid-cols-[1fr_0.72fr]">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200 ring-1 ring-white/15">
                                <FontAwesomeIcon icon={faStore} className="h-3 w-3" />
                                Seller directory
                            </span>
                            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                                Meet trusted sellers
                                <span className="block text-orange-400">across QOT Uganda.</span>
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                                Browse verified sellers rated 3.5 or higher, ranked by the views on their active ads.
                            </p>
                        </div>

                        <form action="/sellers" method="get" className="rounded-[22px] bg-white p-2 text-slate-950 shadow-xl">
                            <label className="flex h-13 items-center gap-3 rounded-[17px] bg-slate-50 px-4 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-orange-300">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-slate-400" />
                                <span className="sr-only">Search sellers</span>
                                <input
                                    type="search"
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Search seller, shop or location"
                                    className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                                />
                                <button type="submit" className="rounded-[13px] bg-orange-500 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-600">
                                    Search
                                </button>
                            </label>
                        </form>
                    </div>
                </section>

                <section className="py-7">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Verified and highly rated</p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                {search ? `Results for “${search}”` : "Sellers with live ads"}
                            </h2>
                        </div>
                        {!loadError && (
                            <p className="text-sm font-bold text-slate-500">
                                {total.toLocaleString("en-UG")} {total === 1 ? "seller" : "sellers"}
                            </p>
                        )}
                    </div>

                    {loadError ? (
                        <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                            <h3 className="text-xl font-black">Sellers are temporarily unavailable</h3>
                            <p className="mt-2 text-sm font-semibold text-slate-500">Please refresh the page and try again.</p>
                        </div>
                    ) : sellers.length === 0 ? (
                        <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-50 text-orange-600">
                                <FontAwesomeIcon icon={faStore} className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 text-xl font-black">No sellers found</h3>
                            <p className="mt-2 text-sm font-semibold text-slate-500">Try another seller name, shop or location.</p>
                            {search && <a href="/sellers" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">View all sellers</a>}
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {sellers.map((seller) => {
                                const name = sellerName(seller);
                                const rating = Number(seller?.average_rating || 0);
                                const reviews = Number(seller?.total_reviews || 0);

                                return (
                                    <article key={seller.id} className="group overflow-hidden rounded-[28px] bg-white shadow-[0_14px_42px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_20px_52px_rgba(15,23,42,0.13)]">
                                        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-800 to-orange-500">
                                            {seller?.cover_photo && <img src={seller.cover_photo} alt="" className="h-full w-full object-cover opacity-75" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                                        </div>

                                        <div className="px-5 pb-5">
                                            <div className="flex items-end justify-between gap-3">
                                                <UserAvatar
                                                    src={seller?.avatar}
                                                    name={name}
                                                    className="-mt-9 h-18 w-18 rounded-[22px] border-4 border-white bg-orange-500 text-xl text-white shadow-lg"
                                                />
                                                {seller?.is_verified && (
                                                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                                                        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" /> Verified
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mt-4 truncate text-xl font-black tracking-tight">{name}</h3>
                                            {seller?.business_name && seller?.full_name && (
                                                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">{seller.full_name}</p>
                                            )}
                                            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-orange-500" />
                                                {sellerLocation(seller)}
                                            </p>

                                            <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[18px] bg-slate-50 ring-1 ring-slate-100">
                                                <div className="p-3 text-center">
                                                    <strong className="block text-base font-black">{compactNumber(seller?.total_active_listings)}</strong>
                                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Ads</span>
                                                </div>
                                                <div className="border-x border-slate-200 p-3 text-center">
                                                    <strong className="block text-base font-black">{compactNumber(seller?.followers_count)}</strong>
                                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-400"><FontAwesomeIcon icon={faUsers} className="h-2.5 w-2.5" /> Followers</span>
                                                </div>
                                                <div className="p-3 text-center">
                                                    <strong className="flex items-center justify-center gap-1 text-base font-black">{reviews ? rating.toFixed(1) : "New"}{reviews > 0 && <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400" />}</strong>
                                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Rating</span>
                                                </div>
                                            </div>

                                            <a href={`/sellers/${seller.id}`} className="mt-4 flex items-center justify-between rounded-[17px] bg-slate-950 px-4 py-3 text-sm font-black text-white transition group-hover:bg-orange-500">
                                                View seller profile
                                                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <nav aria-label="Seller pages" className="mt-7 flex items-center justify-center gap-3">
                            {page > 1 && <a href={pageHref(page - 1)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:text-orange-600">Previous</a>}
                            <span className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Page {page} of {totalPages}</span>
                            {page < totalPages && <a href={pageHref(page + 1)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:text-orange-600">Next</a>}
                        </nav>
                    )}
                </section>
            </div>

            <QotMarketplaceFooter />
        </main>
    );
}
