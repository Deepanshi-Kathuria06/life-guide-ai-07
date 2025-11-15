import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface JournalAnalysis {
  themes: string[];
  patterns: string[];
  improvements: string[];
  positivityIndex: number;
  analysis: string;
}

export default function ReflectionJournal() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);

  const analyze = async () => {
    if (!content.trim()) {
      toast({ title: "Please write your journal entry", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-journal', {
        body: { content }
      });

      if (error) throw error;
      setAnalysis(data);
      toast({
        title: "Analysis Complete!",
        description: "Your journal has been analyzed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze journal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-morphism border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          AI Reflection Journal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Write your thoughts and get AI-powered insights
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your day, thoughts, feelings..."
          rows={8}
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
              <Lightbulb className="h-4 w-4 mr-2" />
              Analyze My Journal
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="font-semibold">Positivity Index</p>
              <div className="text-3xl font-bold text-primary">{analysis.positivityIndex}/10</div>
            </div>

            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">•</span>
                Main Themes:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-background/50 text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">•</span>
                Patterns Detected:
              </p>
              <ul className="space-y-1 ml-4">
                {analysis.patterns.map((pattern, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">•</span>
                Areas to Improve:
              </p>
              <ul className="space-y-1 ml-4">
                {analysis.improvements.map((improvement, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm italic">{analysis.analysis}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}