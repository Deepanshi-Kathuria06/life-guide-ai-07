import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, ArrowLeft, Send, Trash2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Dumbbell, Briefcase, Brain, DollarSign, Heart } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import InsightsPanel from "@/components/InsightsPanel";
import ProgressTracker from "@/components/ProgressTracker";
import GoalsManager from "@/components/GoalsManager";
import ChatHistory from "@/components/ChatHistory";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unsavedMessages, setUnsavedMessages] = useState<{role: string, content: string}[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coach = coachType ? coachInfo[coachType] : null;
  const Icon = coach?.icon;

  useEffect(() => {
    checkUserAndLoadChat();
  }, [coachType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle browser close/refresh - show native prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedMessages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedMessages]);

  const handleNavigateAway = (path: string) => {
    if (unsavedMessages.length > 0) {
      setPendingNavigation(path);
      setShowSaveDialog(true);
    } else {
      navigate(path);
    }
  };

  const saveAndNavigate = async () => {
    if (unsavedMessages.length > 0 && chatId) {
      const messagesToSave = unsavedMessages.map(msg => ({
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
      }));
      await supabase.from("messages").insert(messagesToSave);
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
      toast({ title: "Chat saved", description: "Your conversation has been saved." });
    }
    setUnsavedMessages([]);
    setShowSaveDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const discardAndNavigate = async () => {
    // Don't save - just clear unsaved messages
    setUnsavedMessages([]);
    setShowSaveDialog(false);
    toast({ title: "Chat discarded", description: "Your conversation was not saved." });
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessage = (content: string, role: string) => {
    if (role === "user") {
      return content.replace(/\n/g, "<br />");
    }
    
    // AI message - ChatGPT style formatting
    let formatted = content
      // Bold text **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Italic text *text*
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      // Paragraph breaks
      .replace(/\n\n/g, '</p><p class="mt-4 leading-relaxed">')
      // Single line breaks
      .replace(/\n/g, '<br />');
    
    // Wrap in paragraph
    if (!formatted.startsWith('<')) {
      formatted = '<p class="leading-relaxed">' + formatted + '</p>';
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
      await createNewChat(userId);
    }
  };

  const createNewChat = async (userId?: string) => {
    let user_id = userId;
    if (!user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      user_id = user.id;
    }

    const { data: newChat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user_id,
        coach_type: coachType,
        title: `${coach?.name} Chat - ${new Date().toLocaleDateString()}`,
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
    setMessages([]);
  };

  const handleChatSelect = async (selectedChatId: string) => {
    setChatId(selectedChatId);
    await loadMessages(selectedChatId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewChat();
    setSidebarOpen(false);
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

    // Add user message to UI instantly
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    
    // Queue for batch save later
    setUnsavedMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    const tempAiMsgId = `temp-ai-${Date.now()}`;
    const tempAiMsg: Message = {
      id: tempAiMsgId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempAiMsg]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
          chatId: chatId,
          userId: user?.id,
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

      // Queue AI response for batch save
      if (aiResponseContent) {
        setUnsavedMessages((prev) => [...prev, { role: "assistant", content: aiResponseContent }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
      // Remove user message from unsaved queue on error
      setUnsavedMessages((prev) => prev.slice(0, -1));
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

  // Sidebar content component
  const SidebarContent = () => (
    <div className="p-4 space-y-4">
      <GoalsManager coachType={coachType || ''} chatId={chatId} />
      <ProgressTracker chatId={chatId} coachType={coachType || ''} />
      <ChatHistory 
        coachType={coachType || ''} 
        currentChatId={chatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
    </div>
  );

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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border flex-shrink-0">
        <div className="px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <ScrollArea className="h-full">
                  <SidebarContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" onClick={() => handleNavigateAway("/dashboard")} className="hidden sm:flex">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${coach.color}/10 flex items-center justify-center`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${coach.color}`} />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-semibold">{coach.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">AI-Powered Guidance</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-xs sm:text-sm">
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-80 border-r border-border flex-shrink-0">
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Messages */}
          <ScrollArea className="flex-1">
            <div className="px-3 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">
              {messages.length > 5 && (
                <div className="mb-4 sm:mb-6">
                  <InsightsPanel chatId={chatId} />
                </div>
              )}
          
              {messages.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-${coach.color}/10 flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${coach.color}`} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Start a conversation</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Ask me anything about {coach.name.toLowerCase().replace(" coach", "")}!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 ${
                          message.role === "user"
                            ? "bg-gradient-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                            : "glass-morphism"
                        }`}
                      >
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert text-sm sm:text-base"
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
          </ScrollArea>

          {/* Fixed Input Bar */}
          <div className="border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
            <div className="px-3 sm:px-6 py-3 sm:py-4 max-w-4xl mx-auto">
              <div className="flex gap-2">
                <VoiceInput
                  onTranscript={(text) => setInput(text)}
                  disabled={loading}
                />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 glass-morphism text-sm sm:text-base"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="bg-gradient-primary hover-lift"
                  size="icon"
                >
                  {loading ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Chat Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved messages. Would you like to save this conversation before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardAndNavigate}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={saveAndNavigate}>
              Save Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
