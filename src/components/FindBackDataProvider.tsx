import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getActiveMatches, getReports, loadReportsForUser, type ItemReport, type Match } from "@/lib/findback-data";
import { useSessionContext } from "@/components/SessionContextProvider";

type FindBackData = {
  reports: ItemReport[];
  matches: Match[];
  profileName: string;
  isLoading: boolean;
  refreshReports: () => Promise<void>;
};

const FindBackDataContext = createContext<FindBackData>({ reports: [], matches: getActiveMatches(), profileName: "there", isLoading: true, refreshReports: async () => {} });

function fallbackName(email?: string) {
  return email?.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "there";
}

export function FindBackDataProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [profileName, setProfileName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const userId = session?.user.id;

  const refreshReports = async () => {
    if (userId) {
      setReports(await loadReportsForUser(userId));
    } else {
      setReports(getReports());
    }
  };

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
    setIsLoading(true);
    const load = async () => {
      if (session?.user) {
        const derivedName = session.user.user_metadata?.full_name || fallbackName(session.user.email);
        const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).maybeSingle();
        const { data: existingReports } = await supabase.from("reports").select("id").eq("user_id", session.user.id).limit(1);
        const anonymousReports = getReports().filter((report) => report.id.startsWith("report-"));
        if (!existingReports?.length && anonymousReports.length) {
          await supabase.from("reports").insert(anonymousReports.map((report) => ({ user_id: session.user.id, report_type: report.type, item_name: report.itemName, category: report.category, brand: report.brand, color: report.color, description: report.description, location: report.location, reported_date: report.date, reported_time: report.time, images: report.images, status: report.status.toLowerCase().replace(" ", "_") })));
        }
        if (!profile) {
          await supabase.from("profiles").upsert({ id: session.user.id, display_name: derivedName, updated_at: new Date().toISOString() });
        }
        if (active) {
          setProfileName(profile?.display_name || derivedName);
          setReports(await loadReportsForUser(session.user.id));
        }
      } else if (active) {
        setProfileName("there");
        setReports(getReports());
      }
      if (active) setIsLoading(false);
    };
    load();
    return () => { active = false; };
  }, [session, sessionLoading]);

  const value = useMemo(() => ({ reports, matches: session?.user ? (reports.length ? getActiveMatches(reports) : []) : getActiveMatches(reports), profileName, isLoading, refreshReports }), [reports, profileName, isLoading, userId, session?.user]);
  return <FindBackDataContext.Provider value={value}>{children}</FindBackDataContext.Provider>;
}

export const useFindBackData = () => useContext(FindBackDataContext);
