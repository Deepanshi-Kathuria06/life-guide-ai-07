import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";

// ARIA Pages
import AriaDashboard from "./pages/aria/AriaDashboard";
import AriaChat from "./pages/aria/AriaChat";
import AriaTasks from "./pages/aria/AriaTasks";
import AriaDocuments from "./pages/aria/AriaDocuments";
import AriaGoals from "./pages/aria/AriaGoals";
import AriaNotes from "./pages/aria/AriaNotes";
import AriaCalendar from "./pages/aria/AriaCalendar";
import AriaSettings from "./pages/aria/AriaSettings";
import AriaOnboarding from "./pages/aria/AriaOnboarding";
import AriaHabits from "./pages/aria/AriaHabits";
import AriaMood from "./pages/aria/AriaMood";
import AriaFinance from "./pages/aria/AriaFinance";
import AriaFocus from "./pages/aria/AriaFocus";
import AriaBookmarks from "./pages/aria/AriaBookmarks";
import AriaWeeklyReview from "./pages/aria/AriaWeeklyReview";

const queryClient = new QueryClient();

// Handle OAuth callback redirect
function OAuthRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? "/app" : "/login", { replace: true });
    });
  }, [navigate]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/~oauth" element={<OAuthRedirect />} />

          {/* ARIA App Routes */}
          <Route path="/app" element={<AriaDashboard />} />
          <Route path="/app/chat" element={<AriaChat />} />
          <Route path="/app/tasks" element={<AriaTasks />} />
          <Route path="/app/documents" element={<AriaDocuments />} />
          <Route path="/app/goals" element={<AriaGoals />} />
          <Route path="/app/notes" element={<AriaNotes />} />
          <Route path="/app/calendar" element={<AriaCalendar />} />
          <Route path="/app/habits" element={<AriaHabits />} />
          <Route path="/app/mood" element={<AriaMood />} />
          <Route path="/app/finance" element={<AriaFinance />} />
          <Route path="/app/focus" element={<AriaFocus />} />
          <Route path="/app/bookmarks" element={<AriaBookmarks />} />
          <Route path="/app/review" element={<AriaWeeklyReview />} />
          <Route path="/app/settings" element={<AriaSettings />} />
          <Route path="/app/onboarding" element={<AriaOnboarding />} />

          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/chat/*" element={<Navigate to="/app/chat" replace />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
