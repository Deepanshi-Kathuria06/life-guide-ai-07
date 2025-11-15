import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Milestone {
  month: number;
  title: string;
  description: string;
  actionItems: string[];
  metrics: string[];
}

interface Timeline {
  durationMonths: number;
  milestones: Milestone[];
}

export default function TimelineGenerator() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  const generate = async () => {
    if (!goal.trim()) {
      toast({ title: "Please enter your goal", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-timeline', {
        body: { goal }
      });

      if (error) throw error;
      setTimeline(data);
      toast({
        title: "Timeline Created!",
        description: "Your 3-month roadmap is ready",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create timeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (timeline) {
    return (
      <Card className="glass-morphism border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your 3-Month Roadmap
          </CardTitle>
          <p className="text-sm text-muted-foreground">Goal: {goal}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {timeline.milestones.map((milestone, idx) => (
            <div key={idx} className="relative pl-8 pb-8 border-l-2 border-primary/30 last:pb-0">
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Month {milestone.month}</p>
                  <h4 className="font-semibold text-lg">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2">Action Items:</p>
                  <ul className="space-y-1">
                    {milestone.actionItems.map((item, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Success Metrics:</p>
                  <ul className="space-y-1">
                    {milestone.metrics.map((metric, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">→</span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          <Button onClick={() => setTimeline(null)} variant="outline" className="w-full">
            Create New Timeline
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Life Timeline Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a 3-month roadmap with AI-powered milestones
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="goal">What's your main goal?</Label>
          <Input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Learn a new skill, start a business, improve health..."
            className="mt-1"
          />
        </div>
        <Button onClick={generate} disabled={loading} className="w-full bg-gradient-primary">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Timeline...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Generate My Roadmap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}