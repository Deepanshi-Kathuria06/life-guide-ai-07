import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import CoachCard from "@/components/CoachCard";

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
      navigate("/login");
    } else {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
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
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CoachAI
            </h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Coach</h2>
          <p className="text-muted-foreground text-lg">
            Select an AI coach to start your personalized guidance session
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
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
