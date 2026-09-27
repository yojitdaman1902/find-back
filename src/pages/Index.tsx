import { ArrowUpRight, CheckCircle2, Clock3, MapPin, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLink, AppShell, Eyebrow, GlassCard, LinkButton, SectionArrow } from "@/components/findback-ui";
import { demoMatches, itemImages } from "@/lib/findback-data";

const steps = [
  { number: "01", icon: Search, title: "Tell us what happened", body: "Add a few details about what you lost or found, including where and when." },
  { number: "02", icon: MapPin, title: "See nearby possibilities", body: "FindBack brings the most relevant reports together so you do less scrolling." },
  { number: "03", icon: ShieldCheck, title: "Verify and reconnect", body: "Answer private questions, then coordinate a safe handoff in chat." },
];

const Index = () => {
  return <AppShell>
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-24 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
        <div className="max-w-2xl">
          <Eyebrow icon={MapPin}>Campus lost & found</Eyebrow>
          <h1 className="max-w-2xl text-[3.25rem] font-semibold leading-[1.02] tracking-[-0.075em] text-white sm:text-7xl">Lost something?<br /><span className="text-[#9fbaff]">Let&apos;s get it home.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">A simple place for students to report lost and found belongings, spot a possible match, and reconnect safely.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><LinkButton to="/report/lost">Report something lost <ArrowUpRight className="size-4" /></LinkButton><Link to="/report/found" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]">Report something found <ArrowUpRight className="size-4" /></Link></div>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" />Built for campus communities</span><span className="hidden size-1 rounded-full bg-slate-700 sm:block" /><span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-blue-300" />Private by design</span></div>
        </div>
        <div className="relative lg:pl-6">
          <GlassCard className="relative overflow-hidden border-white/[0.12] bg-[#0d1628] p-3">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[18px] bg-[#18243a]"><img src={itemImages.backpack} alt="Black backpack in a campus library" className="h-full w-full object-cover opacity-80" /><div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#07101f]/90 p-4 backdrop-blur-md"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-medium text-emerald-300">Found near the library</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Black Nike Backpack</h2><p className="mt-1 text-sm text-slate-400">Reported 27 minutes apart</p></div><div className="shrink-0 text-right"><p className="text-2xl font-semibold text-white">94%</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">match strength</p></div></div></div></div>
            <div className="flex items-center justify-between px-2 pb-1 pt-4"><div className="flex items-center gap-2 text-xs text-slate-400"><Clock3 className="size-3.5 text-blue-300" />Library · 2nd Floor</div><Link aria-label="View backpack match" to="/matches/match-backpack" className="flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-blue-300/30 hover:bg-white/10"><ArrowUpRight className="size-4" /></Link></div>
          </GlassCard>
          <p className="mt-4 text-center text-xs text-slate-600 lg:text-left lg:pl-5">A real match starts with a few useful details.</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-7 max-w-xl"><Eyebrow icon={CheckCircle2}>How it works</Eyebrow><h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Less searching. More getting things back.</h2><p className="mt-3 text-sm leading-6 text-slate-500">FindBack keeps the process clear for both sides of the handoff.</p></div><div className="grid gap-4 md:grid-cols-3">{steps.map(({ number, icon: Icon, title, body }) => <GlassCard key={number} className="p-6"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-blue-200">{number}</span><span className="grid size-10 place-items-center rounded-xl bg-white/[0.06] text-blue-200"><Icon className="size-4" /></span></div><h3 className="mt-7 font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></GlassCard>)}</div></section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-7 flex items-end justify-between"><div><Eyebrow icon={MapPin}>From the community</Eyebrow><h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Recent possible matches</h2><p className="mt-2 text-sm text-slate-500">A little context can go a long way.</p></div><ArrowLink to="/matches">View all matches</ArrowLink></div><div className="grid gap-4 lg:grid-cols-3">{demoMatches.map((match) => <Link key={match.id} to={`/matches/${match.id}`} className="group"><GlassCard className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-blue-300/25"><div className="relative h-48 overflow-hidden"><img src={match.image} alt={match.itemName} className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" /><div className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#07101f]/85 px-3 py-1.5 text-[11px] font-medium text-slate-200">{match.score}% match</div></div><div className="p-4"><div className="flex items-center justify-between text-xs text-slate-500"><span>{match.location}</span><span>{match.date}</span></div><h3 className="mt-3 font-semibold text-white">{match.itemName}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{match.explanation}</p><div className="mt-4 flex items-center justify-between text-xs font-medium text-blue-200"><span>See why it matches</span><SectionArrow /></div></div></GlassCard></Link>)}</div></section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><GlassCard className="border-emerald-300/15 bg-[#0c1b20] p-7 sm:p-10"><div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><p className="text-sm font-medium text-emerald-300">Found something that isn&apos;t yours?</p><h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">One small report could make someone&apos;s week.</h2></div><LinkButton to="/report/found" className="bg-emerald-400 text-[#07151a] shadow-[0_10px_30px_rgba(110,231,183,.18)] hover:bg-emerald-300">Help return an item <ArrowUpRight className="size-4" /></LinkButton></div></GlassCard></section>
  </AppShell>;
};
export default Index;
