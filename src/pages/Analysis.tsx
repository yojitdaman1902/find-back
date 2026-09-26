import { useEffect, useState } from "react";
import { BrainCircuit, Check, Circle, Image, MapPinned, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell, GlassCard } from "@/components/findback-ui";

const steps = [
  { label: "Understanding item details", icon: Sparkles },
  { label: "Analyzing image features", icon: Image },
  { label: "Comparing campus reports", icon: Search },
  { label: "Calculating match scores", icon: BrainCircuit },
  { label: "Finding best matches", icon: MapPinned },
];
export default function Analysis() {
  const navigate = useNavigate(); const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => { if (value >= steps.length - 1) { window.clearInterval(timer); window.setTimeout(() => navigate("/matches"), 650); return value; } return value + 1; }), 680); return () => window.clearInterval(timer); }, [navigate]);
  return <AppShell><div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-4xl items-center justify-center px-5 py-16 sm:px-8"><div className="w-full max-w-xl text-center"><div className="relative mx-auto mb-10 grid size-28 place-items-center rounded-[36px] border border-blue-300/20 bg-blue-300/[0.08] shadow-[0_0_80px_rgba(91,140,255,.2)]"><span className="absolute inset-2 animate-ping rounded-[28px] border border-blue-300/20" /><BrainCircuit className="relative size-12 text-[#91b3ff]" strokeWidth={1.4} /></div><p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">FindBack intelligence</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">Connecting the dots<span className="text-blue-300">.</span></h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">Our local matching engine is weighing semantic clues, visual signals, time, and location.</p><GlassCard className="mt-10 p-5 text-left sm:p-7"><div className="space-y-5">{steps.map(({ label, icon: Icon }, index) => { const done = index < active; const current = index === active; return <div key={label} className="flex items-center gap-4"><span className={`grid size-9 shrink-0 place-items-center rounded-xl border transition ${done ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300" : current ? "border-blue-300/35 bg-blue-300/10 text-blue-200" : "border-white/10 bg-white/[0.03] text-slate-600"}`}>{done ? <Check className="size-4" /> : current ? <Icon className="size-4 animate-pulse" /> : <Circle className="size-3" />}</span><span className={`text-sm ${done || current ? "text-slate-200" : "text-slate-600"}`}>{label}</span>{current && <span className="ml-auto flex gap-1"><i className="size-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-.2s]" /><i className="size-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-.1s]" /><i className="size-1.5 animate-bounce rounded-full bg-blue-300" /></span>}</div>; })}</div><div className="mt-7 h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 transition-all duration-500" style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></div></GlassCard></div></div></AppShell>;
}
