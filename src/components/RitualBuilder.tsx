import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Moon, Briefcase, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Ritual {
  title: string;
  steps: { step: string; duration: number }[];
  duration: number;
  reminders: { time: string; message: string }[];
}

export default function RitualBuilder() {
  const [loading, setLoading] = useState(false);
  const [ritual, setRitual] = useState<Ritual | null>(null);

  const buildRitual = async (type: 'morning' | 'evening' | 'work') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ritual', {
        body: { ritualType: type }
      });

      if (error) throw error;
      setRitual(data);
      toast({
        title: "Ritual Created!",
        description: "Your personalized routine is ready",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ritual",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (ritual) {
    return (
      <Card className="glass-morphism border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle>{ritual.title}</CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {ritual.duration} minutes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {ritual.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-background/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{step.step}</p>
                  <p className="text-xs text-muted-foreground">{step.duration} min</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setRitual(null)} variant="outline" className="w-full">
            Create Another Ritual
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/20">
      <CardHeader>
        <CardTitle>AI Ritual Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a personalized routine for optimal wellbeing
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => buildRitual('morning')}
          disabled={loading}
          className="h-32 flex-col gap-2 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 hover:from-orange-500/30 hover:to-yellow-500/30 border border-orange-500/20"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Sunrise className="h-8 w-8" />
              <span>Morning Ritual</span>
            </>
          )}
        </Button>
        <Button
          onClick={() => buildRitual('evening')}
          disabled={loading}
          className="h-32 flex-col gap-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/20"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Moon className="h-8 w-8" />
              <span>Evening Ritual</span>
            </>
          )}
        </Button>
        <Button
          onClick={() => buildRitual('work')}
          disabled={loading}
          className="h-32 flex-col gap-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/20"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Briefcase className="h-8 w-8" />
              <span>Work Ritual</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}