import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, BarChart3, CheckCircle, Target, Brain } from "lucide-react";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import ReactMarkdown from "react-markdown";

type Review = {
  id: string;
  week_start: string;
  tasks_completed: number;
  tasks_total: number;
  mood_average: number | null;
  xp_earned: number;
  ai_summary: string | null;
  ai_recommendations: string | null;
  created_at: string;
};

export default function AriaWeeklyReview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadReviews(user.id); }
    });
  }, []);

  const loadReviews = async (uid: string) => {
    const { data } = await supabase.from("aria_weekly_reviews").select("*").eq("user_id", uid).order("week_start", { ascending: false });
    if (data) setReviews(data as Review[]);
  };

  const generateReview = async () => {
    if (!userId) return;
    setIsGenerating(true);
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      // Gather data
      const [tasksRes, moodRes, xpRes, goalsRes] = await Promise.all([
        supabase.from("aria_tasks").select("*").eq("user_id", userId).gte("created_at", weekStart.toISOString()),
        supabase.from("aria_mood_entries").select("mood_score").eq("user_id", userId).gte("created_at", weekStart.toISOString()),
        supabase.from("aria_xp_logs").select("xp_amount").eq("user_id", userId).gte("created_at", weekStart.toISOString()),
        supabase.from("aria_goals").select("title, progress_percent, category").eq("user_id", userId),
      ]);

      const tasks = tasksRes.data || [];
      const completedTasks = tasks.filter((t: any) => t.status === "done").length;
      const moods = moodRes.data || [];
      const moodAvg = moods.length ? moods.reduce((s: number, m: any) => s + m.mood_score, 0) / moods.length : null;
      const xpEarned = (xpRes.data || []).reduce((s: number, x: any) => s + x.xp_amount, 0);

      // AI summary
      const reviewData = `Week: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}
Tasks: ${completedTasks}/${tasks.length} completed
Mood average: ${moodAvg ? moodAvg.toFixed(1) : "No data"}/10
XP earned: ${xpEarned}
Goals: ${(goalsRes.data || []).map((g: any) => `${g.title} (${g.progress_percent}%)`).join(", ") || "None"}`;

      const resp = await supabase.functions.invoke("aria-summarize", {
        body: { type: "weekly_review", content: reviewData },
      });

      await supabase.from("aria_weekly_reviews").insert({
        user_id: userId,
        week_start: format(weekStart, "yyyy-MM-dd"),
        tasks_completed: completedTasks,
        tasks_total: tasks.length,
        mood_average: moodAvg ? parseFloat(moodAvg.toFixed(1)) : null,
        xp_earned: xpEarned,
        ai_summary: resp.data?.summary || "Review generated.",
        ai_recommendations: resp.data?.recommendations || null,
      });

      await supabase.from("aria_xp_logs").insert({
        user_id: userId, xp_amount: 20, source: "weekly_review", description: "Generated weekly review",
      });

      loadReviews(userId);
      toast({ title: "+20 XP! Weekly review generated 📊" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Weekly Review</h1>
            <p className="text-sm text-muted-foreground">AI-powered insights on your week</p>
          </div>
          <Button onClick={generateReview} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Review
          </Button>
        </div>

        {reviews.length === 0 ? (
          <Card className="p-10 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No reviews yet — generate your first weekly review!</p>
          </Card>
        ) : reviews.map(r => (
          <Card key={r.id} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Week of {format(new Date(r.week_start), "MMM d, yyyy")}</h3>
              <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, h:mm a")}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold text-foreground">{r.tasks_completed}/{r.tasks_total}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg mb-1">{r.mood_average ? (r.mood_average >= 7 ? "😊" : r.mood_average >= 5 ? "🙂" : "😔") : "—"}</p>
                <p className="text-lg font-bold text-foreground">{r.mood_average?.toFixed(1) || "—"}</p>
                <p className="text-xs text-muted-foreground">Mood</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Target className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{r.xp_earned}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Brain className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-foreground">{r.tasks_total > 0 ? Math.round((r.tasks_completed / r.tasks_total) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Rate</p>
              </div>
            </div>

            {r.ai_summary && (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{r.ai_summary}</ReactMarkdown>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
