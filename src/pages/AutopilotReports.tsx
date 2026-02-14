import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, Sparkles, ArrowLeft, Loader2,
  CheckCircle2, AlertTriangle, Lightbulb, ChevronRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AutopilotReports() {
  const navigate = useNavigate();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: goals } = await supabase.from('autopilot_goals')
      .select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1);

    if (goals && goals.length > 0) {
      const g = goals[0];
      setGoal(g);

      const [reportsRes, logsRes] = await Promise.all([
        supabase.from('autopilot_reports').select('*').eq('goal_id', g.id).order('week_start', { ascending: false }).limit(8),
        supabase.from('autopilot_activity_logs').select('*').eq('goal_id', g.id).order('log_date', { ascending: false }).limit(30),
      ]);

      setReports(reportsRes.data || []);
      setActivityData((logsRes.data || []).reverse().map((l: any) => ({
        date: l.log_date.slice(5),
        rate: Number(l.completion_rate),
        completed: l.tasks_completed,
        total: l.tasks_total,
      })));
    }
    setLoading(false);
  };

  const generateReport = async () => {
    if (!goal) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autopilot-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'generate_weekly_report', payload: { goalId: goal.id } }),
      });

      if (!resp.ok) throw new Error((await resp.json()).error);
      toast({ title: "📊 Report generated!" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (subLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/autopilot")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Weekly Reports</h1>
          </div>
          <ProfileDropdown />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Generate Report */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Performance Overview</h2>
          <Button variant="gradient" size="sm" onClick={generateReport} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Generate Report
          </Button>
        </div>

        {/* Top Stats */}
        {latestReport && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{latestReport.performance_score}</div>
                <div className="text-xs text-muted-foreground">Performance Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{Number(latestReport.completion_rate).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{goal?.streak_count || 0}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{goal?.progress_percent || 0}%</div>
                <div className="text-xs text-muted-foreground">Goal Progress</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart */}
        {activityData.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Completion Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Latest Report Details */}
        {latestReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{latestReport.summary}</p>
                {latestReport.ai_feedback && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm italic">{latestReport.ai_feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" /> Insights & Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestReport.productivity_insights?.insights?.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
                {latestReport.next_week_strategy && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">NEXT WEEK</div>
                    <p className="text-sm">{latestReport.next_week_strategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reports yet. Generate your first weekly report!</p>
            </CardContent>
          </Card>
        )}

        {/* Past Reports */}
        {reports.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Past Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.slice(1).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div>
                      <div className="text-sm font-medium">Week of {r.week_start}</div>
                      <div className="text-xs text-muted-foreground">Score: {r.performance_score} | Rate: {Number(r.completion_rate).toFixed(0)}%</div>
                    </div>
                    <Badge variant={r.performance_score >= 70 ? 'default' : r.performance_score >= 40 ? 'secondary' : 'destructive'}>
                      {r.performance_score >= 70 ? 'Great' : r.performance_score >= 40 ? 'Okay' : 'Needs Work'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
