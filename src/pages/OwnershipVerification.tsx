import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell, GlassCard, PrimaryButton, SecondaryButton } from "@/components/findback-ui";
import { useFindBackData } from "@/components/FindBackDataProvider";
import { getBestLostMatchForFound, loadOwnershipQuestions, loadOwnershipVerification, OWNERSHIP_MAX_ATTEMPTS, type OwnershipQuestion, type OwnershipVerificationResult, updateReportStatus, verifyFoundOwnership } from "@/lib/findback-data";

export default function OwnershipVerification() {
  const { foundReportId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const linkedLostReportId = searchParams.get("lostReportId");
  const navigate = useNavigate();
  const { reports, sharedReports, isLoading, refreshReports } = useFindBackData();
  const foundReport = useMemo(() => sharedReports.find((report) => report.id === foundReportId), [foundReportId, sharedReports]);
  const lostReports = useMemo(() => reports.filter((report) => report.type === "lost"), [reports]);
  const match = useMemo(() => foundReport ? getBestLostMatchForFound(foundReport, lostReports) : undefined, [foundReport, lostReports]);
  const lostReport = useMemo(() => {
    const linkedReport = linkedLostReportId ? lostReports.find((report) => report.id === linkedLostReportId) : undefined;
    return linkedReport ?? (match?.targetReportId ? lostReports.find((report) => report.id === match.targetReportId) : undefined);
  }, [linkedLostReportId, lostReports, match?.targetReportId]);
  const [questions, setQuestions] = useState<OwnershipQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | undefined>();
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    if (!foundReport?.id || !lostReport?.id) return;
    loadOwnershipQuestions(foundReport.id, lostReport.id).then((loaded) => {
      setQuestions(loaded);
      setAnswers(loaded.map(() => ""));
    });
    loadOwnershipVerification(foundReport.id, lostReport.id).then((existing) => {
      if (existing?.id) {
        setVerified(true);
        setVerificationId(existing.id);
      }
    });
  }, [foundReport?.id, lostReport?.id]);

  const updateAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer));
    setFailed(false);
  };

  const verify = async () => {
    if (!foundReport || !lostReport || checking || locked) return;
    setChecking(true);
    const result: OwnershipVerificationResult = await verifyFoundOwnership(foundReport.id, lostReport.id, answers);
    setFailed(!result.verified);
    setLocked(result.locked);
    if (result.verified) {
      setVerified(true);
      setVerificationId(result.verificationId);
      await updateReportStatus(lostReport.id, "Ownership Verified");
      await refreshReports();
    }
    setChecking(false);
  };

  const markRecovered = async () => {
    if (!lostReport) return;
    await updateReportStatus(lostReport.id, "Recovered");
    await refreshReports();
    setRecovered(true);
  };

  if (isLoading) return <AppShell><div className="mx-auto max-w-2xl px-5 py-24 text-center text-slate-400">Loading ownership verification…</div></AppShell>;
  if (!foundReport || !lostReport) return <AppShell><div className="mx-auto max-w-2xl px-5 py-24 text-center"><LockKeyhole className="mx-auto size-10 text-amber-200" /><h1 className="mt-6 text-3xl font-semibold text-white">This item is not linked to a lost report</h1><p className="mt-3 text-sm leading-6 text-slate-400">FindBack can only verify an item against its corresponding lost listing.</p><SecondaryButton onClick={() => navigate("/found-items")} className="mt-7">Back to Found Items</SecondaryButton></div></AppShell>;

  return <AppShell><div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16"><button onClick={() => navigate(-1)} className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"><ArrowLeft className="size-4" /> Back to found items</button>{verified ? <GlassCard className="overflow-hidden border-emerald-300/20"><div className="bg-emerald-300/[0.08] p-7 sm:p-9"><div className="grid size-14 place-items-center rounded-2xl bg-emerald-300 text-[#07201a]"><Check className="size-7" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-emerald-300">✅ Ownership Verified</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">You've successfully verified ownership of this item.</h1><p className="mt-4 text-sm leading-6 text-emerald-100/70">Your answers matched the private details added by the finder for this found report.</p></div><div className="grid gap-3 p-7 sm:p-9"><PrimaryButton disabled={!verificationId} onClick={() => navigate(match ? `/matches/${match.id}` : "/dashboard")}>Contact Finder <ShieldCheck className="size-4" /></PrimaryButton>{recovered ? <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-300"><Check className="size-4" /> Marked as recovered</div> : <SecondaryButton onClick={markRecovered}>Mark as Recovered <Check className="size-4" /></SecondaryButton>}</div></GlassCard> : <GlassCard className="overflow-hidden border-purple-300/20"><div className="border-b border-white/[0.08] bg-purple-300/[0.07] p-7 sm:p-9"><div className="grid size-14 place-items-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200"><LockKeyhole className="size-7" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-purple-200">🔐 Verify Ownership</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">Prove this is your {foundReport.itemName}.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Answer the private questions added by the finder for this found report. Your answers are checked securely and never exposed publicly.</p></div><div className="space-y-5 p-7 sm:p-9">{questions.map((question, index) => <label key={`${question.position}-${index}`} className="block"><span className="mb-2 block text-sm font-medium leading-6 text-slate-200">Question {index + 1}: {question.question}</span><input aria-label={`Question ${index + 1}: ${question.question}`} value={answers[index] ?? ""} disabled={checking || locked} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="Your answer" className="field-input" /></label>)}{failed && <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-4"><p className="text-sm font-semibold text-rose-200">❌ Ownership could not be verified.</p><p className="mt-1 text-xs leading-5 text-rose-100/60">Some of the information didn't match. Please try again.</p><button type="button" disabled={locked} onClick={() => { setFailed(false); setAnswers(questions.map(() => "")); }} className="mt-3 text-xs font-semibold text-rose-200 transition hover:text-white disabled:opacity-40">Try Again</button></div>}{locked && <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4 text-xs leading-5 text-amber-100/70">For everyone’s safety, this check locks after {OWNERSHIP_MAX_ATTEMPTS} unsuccessful attempts.</p>}{questions.length < 2 && <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4 text-sm text-amber-100/80">This listing does not have enough private questions to verify ownership.</p>}<PrimaryButton disabled={checking || locked || questions.length < 2 || answers.length !== questions.length || answers.some((answer) => !answer.trim())} onClick={verify} className="w-full">{checking ? "Checking privately…" : "Verify Ownership"} <ShieldCheck className="size-4" /></PrimaryButton><p className="text-center text-xs leading-5 text-slate-600">The selected found listing stays linked to this verification.</p></div></GlassCard>}</div></AppShell>;
}
