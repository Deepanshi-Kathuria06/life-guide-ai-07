import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MoodResult {
  detectedMood: string;
  moodScore: number;
  emotions: string[];
  suggestions: string[];
}

export default function MoodAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7);
    
    if (data) {
      setHistory(data.reverse().map((entry, idx) => ({
        day: idx + 1,
        score: entry.mood_score
      })));
    }
  };

  const analyze = async () => {
    if (!text.trim()) {
      toast({ title: "Please write how you feel", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: { moodText: text }
      });

      if (error) throw error;
      setResult(data);
      loadHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze mood",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-morphism border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            AI Mood Analyzer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Share how you're feeling and get instant insights
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I'm feeling..."
            rows={4}
            className="resize-none"
          />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Analyze My Mood
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div>
                  <p className="text-2xl font-bold capitalize">{result.detectedMood}</p>
                  <p className="text-sm text-muted-foreground">Detected Mood</p>
                </div>
                <div className="text-4xl font-bold text-primary">{result.moodScore}/10</div>
              </div>

              <div>
                <p className="font-semibold mb-2">Key Emotions:</p>
                <div className="flex flex-wrap gap-2">
                  {result.emotions.map((emotion, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-background/50 text-sm">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Suggestions:</p>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="glass-morphism border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mood Trend This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}