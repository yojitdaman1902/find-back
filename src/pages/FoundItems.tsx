import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, MapPin, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell, Eyebrow, GlassCard, PrimaryButton, SecondaryButton } from "@/components/findback-ui";
import { useFindBackData } from "@/components/FindBackDataProvider";
import { getPotentialMatchCount, getPublicFoundDescription, type ItemReport } from "@/lib/findback-data";

const categories = ["All", "Electronics", "Bags", "Documents", "Accessories", "Clothing", "Keys", "Books", "Other"];
const dateFilters = ["Any time", "Last 7 days", "Last 30 days"];
const sortOptions = ["Most Recent", "Oldest", "Most Potential Matches"];

type SortOption = (typeof sortOptions)[number];

type CatalogItem = ItemReport & { potentialMatches: number };

function dateValue(report: ItemReport) {
  const parsed = new Date(`${report.date} ${report.time}`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function displayDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function ItemStatus({ status }: { status: ItemReport["status"] }) {
  const recovered = status === "Recovered";
  const potential = status === "Potential Match";
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${recovered ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : potential ? "border-blue-300/20 bg-blue-300/10 text-blue-200" : "border-white/10 bg-white/[0.06] text-slate-400"}`}><span className={`size-1.5 rounded-full ${recovered ? "bg-emerald-300" : potential ? "bg-blue-300" : "bg-slate-500"}`} />{recovered ? "Recovered" : potential ? "Potential Match" : "Found"}</span>;
}

function SkeletonCard() {
  return <GlassCard className="overflow-hidden"><div className="aspect-[16/10] animate-pulse bg-white/[0.06]" /><div className="space-y-4 p-5"><div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.08]" /><div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.08]" /><div className="h-10 animate-pulse rounded bg-white/[0.06]" /><div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.06]" /><div className="h-10 animate-pulse rounded-full bg-white/[0.08]" /></div></GlassCard>;
}

function FoundItemCard({ item, onOpen }: { item: CatalogItem; onOpen: () => void }) {
  return <GlassCard className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:shadow-[0_22px_70px_rgba(37,99,235,.16)]"><button onClick={onOpen} className="block w-full text-left" aria-label={`View details for ${item.itemName}`}><div className="relative aspect-[16/10] overflow-hidden bg-[#101a30]"><img src={item.images[0]} alt={item.itemName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-[#07101f]/10" /><span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#091326]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100 backdrop-blur-md">{item.category}</span><span className="absolute right-4 top-4"><ItemStatus status={item.status} /></span></div><div className="space-y-4 p-5"><div><h2 className="text-lg font-semibold tracking-[-0.03em] text-white">{item.itemName}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{getPublicFoundDescription(item)}</p></div><div className="space-y-2 text-xs text-slate-500"><p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-blue-300" />{item.location}</p><p className="flex items-center gap-2"><Clock3 className="size-3.5 shrink-0 text-purple-300" />{displayDate(item.date)} <span className="text-slate-700">•</span> {item.time}</p></div><div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.potentialMatches > 0 ? "text-purple-200" : "text-slate-600"}`}><Sparkles className="size-3.5" />{item.potentialMatches > 0 ? `${item.potentialMatches} Possible Match${item.potentialMatches === 1 ? "" : "es"}` : "No matches yet"}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-200 transition group-hover:text-white">View Details <span aria-hidden="true">→</span></span></div></div></button></GlassCard>;
}

function ItemDetails({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#020611]/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={`${item.itemName} details`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0b1427] shadow-[0_30px_100px_rgba(0,0,0,.55)]"><div className="relative aspect-[16/8] bg-[#101a30]"><img src={item.images[0]} alt={item.itemName} className="h-full w-full object-cover" /><button onClick={onClose} aria-label="Close details" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/15 bg-[#07101f]/80 text-slate-200 backdrop-blur-md transition hover:bg-white/15"><X className="size-4" /></button></div><div className="space-y-6 p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">{item.category}</span><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{item.itemName}</h2></div><ItemStatus status={item.status} /></div><p className="max-w-2xl text-sm leading-7 text-slate-300">{getPublicFoundDescription(item)}</p><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Found at</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-200"><MapPin className="size-4 text-blue-300" />{item.location}</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Date and time</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-200"><CalendarDays className="size-4 text-purple-300" />{displayDate(item.date)} <span className="text-slate-700">•</span> {item.time}</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Reported by</p><p className="mt-2 text-sm text-slate-200">{item.finderFirstName ? item.finderFirstName : "A campus community member"}</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Matching activity</p><p className="mt-2 flex items-center gap-2 text-sm text-purple-200"><Sparkles className="size-4" />{item.potentialMatches} possible match{item.potentialMatches === 1 ? "" : "es"}</p></div></div><div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><p className="text-sm font-semibold text-emerald-100">Privacy-first ownership checks</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Private identifying details are kept hidden. We’ll ask you to verify details only you would know.</p></div></div></div><div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-end"><SecondaryButton onClick={onClose}>Keep browsing</SecondaryButton><PrimaryButton onClick={() => navigate(item.id === "catalog-backpack" ? "/matches/match-backpack" : "/matches")}>Prove This Is Mine <ShieldCheck className="size-4" /></PrimaryButton></div></div></div></div>;
}

export default function FoundItems() {
  const navigate = useNavigate();
  const { sharedReports, isLoading } = useFindBackData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All locations");
  const [dateFilter, setDateFilter] = useState("Any time");
  const [sort, setSort] = useState<SortOption>("Most Recent");
  const [potentialOnly, setPotentialOnly] = useState(false);
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  const foundReports = useMemo(() => sharedReports.filter((report) => report.type === "found"), [sharedReports]);
  const catalogItems = useMemo(() => foundReports.map((report) => ({ ...report, potentialMatches: getPotentialMatchCount(report, sharedReports) })), [foundReports, sharedReports]);
  const locations = useMemo(() => ["All locations", ...Array.from(new Set(foundReports.map((item) => item.location.split("—")[0].trim())))], [foundReports]);
  const maxDate = useMemo(() => Math.max(...catalogItems.map(dateValue), 0), [catalogItems]);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = catalogItems.filter((item) => {
      const haystack = `${item.itemName} ${item.category} ${getPublicFoundDescription(item)} ${item.location}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesCategory = category === "All" || item.category === category;
      const matchesLocation = location === "All locations" || item.location.startsWith(location);
      const age = maxDate - dateValue(item);
      const matchesDate = dateFilter === "Any time" || (dateFilter === "Last 7 days" ? age <= 7 * 24 * 60 * 60 * 1000 : age <= 30 * 24 * 60 * 60 * 1000);
      const matchesPotential = !potentialOnly || item.potentialMatches > 0 || item.status === "Potential Match";
      return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesPotential;
    });
    return items.sort((left, right) => sort === "Oldest" ? dateValue(left) - dateValue(right) : sort === "Most Potential Matches" ? right.potentialMatches - left.potentialMatches : dateValue(right) - dateValue(left));
  }, [catalogItems, category, dateFilter, location, maxDate, potentialOnly, search, sort]);

  const clearFilters = () => { setSearch(""); setCategory("All"); setLocation("All locations"); setDateFilter("Any time"); setSort("Most Recent"); setPotentialOnly(false); };
  const activeFilters = category !== "All" || location !== "All locations" || dateFilter !== "Any time" || potentialOnly || Boolean(search);

  return <AppShell><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><Eyebrow icon={Sparkles}>Campus found items</Eyebrow><h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">Found Items</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Browse items found across campus and help reunite them with their owners.</p></div><PrimaryButton onClick={() => navigate("/report/found")}>Report a found item <span aria-hidden="true">+</span></PrimaryButton></div><div className="relative mb-7 max-w-3xl"><Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-blue-200" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search found items…" className="h-14 w-full rounded-2xl border border-blue-300/20 bg-white/[0.06] pl-14 pr-5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50 focus:bg-white/[0.08]" /></div><div className="mb-10 grid gap-3 sm:grid-cols-3"><GlassCard className="border-blue-300/15 bg-blue-300/[0.06] p-4"><p className="text-2xl font-semibold text-white">31</p><p className="mt-1 text-xs text-slate-400">Found Items</p></GlassCard><GlassCard className="border-purple-300/15 bg-purple-300/[0.06] p-4"><p className="text-2xl font-semibold text-white">8</p><p className="mt-1 text-xs text-slate-400">Potential Matches</p></GlassCard><GlassCard className="border-emerald-300/15 bg-emerald-300/[0.05] p-4"><p className="text-2xl font-semibold text-white">5</p><p className="mt-1 text-xs text-slate-400">Recovered</p></GlassCard></div><GlassCard className="mb-10 p-4 sm:p-5"><div className="flex flex-col gap-4"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((option) => <button key={option} onClick={() => setCategory(option)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === option ? "bg-[#5b8cff] text-white shadow-[0_6px_20px_rgba(91,140,255,.2)]" : "border border-white/10 bg-white/[0.035] text-slate-400 hover:border-blue-300/25 hover:text-white"}`}>{option}</button>)}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><select value={location} onChange={(event) => setLocation(event.target.value)} className="field-input pl-9">{locations.map((option) => <option key={option}>{option}</option>)}</select></label><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="field-input pl-9">{dateFilters.map((option) => <option key={option}>{option}</option>)}</select></label><label className="relative"><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="field-input appearance-none">{sortOptions.map((option) => <option key={option}>{option}</option>)}</select></label><button onClick={() => setPotentialOnly((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${potentialOnly ? "border-purple-300/35 bg-purple-300/10 text-purple-100" : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-purple-300/25 hover:text-white"}`}><Sparkles className="size-3.5" />Potential Match</button></div></div></GlassCard><div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-slate-300">{isLoading ? "Loading found reports" : `${filteredItems.length} item${filteredItems.length === 1 ? "" : "s"} to explore`}</p><p className="mt-1 text-xs text-slate-600">Public details are intentionally general to protect owners and finders.</p></div>{activeFilters && <button onClick={clearFilters} className="text-xs font-semibold text-blue-200 transition hover:text-white">Clear all filters</button>}</div>{isLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : filteredItems.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredItems.map((item) => <FoundItemCard key={item.id} item={item} onOpen={() => setSelected(item)} />)}</div> : <GlassCard className="px-6 py-20 text-center"><span className="mx-auto grid size-16 place-items-center rounded-3xl border border-blue-300/15 bg-blue-300/[0.07] text-blue-200"><Search className="size-7" /></span><h2 className="mt-6 text-xl font-semibold text-white">No found items match your search.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Try changing your filters or search terms.</p><SecondaryButton onClick={clearFilters} className="mt-6">Clear Filters</SecondaryButton></GlassCard>}<div className="mt-12 flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><p className="text-sm font-semibold text-slate-200">Privacy is part of the handoff.</p><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">We keep private contents, exact identifying marks, and finder contact details out of this public catalog. Ownership is confirmed through a private verification flow.</p></div></div></div>{selected && <ItemDetails item={selected} onClose={() => setSelected(null)} />}</AppShell>;
}
