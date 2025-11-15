import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function MiniAIDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: { moodText: question }
      });

      if (error) throw error;
      setResponse(`I sense you're feeling ${data.detectedMood}. ${data.suggestions[0]}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-elegant bg-gradient-primary z-50 hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] glass-morphism border-primary/20 shadow-elegant z-50 animate-scale-in">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Ask Me Anything
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Try asking me: "I'm feeling overwhelmed with work"
        </p>
        {response && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
            {response}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How are you feeling today?"
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            disabled={loading}
          />
          <Button
            onClick={handleAsk}
            disabled={loading}
            size="icon"
            className="bg-gradient-primary"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}