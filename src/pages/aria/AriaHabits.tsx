import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Flame, Trophy, Zap, Check, Star } from "lucide-react";
import { format, isToday, differenceInDays } from "date-fns";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  frequency: string;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  last_completed_at: string | null;
  category: string;
  is_active: boolean;
};

const ICONS = ["⭐", "💪", "📚", "🧘", "🏃", "💧", "🍎", "😴", "✍️", "🎯"];
const CATEGORIES = ["health", "fitness", "learning", "mindfulness", "productivity", "finance", "social", "personal"];

const LEVELS = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 100, title: "Starter" },
  { level: 3, xp: 300, title: "Apprentice" },
  { level: 4, xp: 600, title: "Dedicated" },
  { level: 5, xp: 1000, title: "Focused" },
  { level: 6, xp: 1500, title: "Committed" },
  { level: 7, xp: 2200, title: "Expert" },
  { level: 8, xp: 3000, title: "Master" },
  { level: 9, xp: 4000, title: "Legend" },
  { level: 10, xp: 5500, title: "Enlightened" },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(xp: number) {
  const current = getLevel(xp);
  const next = LEVELS.find(l => l.level === current.level + 1);
  return next || null;
}

export default function AriaHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const [newCategory, setNewCategory] = useState("personal");
  const [newFrequency, setNewFrequency] = useState("daily");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        loadHabits(user.id);
        loadXp(user.id);
      }
    });
  }, []);

  const loadHabits = async (uid: string) => {
    const { data } = await supabase.from("aria_habits").select("*").eq("user_id", uid).eq("is_active", true).order("created_at");
    if (data) setHabits(data as Habit[]);
  };

  const loadXp = async (uid: string) => {
    const { data } = await supabase.from("aria_xp_logs").select("xp_amount").eq("user_id", uid);
    if (data) setTotalXp(data.reduce((sum, r) => sum + (r as any).xp_amount, 0));
  };

  const createHabit = async () => {
    if (!newTitle.trim() || !userId) return;
    await supabase.from("aria_habits").insert({
      user_id: userId, title: newTitle.trim(), icon: newIcon, category: newCategory, frequency: newFrequency,
    });
    setNewTitle(""); setDialogOpen(false);
    loadHabits(userId);
    toast({ title: "Habit created!", description: "Start building your streak 🔥" });
  };

  const completeHabit = async (habit: Habit) => {
    if (!userId) return;
    if (habit.last_completed_at && isToday(new Date(habit.last_completed_at))) {
      toast({ title: "Already done today!", description: "Come back tomorrow 💪" }); return;
    }

    const wasYesterday = habit.last_completed_at
      ? differenceInDays(new Date(), new Date(habit.last_completed_at)) === 1
      : false;
    const newStreak = wasYesterday ? habit.current_streak + 1 : 1;
    const newBest = Math.max(newStreak, habit.best_streak);
    const xpEarned = 10 + (newStreak >= 7 ? 5 : 0) + (newStreak >= 30 ? 10 : 0);

    await supabase.from("aria_habits").update({
      current_streak: newStreak, best_streak: newBest,
      total_completions: habit.total_completions + 1,
      last_completed_at: new Date().toISOString(),
    }).eq("id", habit.id);

    await supabase.from("aria_habit_logs").insert({ user_id: userId, habit_id: habit.id });
    await supabase.from("aria_xp_logs").insert({
      user_id: userId, xp_amount: xpEarned, source: "habit", source_id: habit.id,
      description: `Completed "${habit.title}" (streak: ${newStreak})`,
    });

    loadHabits(userId); loadXp(userId);
    toast({ title: `+${xpEarned} XP!`, description: `${habit.icon} ${habit.title} — ${newStreak} day streak 🔥` });
  };

  const deleteHabit = async (id: string) => {
    if (!userId) return;
    await supabase.from("aria_habits").update({ is_active: false }).eq("id", id);
    loadHabits(userId);
  };

  const level = getLevel(totalXp);
  const nextLevel = getNextLevel(totalXp);
  const xpProgress = nextLevel ? ((totalXp - level.xp) / (nextLevel.xp - level.xp)) * 100 : 100;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        {/* XP & Level Bar */}
        <Card className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Level {level.level}</p>
                <h2 className="text-lg font-bold text-foreground">{level.title}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{totalXp} XP</p>
              {nextLevel && <p className="text-xs text-muted-foreground">{nextLevel.xp - totalXp} XP to Level {nextLevel.level}</p>}
            </div>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </Card>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Habits</h1>
            <p className="text-sm text-muted-foreground">{habits.length} active habits</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Habit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Habit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Habit title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(i => (
                    <button key={i} onClick={() => setNewIcon(i)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-colors ${newIcon === i ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                      {i}
                    </button>
                  ))}
                </div>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newFrequency} onValueChange={setNewFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createHabit} className="w-full" disabled={!newTitle.trim()}>Create Habit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <Card className="p-10 text-center">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No habits yet — start building your streaks!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map(h => {
              const doneToday = h.last_completed_at ? isToday(new Date(h.last_completed_at)) : false;
              return (
                <Card key={h.id} className={`p-4 transition-all ${doneToday ? "border-primary/40 bg-primary/5" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{h.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{h.category}</Badge>
                          <Badge variant="outline" className="text-xs">{h.frequency}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant={doneToday ? "secondary" : "default"} onClick={() => completeHabit(h)} disabled={doneToday}>
                      {doneToday ? <><Check className="w-4 h-4 mr-1" /> Done</> : "Complete"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {h.current_streak} day streak</span>
                    <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-yellow-500" /> Best: {h.best_streak}</span>
                    <span>Total: {h.total_completions}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
