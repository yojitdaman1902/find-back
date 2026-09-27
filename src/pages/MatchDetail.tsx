import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, LockKeyhole, MapPin, MessageCircle, RefreshCw, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, Eyebrow, GlassCard, MatchScore, PrimaryButton, SecondaryButton, StatusPill } from "@/components/findback-ui";
import { useFindBackData } from "@/components/FindBackDataProvider";
import { getMatchById, getReports, loadChatMessages, loadOwnershipQuestions, loadOwnershipVerification, OWNERSHIP_MAX_ATTEMPTS, sendChatMessage, type ChatMessage, type OwnershipAnswer, type OwnershipQuestion, type OwnershipVerificationResult, updateReportStatus, verifyFoundOwnership } from "@/lib/findback-data";
import { useSessionContext } from "@/components/SessionContextProvider";

function VerificationPanel({ questions, onVerify }: { questions: OwnershipQuestion[]; onVerify: (answers: OwnershipAnswer[]) => Promise<OwnershipVerificationResult> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => Object.fromEntries(questions.map((question) => [question.id, ""])));
  const [attempts, setAttempts] = useState(0);
  const [failed, setFailed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    setAnswers(Object.fromEntries(questions.map((question) => [question.id, ""])));
    setAttempts(0);
    setFailed(false);
    setLocked(false);
  }, [questions]);
  const submit = async () => {
    if (locked || checking) return;
    setChecking(true);
    const submittedAnswers = questions.map((question) => ({ questionId: question.id, answer: answers[question.id] ?? "" }));
    const result = await onVerify(submittedAnswers);
    setAttempts((current) => current + 1);
    setLocked(result.locked);
    setFailed(!result.verified);
    setChecking(false);
  };
  const blocked = locked || attempts >= OWNERSHIP_MAX_ATTEMPTS;
  return <GlassCard className="sticky top-8 overflow-hidden border-purple-300/20"><div className="border-b border-white/[0.08] bg-purple-300/[0.07] p-6 sm:p-8"><div className="grid size-12 place-items-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200"><LockKeyhole className="size-5" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-purple-200">Ownership verification</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Prove this is your item</h2><p className="mt-3 text-sm leading-6 text-slate-400">The finder added private questions. Answer them using the information only the rightful owner should know.</p></div><div className="space-y-4 p-6 sm:p-8">{questions.map((question, index) => <label key={question.id} className="block"><span className="mb-2 block text-sm font-medium leading-6 text-slate-200">Question {index + 1}: {question.question}</span><input aria-label={`Question ${index + 1}: ${question.question}`} value={answers[question.id] ?? ""} disabled={blocked || checking} onChange={(event) => { setAnswers((current) => ({ ...current, [question.id]: event.target.value })); setFailed(false); }} placeholder="Your answer" className="field-input" /></label>)}{failed && <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-4"><p className="text-sm font-semibold text-rose-200">Ownership could not be verified.</p><p className="mt-1 text-xs leading-5 text-rose-100/60">Some answers didn’t match the finder’s private details. We won’t reveal which ones.</p><button type="button" onClick={() => { setFailed(false); setAnswers(Object.fromEntries(questions.map((question) => [question.id, ""]))); }} className="mt-3 text-xs font-semibold text-rose-200 transition hover:text-white">Try Again</button></div>}{blocked && <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4"><p className="text-sm font-semibold text-amber-100">Verification attempts paused.</p><p className="mt-1 text-xs leading-5 text-amber-100/60">For everyone’s safety, this check locks after {OWNERSHIP_MAX_ATTEMPTS} unsuccessful attempts.</p></div>}<PrimaryButton disabled={blocked || checking || questions.some((question) => !(answers[question.id] ?? "").trim())} onClick={submit} className="mt-2 w-full">{checking ? "Checking privately…" : "Prove Ownership"} <ShieldCheck className="size-4" /></PrimaryButton><p className="text-center text-xs leading-5 text-slate-600">Answers are checked privately and never shown on the public found item.</p></div></GlassCard>;
}

