import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import CoachCard from "@/components/CoachCard";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export default function Dashboard() {
  const navigate = useNavigate();
  const { hasAccess, loading } = useSubscription();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setCheckingAuth(false);
    }
  };


  if (loading || checkingAuth) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => navigate("/autopilot")}
                className="text-sm hover:text-primary transition-colors"
              >
                Life Autopilot
              </button>
            </nav>
          </div>
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="mb-8 sm:mb-12 md:mb-16 text-center px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">Coach</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Select an AI coach to start your personalized guidance session
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <CoachCard
            type="fitness"
            name="Fitness Coach"
            description="Personalized workout plans, form tips, and motivational support"
          />
          <CoachCard
            type="career"
            name="Career Coach"
            description="Resume reviews, interview prep, and career advancement strategies"
          />
          <CoachCard
            type="mindfulness"
            name="Mindfulness Coach"
            description="Meditation techniques, stress management, and peaceful living"
          />
          <CoachCard
            type="finance"
            name="Finance Coach"
            description="Budgeting, saving strategies, and investment guidance"
          />
          <CoachCard
            type="relationship"
            name="Relationship Coach"
            description="Communication skills and relationship dynamics guidance"
          />
        </div>
      </main>
    </div>
  );
}
