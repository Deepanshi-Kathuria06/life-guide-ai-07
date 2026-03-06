import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, Heart, Zap, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

const MOODS = [
  { score: 1, label: "Terrible", emoji: "😢", color: "text-red-500" },
  { score: 2, label: "Bad", emoji: "😞", color: "text-red-400" },
  { score: 3, label: "Low", emoji: "😔", color: "text-orange-400" },
  { score: 4, label: "Meh", emoji: "😐", color: "text-orange-300" },
  { score: 5, label: "Okay", emoji: "🙂", color: "text-yellow-400" },
  { score: 6, label: "Fine", emoji: "😊", color: "text-yellow-300" },
  { score: 7, label: "Good", emoji: "😄", color: "text-green-400" },
  { score: 8, label: "Great", emoji: "😁", color: "text-green-500" },
  { score: 9, label: "Amazing", emoji: "🤩", color: "text-emerald-500" },
  { score: 10, label: "Incredible", emoji: "🥳", color: "text-emerald-400" },
];

const ENERGY = [
  { level: 1, label: "Exhausted", emoji: "🪫" },
  { level: 2, label: "Low", emoji: "🔋" },
  { level: 3, label: "Normal", emoji: "⚡" },
  { level: 4, label: "High", emoji: "💪" },
  { level: 5, label: "Supercharged", emoji: "🚀" },
];

const MOOD_TAGS = ["work", "relationships", "health", "sleep", "exercise", "social", "alone time", "stress", "gratitude", "weather"];

type MoodEntry = {
  id: string;
  mood_score: number;
  mood_label: string;
  energy_level: number | null;
  journal_entry: string | null;
  tags: string[];
  ai_insight: string | null;
  created_at: string;
};

export default function AriaMood() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [journal, setJournal] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadEntries(user.id); }
    });
  }, []);

  const loadEntries = async (uid: string) => {
    const { data } = await supabase.from("aria_mood_entries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(30);
    if (data) setEntries(data as MoodEntry[]);
  };

  const logMood = async () => {
    if (!selectedMood || !userId) return;
    setIsLogging(true);
    const mood = MOODS.find(m => m.score === selectedMood)!;

    // Get AI insight
    let aiInsight: string | null = null;
    try {
      const resp = await supabase.functions.invoke("aria-summarize", {
        body: { type: "mood_insight", content: `Mood: ${mood.label} (${selectedMood}/10), Energy: ${selectedEnergy}/5, Journal: ${journal || "none"}, Tags: ${selectedTags.join(", ") || "none"}` },
      });
      aiInsight = resp.data?.summary || null;
    } catch {}

    await supabase.from("aria_mood_entries").insert({
      user_id: userId, mood_score: selectedMood, mood_label: mood.label,
      energy_level: selectedEnergy, journal_entry: journal || null,
      tags: selectedTags, ai_insight: aiInsight,
    });

    // Award XP
    await supabase.from("aria_xp_logs").insert({
      user_id: userId, xp_amount: 5, source: "mood_log", description: "Logged daily mood",
    });

    setSelectedMood(null); setJournal(""); setSelectedTags([]); setSelectedEnergy(3);
    loadEntries(userId);
    toast({ title: "+5 XP! Mood logged", description: aiInsight || `Feeling ${mood.label.toLowerCase()} today` });
    setIsLogging(false);
  };

  const avgMood = entries.length ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1) : "—";
  const last7 = entries.filter(e => new Date(e.created_at) > subDays(new Date(), 7));
  const weekAvg = last7.length ? (last7.reduce((s, e) => s + e.mood_score, 0) / last7.length).toFixed(1) : "—";

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-foreground">{weekAvg}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Avg</p>
            <p className="text-2xl font-bold text-foreground">{avgMood}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Entries</p>
            <p className="text-2xl font-bold text-foreground">{entries.length}</p>
          </Card>
        </div>

        {/* Log Mood */}
        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-bold text-foreground">How are you feeling?</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {MOODS.map(m => (
              <button key={m.score} onClick={() => setSelectedMood(m.score)}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all min-w-[60px] ${selectedMood === m.score ? "border-primary bg-primary/10 scale-110" : "border-border hover:bg-muted"}`}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{m.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Energy level</p>
                <div className="flex gap-2">
                  {ENERGY.map(e => (
                    <button key={e.level} onClick={() => setSelectedEnergy(e.level)}
                      className={`flex-1 p-2 rounded-lg border text-center transition-all ${selectedEnergy === e.level ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                      <span className="text-lg">{e.emoji}</span>
                      <p className="text-[10px] text-muted-foreground">{e.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">What's influencing your mood?</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map(t => (
                    <Badge key={t} variant={selectedTags.includes(t) ? "default" : "outline"}
                      className="cursor-pointer" onClick={() => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <Textarea placeholder="Journal entry (optional)..." value={journal} onChange={e => setJournal(e.target.value)} rows={3} />
              <Button onClick={logMood} disabled={isLogging} className="w-full">
                {isLogging ? "Logging..." : "Log Mood & Earn 5 XP"}
              </Button>
            </>
          )}
        </Card>

        {/* History */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Recent Entries</h2>
          {entries.map(e => {
            const mood = MOODS.find(m => m.score === e.mood_score);
            return (
              <Card key={e.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mood?.emoji}</span>
                    <div>
                      <p className="font-medium text-foreground">{mood?.label} <span className="text-muted-foreground text-sm">({e.mood_score}/10)</span></p>
                      <p className="text-xs text-muted-foreground">{format(new Date(e.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  {e.energy_level && <span className="text-lg">{ENERGY[e.energy_level - 1]?.emoji}</span>}
                </div>
                {e.journal_entry && <p className="text-sm text-muted-foreground mt-2">{e.journal_entry}</p>}
                {e.tags?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">{e.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                )}
                {e.ai_insight && (
                  <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary">💡 {e.ai_insight}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
