import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare, Clock, FileText, Target, Send, Sparkles,
  Flame, Zap, SmilePlus, Wallet, Timer, TrendingUp,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

const LEVELS = [
  { level: 1, xp: 0, title: "Beginner" }, { level: 2, xp: 100, title: "Starter" },
  { level: 3, xp: 300, title: "Apprentice" }, { level: 4, xp: 600, title: "Dedicated" },
  { level: 5, xp: 1000, title: "Focused" }, { level: 6, xp: 1500, title: "Committed" },
  { level: 7, xp: 2200, title: "Expert" }, { level: 8, xp: 3000, title: "Master" },
  { level: 9, xp: 4000, title: "Legend" }, { level: 10, xp: 5500, title: "Enlightened" },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i];
  }
  return LEVELS[0];
}

export default function AriaDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [moodToday, setMoodToday] = useState<any>(null);
  const [stats, setStats] = useState({ tasksDone: 0, pendingReminders: 0, documents: 0, goals: 0, streakMax: 0, focusMinutes: 0 });
  const [quickMessage, setQuickMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, tasksRes, remindersRes, docsRes, goalsRes, doneRes, habitsRes, xpRes, moodRes, focusRes] = await Promise.all([
      supabase.from("aria_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("aria_tasks").select("*").eq("user_id", user.id).neq("status", "done").order("due_at", { ascending: true, nullsFirst: false }).limit(5),
      supabase.from("aria_reminders").select("*").eq("user_id", user.id).eq("is_sent", false).order("remind_at", { ascending: true }).limit(5),
      supabase.from("aria_documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("aria_goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("aria_tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "done"),
      supabase.from("aria_habits").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at").limit(5),
      supabase.from("aria_xp_logs").select("xp_amount").eq("user_id", user.id),
      supabase.from("aria_mood_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("aria_focus_sessions").select("duration_minutes").eq("user_id", user.id).eq("completed", true),
    ]);

    if (!profileRes.data) { navigate("/app/onboarding"); return; }

    setProfile(profileRes.data);
    setTasks(tasksRes.data || []);
    setReminders(remindersRes.data || []);
    setHabits(habitsRes.data || []);
    setTotalXp((xpRes.data || []).reduce((s, r: any) => s + r.xp_amount, 0));
    setMoodToday(moodRes.data?.[0] || null);

    const maxStreak = (habitsRes.data || []).reduce((max: number, h: any) => Math.max(max, h.current_streak || 0), 0);
    const totalFocus = (focusRes.data || []).reduce((s: number, r: any) => s + r.duration_minutes, 0);

    setStats({
      tasksDone: doneRes.count || 0,
      pendingReminders: remindersRes.data?.length || 0,
      documents: docsRes.count || 0,
      goals: goalsRes.count || 0,
      streakMax: maxStreak,
      focusMinutes: totalFocus,
    });
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase.from("aria_tasks").update({ status: completed ? "done" : "todo", updated_at: new Date().toISOString() }).eq("id", taskId);
    loadDashboard();
  };

  const handleQuickChat = () => {
    if (!quickMessage.trim()) return;
    navigate("/app/chat", { state: { initialMessage: quickMessage } });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const level = getLevel(totalXp);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);
  const xpProgress = nextLevel ? ((totalXp - level.xp) / (nextLevel.xp - level.xp)) * 100 : 100;

  const statCards = [
    { label: "Tasks Done", value: stats.tasksDone, icon: CheckSquare, color: "text-emerald-400" },
    { label: "Best Streak", value: `${stats.streakMax}🔥`, icon: Flame, color: "text-orange-400" },
    { label: "Focus Time", value: `${Math.floor(stats.focusMinutes / 60)}h ${stats.focusMinutes % 60}m`, icon: Timer, color: "text-blue-400" },
    { label: "Goals", value: stats.goals, icon: Target, color: "text-purple-400" },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Greeting + XP Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{greeting}, {profile?.name || "there"} 👋</h1>
              <p className="text-sm text-muted-foreground">Level {level.level} · {level.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-[200px]">
            <Zap className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{totalXp} XP</span>
                {nextLevel && <span>Lvl {nextLevel.level}</span>}
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" /> Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending tasks 🎉</p>
              ) : tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox checked={t.status === "done"} onCheckedChange={c => toggleTask(t.id, !!c)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    {t.due_at && <p className="text-xs text-muted-foreground">{new Date(t.due_at).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate("/app/tasks")}>View all →</Button>
            </CardContent>
          </Card>

          {/* Habits */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" /> Habits Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No habits yet — <Link to="/app/habits" className="text-primary hover:underline">create one</Link></p>
              ) : habits.map(h => {
                const done = h.last_completed_at ? new Date(h.last_completed_at).toDateString() === new Date().toDateString() : false;
                return (
                  <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-xl">{h.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{h.title}</p>
                      <p className="text-xs text-muted-foreground">{h.current_streak} day streak</p>
                    </div>
                    {done && <span className="text-xs text-primary font-medium">✓ Done</span>}
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate("/app/habits")}>View all →</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/app/mood")}>
            <SmilePlus className="w-5 h-5" />
            <span className="text-xs">Log Mood</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/app/focus")}>
            <Timer className="w-5 h-5" />
            <span className="text-xs">Focus Session</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/app/finance")}>
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Log Expense</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/app/review")}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Weekly Review</span>
          </Button>
        </div>

        {/* Quick Chat */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input placeholder="Ask ARIA anything..." value={quickMessage}
                onChange={e => setQuickMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleQuickChat()}
                className="bg-muted border-border" />
              <Button onClick={handleQuickChat} className="shrink-0"><Send className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
