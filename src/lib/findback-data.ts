import { supabase } from "@/integrations/supabase/client";

export type ReportType = "lost" | "found";
export type ReportStatus = "Reported" | "Potential Match" | "Verified" | "Recovered";

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
    factors: [
      { label: "Item type", value: 100 },
      { label: "Colour", value: 95 },
      { label: "Location", value: 100 },
      { label: "Time proximity", value: 87 },
      { label: "Description", value: 91 },
      { label: "Image similarity", value: 89 },
    ],
    reasoning: "Both reports describe a black backpack found in the Library building within 30 minutes of the reported loss. Both descriptions mention a red keychain and a laptop charger.",
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
    factors: [
      { label: "Item type", value: 92 },
      { label: "Colour", value: 84 },
      { label: "Location", value: 72 },
      { label: "Time proximity", value: 66 },
      { label: "Description", value: 73 },
      { label: "Image similarity", value: 68 },
    ],
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
    factors: [
      { label: "Item type", value: 78 },
      { label: "Colour", value: 81 },
      { label: "Location", value: 49 },
      { label: "Time proximity", value: 45 },
      { label: "Description", value: 61 },
      { label: "Image similarity", value: 57 },
    ],
    reasoning: "The semantic engine found a loose match around the navy color and study context, but lacks enough shared identifying detail to rank this highly.",
  },
];

const demoReports: ItemReport[] = [
  {
    id: "lost-backpack",
    type: "lost",
    itemName: "Black Nike Backpack",
    category: "Bags",
    brand: "Nike",
    color: "Black",
    description: "Black Nike backpack with a red keychain and a laptop charger inside.",
    location: "Library — 2nd Floor",
    date: "25 Sept",
    time: "3:15 PM",
    images: [itemImages.backpack],
    status: "Potential Match",
  },
  {
    id: "found-earbuds",
    type: "found",
    itemName: "Midnight AirPods Case",
    category: "Electronics",
    color: "Midnight blue",
    description: "Small wireless earbuds case found beside the charging station.",
    location: "Student Union — Atrium",
    date: "24 Sept",
    time: "12:18 PM",
    images: [itemImages.earbuds],
    status: "Reported",
  },
  {
    id: "found-notebook",
    type: "found",
    itemName: "Navy Lecture Notebook",
    category: "Books",
    color: "Navy",
    description: "Navy notebook with handwritten economics notes and a silver elastic.",
    location: "Science Hall — Room 204",
    date: "23 Sept",
    time: "5:06 PM",
    images: [itemImages.notebook],
    status: "Recovered",
  },
];

export function getReports(): ItemReport[] {
  const stored = localStorage.getItem("findback-reports");
  if (!stored) {
    localStorage.setItem("findback-reports", JSON.stringify(demoReports));
    return demoReports;
  }
  return JSON.parse(stored) as ItemReport[];
}

export function saveReports(reports: ItemReport[]) {
  localStorage.setItem("findback-reports", JSON.stringify(reports));
}

export async function saveReport(report: ItemReport) {
  const reports = getReports();
  saveReports([report, ...reports]);
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    await supabase.from("reports").insert({
      user_id: data.session.user.id,
      report_type: report.type,
      item_name: report.itemName,
      category: report.category,
      brand: report.brand,
      color: report.color,
      description: report.description,
      location: report.location,
      reported_date: new Date().toISOString().slice(0, 10),
      reported_time: report.time,
      images: report.images,
      status: report.status.toLowerCase().replace(" ", "_"),
    });
  }
}

export function updateReportStatus(id: string, status: ReportStatus) {
  const reports = getReports().map((report) => report.id === id ? { ...report, status } : report);
  saveReports(reports);
}

export function getLatestReport() {
  return getReports()[0];
}
