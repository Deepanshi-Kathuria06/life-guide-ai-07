import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ListTodo, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ActionPlansGeneratorProps {
  coachType: string;
}

export default function ActionPlansGenerator({ coachType }: ActionPlansGeneratorProps) {
  const [challenge, setChallenge] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generateActionPlan = async () => {
    if (!challenge.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your challenge or goal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-action-plan', {
        body: { challenge, coachType }
      });

      if (error) throw error;

      setActionPlan(data.actionPlan);
    } catch (error: any) {
      console.error('Error generating action plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate action plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatActionPlan = (content: string) => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
      .replace(/^[•\-\*]\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-2 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mt-3">')
      .replace(/\n/g, '<br />');
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <ListTodo className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Personalized Action Plan</h3>
      </div>

      <div className="space-y-4">
        <Textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="Describe your current challenge or goal..."
          className="min-h-[100px]"
          disabled={loading}
        />

        <Button
          onClick={generateActionPlan}
          disabled={loading || !challenge.trim()}
          className="w-full bg-gradient-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Action Plan
            </>
          )}
        </Button>

        {actionPlan && (
          <div 
            className="prose prose-sm prose-invert max-w-none bg-background/30 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: formatActionPlan(actionPlan) }}
          />
        )}
      </div>
    </Card>
  );
}
