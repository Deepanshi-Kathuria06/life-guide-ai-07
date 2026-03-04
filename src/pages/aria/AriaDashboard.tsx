import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Clock, FileText, Target, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

export default function AriaDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [stats, setStats] = useState({ tasksDone: 0, pendingReminders: 0, documents: 0, goals: 0 });
  const [quickMessage, setQuickMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, tasksRes, remindersRes, docsRes, goalsRes, doneRes] = await Promise.all([
      supabase.from("aria_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("aria_tasks").select("*").eq("user_id", user.id).neq("status", "done").order("due_at", { ascending: true, nullsFirst: false }).limit(5),
      supabase.from("aria_reminders").select("*").eq("user_id", user.id).eq("is_sent", false).order("remind_at", { ascending: true }).limit(5),
      supabase.from("aria_documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("aria_goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("aria_tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "done"),
    ]);

    if (!profileRes.data) {
      navigate("/app/onboarding");
      return;
    }

    setProfile(profileRes.data);
    setTasks(tasksRes.data || []);
    setReminders(remindersRes.data || []);
    setStats({
      tasksDone: doneRes.count || 0,
      pendingReminders: remindersRes.data?.length || 0,
      documents: docsRes.count || 0,
      goals: goalsRes.count || 0,
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

  const statCards = [
    { label: "Tasks Done", value: stats.tasksDone, icon: CheckSquare, color: "text-emerald-400" },
    { label: "Pending Reminders", value: stats.pendingReminders, icon: Clock, color: "text-amber-400" },
    { label: "Documents", value: stats.documents, icon: FileText, color: "text-blue-400" },
    { label: "Goals Tracked", value: stats.goals, icon: Target, color: "text-purple-400" },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}, {profile?.name || "there"} 👋</h1>
            <p className="text-sm text-muted-foreground">Here's your life at a glance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => (
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
                <p className="text-sm text-muted-foreground py-4 text-center">No pending tasks. Ask ARIA to help plan your day!</p>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox checked={t.status === "done"} onCheckedChange={(c) => toggleTask(t.id, !!c)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      {t.due_at && <p className="text-xs text-muted-foreground">{new Date(t.due_at).toLocaleDateString()}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.priority === "high" ? "bg-destructive/20 text-destructive" : t.priority === "medium" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate("/app/tasks")}>
                View all tasks →
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming reminders</p>
              ) : (
                reminders.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.remind_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Chat */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask ARIA anything..."
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickChat()}
                className="bg-muted border-border"
              />
              <Button onClick={handleQuickChat} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
