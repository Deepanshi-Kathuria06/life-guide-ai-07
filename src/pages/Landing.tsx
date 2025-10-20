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
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CoachAI
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">
            Your Personal AI Coaches,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              All In One Place
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Get expert guidance across fitness, career, mindfulness, finance, and relationships.
            One subscription, unlimited potential.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Coaches Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Meet Your AI Coaches</h3>
          <p className="text-muted-foreground">
            Expert guidance tailored to every aspect of your life
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coaches.map((coach) => {
            const Icon = coach.icon;
            return (
              <Card
                key={coach.name}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
              >
                <div className={`w-12 h-12 rounded-xl bg-${coach.color}/10 flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${coach.color}`} />
                </div>
                <h4 className="text-xl font-semibold mb-2">{coach.name}</h4>
                <p className="text-muted-foreground">{coach.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary border-0">
          <h3 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/signup")}>
            Get Started Now
          </Button>
        </Card>
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
