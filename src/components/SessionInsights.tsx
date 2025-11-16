import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, TrendingUp, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SessionInsightsProps {
  chatId: string | null;
  coachType: string;
}

export default function SessionInsights({ chatId, coachType }: SessionInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatId) loadInsights();
  }, [chatId]);

  const loadInsights = async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { chatId, coachType }
      });

      if (error) throw error;
      setInsights(data.insights);
    } catch (error: any) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const insightCards = [
    { icon: TrendingUp, label: "Growth Areas", color: "text-green-400" },
    { icon: Target, label: "Focus Points", color: "text-blue-400" },
    { icon: Zap, label: "Quick Wins", color: "text-yellow-400" },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Session Insights</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : insights ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {insightCards.map((card, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-background/30">
                <card.icon className={`h-5 w-5 mx-auto mb-1 ${card.color}`} />
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="prose prose-sm prose-invert max-w-none bg-background/30 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{insights}</p>
          </div>
          <Button onClick={loadInsights} variant="outline" size="sm" className="w-full">
            Refresh Insights
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          Start chatting to get personalized insights about your progress and patterns.
        </p>
      )}
    </Card>
  );
}
