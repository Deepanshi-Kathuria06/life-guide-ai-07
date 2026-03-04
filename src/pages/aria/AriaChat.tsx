import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Loader2, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const quickPrompts = [
  "Help me plan my week",
  "Review my goals",
  "I need to make a decision",
  "What should I focus on today?",
];

export default function AriaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const state = location.state as any;
    if (state?.initialMessage) {
      setInput(state.initialMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const createConversation = async () => {
    if (conversationId) return conversationId;
    const { data } = await supabase.from("aria_conversations").insert({ user_id: userId!, title: "New conversation" }).select("id").single();
    if (data) { setConversationId(data.id); return data.id; }
    return null;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("aria_messages").insert({ user_id: userId!, conversation_id: convId, role, content });
  };

  const detectAndCreateTask = async (content: string) => {
    const match = content.match(/\[TASK_DETECTED\](.*?)\[\/TASK_DETECTED\]/s);
    if (match) {
      try {
        const task = JSON.parse(match[1]);
        await supabase.from("aria_tasks").insert({
          user_id: userId!,
          title: task.title,
          description: task.description || null,
          due_at: task.due_at || null,
          priority: task.priority || "medium",
          category: task.category || "personal",
        });
        toast({ title: "Task created", description: task.title });
      } catch {}
      return content.replace(/\[TASK_DETECTED\].*?\[\/TASK_DETECTED\]/s, "").trim();
    }
    return content;
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading || !userId) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const convId = await createConversation();
      if (!convId) throw new Error("Failed to create conversation");
      await saveMessage(convId, "user", msg);

      const allMessages = [...messages, userMsg];

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aria-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, userId, conversationId: convId }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI error" }));
        throw new Error(err.error || "AI service error");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {}
        }
      }

      const cleanContent = await detectAndCreateTask(assistantContent);
      if (cleanContent !== assistantContent) {
        setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: cleanContent } : m));
      }
      await saveMessage(convId, "assistant", cleanContent);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast({ title: "Not supported", description: "Voice input not supported in this browser", variant: "destructive" });
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">Hi, I'm ARIA</h2>
                <p className="text-muted-foreground text-sm">Your personal life operating system. How can I help?</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {quickPrompts.map((p) => (
                  <Button key={p} variant="outline" size="sm" className="border-border text-sm" onClick={() => sendMessage(p)}>
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-background">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Button variant="ghost" size="icon" onClick={toggleVoice} className={isListening ? "text-destructive" : "text-muted-foreground"}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Input
              placeholder="Message ARIA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="bg-muted border-border"
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
