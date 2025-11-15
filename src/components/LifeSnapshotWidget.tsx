import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LifeSnapshotResult {
  lifeScore: number;
  priority: string;
  analysis: string;
}

export default function LifeSnapshotWidget() {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LifeSnapshotResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q1 || !q2 || !q3) {
      toast({ title: "Please answer all questions", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-life-snapshot', {
        body: { question1: q1, question2: q2, question3: q3 }
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate snapshot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card className="glass-morphism border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your AI Life Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {result.lifeScore}
            </div>
            <p className="text-sm text-muted-foreground">Life Score</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="font-semibold mb-1">Today's Priority:</p>
            <p className="text-foreground">{result.priority}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {result.analysis}
          </div>
          <Button onClick={() => setResult(null)} variant="outline" className="w-full">
            Take Another Snapshot
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Life Snapshot
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Answer 3 quick questions for instant insights
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="q1">What's your biggest priority right now?</Label>
            <Input
              id="q1"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="Career growth, health, relationships..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="q2">How are you feeling today?</Label>
            <Input
              id="q2"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="Energized, stressed, hopeful..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="q3">What would make today great?</Label>
            <Input
              id="q3"
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              placeholder="Completing a task, connecting with someone..."
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get My Life Score
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}