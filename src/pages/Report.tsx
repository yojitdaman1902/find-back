import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, ImagePlus, MapPin, UploadCloud } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppShell, Eyebrow, GlassCard, PrimaryButton } from "@/components/findback-ui";
import { PrivateClueFields } from "@/components/PrivateClueFields";
import { useFindBackData } from "@/components/FindBackDataProvider";
import { ItemReport, OwnershipClue, saveReport, updateReport } from "@/lib/findback-data";

const categories = ["Electronics", "Bags", "Documents", "Accessories", "Clothing", "Keys", "Books", "Other"];
const emptyClue = (): OwnershipClue => ({ question: "", answer: "" });

function dateInputValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  let parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) parsed = new Date(`${value} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? "" : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

function timeInputValue(value: string) {
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const parsed = new Date(`1970-01-01 ${value}`);
  return Number.isNaN(parsed.getTime()) ? "" : `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

export default function Report() {
  const { type = "lost", reportId } = useParams();
  const reportType = type === "found" ? "found" : "lost";
  const isEdit = Boolean(reportId);
  const navigate = useNavigate();
  const { reports, refreshReports, isLoading } = useFindBackData();
  const existingReport = reportId ? reports.find((report) => report.id === reportId) : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [privateClues, setPrivateClues] = useState<OwnershipClue[]>([emptyClue(), emptyClue()]);
  const [form, setForm] = useState({ itemName: "", category: "Bags", brand: "", color: "", description: "", location: "", date: "", time: "" });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateClue = (index: number, key: keyof OwnershipClue, value: string) => setPrivateClues((current) => current.map((clue, clueIndex) => clueIndex === index ? { ...clue, [key]: value } : clue));

  useEffect(() => {
    if (!existingReport) return;
    setForm({ itemName: existingReport.itemName, category: existingReport.category, brand: existingReport.brand ?? "", color: existingReport.color, description: existingReport.description, location: existingReport.location, date: dateInputValue(existingReport.date), time: timeInputValue(existingReport.time) });
    setImages(existingReport.images);
    setPrivateClues(existingReport.ownershipVerification?.length ? existingReport.ownershipVerification : []);
  }, [existingReport?.id]);

  const readFiles = (files: FileList | File[]) => {
    Array.from(files).slice(0, 5 - images.length).forEach((file) => { if (!file.type.startsWith("image/")) return; const reader = new FileReader(); reader.onload = () => setImages((current) => [...current, String(reader.result)]); reader.readAsDataURL(file); });
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); readFiles(event.dataTransfer.files); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const clues = privateClues.map((clue) => ({ question: clue.question.trim(), answer: clue.answer.trim() })).filter((clue) => clue.question && clue.answer).slice(0, 5);
    try {
      if (isEdit && existingReport) {
        const editedReport: ItemReport = { ...existingReport, ...form, images, ownershipVerification: clues };
        await updateReport(editedReport, existingReport);
        await refreshReports();
        toast.success("Listing updated successfully ✓");
        navigate("/dashboard");
      } else {
        const report: ItemReport = { id: `report-${Date.now()}`, type: reportType, ...form, images, status: "Reported", ownershipVerification: clues };
        await saveReport(report);
        await refreshReports();
        navigate("/analysis");
      }
    } catch {
      toast.error(isEdit ? "Could not update listing. Please try again." : "Could not submit listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const validBasics = form.itemName && form.color && form.description && form.location && form.date && form.time;
  const shouldValidateClues = !isEdit || privateClues.length > 0;
  const validClues = privateClues.length >= 2 && privateClues.length <= 5 && privateClues.every((clue) => clue.question.trim() && clue.answer.trim());
  const valid = validBasics && (!shouldValidateClues || validClues);
  const showExistingState = isEdit && isLoading && !existingReport;
  if (isEdit && !isLoading && !existingReport) return <AppShell><div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8"><h1 className="text-3xl font-semibold text-white">Listing not found</h1><p className="mt-3 text-slate-400">This listing may have been deleted or belongs to another account.</p><button onClick={() => navigate("/dashboard")} className="mt-7 rounded-full bg-[#5b8cff] px-5 py-3 text-sm font-semibold text-white">Back to My Activity</button></div></AppShell>;
  if (showExistingState) return <AppShell><div className="mx-auto max-w-3xl px-5 py-24 text-center text-slate-400">Loading your listing…</div></AppShell>;
  return <AppShell><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16"><button onClick={() => navigate(-1)} className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"><ArrowLeft className="size-4" /> Back</button><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><Eyebrow icon={ImagePlus}>{isEdit ? "Edit listing" : reportType === "lost" ? "Lost item report" : "Found item report"}</Eyebrow><h1 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{isEdit ? "Keep your listing current." : reportType === "lost" ? "Tell us what went missing." : "Help an item find its way home."}</h1><p className="mt-5 text-base leading-7 text-slate-400">{isEdit ? "Update the details so matching and ownership checks always use your latest information." : "The more detail you share, the more confidently our matching engine can connect the dots."}</p><div className="mt-9 space-y-4"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-400/10 text-blue-300">1</span><div><p className="font-medium text-slate-200">Describe the item</p><p className="mt-1 text-sm leading-6 text-slate-500">Use the details only an owner would know.</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-400/10 text-blue-300">2</span><div><p className="font-medium text-slate-200">Add where and when</p><p className="mt-1 text-sm leading-6 text-slate-500">Location and time help us narrow the search.</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-purple-400/10 text-purple-200">3</span><div><p className="font-medium text-slate-200">{reportType === "found" ? "Set an owner check" : "Protect your ownership proof"}</p><p className="mt-1 text-sm leading-6 text-slate-500">Private answers unlock a safe handoff only after verification.</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">4</span><div><p className="font-medium text-slate-200">Let AI do the connecting</p><p className="mt-1 text-sm leading-6 text-slate-500">Matching identifies a possibility; private questions confirm it.</p></div></div></div></div><GlassCard className="p-5 sm:p-8"><form onSubmit={submit} className="space-y-6"><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label">Item name <b>*</b></span><input required value={form.itemName} onChange={(e) => update("itemName", e.target.value)} placeholder="e.g. Black Nike backpack" className="field-input" /></label><label><span className="field-label">Category <b>*</b></span><select value={form.category} onChange={(e) => update("category", e.target.value)} className="field-input">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span className="field-label">Brand <span>(optional)</span></span><input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g. Nike" className="field-input" /></label><label><span className="field-label">Colour <b>*</b></span><input required value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="e.g. Black with red accent" className="field-input" /></label><label><span className="field-label">Campus area <b>*</b></span><div className="relative"><MapPin className="field-icon" /><input required value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Library — 2nd Floor" className="field-input pl-10" /></div></label><label className="sm:col-span-2"><span className="field-label">Description <b>*</b></span><textarea required value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Include marks, stickers, contents, or anything uniquely identifying..." className="field-input min-h-28 resize-none" /></label><label><span className="field-label">Date <b>*</b></span><div className="relative"><CalendarDays className="field-icon" /><input required type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="field-input pl-10" /></div></label><label><span className="field-label">Approximate time <b>*</b></span><div className="relative"><Clock3 className="field-icon" /><input required type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className="field-input pl-10" /></div></label></div>{(!isEdit || reportType === "found" || privateClues.length > 0) && <PrivateClueFields mode={reportType} clues={privateClues} onChange={updateClue} onAdd={() => setPrivateClues((current) => current.length < 5 ? [...current, emptyClue()] : current)} onRemove={(index) => setPrivateClues((current) => current.filter((_, clueIndex) => clueIndex !== index))} />}{isEdit && reportType === "lost" && privateClues.length === 0 && <div className="rounded-2xl border border-purple-300/20 bg-purple-300/[0.06] p-5 text-sm leading-6 text-slate-400"><span className="font-semibold text-purple-100">Ownership Check is not configured.</span> You can add two to five private questions from the My Activity card.</div>}<div><div className="mb-2 flex items-center justify-between"><span className="field-label">Photos <span>(up to 5)</span></span><span className="text-xs text-slate-600">{images.length}/5 added</span></div><div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`cursor-pointer rounded-2xl border border-dashed p-6 text-center transition ${dragging ? "border-blue-300 bg-blue-300/10" : "border-white/15 bg-white/[0.025] hover:border-blue-300/35 hover:bg-white/[0.05]"}`}><input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files && readFiles(event.target.files)} /><UploadCloud className="mx-auto size-7 text-blue-300" /><p className="mt-3 text-sm font-medium text-slate-200">Drop photos here or <span className="text-blue-300">browse</span></p><p className="mt-1 text-xs text-slate-500">JPG, PNG up to 10MB each</p></div>{images.length > 0 && <div className="mt-3 grid grid-cols-5 gap-2">{images.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl"><img src={image} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#07101f]/80 text-xs text-white">×</button></div>)}</div>}</div><div className="flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center"><div className="flex items-start gap-2 text-xs leading-5 text-slate-500"><Check className="mt-0.5 size-4 shrink-0 text-emerald-300" /> Private answers are only used for a verified handoff.</div><PrimaryButton type="submit" disabled={!valid || saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Analyze my item"} <span className="text-blue-100">✦</span></PrimaryButton></div></form></GlassCard></div></div></AppShell>;
}