function ChatPanel({ verificationId, finderName, onClose }: { verificationId: string; finderName: string; onClose: () => void }) {
  const { session } = useSessionContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const senderId = session?.user.id ?? "demo-owner";
  useEffect(() => { loadChatMessages(verificationId).then(setMessages).finally(() => setLoading(false)); }, [verificationId]);
  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const created = await sendChatMessage(verificationId, message, senderId);
    if (created) { setMessages((current) => [...current, created]); setMessage(""); }
    setSending(false);
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#020611]/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Secure chat with finder" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><GlassCard className="flex max-h-[82vh] w-full max-w-lg flex-col overflow-hidden border-emerald-300/20 bg-[#0b1427] shadow-[0_30px_100px_rgba(0,0,0,.55)]"><div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-6"><div><div className="flex items-center gap-2"><span className="grid size-10 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300"><MessageCircle className="size-5" /></span><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Verified chat</span></div><h2 className="mt-4 text-2xl font-semibold text-white">Chat with {finderName}</h2><p className="mt-1 text-sm text-slate-500">Arrange a safe handoff without sharing phone numbers or email.</p></div><button onClick={onClose} aria-label="Close secure chat" className="grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white"><X className="size-4" /></button></div><div className="min-h-56 flex-1 space-y-3 overflow-y-auto p-6">{loading ? <p className="text-sm text-slate-500">Loading secure messages…</p> : messages.length === 0 ? <div className="grid h-full place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center"><MessageCircle className="size-7 text-slate-600" /><p className="mt-3 text-sm text-slate-400">Start the handoff conversation.</p><p className="mt-1 text-xs text-slate-600">Only verified participants can read this chat.</p></div> : messages.map((item) => <div key={item.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.senderUserId === senderId ? "ml-auto bg-blue-400/15 text-blue-50" : "bg-white/[0.06] text-slate-300"}`}>{item.body}</div>)}</div><div className="border-t border-white/[0.08] p-4"><div className="flex items-end gap-2"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Write a handoff message…" className="field-input min-h-12 resize-none" rows={2} /><PrimaryButton aria-label="Send message" disabled={!message.trim() || sending} onClick={send} className="size-12 shrink-0 rounded-2xl p-0"><Send className="size-4" /></PrimaryButton></div><p className="mt-2 text-[10px] text-slate-600">Press Enter to send · Shift + Enter for a new line</p></div></GlassCard></div>;
}

