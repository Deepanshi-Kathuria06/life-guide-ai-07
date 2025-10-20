import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "7 days",
    features: [
      "Access to all AI coaches",
      "Unlimited conversations",
      "Message history saved",
      "No credit card required",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    features: [
      "Everything in Free Trial",
      "Unlimited access to all coaches",
      "Priority AI responses",
      "Advanced analytics",
      "Email support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    features: [
      "Everything in Pro",
      "Custom AI coaching models",
      "Team collaboration features",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleSelectPlan = async (planName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/signup");
      return;
    }

    if (planName === "Free Trial") {
      navigate("/dashboard");
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Stripe integration will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
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

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular
                  ? "border-primary border-2 shadow-elegant"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
