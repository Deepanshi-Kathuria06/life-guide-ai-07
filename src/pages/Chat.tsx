import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowLeft, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Dumbbell, Briefcase, Brain, DollarSign, Heart } from "lucide-react";

type CoachType = "fitness" | "career" | "mindfulness" | "finance" | "relationship";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const coachInfo = {
  fitness: {
    name: "Fitness Coach",
    icon: Dumbbell,
    color: "coach-fitness",
  },
  career: {
    name: "Career Coach",
    icon: Briefcase,
    color: "coach-career",
  },
  mindfulness: {
    name: "Mindfulness Coach",
    icon: Brain,
    color: "coach-mindfulness",
  },
  finance: {
    name: "Finance Coach",
    icon: DollarSign,
    color: "coach-finance",
  },
  relationship: {
    name: "Relationship Coach",
    icon: Heart,
    color: "coach-relationship",
  },
};

export default function Chat() {
  const navigate = useNavigate();
  const { coachType } = useParams<{ coachType: CoachType }>();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coach = coachType ? coachInfo[coachType] : null;
  const Icon = coach?.icon;

  useEffect(() => {
    checkUserAndLoadChat();
  }, [coachType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessage = (content: string, role: string) => {
    if (role === "user") {
      return content.replace(/\n/g, "<br />");
    }
    
    // AI message - parse markdown-like formatting
    let formatted = content
      // Bold text **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Bullet points
      .replace(/^[•\-\*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')
      // Numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, '<br />');
    
    // Wrap lists
    formatted = formatted.replace(/(<li class="ml-4">.*?<\/li>(\s|<br \/>)*)+/gs, (match) => {
      return '<ul class="list-disc space-y-1 my-2">' + match.replace(/<br \/>/g, '') + '</ul>';
    });
    formatted = formatted.replace(/(<li class="ml-4 list-decimal">.*?<\/li>(\s|<br \/>)*)+/gs, (match) => {
      return '<ol class="list-decimal space-y-1 my-2">' + match.replace(/<br \/>/g, '') + '</ol>';
    });
    
    // Wrap in paragraph if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
  };

  const checkUserAndLoadChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    await loadOrCreateChat(user.id);
  };

  const loadOrCreateChat = async (userId: string) => {
    // Try to find existing chat
    const { data: existingChats } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .eq("coach_type", coachType)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (existingChats && existingChats.length > 0) {
      setChatId(existingChats[0].id);
      await loadMessages(existingChats[0].id);
    } else {
      // Create new chat
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({
          user_id: userId,
          coach_type: coachType,
          title: `${coach?.name} Chat`,
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create chat",
        });
        return;
      }

      setChatId(newChat.id);
    }
  };

  const loadMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages",
      });
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to UI
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Save user message to database
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        role: "user",
        content: userMessage,
      });

    if (userMsgError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save message",
      });
      setLoading(false);
      return;
    }

    // Add placeholder for AI message that will be updated
    const tempAiMsgId = `temp-ai-${Date.now()}`;
    const tempAiMsg: Message = {
      id: tempAiMsgId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempAiMsg]);

    try {
      // Stream AI response
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .filter((m) => !m.id.startsWith("temp-"))
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: "user", content: userMessage }]),
          coachType: coachType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let aiResponseContent = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              aiResponseContent += content;
              // Update the AI message in UI
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAiMsgId ? { ...m, content: aiResponseContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save final AI message to database
      if (aiResponseContent) {
        await supabase.from("messages").insert({
          chat_id: chatId,
          role: "assistant",
          content: aiResponseContent,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
      });
      // Remove the temp AI message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
    }

    setLoading(false);
  };

  const handleClearChat = async () => {
    if (!chatId) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear chat",
      });
      return;
    }

    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been deleted",
    });
  };

  if (subscriptionLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  if (!coach || !Icon) {
    return <div>Invalid coach type</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${coach.color}/10 flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-${coach.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{coach.name}</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Guidance</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleClearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-2xl bg-${coach.color}/10 flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-8 w-8 text-${coach.color}`} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground">
                Ask me anything about {coach.name.toLowerCase().replace(" coach", "")}!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessage(message.content, message.role) 
                      }}
                    />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