export default function MatchDetail() {
  const { matchId = "match-backpack" } = useParams();
  const navigate = useNavigate();
  const { reports, matches, refreshReports } = useFindBackData();
  const match = matches.find((item) => item.id === matchId) ?? getMatchById(matchId, reports);
  const lost = match?.targetReportId ? reports.find((report) => report.id === match.targetReportId) ?? getReports().find((report) => report.id === match.targetReportId) : undefined;
  const foundReportId = match?.candidateReportId ?? (match?.id === "match-backpack" ? "catalog-backpack" : undefined);
  const [questions, setQuestions] = useState<OwnershipQuestion[]>([]);
  const [verified, setVerified] = useState(lost?.status === "Ownership Verified" || lost?.status === "Verified");
  const [recovered, setRecovered] = useState(lost?.status === "Recovered");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const finderName = match?.finderFirstName ?? "the finder";

  useEffect(() => {
    setQuestions([]);
    setVerificationId(null);
    setVerified(lost?.status === "Ownership Verified" || lost?.status === "Verified");
    if (!foundReportId || !lost?.id) return;
    let active = true;
    loadOwnershipQuestions(foundReportId, lost.id).then((loaded) => { if (active) setQuestions(loaded); });
    loadOwnershipVerification(foundReportId, lost.id).then((verification) => {
      if (active && verification?.id) {
        setVerificationId(verification.id);
        setVerified(true);
      }
    });
    return () => { active = false; };
  }, [foundReportId, lost?.id]);
  useEffect(() => { setRecovered(lost?.status === "Recovered"); }, [lost]);

  const verifyAnswers = async (answers: OwnershipAnswer[]) => {
    if (!foundReportId || !lost?.id) return { verified: false, locked: true, attemptsRemaining: 0 };
    const result = await verifyFoundOwnership(foundReportId, lost.id, answers);
    if (result.verified) {
      setVerified(true);
      setVerificationId(result.verificationId ?? null);
      await updateReportStatus(lost.id, "Ownership Verified");
      await refreshReports();
    }
    return result;
  };
  const markRecovered = async () => {
    if (!lost) return;
    setRecovered(true);
    await updateReportStatus(lost.id, "Recovered");
    await refreshReports();
  };

  if (!match) return <AppShell><div className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-3xl font-semibold text-white">This match is no longer active</h1><p className="mt-3 text-sm leading-6 text-slate-400">This listing has been recovered and is available only in My Activity history.</p><SecondaryButton onClick={() => navigate("/dashboard")} className="mt-7">Back to My Activity</SecondaryButton></div></AppShell>;
  return <AppShell><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><button onClick={() => navigate(-1)} className="mb-9 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"><ArrowLeft className="size-4" /> Back to matches</button><div className="grid gap-10 lg:grid-cols-[1fr_.78fr]"><div><div className="flex flex-wrap items-center gap-3"><Eyebrow icon={Sparkles}>AI match analysis</Eyebrow><StatusPill status={verified ? "Ownership Verified" : lost?.status ?? "Potential Match"} /></div><h1 className="mt-1 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{match.itemName}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">A transparent view of why our matching engine connected these two reports — and the separate step that confirms ownership.</p><div className="mt-9 grid gap-4 md:grid-cols-2"><GlassCard className="overflow-hidden"><div className="relative aspect-[1.4/1]"><img src={lost?.images[0] ?? match.image} alt="Your lost report" className="h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a1324] to-transparent" /><span className="absolute bottom-4 left-4 rounded-full border border-blue-300/20 bg-blue-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200">Your lost report</span></div><div className="p-5"><h3 className="font-semibold text-white">{lost?.itemName ?? "Black Nike Backpack"}</h3><p className="mt-2 text-sm text-slate-400">Private identifying details are stored in your ownership check and never shown here.</p><p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MapPin className="size-3.5" />{lost?.location ?? "Library — 2nd Floor"} · {lost?.time ?? "3:15 PM"}</p></div></GlassCard><GlassCard className="overflow-hidden"><div className="relative aspect-[1.4/1]"><img src={match.image} alt="Found report" className="h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a1324] to-transparent" /><span className="absolute bottom-4 left-4 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Found report</span></div><div className="p-5"><h3 className="font-semibold text-white">{match.itemName}</h3><p className="mt-2 text-sm text-slate-400">General details only. Finder information stays locked until ownership is verified.</p><p className="mt-4 text-xs text-slate-500">{match.location} · {match.time}</p></div></GlassCard></div><GlassCard className="mt-5 border-blue-300/15 p-6 sm:p-7"><div className="flex flex-col gap-7 sm:flex-row sm:items-center"><div className="flex justify-center sm:w-40"><MatchScore score={match.score} size="lg" /></div><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-300">AI match · {match.score}%</p><p className="mt-3 text-lg leading-8 text-slate-200">“{match.reasoning}”</p></div></div><div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-3">{match.factors.map((factor) => <div key={factor.label}><div className="flex justify-between text-xs"><span className="text-slate-500">{factor.label}</span><span className="font-semibold text-slate-200">{factor.value}%</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400" style={{ width: `${factor.value}%` }} /></div></div>)}</div></GlassCard><div className="mt-5 rounded-[24px] border border-purple-300/15 bg-purple-300/[0.05] p-6 sm:p-7"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-purple-200" /><div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-purple-200">Ownership verification ≠ AI match</p><p className="mt-2 text-sm leading-6 text-slate-400">The score finds a promising connection. The finder’s private questions confirm that the claimant is the owner.</p></div></div></div></div><div className="lg:pt-20">{!verified ? questions.length >= 2 ? <VerificationPanel questions={questions} onVerify={verifyAnswers} /> : <GlassCard className="sticky top-8 border-amber-300/20 p-6 sm:p-8"><LockKeyhole className="size-6 text-amber-200" /><h2 className="mt-5 text-2xl font-semibold text-white">The finder has not added enough proof questions</h2><p className="mt-3 text-sm leading-6 text-slate-400">Ownership cannot be confirmed from an AI score alone. The finder must add at least two private questions before a claim can continue.</p><PrimaryButton onClick={() => navigate("/found-items")} className="mt-6 w-full">Back to found items <ChevronRight className="size-4" /></PrimaryButton></GlassCard> : <GlassCard className="sticky top-8 overflow-hidden border-emerald-300/20"><div className="bg-emerald-300/[0.08] p-6 sm:p-8"><div className="grid size-12 place-items-center rounded-2xl bg-emerald-300 text-[#07201a]"><Check className="size-6" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-emerald-300">Ownership verified</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">This item has been matched to your report.</h2><p className="mt-3 text-sm leading-6 text-emerald-100/60">Your answers matched the finder’s private details. A secure chat is now available.</p></div><div className="p-6 sm:p-8"><p className="text-xs uppercase tracking-wider text-slate-500">Verified handoff</p><div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="font-medium text-white">Finder contact unlocked</p><p className="mt-1 text-sm leading-6 text-slate-500">Keep the conversation inside FindBack. Phone numbers and email addresses remain hidden.</p></div><div className="mt-6 grid gap-3"><SecondaryButton disabled={!verificationId} onClick={() => setChatOpen(true)}><MessageCircle className="size-4" /> Open secure chat</SecondaryButton>{recovered ? <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-300"><Check className="size-4" /> Marked as recovered</div> : <PrimaryButton onClick={markRecovered} className="bg-emerald-400 text-[#07201a] hover:bg-emerald-300">Mark as recovered <Check className="size-4" /></PrimaryButton>}</div><Link to="/dashboard" className="mt-5 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-white">Go to your dashboard <ChevronRight className="size-3" /></Link></div></GlassCard>}</div></div></div>{chatOpen && verificationId && <ChatPanel verificationId={verificationId} finderName={finderName} onClose={() => setChatOpen(false)} />}</AppShell>;
}
