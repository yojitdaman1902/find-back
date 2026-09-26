import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { demoFoundReports, getActiveMatches, getPotentialMatchCount, getReports, loadMatchFeatures, loadReportsForUser, type ItemReport, type Match } from "@/lib/findback-data";
import { useSessionContext } from "@/components/SessionContextProvider";

type FindBackData = {
  reports: ItemReport[];
  sharedReports: ItemReport[];
  matches: Match[];
  profileName: string;
  isLoading: boolean;
  refreshReports: () => Promise<void>;
};

const FindBackDataContext = createContext<FindBackData>({ reports: [], sharedReports: demoFoundReports, matches: getActiveMatches(), profileName: "there", isLoading: true, refreshReports: async () => {} });

function fallbackName(email?: string) {
  return email?.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "there";
}

export function FindBackDataProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matchReports, setMatchReports] = useState<ItemReport[]>([]);
  const [profileName, setProfileName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const userId = session?.user.id;

  const refreshReports = async () => {
    if (userId) {
      const [ownReports, sharedReports] = await Promise.all([loadReportsForUser(userId), loadMatchFeatures()]);
      setReports(ownReports);
      setMatchReports([...demoFoundReports, ...sharedReports]);
    } else {
      const localReports = getReports();
      setReports(localReports);
      setMatchReports([...demoFoundReports, ...localReports]);
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
          for (const report of anonymousReports) {
            const { data: inserted } = await supabase.from("reports").insert({ user_id: session.user.id, report_type: report.type, item_name: report.itemName, category: report.category, brand: report.brand, color: report.color, description: report.description, public_description: report.publicDescription, finder_first_name: report.finderFirstName, location: report.location, reported_date: report.date, reported_time: report.time, images: report.images, status: report.status.toLowerCase().replace(/\s+/g, "_") }).select("id").single();
            if (inserted?.id && report.ownershipVerification?.length) {
              await supabase.from("ownership_verification_clues").insert(report.ownershipVerification.slice(0, 5).map((clue, position) => ({ report_id: inserted.id, owner_user_id: session.user.id, question: clue.question, answer: clue.answer, position })));
            }
          }
        }
        if (!profile) {
          await supabase.from("profiles").upsert({ id: session.user.id, display_name: derivedName, updated_at: new Date().toISOString() });
        }
        if (active) {
          const [ownReports, sharedReports] = await Promise.all([loadReportsForUser(session.user.id), loadMatchFeatures()]);
          setProfileName(profile?.display_name || derivedName);
          setReports(ownReports);
          setMatchReports([...demoFoundReports, ...sharedReports]);
        }
      } else if (active) {
        const localReports = getReports();
        setProfileName("there");
        setReports(localReports);
        setMatchReports([...demoFoundReports, ...localReports]);
      }
      if (active) setIsLoading(false);
    };
    load();
    return () => { active = false; };
  }, [session, sessionLoading]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refreshSharedReports = async () => {
      const [ownReports, sharedReports] = await Promise.all([loadReportsForUser(userId), loadMatchFeatures()]);
      if (active) {
        setReports(ownReports);
        setMatchReports([...demoFoundReports, ...sharedReports]);
      }
    };
    const interval = window.setInterval(refreshSharedReports, 5000);
    window.addEventListener("focus", refreshSharedReports);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshSharedReports);
    };
  }, [userId]);

  const displayReports = useMemo(() => reports.map((report) => report.type === "lost" && report.status === "Reported" && getPotentialMatchCount(report, matchReports) > 0 ? { ...report, status: "Ownership Verification Pending" as const } : report), [reports, matchReports]);
  const value = useMemo(() => ({ reports: displayReports, sharedReports: matchReports, matches: session?.user ? (displayReports.length ? getActiveMatches(displayReports, matchReports) : []) : getActiveMatches(displayReports, matchReports), profileName, isLoading, refreshReports }), [displayReports, matchReports, profileName, isLoading, userId, session?.user]);
  return <FindBackDataContext.Provider value={value}>{children}</FindBackDataContext.Provider>;
}

export const useFindBackData = () => useContext(FindBackDataContext);
