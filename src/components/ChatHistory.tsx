import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  coachType: string;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistory({ coachType, currentChatId, onChatSelect, onNewChat }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [coachType]);

  const loadChats = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .eq("coach_type", coachType)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history",
      });
      setLoading(false);
      return;
    }

    setChats((data || []) as Chat[]);
    setLoading(false);
  };

  return (
    <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Chat History</h3>
        <Button onClick={onNewChat} size="sm" variant="outline" className="text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          New
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 sm:py-8">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </div>
      ) : chats.length === 0 ? (
        <p className="text-muted-foreground text-xs sm:text-sm text-center py-6 sm:py-8">
          No chat history yet. Start a new conversation!
        </p>
      ) : (
        <div className="space-y-2 max-h-[200px] sm:max-h-[500px] overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all hover:bg-primary/10 ${
                currentChatId === chat.id ? "bg-primary/20 border border-primary/40" : "bg-background/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{chat.title}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {new Date(chat.updated_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
