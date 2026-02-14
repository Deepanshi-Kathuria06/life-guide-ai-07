import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { motion } from "framer-motion";
import {
  Rocket, Target, CheckCircle2, Circle, Flame, Sparkles,
  BarChart3, Bell, RefreshCw, Edit, Calendar, TrendingUp, Loader2
} from "lucide-react";

export default function AutopilotDashboard() {
  const navigate = useNavigate();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const [goal, setGoal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [goalsRes, notifRes] = await Promise.all([
      supabase.from('autopilot_goals').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1),
      supabase.from('autopilot_notifications').select('*').eq('user_id', user.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
    ]);

    if (goalsRes.data && goalsRes.data.length > 0) {
      const g = goalsRes.data[0];
      setGoal(g);

      const today = new Date().toISOString().split('T')[0];
      const [tasksRes, logsRes] = await Promise.all([
        supabase.from('autopilot_tasks').select('*').eq('goal_id', g.id).eq('due_date', today).order('priority'),
        supabase.from('autopilot_activity_logs').select('*').eq('goal_id', g.id).order('log_date', { ascending: false }).limit(30),
      ]);

      setTasks(tasksRes.data || []);
      setActivityLogs(logsRes.data || []);
    }

    setNotifications(notifRes.data || []);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase.from('autopilot_tasks').update({
      completed: !completed,
      completed_at: !completed ? new Date().toISOString() : null,
    }).eq('id', taskId);

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));

    // Update streak & progress
    if (!completed && goal) {
      const completedCount = tasks.filter(t => t.completed || t.id === taskId).length;
      const totalCount = tasks.length;
      const allDone = completedCount === totalCount;
      
      const newStreak = allDone ? goal.streak_count + 1 : goal.streak_count;
      const newProgress = Math.min(100, goal.progress_percent + Math.round(5 / totalCount));

      await supabase.from('autopilot_goals').update({
        streak_count: newStreak,
        progress_percent: newProgress,
        last_active_at: new Date().toISOString(),
      }).eq('id', goal.id);

      setGoal((prev: any) => ({ ...prev, streak_count: newStreak, progress_percent: newProgress }));

      // Log activity
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('autopilot_activity_logs').insert({
        user_id: goal.user_id,
        goal_id: goal.id,
        log_date: today,
        tasks_completed: completedCount,
        tasks_total: totalCount,
        completion_rate: (completedCount / totalCount) * 100,
      });
    }
  };

  const generateTasks = async () => {
    if (!goal) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autopilot-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'generate_daily_tasks', payload: { goalId: goal.id } }),
      });

      if (!resp.ok) throw new Error((await resp.json()).error);
      toast({ title: "✨ New tasks generated!" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleAutopilot = async () => {
    if (!goal) return;
    const newVal = !goal.autopilot_enabled;
    await supabase.from('autopilot_goals').update({ autopilot_enabled: newVal }).eq('id', goal.id);
    setGoal((prev: any) => ({ ...prev, autopilot_enabled: newVal }));
    toast({ title: newVal ? "🚀 Autopilot ON" : "⏸️ Autopilot paused" });
  };

  if (subLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-2 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <Rocket className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Life Autopilot</h2>
            <p className="text-muted-foreground">Set a goal and let AI plan, track, and adapt your journey automatically.</p>
            <Button variant="gradient" size="lg" className="w-full" onClick={() => navigate("/autopilot/setup")}>
              <Sparkles className="h-5 w-5 mr-2" /> Set Up Autopilot
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const todayRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Build heatmap data (last 28 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = activityLogs.find(l => l.log_date === dateStr);
    return { date: dateStr, rate: log ? Number(log.completion_rate) : 0, day: d.getDate() };
  });

  const milestones = (goal.milestones as any[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/dashboard")}>
              AICOACHLY
            </h1>
            <Badge variant="outline" className="hidden sm:flex gap-1 border-primary/50 text-primary">
              <Rocket className="h-3 w-3" /> Autopilot
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Autopilot</span>
              <Switch checked={goal.autopilot_enabled} onCheckedChange={toggleAutopilot} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/autopilot/reports")}>
              <BarChart3 className="h-5 w-5" />
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-2">
            {notifications.slice(0, 2).map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{n.title}</span>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={async () => {
                  await supabase.from('autopilot_notifications').update({ read: true }).eq('id', n.id);
                  setNotifications(prev => prev.filter(x => x.id !== n.id));
                }}>Dismiss</Button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Goal Overview */}
        <Card className="mb-6 border-2 border-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{goal.goal_description}</h2>
                </div>
                {goal.deadline && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Deadline: {goal.deadline}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/autopilot/setup")}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="text-primary font-semibold">{goal.progress_percent}%</span>
              </div>
              <Progress value={goal.progress_percent} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Today's Tasks
                    <Badge variant="secondary" className="ml-2">{completedCount}/{tasks.length}</Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={generateTasks} disabled={generating}>
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">Generate</span>
                  </Button>
                </div>
                {tasks.length > 0 && <Progress value={todayRate} className="h-1.5 mt-2" />}
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">No tasks for today yet</p>
                    <Button variant="gradient" size="sm" onClick={generateTasks} disabled={generating}>
                      <Sparkles className="h-4 w-4 mr-1" /> Generate Tasks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${task.completed ? 'bg-muted/30 border-border' : 'border-border hover:border-primary/50'}`}
                        onClick={() => toggleTask(task.id, task.completed)}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task_text}
                        </span>
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'low' ? 'secondary' : 'outline'} className="text-xs">
                          {task.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Activity (Last 28 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1.5">
                  {heatmapDays.map((d, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-sm flex items-center justify-center text-[10px]"
                      title={`${d.date}: ${d.rate}%`}
                      style={{
                        backgroundColor: d.rate === 0
                          ? 'hsl(var(--muted))'
                          : d.rate < 40
                            ? 'hsl(var(--primary) / 0.2)'
                            : d.rate < 70
                              ? 'hsl(var(--primary) / 0.5)'
                              : 'hsl(var(--primary) / 0.9)',
                      }}
                    >
                      {d.day}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Less</span>
                  {[0.1, 0.3, 0.5, 0.9].map((o) => (
                    <div key={o} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
                  ))}
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Streak */}
            <Card className="border-2 border-primary/10">
              <CardContent className="p-6 text-center">
                <Flame className="h-10 w-10 text-primary mx-auto mb-2" />
                <div className="text-4xl font-bold text-primary">{goal.streak_count}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No milestones yet</p>
                ) : (
                  <div className="space-y-3">
                    {milestones.slice(0, 5).map((m: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{m.title}</div>
                          {m.target_date && <div className="text-xs text-muted-foreground">{m.target_date}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goal.ai_plan?.difficulty_assessment ? (
                  <p className="text-sm text-muted-foreground">{goal.ai_plan.difficulty_assessment}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete tasks to unlock AI insights.</p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate("/autopilot/reports")}>
                  View Weekly Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
