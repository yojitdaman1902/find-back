import { createContext, useContext, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type SessionContextValue = { session: Session | null; isLoading: boolean };
const SessionContext = createContext<SessionContextValue>({ session: null, isLoading: true });

export function SessionContextProvider({ supabaseClient, children }: { supabaseClient: SupabaseClient; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => { setSession(data.session); setIsLoading(false); });
    const { data } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [supabaseClient]);
  return <SessionContext.Provider value={{ session, isLoading }}>{children}</SessionContext.Provider>;
}

export const useSessionContext = () => useContext(SessionContext);
