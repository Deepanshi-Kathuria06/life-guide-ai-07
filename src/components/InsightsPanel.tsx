import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InsightsPanelProps {
  chatId: string | null;
}

export default function InsightsPanel({ chatId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { chatId }
      });

      if (error) throw error;

      setInsights(data.insights);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatInsights = (content: string) => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
      .replace(/^[•\-\*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, '<br />');
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={loading || !chatId}
          size="sm"
          className="bg-gradient-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      {insights ? (
        <div 
          className="prose prose-sm prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formatInsights(insights) }}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          Click generate to get AI-powered insights about your conversation
        </p>
      )}
    </Card>
  );
}
