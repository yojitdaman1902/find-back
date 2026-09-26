import { SessionContextProvider } from "@/components/SessionContextProvider";
import { FindBackDataProvider } from "@/components/FindBackDataProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Report from "./pages/Report";
import Analysis from "./pages/Analysis";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Dashboard from "./pages/Dashboard";
import FoundItems from "./pages/FoundItems";
import OwnershipVerification from "./pages/OwnershipVerification";
import Chat from "./pages/Chat";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <FindBackDataProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/report/:type/:reportId" element={<Report />} />
            <Route path="/report/:type" element={<Report />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:matchId" element={<MatchDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/found-items" element={<FoundItems />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/verify-ownership/:foundReportId" element={<OwnershipVerification />} />
            <Route path="/auth/:path" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </FindBackDataProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;
