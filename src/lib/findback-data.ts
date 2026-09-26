import { supabase } from "@/integrations/supabase/client";

export type ReportType = "lost" | "found";
export type ReportStatus = "Reported" | "Potential Match" | "Ownership Verification Pending" | "Verified" | "Ownership Verified" | "Recovered";

export type OwnershipClue = {
  question: string;
  answer: string;
};

export type ItemReport = {
  id: string;
  type: ReportType;
  itemName: string;
  category: string;
  brand?: string;
  color: string;
  description: string;
  location: string;
  date: string;
  time: string;
  images: string[];
  status: ReportStatus;
  ownershipVerification?: OwnershipClue[];
  publicDescription?: string;
  finderFirstName?: string;
};

export type Match = {
  id: string;
  itemName: string;
  location: string;
  date: string;
  time: string;
  score: number;
  image: string;
  type: "found" | "lost";
  explanation: string;
  factors: { label: string; value: number }[];
  reasoning: string;
  finderFirstName?: string;
  targetReportId?: string;
  candidateReportId?: string;
};

export const itemImages = {
  backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85",
  earbuds: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
  notebook: "https://images.unsplash.com/photo-1531346878377-a5be20888e7e?auto=format&fit=crop&w=900&q=85",
  keys: "https://images.unsplash.com/photo-1553484771-047a44eee27b?auto=format&fit=crop&w=900&q=85",
  id: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=900&q=85",
};

export const demoMatches: Match[] = [
  {
    id: "match-backpack",
    itemName: "Black Nike Backpack",
    location: "Library — 2nd Floor",
    date: "25 Sept",
    time: "3:42 PM",
    score: 94,
    image: itemImages.backpack,
    type: "found",
    explanation: "Same color and brand cues, with a red keychain mentioned in both descriptions.",
    factors: [{ label: "Item type", value: 100 }, { label: "Colour", value: 95 }, { label: "Location", value: 100 }, { label: "Time proximity", value: 87 }, { label: "Description", value: 91 }, { label: "Image similarity", value: 89 }],
    reasoning: "Both reports describe a black backpack found in the Library building within 30 minutes of the reported loss. The AI signal is strong, but private clues are still required before contact is unlocked.",
    finderFirstName: "Jordan",
  },
  {
    id: "match-earbuds",
    itemName: "Midnight AirPods Case",
    location: "Student Union — Atrium",
    date: "24 Sept",
    time: "12:18 PM",
    score: 76,
    image: itemImages.earbuds,
    type: "found",
    explanation: "The category, dark finish, and nearby Student Union location align with your report.",
    factors: [{ label: "Item type", value: 92 }, { label: "Colour", value: 84 }, { label: "Location", value: 72 }, { label: "Time proximity", value: 66 }, { label: "Description", value: 73 }, { label: "Image similarity", value: 68 }],
    reasoning: "This report has strong category and appearance signals, but the location and time are less precise than the leading match.",
  },
  {
    id: "match-notebook",
    itemName: "Navy Lecture Notebook",
    location: "Science Hall — Room 204",
    date: "23 Sept",
    time: "5:06 PM",
    score: 62,
    image: itemImages.notebook,
    type: "found",
    explanation: "A possible category and color connection, though the place and time are less aligned.",
    factors: [{ label: "Item type", value: 78 }, { label: "Colour", value: 81 }, { label: "Location", value: 49 }, { label: "Time proximity", value: 45 }, { label: "Description", value: 61 }, { label: "Image similarity", value: 57 }],
    reasoning: "The semantic engine found a loose match around the navy color and study context, but lacks enough shared identifying detail to rank this highly.",
  },
];

const demoReports: ItemReport[] = [
  { id: "lost-backpack", type: "lost", itemName: "Black Nike Backpack", category: "Bags", brand: "Nike", color: "Black", description: "Black Nike backpack with a red keychain and a laptop charger inside.", location: "Library — 2nd Floor", date: "25 Sept", time: "3:15 PM", images: [itemImages.backpack], status: "Ownership Verification Pending", ownershipVerification: [{ question: "What colour was the keychain attached to your backpack?", answer: "Red" }, { question: "What was inside the backpack?", answer: "MacBook charger and notebook" }] },
  { id: "found-earbuds", type: "found", itemName: "Midnight AirPods Case", category: "Electronics", color: "Midnight blue", description: "Small wireless earbuds case found beside the charging station.", location: "Student Union — Atrium", date: "24 Sept", time: "12:18 PM", images: [itemImages.earbuds], status: "Reported" },
  { id: "found-notebook", type: "found", itemName: "Navy Lecture Notebook", category: "Books", color: "Navy", description: "Navy notebook with handwritten economics notes and a silver elastic.", location: "Science Hall — Room 204", date: "23 Sept", time: "5:06 PM", images: [itemImages.notebook], status: "Recovered" },
];

