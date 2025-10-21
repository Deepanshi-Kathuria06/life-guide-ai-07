import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Briefcase, Brain, DollarSign, Heart, Sparkles } from "lucide-react";

const coaches = [
  {
    name: "Fitness Coach",
    description: "Personalized workout plans, form tips, and motivational support",
    icon: Dumbbell,
    color: "coach-fitness",
  },
  {
    name: "Career Coach",
    description: "Resume reviews, interview prep, and career advancement strategies",
    icon: Briefcase,
    color: "coach-career",
  },
  {
    name: "Mindfulness Coach",
    description: "Meditation techniques, stress management, and peaceful living",
    icon: Brain,
    color: "coach-mindfulness",
  },
  {
    name: "Finance Coach",
    description: "Budgeting, saving strategies, and investment guidance",
    icon: DollarSign,
    color: "coach-finance",
  },
  {
    name: "Relationship Coach",
    description: "Communication skills and relationship dynamics guidance",
    icon: Heart,
    color: "coach-relationship",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="gradient" onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-4xl mx-auto space-y-8 relative">
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight">
            Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI Coach</span>
            <br />
            for Every Goal
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance from specialized AI coaches in fitness, career, mindfulness, finance, and relationships. Your 24/7 personal mentor awaits.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" variant="gradient" onClick={() => navigate("/signup")}>
              <Sparkles className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              Explore Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Coaches Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI Coaches</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coaches.map((coach) => {
            const Icon = coach.icon;
            return (
              <Card
                key={coach.name}
                className="relative p-8 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border-2 group overflow-hidden"
                style={{
                  borderImage: `linear-gradient(135deg, hsl(var(--${coach.color})), transparent) 1`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{coach.icon === Dumbbell ? "💪" : coach.icon === Briefcase ? "💼" : coach.icon === Brain ? "🧠" : coach.icon === DollarSign ? "💰" : "❤️"}</div>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: `hsl(var(--${coach.color}))` }}>
                    {coach.name}
                  </h4>
                  <p className="text-muted-foreground mb-6">{coach.description}</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    style={{ 
                      borderColor: `hsl(var(--${coach.color}))`,
                      color: `hsl(var(--${coach.color}))`
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Chat Now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Instant Responses</h4>
            <p className="text-muted-foreground">Get expert advice instantly, 24/7. No waiting, no scheduling.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Specialized Coaches</h4>
            <p className="text-muted-foreground">Each coach is trained in their specific domain for expert guidance.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Personalized Experience</h4>
            <p className="text-muted-foreground">Conversations are tailored to your specific goals and needs.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Start with 10 free messages. No credit card required.
          </p>
          <Button size="lg" variant="gradient" onClick={() => navigate("/signup")}>
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 CoachAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
