import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Target, Clock, Zap, Brain, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

const STEPS = [
  { icon: Target, label: "Your Goal", description: "What do you want to achieve?" },
  { icon: Clock, label: "Timeline", description: "When and how much time?" },
  { icon: Zap, label: "Difficulty", description: "Set your challenge level" },
  { icon: Brain, label: "Details", description: "Help us personalize" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "🌱 Easy", desc: "Gentle pace, small steps" },
  { value: "medium", label: "⚡ Medium", desc: "Balanced challenge" },
  { value: "hard", label: "🔥 Hard", desc: "Push your limits" },
];

const MOTIVATION_OPTIONS = [
  { value: "achievement", label: "🏆 Achievement", desc: "I love checking things off" },
  { value: "growth", label: "🌿 Growth", desc: "I want to become better" },
  { value: "accountability", label: "📊 Accountability", desc: "Keep me on track" },
  { value: "competition", label: "⚔️ Competition", desc: "I want to beat my past self" },
];

export default function AutopilotOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planPreview, setPlanPreview] = useState<any>(null);

  const [formData, setFormData] = useState({
    goalDescription: "",
    deadline: "",
    dailyTime: 30,
    difficulty: "medium",
    challenges: "",
    motivationType: "achievement",
  });

  const update = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return formData.goalDescription.trim().length > 5;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autopilot-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'generate_plan',
          payload: formData,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate plan');
      }

      const data = await response.json();
      setPlanPreview(data);
      setStep(4); // Show preview
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/dashboard")}>
            AICOACHLY
          </h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>← Back</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-primary" />
                    What's your big goal?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="e.g., Learn to code and build a SaaS product in 3 months..."
                    value={formData.goalDescription}
                    onChange={(e) => update("goalDescription", e.target.value)}
                    className="min-h-[120px] text-base"
                  />
                  <p className="text-sm text-muted-foreground">Be specific! The more detail, the better your AI plan.</p>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    Timeline & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Target Deadline (optional)</Label>
                    <Input type="date" value={formData.deadline} onChange={(e) => update("deadline", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Daily available time: {formData.dailyTime} minutes</Label>
                    <input
                      type="range" min={10} max={180} step={5}
                      value={formData.dailyTime}
                      onChange={(e) => update("dailyTime", parseInt(e.target.value))}
                      className="w-full mt-2 accent-[hsl(var(--primary))]"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10 min</span><span>1 hour</span><span>3 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" />
                    Challenge Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("difficulty", opt.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${formData.difficulty === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-sm text-muted-foreground">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-primary" />
                    Personalize Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Current challenges (optional)</Label>
                    <Textarea
                      placeholder="What obstacles might get in your way?"
                      value={formData.challenges}
                      onChange={(e) => update("challenges", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="mb-3 block">What motivates you?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {MOTIVATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => update("motivationType", opt.value)}
                          className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${formData.motivationType === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        >
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && planPreview && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Your AI-Generated Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {planPreview.plan?.motivational_note && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm italic">{planPreview.plan.motivational_note}</p>
                    </div>
                  )}

                  {planPreview.plan?.milestones && (
                    <div>
                      <h3 className="font-semibold mb-3">📍 Milestones</h3>
                      <div className="space-y-3">
                        {planPreview.plan.milestones.map((m: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg bg-card border border-border">
                            <div className="font-medium">{m.title}</div>
                            <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                            {m.target_date && <p className="text-xs text-primary mt-1">Target: {m.target_date}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {planPreview.plan?.first_week_tasks && (
                    <div>
                      <h3 className="font-semibold mb-3">📋 First Week Tasks</h3>
                      <div className="space-y-2">
                        {planPreview.plan.first_week_tasks.slice(0, 5).map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{t.priority}</span>
                            <span className="text-sm">{t.task_text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="gradient" className="w-full" size="lg" onClick={() => navigate("/autopilot")}>
                    <Rocket className="h-5 w-5 mr-2" />
                    Launch Autopilot Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate My Plan</>}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