export const demoFoundReports: ItemReport[] = [
  { id: "catalog-backpack", type: "found", itemName: "Black Nike Backpack", category: "Bags", brand: "Nike", color: "Black", description: "Black Nike backpack with a red keychain and a laptop charger inside.", publicDescription: "Black backpack found near the Library.", location: "Library — Ground Floor", date: "25 Sept", time: "3:42 PM", images: [itemImages.backpack], status: "Potential Match", finderFirstName: "Jordan" },
  { id: "catalog-airpods", type: "found", itemName: "AirPods Pro", category: "Electronics", color: "White", description: "White wireless earbuds case found beside the canteen charging station.", publicDescription: "White wireless earbuds found near the Canteen.", location: "Canteen — Charging Station", date: "26 Sept", time: "11:18 AM", images: [itemImages.earbuds], status: "Reported", finderFirstName: "Maya" },
  { id: "catalog-bottle", type: "found", itemName: "Blue Water Bottle", category: "Other", color: "Blue", description: "Reusable blue insulated bottle with a matte finish.", publicDescription: "Blue insulated water bottle found at the Sports Complex.", location: "Sports Complex — Court 2", date: "26 Sept", time: "9:05 AM", images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85"], status: "Reported", finderFirstName: "Riya" },
  { id: "catalog-id", type: "found", itemName: "Student ID Card", category: "Documents", color: "White and blue", description: "University student ID card found near the academic block entrance.", publicDescription: "Student ID card found near the Academic Block.", location: "Academic Block — Main Entrance", date: "25 Sept", time: "4:27 PM", images: [itemImages.id], status: "Potential Match", finderFirstName: "Noah" },
  { id: "catalog-hoodie", type: "found", itemName: "Black Hoodie", category: "Clothing", color: "Black", description: "Soft black pullover hoodie found on the third auditorium row.", publicDescription: "Black hoodie found in the Auditorium.", location: "Auditorium — Row C", date: "24 Sept", time: "6:11 PM", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85"], status: "Reported", finderFirstName: "Ethan" },
  { id: "catalog-charger", type: "found", itemName: "USB-C Charger", category: "Electronics", color: "White", description: "65W USB-C laptop charger with a braided cable.", publicDescription: "USB-C charger found in the Computer Lab.", location: "Computer Lab — Desk 18", date: "24 Sept", time: "2:54 PM", images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85"], status: "Reported", finderFirstName: "Leah" },
  { id: "catalog-wallet", type: "found", itemName: "Brown Leather Wallet", category: "Accessories", color: "Brown", description: "Brown leather wallet with private contents held securely by the finder.", publicDescription: "Brown leather wallet found near the Library.", location: "Library — Reading Garden", date: "23 Sept", time: "1:36 PM", images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85"], status: "Potential Match", finderFirstName: "Sam" },
  { id: "catalog-keys", type: "found", itemName: "Set of Keys", category: "Keys", color: "Silver", description: "Small silver keyring with three keys and a fabric tag.", publicDescription: "Set of keys found near the Hostel Block.", location: "Hostel Block — Common Room", date: "22 Sept", time: "8:46 PM", images: [itemImages.keys], status: "Reported", finderFirstName: "Aarav" },
  { id: "catalog-calculator", type: "found", itemName: "Scientific Calculator", category: "Electronics", color: "Black", description: "Black scientific calculator found beneath a classroom desk.", publicDescription: "Scientific calculator found in the Classroom Block.", location: "Classroom Block — Room 108", date: "22 Sept", time: "12:22 PM", images: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85"], status: "Recovered", finderFirstName: "Priya" },
  { id: "catalog-phone", type: "found", itemName: "Samsung Galaxy Phone", category: "Electronics", color: "Graphite", description: "Graphite Samsung Galaxy phone found at the Canteen help desk.", publicDescription: "Graphite smartphone found at the Canteen help desk.", location: "Canteen — Help Desk", date: "21 Sept", time: "7:15 PM", images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85"], status: "Potential Match", finderFirstName: "Ishaan" },
];

export function getReports(storageKey = "findback-reports", seedDemo = true): ItemReport[] {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    if (seedDemo) localStorage.setItem(storageKey, JSON.stringify(demoReports));
    return seedDemo ? demoReports : [];
  }
  return JSON.parse(stored) as ItemReport[];
}

export function saveReports(reports: ItemReport[], storageKey = "findback-reports") {
  localStorage.setItem(storageKey, JSON.stringify(reports));
}

function mapReportRow(row: any, id = row.id): ItemReport {
  return {
    id,
    type: row.report_type as ReportType,
    itemName: row.item_name,
    category: row.category,
    brand: row.brand ?? undefined,
    color: row.color,
    description: row.description,
    location: row.location,
    date: row.reported_date,
    time: row.reported_time,
    images: Array.isArray(row.images) ? row.images as string[] : [],
    status: row.status === "potential_match" ? "Potential Match" : row.status === "ownership_verification_pending" ? "Ownership Verification Pending" : row.status === "ownership_verified" ? "Ownership Verified" : row.status === "verified" ? "Verified" : row.status === "recovered" ? "Recovered" : "Reported",
    publicDescription: row.public_description ?? undefined,
    finderFirstName: row.finder_first_name ?? undefined,
  };
}

export async function loadReportsForUser(userId: string): Promise<ItemReport[]> {
  const { data, error } = await supabase.from("reports").select("id, report_type, item_name, category, brand, color, description, public_description, finder_first_name, location, reported_date, reported_time, images, status, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error || !data) return getReports(`findback-reports-${userId}`, false);
  const { data: clueRows } = await supabase.from("ownership_verification_clues").select("report_id, question, answer, position").eq("owner_user_id", userId).order("position", { ascending: true });
  const cluesByReport = new Map<string, OwnershipClue[]>();
  (clueRows ?? []).forEach((row) => {
    const clues = cluesByReport.get(row.report_id) ?? [];
    clues.push({ question: row.question, answer: row.answer });
    cluesByReport.set(row.report_id, clues);
  });
  return data.map((row) => ({ ...mapReportRow(row), ownershipVerification: cluesByReport.get(row.id) ?? [] }));
}

export async function loadMatchFeatures(): Promise<ItemReport[]> {
  const { data, error } = await supabase.from("report_match_features").select("report_id, report_type, item_name, category, brand, color, description, public_description, finder_first_name, location, reported_date, reported_time, images, created_at").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => mapReportRow(row, row.report_id));
}

const synonymGroups = [["macbook", "laptop", "notebook", "computer"], ["charger", "cable", "adapter", "power"], ["earbuds", "airpods", "headphones", "buds"], ["backpack", "rucksack", "bag"], ["black", "dark", "midnight"], ["silver", "grey", "gray", "metallic"]];

function tokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((token) => token.length > 2);
}

function semanticSimilarity(left: string, right: string) {
  const leftTokens = new Set(tokens(left));
  const rightTokens = new Set(tokens(right));
  const expandedMatches = [...leftTokens].filter((token) => rightTokens.has(token) || synonymGroups.some((group) => group.includes(token) && group.some((synonym) => rightTokens.has(synonym))));
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? Math.round((expandedMatches.length / union) * 100) : 0;
}

function timeScore(left: ItemReport, right: ItemReport) {
  const leftTime = new Date(`${left.date}T${left.time}`);
  const rightTime = new Date(`${right.date}T${right.time}`);
  const difference = Math.abs(leftTime.getTime() - rightTime.getTime());
  if (Number.isNaN(difference)) return 55;
  return Math.max(0, Math.round(100 - difference / (1000 * 60 * 8)));
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function buildDynamicMatch(target: ItemReport, candidate: ItemReport): Match {
  const category = target.category.toLowerCase() === candidate.category.toLowerCase() ? 100 : semanticSimilarity(`${target.category} ${target.itemName}`, `${candidate.category} ${candidate.itemName}`);
  const description = semanticSimilarity(`${target.itemName} ${target.brand ?? ""} ${target.color} ${target.description}`, `${candidate.itemName} ${candidate.brand ?? ""} ${candidate.color} ${candidate.description}`);
  const color = semanticSimilarity(target.color, candidate.color);
  const location = semanticSimilarity(target.location, candidate.location);
  const time = timeScore(target, candidate);
  const image = target.images.length > 0 && candidate.images.length > 0 ? 88 : 62;
  const score = Math.round(description * 0.3 + image * 0.25 + location * 0.2 + time * 0.15 + category * 0.1);
  const matchLabel = score >= 85 ? "Strong match" : score >= 70 ? "Promising match" : "Possible match";
  return {
    id: `match-${target.id}-${candidate.id}`,
    itemName: candidate.itemName,
    location: candidate.location,
    date: formatDate(candidate.date),
    time: candidate.time,
    score,
    image: candidate.images[0] || itemImages.backpack,
    type: candidate.type,
    explanation: `${matchLabel}: ${candidate.itemName} shares ${target.category.toLowerCase()} signals, descriptive clues, and nearby report context.`,
    factors: [{ label: "Item type", value: category }, { label: "Colour", value: color }, { label: "Location", value: location }, { label: "Time proximity", value: time }, { label: "Description", value: description }, { label: "Image similarity", value: image }],
    reasoning: `Both reports describe a ${target.color.toLowerCase()} ${target.category.toLowerCase()} and share semantic clues across their item names and descriptions. The reports were made around ${candidate.location}, so FindBack ranked this as a ${matchLabel.toLowerCase()}.`,
    finderFirstName: candidate.finderFirstName,
    targetReportId: target.id,
    candidateReportId: candidate.id,
  };
}

export function getActiveMatches(reports?: ItemReport[], comparisonReports?: ItemReport[]) {
  const sourceReports = reports ?? getReports().filter((report) => report.id.startsWith("report-"));
  const candidates = comparisonReports ?? sourceReports;
  const target = sourceReports[0];
  if (!target) return demoMatches;
  const dynamicMatches = candidates.filter((report) => report.id !== target.id && report.type !== target.type).map((report) => buildDynamicMatch(target, report)).sort((left, right) => right.score - left.score);
  return dynamicMatches.length ? [...dynamicMatches, ...demoMatches].slice(0, 3) : demoMatches;
}

export function getMatchById(id: string, reports?: ItemReport[], comparisonReports?: ItemReport[]) {
  return getActiveMatches(reports, comparisonReports).find((match) => match.id === id) ?? demoMatches.find((match) => match.id === id) ?? demoMatches[0];
}

export function getPotentialMatchCount(report: ItemReport, candidates: ItemReport[]) {
  return candidates.filter((candidate) => candidate.id !== report.id && candidate.type !== report.type).map((candidate) => buildDynamicMatch(report, candidate)).filter((match) => match.score >= 60).length;
}

export function getPublicFoundDescription(report: ItemReport) {
  if (report.publicDescription) return report.publicDescription;
  const descriptor = (report.itemName || report.category).trim();
  const color = report.color.trim();
  const publicLabel = descriptor.toLowerCase().startsWith(color.toLowerCase()) ? descriptor : `${color} ${descriptor}`;
  return `${publicLabel} found near ${report.location.split("—")[0].trim()}.`;
}

export const OWNERSHIP_MAX_ATTEMPTS = 3;

export function normalizeVerificationAnswer(value: string) {
  return value.toLowerCase().replace(/\+/g, " and ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }
  return previous[right.length];
}

function answersMatch(expected: string, actual: string) {
  const normalizedExpected = normalizeVerificationAnswer(expected);
  const normalizedActual = normalizeVerificationAnswer(actual);
  if (!normalizedExpected || !normalizedActual) return false;
  if (normalizedExpected === normalizedActual) return true;
  const expectedTokens = new Set(normalizedExpected.split(" "));
  const actualTokens = new Set(normalizedActual.split(" "));
  const overlap = [...expectedTokens].filter((token) => actualTokens.has(token)).length;
  const tokenCoverage = overlap / Math.max(expectedTokens.size, actualTokens.size);
  const compactExpected = normalizedExpected.replace(/ /g, "");
  const compactActual = normalizedActual.replace(/ /g, "");
  const distance = editDistance(compactExpected, compactActual);
  const similarity = 1 - distance / Math.max(compactExpected.length, compactActual.length);
  return tokenCoverage >= 0.75 || (Math.min(compactExpected.length, compactActual.length) >= 5 && similarity >= 0.9);
}

export function verifyOwnership(clues: OwnershipClue[], answers: string[]) {
  const required = Math.max(2, Math.ceil(clues.length * 0.75));
  const correct = clues.reduce((total, clue, index) => total + (answersMatch(clue.answer, answers[index] ?? "") ? 1 : 0), 0);
  return { correct, total: clues.length, required, verified: clues.length >= 2 && correct >= required };
}

function statusToDb(status: ReportStatus) {
  return status.toLowerCase().replace(/\s+/g, "_");
}

export async function saveReport(report: ItemReport) {
  const { data } = await supabase.auth.getSession();
  const storageKey = data.session?.user ? `findback-reports-${data.session.user.id}` : "findback-reports";
  const reports = getReports(storageKey, !data.session?.user);
  const sharedReports = data.session?.user ? await loadMatchFeatures() : [];
  const oppositeUserReports = [...reports, ...sharedReports].filter((existing, index, all) => existing.type !== report.type && all.findIndex((candidate) => candidate.id === existing.id) === index);
  const status = oppositeUserReports.length && report.type === "lost" ? "Ownership Verification Pending" as ReportStatus : oppositeUserReports.length ? "Potential Match" as ReportStatus : report.status;
  let finderFirstName = report.finderFirstName;
  if (report.type === "found" && data.session?.user && !finderFirstName) {
    const { data: profile } = await supabase.from("profiles").select("first_name, display_name").eq("id", data.session.user.id).maybeSingle();
    finderFirstName = profile?.first_name || profile?.display_name?.split(/\s+/)[0] || data.session.user.user_metadata?.full_name?.split(/\s+/)[0];
  }
  const savedReport = { ...report, status, finderFirstName, publicDescription: report.type === "found" ? getPublicFoundDescription(report) : report.publicDescription };
  let persistedReport = savedReport;

  if (data.session?.user) {
    const { data: inserted } = await supabase.from("reports").insert({ user_id: data.session.user.id, report_type: report.type, item_name: report.itemName, category: report.category, brand: report.brand, color: report.color, description: report.description, public_description: savedReport.publicDescription, finder_first_name: savedReport.finderFirstName, location: report.location, reported_date: report.date, reported_time: report.time, images: report.images, status: statusToDb(status) }).select("id").single();
    if (inserted?.id) persistedReport = { ...savedReport, id: inserted.id };
    if (savedReport.ownershipVerification?.length && inserted?.id) {
      await supabase.from("ownership_verification_clues").insert(savedReport.ownershipVerification.slice(0, 4).map((clue, position) => ({ report_id: inserted.id, owner_user_id: data.session.user.id, question: clue.question, answer: clue.answer, position })));
    }
    const existingIds = oppositeUserReports.map((existing) => existing.id).filter((id) => !id.startsWith("report-"));
    if (existingIds.length) await supabase.from("reports").update({ status: report.type === "found" ? "ownership_verification_pending" : "potential_match" }).in("id", existingIds).eq("user_id", data.session.user.id);
  }

  const updatedReports = [persistedReport, ...reports.map((existing) => oppositeUserReports.some((match) => match.id === existing.id) ? { ...existing, status: existing.type === "lost" ? "Ownership Verification Pending" as ReportStatus : "Potential Match" as ReportStatus } : existing)];
  saveReports(updatedReports, storageKey);
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  const { data } = await supabase.auth.getSession();
  const storageKey = data.session?.user ? `findback-reports-${data.session.user.id}` : "findback-reports";
  const reports = getReports(storageKey, !data.session?.user).map((report) => report.id === id ? { ...report, status } : report);
  saveReports(reports, storageKey);
  if (data.session?.user) await supabase.from("reports").update({ status: statusToDb(status) }).eq("id", id).eq("user_id", data.session.user.id);
}

export function getLatestReport() {
  return getReports()[0];
}
