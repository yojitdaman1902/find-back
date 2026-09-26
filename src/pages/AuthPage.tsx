import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const { path = "sign-in" } = useParams();
  const signUp = path === "sign-up";
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate("/", { replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate("/", { replace: true });
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  return <div className="auth-page min-h-screen overflow-hidden bg-[#070b16] text-slate-100"><div className="absolute -left-20 top-10 size-80 rounded-full bg-blue-500/15 blur-3xl" /><div className="absolute bottom-0 right-0 size-96 rounded-full bg-violet-500/10 blur-3xl" /><div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><div className="hidden lg:block"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft className="size-4" /> Back to FindBack</Link><div className="mt-24 max-w-md"><div className="grid size-12 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/10 text-blue-200"><ShieldCheck className="size-6" /></div><h1 className="mt-7 text-5xl font-semibold tracking-[-0.07em] text-white">Your campus,<br /><span className="text-[#86aaff]">a little more connected.</span></h1><p className="mt-6 text-lg leading-8 text-slate-400">Sign in to keep your reports, matches, and recovered items together in one private space.</p></div></div><div className="mx-auto w-full max-w-md"><Link to="/" className="mb-8 inline-flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-[14px] border border-blue-300/25 bg-blue-400/10 text-blue-200">⌁</span><span className="font-semibold text-white">Find<span className="text-[#7da7ff]">Back</span></span></Link><div className="rounded-[28px] border border-white/[0.1] bg-white/[0.055] p-5 shadow-[0_24px_100px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-8"><p className="text-sm font-medium text-blue-200">{signUp ? "Create your account" : "Welcome back"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{signUp ? "Start finding back." : "Pick up where you left off."}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{signUp ? "Join your campus recovery network in under a minute." : "Your privacy-first lost & found is waiting."}</p><div className="mt-7 auth-form"><Auth supabaseClient={supabase} providers={[]} view={signUp ? "sign_up" : "sign_in"} appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: "#5b8cff", brandAccent: "#78a1ff", inputBackground: "rgba(255,255,255,.05)", inputBorder: "rgba(255,255,255,.1)", inputText: "#f8fafc", inputPlaceholder: "#64748b", messageText: "#94a3b8", anchorTextColor: "#9db8ff" }, radii: { borderRadiusButton: "999px", inputBorderRadius: "14px" } } } }} theme="dark" redirectTo={window.location.origin + "/"} /></div></div><p className="mt-5 text-center text-xs text-slate-600">FindBack keeps ownership details private until you verify.</p></div></div></div>;
}
