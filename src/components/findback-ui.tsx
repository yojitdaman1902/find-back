import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Bell, Check, ChevronRight, Compass, LayoutDashboard, LogIn, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="relative grid size-10 place-items-center rounded-[14px] border border-blue-300/25 bg-blue-400/10 shadow-[0_0_25px_rgba(91,140,255,.18)]">
        <Compass className="size-5 text-[#75a4ff] transition-transform duration-500 group-hover:rotate-45" strokeWidth={2.2} />
        <span className="absolute bottom-2 right-2 size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
      </span>
      {!compact && <span className="text-[17px] font-semibold tracking-[-0.03em] text-white">Find<span className="text-[#7da7ff]">Back</span></span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  return (
    <div className="min-h-screen overflow-hidden bg-[#070b16] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_18%_4%,rgba(91,140,255,.14),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(139,92,246,.1),transparent_24%)]" />
      <header className="relative z-20 border-b border-white/[0.07] bg-[#070b16]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <Link className={cn("rounded-full px-4 py-2 text-sm transition-colors", location.pathname === "/" ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white")} to="/">Discover</Link>
            <Link className={cn("rounded-full px-4 py-2 text-sm transition-colors", isDashboard ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white")} to="/dashboard">My activity</Link>
            <Link className="rounded-full px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white" to="/dashboard#safety">Safety center</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="hidden size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:text-white sm:grid"><Bell className="size-4" /></button>
            <Link to="/auth/sign-in" className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-300/30 hover:bg-white/[0.06] hover:text-white sm:flex"><LogIn className="size-4" /> Sign in</Link>
            <Link to="/report/lost" className="grid size-10 place-items-center rounded-full bg-[#5b8cff] text-white shadow-[0_8px_25px_rgba(91,140,255,.22)] transition hover:bg-[#76a1ff] sm:hidden"><Plus className="size-5" /></Link>
          </div>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.07] px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3"><Logo compact /><span>© 2025 FindBack</span></div>
        <div className="flex gap-5"><span>Privacy first</span><span>Built for campus communities</span></div>
      </footer>
    </div>
  );
}

export function Eyebrow({ children, icon: Icon = Sparkles }: { children: React.ReactNode; icon?: typeof Sparkles }) {
  return <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a9c4ff]"><Icon className="size-3.5" /> {children}</div>;
}

export function PageIntro({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: React.ReactNode }) {
  return <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><Eyebrow>{eyebrow}</Eyebrow><h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{body}</p></div>{action}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const active = status === "Potential Match" || status === "Verified";
  const recovered = status === "Recovered";
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", recovered ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : active ? "border-blue-300/20 bg-blue-300/10 text-blue-200" : "border-white/10 bg-white/[0.06] text-slate-400")}><span className={cn("size-1.5 rounded-full", recovered ? "bg-emerald-300" : active ? "bg-[#79a2ff]" : "bg-slate-500")} />{status}</span>;
}

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "size-36 text-4xl" : size === "md" ? "size-20 text-xl" : "size-12 text-sm";
  return <div className={cn("relative grid shrink-0 place-items-center rounded-full border border-blue-300/25 bg-[#0e1830] font-semibold text-white", dims)}><div className="absolute inset-1 rounded-full border border-dashed border-blue-300/25" /><span>{score}%</span><span className="absolute -bottom-2 rounded-full border border-blue-300/20 bg-[#111b34] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-blue-200">match</span></div>;
}

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-[24px] border border-white/[0.09] bg-white/[0.045] shadow-[0_18px_60px_rgba(0,0,0,.18)] backdrop-blur-xl", className)}>{children}</div>;
}

export function PrimaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; className?: string }) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-full bg-[#5b8cff] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(91,140,255,.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#78a1ff] disabled:cursor-not-allowed disabled:opacity-60", className)} {...props}>{children}</button>;
}

export function SecondaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; className?: string }) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-white/[0.08]", className)} {...props}>{children}</button>;
}

export function LinkButton({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) {
  return <Link to={to} className={cn("inline-flex items-center justify-center gap-2 rounded-full bg-[#5b8cff] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(91,140,255,.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#78a1ff]", className)}>{children}</Link>;
}

export function SectionArrow() { return <ChevronRight className="size-4 text-slate-500" />; }
export function ArrowLink({ children, to }: { children: React.ReactNode; to: string }) { return <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-[#a9c4ff] transition hover:text-white">{children}<ArrowRight className="size-4" /></Link>; }
export function CheckIcon() { return <span className="grid size-5 place-items-center rounded-full bg-emerald-300/15 text-emerald-300"><Check className="size-3" /></span>; }
export function SearchIcon() { return <Search className="size-4" />; }
export function DashboardIcon() { return <LayoutDashboard className="size-4" />; }
export function ShieldIcon() { return <ShieldCheck className="size-4" />; }
