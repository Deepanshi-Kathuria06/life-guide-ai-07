import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome to CoachAI!",
        description: "Your account has been created.",
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Start Your Journey
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">7 days free trial, then $29/month</p>
        </div>

        <Card className="p-5 sm:p-8 bg-card/50 backdrop-blur-sm border-2">
          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="text-sm sm:text-base"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>

            <Button type="submit" className="w-full text-sm sm:text-base" disabled={loading} variant="gradient">
              {loading ? "Creating account..." : "Start Free Trial"}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0 text-primary text-xs sm:text-sm" onClick={() => navigate("/auth")}>
                Log in
              </Button>
            </p>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate("/")} className="text-muted-foreground text-xs sm:text-sm">
            ← Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
