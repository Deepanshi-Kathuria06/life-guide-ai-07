import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dumbbell, Briefcase, Brain, DollarSign, Heart, Sparkles, Menu
} from "lucide-react";

const coaches = [
  {
    name: "Fitness Coach",
    description: "Personalized workout plans, form tips, and motivational support",
    icon: Dumbbell,
    color: "coach-fitness",
    emoji: "💪",
  },
  {
    name: "Career Coach",
    description: "Resume reviews, interview prep, and career advancement strategies",
    icon: Briefcase,
    color: "coach-career",
    emoji: "💼",
  },
  {
    name: "Mindfulness Coach",
    description: "Meditation techniques, stress management, and peaceful living",
    icon: Brain,
    color: "coach-mindfulness",
    emoji: "🧠",
  },
  {
    name: "Finance Coach",
    description: "Budgeting, saving strategies, and investment guidance",
    icon: DollarSign,
    color: "coach-finance",
    emoji: "💰",
  },
  {
    name: "Relationship Coach",
    description: "Communication skills and relationship dynamics guidance",
    icon: Heart,
    color: "coach-relationship",
    emoji: "❤️",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Conversations" },
  { value: "4.9/5", label: "User Rating" },
  { value: "24/7", label: "Availability" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Features", action: () => navigate("/features") },
    { label: "Pricing", action: () => navigate("/pricing") },
    { label: "About", action: () => navigate("/about") },
    { label: "Contact", action: () => navigate("/contact") },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md z-50 shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={item.action} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Log In
            </Button>
            <Button variant="gradient" size="sm" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                    AICOACHLY
                  </h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                    Log In
                  </Button>
                  <Button variant="gradient" className="w-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content - Single Screen */}
      <main className="flex-1 flex flex-col justify-center container mx-auto px-4 py-4 md:py-8 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-10 left-10 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 md:w-80 h-40 md:h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-3 md:space-y-4 relative mb-6 md:mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs md:text-sm font-medium text-primary">🚀 Powered by Advanced AI</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI-Powered</span> Life Coach
          </h2>
          
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance from 5 specialized AI coaches. Available 24/7 to help you achieve your goals.
          </p>
          
          <div className="flex flex-row gap-3 justify-center pt-2">
            <Button variant="gradient" onClick={() => navigate("/auth")} className="px-6 md:px-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Start Free
            </Button>
            <Button variant="outline" onClick={() => navigate("/pricing")} className="px-6 md:px-8">
              View Pricing
            </Button>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="relative">
          <h3 className="text-center text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6">
            Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">Coach</span>
          </h3>
          <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
            {coaches.map((coach) => (
              <Card
                key={coach.name}
                className="relative p-3 md:p-4 lg:p-6 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border group overflow-hidden hover:scale-105 cursor-pointer"
                style={{
                  borderColor: `hsl(var(--${coach.color}) / 0.3)`,
                }}
                onClick={() => navigate("/auth")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 animate-float">
                    {coach.emoji}
                  </div>
                  <h4 className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium leading-tight" style={{ color: `hsl(var(--${coach.color}))` }}>
                    {coach.name.replace(" Coach", "")}
                  </h4>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto mt-6 md:mt-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
