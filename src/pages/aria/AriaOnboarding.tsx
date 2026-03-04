import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { key: "name", question: "What should I call you?", placeholder: "Your name", type: "input" },
  { key: "goals_summary", question: "What are your main life goals right now?", placeholder: "e.g., Get promoted, improve fitness, save for a house...", type: "textarea" },
  { key: "work_situation", question: "What's your current work situation?", placeholder: "e.g., Software engineer at a startup, freelancer, student...", type: "input" },
  { key: "challenges", question: "What are your biggest challenges?", placeholder: "e.g., Time management, staying consistent, work-life balance...", type: "textarea" },
  { key: "communication_style", question: "How should I communicate with you?", placeholder: "", type: "select", options: [
    { value: "casual", label: "Casual & Friendly", desc: "Like talking to a smart friend" },
    { value: "formal", label: "Formal & Professional", desc: "Structured and business-like" },
    { value: "coach", label: "Coach-like", desc: "Motivating and accountability-focused" },
    { value: "secretary", label: "Secretary-like", desc: "Efficient and action-oriented" },
  ]},
];

export default function AriaOnboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentStep = steps[step];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("aria_profiles").upsert({
        user_id: user.id,
        name: answers.name || null,
        goals_summary: answers.goals_summary || null,
        work_situation: answers.work_situation || null,
        challenges: answers.challenges || null,
        communication_style: answers.communication_style || "casual",
      }, { onConflict: "user_id" });

      toast({ title: "Welcome aboard! 🎉", description: "ARIA is ready to help you." });
      navigate("/app");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground text-center">{currentStep.question}</h2>

            {currentStep.type === "input" && (
              <Input
                placeholder={currentStep.placeholder}
                value={answers[currentStep.key] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentStep.key]: e.target.value })}
                className="bg-muted border-border text-center"
              />
            )}

            {currentStep.type === "textarea" && (
              <Textarea
                placeholder={currentStep.placeholder}
                value={answers[currentStep.key] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentStep.key]: e.target.value })}
                className="bg-muted border-border min-h-[100px]"
              />
            )}

            {currentStep.type === "select" && (
              <div className="grid grid-cols-2 gap-3">
                {currentStep.options?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers({ ...answers, [currentStep.key]: opt.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      answers[currentStep.key] === opt.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={saving} className="flex-1">
                  {saving ? "Setting up..." : "Get Started"} <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
